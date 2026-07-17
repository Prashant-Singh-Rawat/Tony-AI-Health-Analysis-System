import os
import subprocess
import tempfile
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from ai_service import chunk_text, generate_embedding

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/repositories",
    tags=["Repositories"]
)

# Allowed text file extensions
VALID_EXTENSIONS = {'.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.cs', '.go', '.rs', '.php', '.rb', '.md', '.txt', '.json', '.html', '.css'}

def is_valid_file(file_path: str) -> bool:
    if "node_modules" in file_path or ".git" in file_path:
        return False
    _, ext = os.path.splitext(file_path)
    return ext.lower() in VALID_EXTENSIONS

def ingest_repository(repo_id: int, url: str, db: Session):
    try:
        repo = db.query(models.Repository).filter(models.Repository.id == repo_id).first()
        if not repo:
            return
        
        repo.status = "cloning"
        db.commit()
        
        with tempfile.TemporaryDirectory() as temp_dir:
            logger.info(f"Cloning {url} into {temp_dir}")
            
            # 1. Clone the repository
            result = subprocess.run(
                ["git", "clone", "--depth", "1", url, temp_dir],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"Git clone failed: {result.stderr}")
                repo.status = "failed"
                db.commit()
                return

            repo.status = "indexing"
            db.commit()

            # 2. Walk through the directory tree
            for root, dirs, files in os.walk(temp_dir):
                # Skip hidden directories like .git or node_modules
                dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
                
                for file in files:
                    file_path = os.path.join(root, file)
                    if not is_valid_file(file_path):
                        continue
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                    except Exception as e:
                        logger.warning(f"Failed to read file {file_path}: {e}")
                        continue
                    
                    if not content.strip():
                        continue
                    
                    # 3. Save Document
                    rel_path = os.path.relpath(file_path, temp_dir)
                    db_doc = models.Document(
                        repo_id=repo_id,
                        file_path=rel_path,
                        content=content
                    )
                    db.add(db_doc)
                    db.commit()
                    db.refresh(db_doc)
                    
                    # 4. Chunk content and generate embeddings
                    chunks = chunk_text(content, max_size=1000, overlap=100)
                    for chunk_content in chunks:
                        embedding = generate_embedding(chunk_content)
                        db_chunk = models.Chunk(
                            document_id=db_doc.id,
                            chunk_text=chunk_content,
                            embedding=embedding
                        )
                        db.add(db_chunk)
                    
                    db.commit()
            
            repo.status = "completed"
            db.commit()
            logger.info(f"Ingestion completed for repo {url}")
            
    except Exception as e:
        logger.error(f"Error during repository ingestion: {e}", exc_info=True)
        try:
            repo = db.query(models.Repository).filter(models.Repository.id == repo_id).first()
            if repo:
                repo.status = "failed"
                db.commit()
        except:
            pass


@router.post("/ingest", response_model=schemas.RepositoryResponse)
def start_ingestion(
    repo_data: schemas.RepositoryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Start the ingestion process for a GitHub repository.
    """
    # Create the repository record in DB
    db_repo = models.Repository(url=repo_data.url, status="pending")
    db.add(db_repo)
    db.commit()
    db.refresh(db_repo)

    # Spawn background task
    background_tasks.add_task(ingest_repository, db_repo.id, db_repo.url, db)

    return db_repo

@router.get("/{repo_id}", response_model=schemas.RepositoryResponse)
def get_repository_status(
    repo_id: int,
    db: Session = Depends(get_db)
):
    """
    Check the ingestion status of a repository.
    """
    db_repo = db.query(models.Repository).filter(models.Repository.id == repo_id).first()
    if not db_repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    return db_repo

from agents.base import Memory
from typing import Dict, Any, List

class ChatMemory(Memory):
    def __init__(self, session_id: str):
        super().__init__()
        self.session_id = session_id
        self.metadata: Dict[str, Any] = {}
        
    def add_metadata(self, key: str, value: Any):
        self.metadata[key] = value
        
    def get_metadata(self) -> Dict[str, Any]:
        return self.metadata

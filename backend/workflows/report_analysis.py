from orchestrator.coordinator import AgentCoordinator
from typing import Dict, Any

class ReportAnalysisWorkflow:
    def __init__(self):
        self.coordinator = AgentCoordinator()
        
    def execute_workflow(self, file_path: str) -> Dict[str, Any]:
        # Coordinates pipeline and parses final output
        result = self.coordinator.orchestrate_analysis_workflow(file_path)
        return result

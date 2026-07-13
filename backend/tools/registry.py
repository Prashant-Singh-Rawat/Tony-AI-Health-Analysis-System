from agents.base import Tool
from typing import Dict, Any, List

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Tool] = {}
        
    def register(self, tool: Tool):
        self._tools[tool.name] = tool
        
    def get_tool(self, name: str) -> Tool:
        return self._tools.get(name)
        
    def list_tools(self) -> List[str]:
        return list(self._tools.keys())

# Define some mock tools for reports extraction & nearby clinic queries
class MockTextExtractorTool(Tool):
    def __init__(self):
        super().__init__(name="text_extractor", description="Extracts text content from local PDF files.")
        
    def execute(self, file_path: str) -> str:
        return f"Mock extracted text content for file: {file_path}"

class MockHospitalFinderTool(Tool):
    def __init__(self):
        super().__init__(name="hospital_finder", description="Solves nearest emergency hospitals by coordinate distance.")
        
    def execute(self, lat: float, lon: float) -> list:
        return [{"name": "Mock General Hospital", "distance_km": 0.5}]

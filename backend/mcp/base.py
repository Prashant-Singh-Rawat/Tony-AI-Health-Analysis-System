from typing import Dict, Any, List

class MCPProvider:
    def __init__(self, name: str):
        self.name = name
        
    def connect(self) -> bool:
        raise NotImplementedError("Subclasses must implement connect")
        
    def execute_tool(self, tool_name: str, params: Dict[str, Any]) -> Any:
        raise NotImplementedError("Subclasses must implement execute_tool")

class LLMProvider:
    def __init__(self, model_name: str):
        self.model_name = model_name
        
    def generate(self, prompt: str, system_instruction: str = None) -> str:
        raise NotImplementedError("Subclasses must implement generate")

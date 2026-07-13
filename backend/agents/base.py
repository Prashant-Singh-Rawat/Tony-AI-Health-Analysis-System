import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("agent_system")

class AgentConfig:
    def __init__(self, name: str, model_name: str = "gemini-2.5-flash", temperature: float = 0.2):
        self.name = name
        self.model_name = model_name
        self.temperature = temperature

class Memory:
    def __init__(self):
        self.messages: List[Dict[str, str]] = []
    
    def add_message(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        
    def get_context(self) -> List[Dict[str, str]]:
        return self.messages
    
    def clear(self):
        self.messages.clear()

class Tool:
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        
    def execute(self, *args, **kwargs) -> Any:
        raise NotImplementedError("Subclasses must implement execute")

class Planner:
    def plan(self, task: str, memory_context: List[Dict[str, str]], tools: List[Tool]) -> List[Dict[str, Any]]:
        logger.info(f"Planning steps for task: {task}")
        return [{"step": 1, "action": "execute_task", "params": {"task": task}}]

class Executor:
    def run_step(self, step: Dict[str, Any], tools: List[Tool]) -> Any:
        logger.info(f"Executing step: {step.get('step')} - Action: {step.get('action')}")
        return f"Result of {step.get('action')}"

class Validator:
    def validate(self, result: Any) -> bool:
        logger.info("Validating execution result")
        return True

class ResponseFormatter:
    def format(self, result: Any) -> Dict[str, Any]:
        logger.info("Formatting response")
        return {"status": "success", "data": result}

class Agent:
    def __init__(self, config: AgentConfig, system_prompt: str, tools: List[Tool]):
        self.config = config
        self.system_prompt = system_prompt
        self.tools = tools
        self.memory = Memory()
        self.planner = Planner()
        self.executor = Executor()
        self.validator = Validator()
        self.formatter = ResponseFormatter()
        
    def run(self, task: str) -> Dict[str, Any]:
        logger.info(f"Agent [{self.config.name}] started task: {task}")
        self.memory.add_message("user", task)
        
        # 1. Plan
        plan_steps = self.planner.plan(task, self.memory.get_context(), self.tools)
        
        # 2. Execute
        results = []
        for step in plan_steps:
            res = self.executor.run_step(step, self.tools)
            results.append(res)
            
        # 3. Validate
        is_valid = self.validator.validate(results)
        if not is_valid:
            logger.warning("Validation failed for task execution")
            
        # 4. Format
        formatted_response = self.formatter.format(results)
        self.memory.add_message("assistant", str(formatted_response))
        return formatted_response

import logging
from agents.base import Agent, AgentConfig
from prompts.templates import ANONYMIZER_SYSTEM_PROMPT, ANALYSIS_SYSTEM_PROMPT
from tools.registry import ToolRegistry, MockTextExtractorTool

logger = logging.getLogger("agent_system")

class AgentCoordinator:
    def __init__(self):
        self.registry = ToolRegistry()
        self.registry.register(MockTextExtractorTool())
        
        # Configure specialized agents
        self.anonymizer = Agent(
            config=AgentConfig("AnonymizerAgent"),
            system_prompt=ANONYMIZER_SYSTEM_PROMPT,
            tools=[self.registry.get_tool("text_extractor")]
        )
        self.analyst = Agent(
            config=AgentConfig("AnalysisAgent"),
            system_prompt=ANALYSIS_SYSTEM_PROMPT,
            tools=[]
        )
        
    def orchestrate_analysis_workflow(self, raw_report_path: str) -> dict:
        logger.info(f"Starting orchestration pipeline for file: {raw_report_path}")
        
        # Step 1: Anonymize raw data
        anonymized_res = self.anonymizer.run(f"Anonymize data from file {raw_report_path}")
        
        # Step 2: Extract medical insights
        analysis_res = self.analyst.run(f"Extract metrics from clean data: {anonymized_res.get('data')}")
        
        return {
            "status": "orchestrated_success",
            "anonymizer_output": anonymized_res,
            "analyst_output": analysis_res
        }

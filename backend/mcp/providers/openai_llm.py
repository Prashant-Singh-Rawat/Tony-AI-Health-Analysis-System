from mcp.base import LLMProvider
from typing import Optional

class OpenAILLMProvider(LLMProvider):
    """
    OpenAI LLM provider stub.
    On integration: pip install openai, then wire generate() to openai.chat.completions.create().
    """
    def __init__(self, model_name: str = "gpt-4o"):
        super().__init__(model_name)
        self._client = None  # Wire to openai.OpenAI(api_key=...) on activation

    def connect(self, api_key: str):
        # On activation:
        # import openai
        # self._client = openai.OpenAI(api_key=api_key)
        pass

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if self._client is None:
            return f"[MOCK OpenAI] System: {system_instruction or 'N/A'} | Prompt: {prompt}"
        raise NotImplementedError("Live OpenAI client not yet wired")

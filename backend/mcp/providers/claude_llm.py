from mcp.base import LLMProvider
from typing import Optional

class ClaudeLLMProvider(LLMProvider):
    """
    Anthropic Claude LLM provider stub.
    On integration: pip install anthropic, then wire generate() to anthropic.Anthropic().messages.create().
    """
    def __init__(self, model_name: str = "claude-sonnet-4-5"):
        super().__init__(model_name)
        self._client = None  # Wire to anthropic.Anthropic(api_key=...) on activation

    def connect(self, api_key: str):
        # On activation:
        # import anthropic
        # self._client = anthropic.Anthropic(api_key=api_key)
        pass

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if self._client is None:
            return f"[MOCK Claude] System: {system_instruction or 'N/A'} | Prompt: {prompt}"
        raise NotImplementedError("Live Claude client not yet wired")

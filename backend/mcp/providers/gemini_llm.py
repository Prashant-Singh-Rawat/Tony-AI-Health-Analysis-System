from mcp.base import LLMProvider
from typing import Optional

class GeminiLLMProvider(LLMProvider):
    """
    Gemini LLM provider. Wraps the existing google-genai client.
    On integration: import google.genai and wire generate() to client.models.generate_content().
    """
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        super().__init__(model_name)
        self._client = None  # Wire to genai.Client(api_key=...) on activation

    def connect(self, api_key: str):
        # On activation:
        # from google import genai
        # self._client = genai.Client(api_key=api_key)
        pass

    def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if self._client is None:
            return f"[MOCK Gemini] System: {system_instruction or 'N/A'} | Prompt: {prompt}"
        raise NotImplementedError("Live Gemini client not yet wired")

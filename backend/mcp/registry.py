"""
MCPRegistry — central registry for all MCP and LLM providers.

Usage:
    from mcp.registry import MCPRegistry
    registry = MCPRegistry()
    provider = registry.get_provider("filesystem")
    provider.connect()
    result = provider.execute_tool("read_file", {"path": "/tmp/report.pdf"})

    llm = registry.get_llm("gemini")
    text = llm.generate("Summarize this report", system_instruction="You are a medical analyst.")
"""
from typing import Dict
from mcp.base import MCPProvider, LLMProvider
from mcp.providers import (
    FilesystemMCPProvider,
    GithubMCPProvider,
    Context7MCPProvider,
    SerenaMCPProvider,
    BrowserMCPProvider,
    DatabaseMCPProvider,
    GeminiLLMProvider,
    OpenAILLMProvider,
    ClaudeLLMProvider,
)


class MCPRegistry:
    def __init__(self):
        self._providers: Dict[str, MCPProvider] = {
            "filesystem": FilesystemMCPProvider(),
            "github":     GithubMCPProvider(),
            "context7":   Context7MCPProvider(),
            "serena":     SerenaMCPProvider(),
            "browser":    BrowserMCPProvider(),
            "database":   DatabaseMCPProvider(),
        }
        self._llms: Dict[str, LLMProvider] = {
            "gemini":  GeminiLLMProvider(),
            "openai":  OpenAILLMProvider(),
            "claude":  ClaudeLLMProvider(),
        }

    def get_provider(self, name: str) -> MCPProvider:
        provider = self._providers.get(name)
        if not provider:
            raise KeyError(f"MCP provider '{name}' not registered. Available: {list(self._providers.keys())}")
        return provider

    def get_llm(self, name: str) -> LLMProvider:
        llm = self._llms.get(name)
        if not llm:
            raise KeyError(f"LLM provider '{name}' not registered. Available: {list(self._llms.keys())}")
        return llm

    def list_providers(self):
        return list(self._providers.keys())

    def list_llms(self):
        return list(self._llms.keys())

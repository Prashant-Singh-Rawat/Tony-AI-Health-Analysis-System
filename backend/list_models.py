import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
_gemini_api_key = os.getenv("HEALTH_AI_API")
client = genai.Client(api_key=_gemini_api_key)

try:
    models = client.models.list()
    print("AVAILABLE MODELS:")
    for m in models:
        if 'generateContent' in m.supported_actions:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")

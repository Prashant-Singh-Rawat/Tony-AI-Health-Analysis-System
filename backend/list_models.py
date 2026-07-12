import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
_gemini_api_key = os.getenv("HEALTH_AI_API")
genai.configure(api_key=_gemini_api_key)

try:
    models = genai.list_models()
    print("AVAILABLE MODELS:")
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")

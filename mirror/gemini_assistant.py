import os

from google import genai
from google.genai import types


SYSTEM_INSTRUCTION = """
You are a voice assistant inside a desktop magic mirror.
Answer in one to three short sentences.
Use plain spoken language.
Do not include Markdown, URLs, or unnecessary formatting.
""".strip()

_client = None


def get_client() -> genai.Client:
    global _client

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    if _client is None:
        _client = genai.Client(api_key=api_key)

    return _client


def ask_gemini(question: str) -> str:
    cleaned_question = question.strip()

    if not cleaned_question:
        raise ValueError("A question is required")

    # API call to Gemini to generate a response
    response = get_client().models.generate_content( 
        model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
        contents=cleaned_question,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.4,
            max_output_tokens=160,
        ),
    )

    answer = (response.text or "").strip()

    if not answer:
        raise RuntimeError("Gemini returned an empty response")

    return answer
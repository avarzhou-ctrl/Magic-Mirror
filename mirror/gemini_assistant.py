import logging
import os

from google import genai
from google.genai import errors, types


logger = logging.getLogger(__name__)


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

    primary_model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    fallback_model = os.getenv(
        "GEMINI_FALLBACK_MODEL",
        "gemini-3.5-flash-lite",
    )

    try:
        response = generate_response(primary_model, cleaned_question)
    except errors.ServerError as error:
        if error.code != 503 or fallback_model == primary_model:
            raise

        logger.warning(
            "Gemini model %s is unavailable; retrying with %s",
            primary_model,
            fallback_model,
        )
        response = generate_response(fallback_model, cleaned_question)

    answer = (response.text or "").strip()

    if not answer:
        raise RuntimeError("Gemini returned an empty response")

    return answer


def generate_response(model: str, question: str):
    """Generate a concise answer with one configured Gemini model."""
    return get_client().models.generate_content(
        model=model,
        contents=question,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            max_output_tokens=160,
        ),
    )

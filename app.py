import logging
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request

PROJECT_DIR = Path(__file__).resolve().parent
load_dotenv(PROJECT_DIR / ".env")

from mirror.demo_assistant import ask_demo
from mirror.gemini_assistant import ask_gemini

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
DEMO_RESPONSE_DELAY_SECONDS = 3


def demo_mode_enabled() -> bool:
    """Return whether the local, API-free demonstration mode is enabled."""
    return os.getenv("MIRROR_DEMO_MODE", "false").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


@app.after_request
def allow_local_magicmirror(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:8080"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.get("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "demoMode": demo_mode_enabled(),
            "geminiConfigured": bool(os.getenv("GEMINI_API_KEY")),
        }
    )


@app.post("/api/assistant")
def assistant():
    body = request.get_json(silent=True) or {}
    question = body.get("question", "")

    if not isinstance(question, str) or not question.strip():
        return jsonify({"error": "Please ask a question."}), 400

    if demo_mode_enabled():
        time.sleep(DEMO_RESPONSE_DELAY_SECONDS)
        return jsonify({"answer": ask_demo(question)})

    try:
        answer = ask_gemini(question)
        return jsonify({"answer": answer})
    except Exception:
        logger.exception("Gemini request failed")
        return jsonify(
            {"error": "The assistant is unavailable right now."}
        ), 503


if __name__ == "__main__":
    port = int(os.getenv("MIRROR_BACKEND_PORT", "5001"))
    app.run(host="127.0.0.1", port=port, debug=False)

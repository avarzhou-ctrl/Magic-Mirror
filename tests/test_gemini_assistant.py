from types import SimpleNamespace
from unittest.mock import patch

import pytest
from google.genai import errors

from mirror.gemini_assistant import ask_gemini


def test_uses_fallback_model_after_temporary_unavailable_error():
    unavailable = errors.ServerError(
        503,
        {
            "error": {
                "code": 503,
                "message": "High demand",
                "status": "UNAVAILABLE",
            }
        },
    )

    with patch(
        "mirror.gemini_assistant.generate_response",
        side_effect=[unavailable, SimpleNamespace(text="Fallback answer")],
    ) as generate:
        answer = ask_gemini("Hello")

    assert answer == "Fallback answer"
    assert generate.call_args_list[0].args == ("gemini-3.8-flash", "Hello")
    assert generate.call_args_list[1].args == (
        "gemini-3.5-flash-lite",
        "Hello",
    )


def test_rejects_an_empty_question_without_calling_gemini():
    with patch("mirror.gemini_assistant.generate_response") as generate:
        with pytest.raises(ValueError, match="question is required"):
            ask_gemini("   ")

    generate.assert_not_called()

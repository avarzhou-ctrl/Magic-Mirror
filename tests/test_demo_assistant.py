from mirror.demo_assistant import ask_demo


def test_returns_known_response_despite_case_and_punctuation():
    answer = ask_demo("  Give me a STUDY tip?  ")

    assert answer.startswith("Choose one small task")


def test_returns_helpful_fallback_for_unknown_question():
    answer = ask_demo("What is the meaning of life?")

    assert "demo mode" in answer

"""Local canned responses for demonstrating the mirror without an API key."""


DEMO_RESPONSES = {
    "what should i bring today": (
        "Take a light jacket and an umbrella. You will be ready if the "
        "weather changes."
    ),
    "give me a study tip": (
        "Choose one small task and focus on it for twenty-five minutes. "
        "Then take a short break."
    ),
    "what is my plan for today": (
        "Start with your most important school task, take a break at lunch, "
        "and review your progress this evening."
    ),
    "tell me something encouraging": (
        "You do not need to finish everything at once. One focused step is "
        "still real progress."
    ),
}


def normalize_question(question: str) -> str:
    """Normalize a spoken or typed question for a demo-response lookup."""
    return " ".join(question.strip().lower().rstrip(".!?").split())


def ask_demo(question: str) -> str:
    """Return a canned answer for a known demo question."""
    cleaned_question = normalize_question(question)

    if not cleaned_question:
        raise ValueError("A question is required")

    return DEMO_RESPONSES.get(
        cleaned_question,
        (
            "I am running in demo mode. Try asking for a study tip or "
            "something encouraging."
        ),
    )

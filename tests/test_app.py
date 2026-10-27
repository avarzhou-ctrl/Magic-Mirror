from unittest.mock import patch

from app import app


def test_health_reports_demo_mode(monkeypatch):
    monkeypatch.setenv("MIRROR_DEMO_MODE", "true")

    response = app.test_client().get("/health")

    assert response.status_code == 200
    assert response.get_json()["demoMode"] is True


def test_demo_request_does_not_call_gemini(monkeypatch):
    monkeypatch.setenv("MIRROR_DEMO_MODE", "true")

    with (
        patch("app.ask_gemini") as ask_gemini,
        patch("app.time.sleep") as sleep,
    ):
        response = app.test_client().post(
            "/api/assistant",
            json={"question": "Tell me something encouraging."},
        )

    assert response.status_code == 200
    assert "focused step" in response.get_json()["answer"]
    ask_gemini.assert_not_called()
    sleep.assert_called_once_with(3)

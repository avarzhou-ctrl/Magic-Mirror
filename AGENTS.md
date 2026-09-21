# AGENTS.md

## Project Overview

This project is a desktop-sized Raspberry Pi magic mirror with a voice-controlled AI assistant.

The finished mirror should:

- Display the time and date.
- Display current weather and a short forecast.
- Show useful daily information.
- Accept spoken questions through a microphone.
- Send questions to the OpenAI API.
- Display and speak the assistant’s response.
- Run automatically when the Raspberry Pi starts.
- Use a dark, minimal interface suitable for viewing through two-way mirror acrylic.

The user is a student and may be relatively new to Raspberry Pi development. Explain unfamiliar commands and avoid unnecessarily complicated solutions.

## Target Hardware

Assume the project will eventually run on:

- A Raspberry Pi 4 or Raspberry Pi 5.
- Raspberry Pi OS Bookworm, 64-bit.
- A small HDMI display.
- A USB microphone or USB speakerphone.
- A speaker or display with audio output.
- Two-way mirror acrylic placed in front of the display.

Development may initially happen on a Mac before files are transferred to the Raspberry Pi.

## Technology Stack

Use the following stack unless there is a clear reason to change it:

- Python 3 for the backend and hardware-related logic.
- Flask for the local web server.
- HTML, CSS, and vanilla JavaScript for the mirror interface.
- OpenAI’s official Python SDK for AI, transcription, and speech.
- Environment variables for API keys and private configuration.
- `pytest` for Python tests.

Avoid adding large frameworks when a small dependency or standard-library solution is sufficient.

## Suggested Project Structure

```text
magic-mirror/
├── AGENTS.md
├── README.md
├── requirements.txt
├── .gitignore
├── .env.example
├── app.py
├── mirror/
│   ├── __init__.py
│   ├── assistant.py
│   ├── audio.py
│   ├── config.py
│   └── weather.py
├── templates/
│   └── index.html
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── mirror.js
├── tests/
└── scripts/
    └── start-mirror.sh
```

Do not reorganize the project unnecessarily if an existing structure is already working.

## Development Priorities

Build features in this order:

1. Create the full-screen mirror interface.
2. Add the clock and date.
3. Add weather information.
4. Add push-to-talk recording.
5. Transcribe the recording.
6. Send the question to the OpenAI API.
7. display and speak the response.
8. Add conversation memory.
9. Add an optional wake word.
10. Configure automatic startup on the Raspberry Pi.

Push-to-talk should work reliably before attempting an always-listening wake word.

## User Interface Requirements

The interface should:

- Use a black background.
- Use white or light-gray text.
- Have strong contrast when viewed through mirror acrylic.
- Avoid bright boxes and large colored backgrounds.
- Keep the most important information near the edges of the screen.
- Reserve the center for the user’s question and the assistant’s response.
- Work on small displays and different screen resolutions.
- Hide the mouse cursor during normal operation.
- Run in Chromium kiosk mode on the Raspberry Pi.

The UI should clearly communicate these states:

- Idle
- Listening
- Thinking
- Speaking
- Offline
- Error

Avoid showing long technical error messages on the mirror. Log the detailed error and show the user a short, understandable message.

## OpenAI Integration

Use the current official OpenAI Python SDK.

Keep OpenAI-related logic in a separate module rather than placing it directly in Flask routes.

The assistant should:

- Give concise answers that are suitable for speech.
- Prefer one to three short sentences unless the user requests more detail.
- Know that it is operating inside a desktop magic mirror.
- Avoid reading URLs, Markdown syntax, or unnecessary formatting aloud.
- Handle network and API failures without crashing the main display.

Do not assume that a ChatGPT subscription includes API usage. The application uses an OpenAI API key and may incur separate API charges.

When model names or API methods may have changed, check current official OpenAI documentation before implementing them.

## Security Requirements

Never hard-code passwords, API keys, or tokens.

Read secrets from environment variables, such as:

```text
OPENAI_API_KEY
WEATHER_API_KEY
```

Include a `.env.example` containing placeholder values, but never place real credentials in it.

Ensure `.gitignore` includes at least:

```text
.env
.venv/
__pycache__/
*.pyc
*.wav
*.mp3
.DS_Store
```

Temporary audio files should be deleted after use whenever practical.

Do not print API keys or full environment contents to the terminal or application logs.

The Flask server should normally listen only on the local device or trusted home network. Do not expose it publicly without authentication and a specific reason.

## Audio Requirements

Audio code should:

- Allow the microphone and speaker device to be configured.
- Stop recording after a configurable duration or detected silence.
- Prevent multiple recordings from running simultaneously.
- Handle missing microphones or speakers gracefully.
- Avoid feeding the mirror’s spoken response back into the microphone.
- Use temporary files or in-memory audio when practical.

The first version may use a fixed recording duration. Silence detection and wake-word recognition can be added later.

Because microphone libraries may behave differently on macOS and Raspberry Pi OS, isolate platform-specific audio logic from the rest of the application.

## Weather and Daily Information

Retrieve weather from a dedicated weather service rather than asking the language model to invent current conditions.

Cache weather data for a reasonable period so the mirror does not repeatedly call the weather API.

If weather retrieval fails:

- Continue showing the clock and other working components.
- Display the last successful weather result when appropriate.
- Show a subtle offline indicator.

Calendar, reminders, and other private integrations should be optional modules added after the basic mirror works.

## Error Handling

The application should continue running when one feature fails.

For example:

- A weather failure should not stop the clock.
- A transcription failure should not crash Flask.
- A speech-output failure should still allow the text answer to appear.
- An OpenAI API failure should produce a short user-facing message.

Use Python logging rather than scattered `print()` statements for permanent diagnostics.

Log enough information to identify which component failed, but do not log secrets or unnecessary personal voice transcripts.

## Testing

Before considering a change complete:

- Run relevant Python tests.
- Check that Python files compile.
- Check that the Flask application starts.
- Check the interface at the target display size.
- Confirm that missing environment variables produce a useful message.
- Confirm that temporary audio files are cleaned up.
- Verify Raspberry Pi-specific commands before recommending them.

Where hardware is unavailable, mock the microphone, speaker, weather service, and OpenAI client.

Do not claim a hardware feature was tested unless it was actually tested on the relevant hardware.

## Coding Style

Write code that is easy for a beginner to understand and modify.

Use:

- Descriptive function and variable names.
- Small functions with one clear responsibility.
- Type hints for important Python functions.
- Docstrings where behavior is not obvious.
- Comments that explain decisions, not every line.
- Constants or configuration values instead of unexplained numbers.

Avoid:

- Unnecessary abstraction.
- Large files containing unrelated responsibilities.
- Deeply nested logic.
- Silent exception handling.
- Adding dependencies without explaining why they are needed.

Format Python with `black` and check it with `ruff` when those tools are configured.

## Dependency Changes

When adding a dependency:

1. Explain what it is used for.
2. Add it to `requirements.txt`.
3. Prefer actively maintained packages.
4. Confirm that it supports Raspberry Pi OS and ARM processors.
5. Avoid dependencies that require expensive compilation unless necessary.

Distinguish between:

- Python packages installed with `pip`.
- Operating-system packages installed with `apt`.
- Software used only on the developer’s Mac.

## Running the Project

The project should eventually support a clear setup similar to:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

Raspberry Pi system packages should be documented separately in `README.md`.

Do not use `sudo pip install`. Use a virtual environment.

## Transferring Code to the Raspberry Pi

The project may be developed on a Mac and transferred through:

- VS Code Remote SSH.
- Git and a private GitHub repository.
- `rsync` or `scp`.

Do not include `.env`, virtual environments, generated audio, or cache files in transfers unless specifically required.

Code changes should work when the repository is placed somewhere other than one specific home-directory path. Build paths relative to the project directory instead of hard-coding a username.

## Raspberry Pi Startup

Once the application works normally, create a startup process using `systemd` or another appropriate Raspberry Pi OS mechanism.

The startup configuration should:

- Wait for networking when required.
- Start the Flask backend.
- Restart it after unexpected failures.
- Launch Chromium in kiosk mode.
- Write useful logs.
- Avoid embedding secret values directly in the service file.

Do not configure automatic startup until the program can be started and stopped reliably by hand.

## Agent Behavior

Before changing code:

1. Inspect the existing project structure.
2. Read the relevant files.
3. Preserve working features and unrelated user changes.
4. Explain any important design decision in plain language.

When implementing a feature:

1. Make the smallest complete change.
2. Update configuration examples and documentation if needed.
3. Add or update tests.
4. Run relevant checks.
5. Report what changed and what still requires Raspberry Pi hardware testing.

If a choice would substantially affect hardware cost, privacy, recurring API costs, or project complexity, ask the user before proceeding.

Do not replace a simple working implementation with a complicated architecture without a clear benefit.

## Current Scope

The initial version should focus on:

- A clean mirror display.
- Clock and date.
- Weather.
- Push-to-talk interaction.
- OpenAI transcription.
- A concise AI response.
- Text-to-speech playback.

The following are later extensions and should not block the initial version:

- Wake-word detection.
- Face recognition.
- Camera features.
- Smart-home control.
- Multiple user profiles.
- Calendar account integration.
- Custom animations.
- Offline language models.
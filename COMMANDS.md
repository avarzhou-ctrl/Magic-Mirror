# Magic Mirror Commands

This guide collects the commands used to develop, install, run, and update the
`MMM-MirrorAssistant` module.

## Check the module on a development computer

Open Terminal and move into the project folder:

```bash
cd /path/to/Magic-Mirror
```

Check the JavaScript for syntax errors:

```bash
npm run check
```

## Demo the assistant without an API key

Demo mode returns local, prewritten answers and does not contact Gemini or any
other external service. In `.env`, set:

```text
MIRROR_DEMO_MODE=true
```

Start or restart the backend so it loads the setting:

```bash
cd /path/to/Magic-Mirror
source .venv/bin/activate
python3 app.py
```

Start MagicMirror², define `assistantModule` using the browser-console helper
in the Pomodoro section below, then try these demo questions one at a time:

```js
assistantModule.askAssistant("What should I bring today?");
assistantModule.askAssistant("Give me a study tip.");
assistantModule.askAssistant("What is my plan for today?");
assistantModule.askAssistant("Tell me something encouraging.");
```

Each command uses the normal browser-to-backend flow. The mirror shows
**Thinking** for three seconds before changing to **Speaking** with the canned
answer. An unknown question receives a short message suggesting supported demo
prompts. To use a real Gemini API key later, change `MIRROR_DEMO_MODE` to
`false` and restart the backend.

## Test the assistant API connection

The backend reads the Gemini API key from the project's `.env` file. If this
is the first setup, create the file from the safe example and then edit it:

```bash
cd /path/to/Magic-Mirror
cp .env.example .env
nano .env
```

Replace `replace_with_your_key` with the real Gemini API key. Do not paste the
key into this guide, the browser console, or a Git commit. Set
`MIRROR_DEMO_MODE=false` so this test makes a real API request.

In the first Terminal window, prepare the Python environment and start the
local backend:

```bash
cd /path/to/Magic-Mirror
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 app.py
```

Leave that Terminal window open. The final line should show that the server is
running at `http://127.0.0.1:5001`.

In a second Terminal window, check that the backend is running and loaded the
API configuration:

```bash
curl --silent --show-error http://127.0.0.1:5001/health
```

A configured backend returns:

```json
{"demoMode":false,"geminiConfigured":true,"status":"ok"}
```

This health check does not contact Gemini. Make a small real API request to
test the key, selected model, internet connection, and Gemini service:

```bash
curl --silent --show-error \
  --request POST \
  --header "Content-Type: application/json" \
  --data '{"question":"Reply with exactly: API connection successful."}' \
  http://127.0.0.1:5001/api/assistant
```

A successful response should look similar to:

```json
{"answer":"API connection successful."}
```

If the response says that the assistant is unavailable, read the detailed
error in the first Terminal window. Common causes are a missing or invalid
`GEMINI_API_KEY`, an unavailable `GEMINI_MODEL`, or no internet connection.
Stop the backend by pressing `Ctrl+C` in its Terminal window.

To test the complete browser-to-backend connection, start MagicMirror², define
`assistantModule` using the helper in the Pomodoro section below, and run this
in the browser's **Console** tab:

```js
assistantModule.askAssistant("Reply with exactly: Mirror connection successful.");
```

The mirror should briefly show **Thinking**, followed by the response from the
API. This last test requires both MagicMirror² and `python3 app.py` to be
running.

## Install MagicMirror² on the Raspberry Pi

Follow the [official MagicMirror² installation guide](https://docs.magicmirror.builders/getting-started/installation.html)
first. Then install this module inside the MagicMirror² modules folder:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/avarzhou-ctrl/Magic-Mirror.git MMM-MirrorAssistant
```

Edit the MagicMirror² configuration:

```bash
nano ~/MagicMirror/config/config.js
```

Add this entry inside the `modules` array:

```js
{
  module: "MMM-MirrorAssistant",
  position: "middle_center",
  config: {
    idleMessage: "Ready when you are",
  },
},
```

In `nano`, press `Ctrl+O`, then `Enter` to save. Press `Ctrl+X` to exit.

## Check and run MagicMirror²

Check the configuration before starting:

```bash
cd ~/MagicMirror
node --run config:check
```

Start MagicMirror²:

```bash
node --run start
```

or:

```bash
node --run server
```

Stop it by pressing `Ctrl+C` in the terminal where it is running.

## Update the module on the Raspberry Pi

Pull the newest committed changes:

```bash
cd ~/MagicMirror/modules/MMM-MirrorAssistant
git pull
```

Check the updated module and restart MagicMirror²:

```bash
npm run check
cd ~/MagicMirror
node --run config:check
node --run start
```

## View useful version information

Show the operating system version:

```bash
cat /etc/os-release
```

Show the Node.js and npm versions:

```bash
node --version
npm --version
```

Show the current module revision:

```bash
cd ~/MagicMirror/modules/MMM-MirrorAssistant
git status
git log -1 --oneline
```

## Test the Pomodoro timer

Start MagicMirror², then open Chromium or Chrome Developer Tools:

- macOS: press `Command+Option+J`.
- Raspberry Pi OS or Windows: press `Ctrl+Shift+J`.

Paste this helper into the **Console** tab. Using `var` makes it safe to paste
the helper again after MagicMirror² reloads.

```js
var assistantModule;

MM.getModules()
  .withClass("MMM-MirrorAssistant")
  .enumerate((module) => {
    assistantModule = module;
  });
```

Confirm that the module was found:

```js
assistantModule;
```

The console should show the `MMM-MirrorAssistant` module. If it shows
`undefined`, confirm that the module is enabled in `config/config.js`, reload
MagicMirror², and run the helper again.

Run these commands one at a time to test the main controls:

```js
// Show and start the timer.
assistantModule.notificationReceived("POMODORO_START");

// Pause the countdown.
assistantModule.notificationReceived("POMODORO_PAUSE");

// Resume a paused timer, or pause a running timer.
assistantModule.notificationReceived("POMODORO_TOGGLE");

// Stop the timer and restore the current phase's full duration.
assistantModule.notificationReceived("POMODORO_RESET");

// Move from focus to a break, or from a break to the next focus session.
assistantModule.notificationReceived("POMODORO_SKIP");

// Return to focus session 1 and hide the timer.
assistantModule.notificationReceived("POMODORO_RESET_ALL");

// Hide the timer without resetting it.
assistantModule.notificationReceived("POMODORO_HIDE");
```

To test phase completion without waiting 25 minutes, reset the timer, shorten
the current phase to five seconds, and start it:

```js
assistantModule.notificationReceived("POMODORO_RESET_ALL");
assistantModule.pomodoro.remainingSeconds = 5;
assistantModule.notificationReceived("POMODORO_START");
```

After five seconds, the timer should stop, move to **Short break**, and show
the message **Focus complete. Take a break.** Run the following cleanup command
when testing is finished:

```js
assistantModule.notificationReceived("POMODORO_RESET_ALL");
```

## Preview Assistant States

Use the `assistantModule` helper above to check each visual state without a
microphone or OpenAI API connection:

```js
assistantModule.notificationReceived("MIRROR_ASSISTANT_STATE", {
  state: "listening",
});

assistantModule.notificationReceived("MIRROR_ASSISTANT_STATE", {
  state: "thinking",
  question: "What should I bring today?",
});

assistantModule.notificationReceived("MIRROR_ASSISTANT_STATE", {
  state: "speaking",
  question: "What should I bring today?",
  response: "Take a light jacket. It will be cooler this evening.",
});

assistantModule.notificationReceived("MIRROR_ASSISTANT_STATE", {
  state: "offline",
  response: "Weather and voice services are unavailable.",
});

assistantModule.notificationReceived("MIRROR_ASSISTANT_STATE", {
  state: "error",
  response: "Please try again in a moment.",
});

assistantModule.notificationReceived("MIRROR_ASSISTANT_STATE", {
  state: "idle",
});
```

To preview a state immediately after startup, temporarily add these values to
the module's `config` object in the MagicMirror `config/config.js` file:

```js
previewState: "speaking",
previewQuestion: "What should I bring today?",
previewResponse: "Take a light jacket. It will be cooler this evening.",
```

Remove the three preview values after checking the layout.

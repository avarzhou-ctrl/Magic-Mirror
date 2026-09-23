# MMM-MirrorAssistant

A voice-controlled AI assistant module for
[MagicMirror²](https://magicmirror.builders/).

The project is being migrated from an early Flask prototype. The current
MagicMirror² module displays the assistant's question, response, and state.
Microphone recording, transcription, AI responses, and speech playback will
be added in later steps.

## Install on the Raspberry Pi

Install MagicMirror² first by following its
[official installation guide](https://docs.magicmirror.builders/getting-started/installation.html).
Then clone this repository into the MagicMirror² modules directory:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/avarzhou-ctrl/Magic-Mirror.git MMM-MirrorAssistant
```

Add the module to the `modules` array in `~/MagicMirror/config/config.js`:

```js
{
  module: "MMM-MirrorAssistant",
  position: "middle_center",
  config: {
    idleMessage: "Ready when you are",
  },
},
```

Check the MagicMirror² configuration and start it:

```bash
cd ~/MagicMirror
node --run config:check
node --run start
```

## Update the module later

After pushing changes from the development computer, update the Raspberry Pi:

```bash
cd ~/MagicMirror/modules/MMM-MirrorAssistant
git pull
```

Restart MagicMirror² after pulling the changes.

## Development files

- `MMM-MirrorAssistant.js` is the MagicMirror² browser module.
- `MMM-MirrorAssistant.css` contains the mirror-friendly visual styles.
- `package.json` records Node.js compatibility and JavaScript checks.
- `requirements.txt` currently supports only the legacy Flask prototype in
  `app.py`; MagicMirror² does not install Python packages from this file.

Run the JavaScript syntax check with:

```bash
npm run check
```

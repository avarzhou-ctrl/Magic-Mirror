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


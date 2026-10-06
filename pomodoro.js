window.PomodoroTimer = class PomodoroTimer {
  constructor(config, onUpdate, onFinish) {
    this.config = config;
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;

    this.phase = "focus";
    this.session = 1;
    this.running = false;
    this.remainingSeconds = this.getPhaseDuration();

    this.endsAt = null;
    this.intervalId = null;
  }

  getPhaseDuration() {
    if (this.phase === "shortBreak") {
      return this.config.shortBreakMinutes * 60;
    }

    if (this.phase === "longBreak") {
      return this.config.longBreakMinutes * 60;
    }

    return this.config.focusMinutes * 60;
  }

  getSnapshot() {
    return {
      phase: this.phase,
      session: this.session,
      running: this.running,
      remainingSeconds: this.remainingSeconds,
    };
  }

  sendUpdate() {
    this.onUpdate(this.getSnapshot());
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.endsAt = Date.now() + this.remainingSeconds * 1000;

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 250);

    this.sendUpdate();
  }

  pause() {
    if (!this.running) {
      return;
    }

    this.remainingSeconds = Math.max(
      0,
      Math.ceil((this.endsAt - Date.now()) / 1000),
    );

    this.running = false;
    this.endsAt = null;
    window.clearInterval(this.intervalId);
    this.intervalId = null;

    this.sendUpdate();
  }

  toggle() {
    if (this.running) {
      this.pause();
    } else {
      this.start();
    }
  }

  reset() {
    if (this.running) {
      window.clearInterval(this.intervalId);
    }

    this.running = false;
    this.endsAt = null;
    this.intervalId = null;
    this.remainingSeconds = this.getPhaseDuration();

    this.sendUpdate();
  }

  skip() {
    if (this.running) {
      window.clearInterval(this.intervalId);
    }

    this.running = false;
    this.endsAt = null;
    this.intervalId = null;

    this.moveToNextPhase();
    this.sendUpdate();
  }

  tick() {
    const nextRemainingSeconds = Math.max(
      0,
      Math.ceil((this.endsAt - Date.now()) / 1000),
    );

    // The interval runs four times per second, but the display only needs
    // updating when the visible number of seconds changes.
    if (nextRemainingSeconds === this.remainingSeconds) {
      return;
    }

    this.remainingSeconds = nextRemainingSeconds;

    if (this.remainingSeconds > 0) {
      this.sendUpdate();
      return;
    }

    window.clearInterval(this.intervalId);
    this.intervalId = null;
    this.running = false;
    this.endsAt = null;

    const completedPhase = this.phase;
    this.moveToNextPhase();
    this.sendUpdate();
    this.onFinish(completedPhase, this.getSnapshot());
  }

  moveToNextPhase() {
    if (this.phase === "focus") {
      if (this.session >= this.config.sessionsBeforeLongBreak) {
        this.phase = "longBreak";
      } else {
        this.phase = "shortBreak";
      }
    } else {
      if (this.phase === "longBreak") {
        this.session = 1;
      } else {
        this.session += 1;
      }

      this.phase = "focus";
    }

    this.remainingSeconds = this.getPhaseDuration();
  }

  resetAll() {
    window.clearInterval(this.intervalId);

    this.phase = "focus";
    this.session = 1;
    this.running = false;
    this.endsAt = null;
    this.intervalId = null;
    this.remainingSeconds = this.getPhaseDuration();

    this.sendUpdate();
  }

  destroy() {
    window.clearInterval(this.intervalId);
    this.running = false;
    this.endsAt = null;
    this.intervalId = null;
  }
};
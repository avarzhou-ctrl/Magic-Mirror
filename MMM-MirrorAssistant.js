/* global Module */

Module.register("MMM-MirrorAssistant", {
  defaults: {
    idleMessage: "Ready when you are",
    pomodoroEnabled: true,
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
  },

  start() {
    this.state = "idle";
    this.question = "";
    this.response = this.config.idleMessage;
    this.pomodoroNotice = "";

    this.pomodoro = new window.PomodoroTimer(
      {
        focusMinutes: this.config.focusMinutes,
        shortBreakMinutes: this.config.shortBreakMinutes,
        longBreakMinutes: this.config.longBreakMinutes,
        sessionsBeforeLongBreak: this.config.sessionsBeforeLongBreak,
      },
      (snapshot) => {
        this.pomodoroSnapshot = snapshot;
        this.updateDom();
      },
      (completedPhase, snapshot) => {
        this.pomodoroSnapshot = snapshot;

        if (completedPhase === "focus") {
          this.pomodoroNotice = "Focus complete — take a break.";
        } else {
          this.pomodoroNotice = "Break complete — ready to focus?";
        }

        this.updateDom();
      },
    );

    this.pomodoroSnapshot = this.pomodoro.getSnapshot();
  },

  getStyles() {
    return ["MMM-MirrorAssistant.css"];
  },

  getScripts() {
    return ["pomodoro.js"];
  },

  formatPomodoroTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  },

  getPomodoroPhaseLabel(phase) {
    const labels = {
      focus: "Focus",
      shortBreak: "Short break",
      longBreak: "Long break",
    };

    return labels[phase] || "Pomodoro";
  },


  getDom() {
    const wrapper = document.createElement("section");
    wrapper.className = `mirror-assistant mirror-assistant--${this.state}`; //allows for different appear based on state

    if (this.config.pomodoroEnabled && this.pomodoroSnapshot) {
      const pomodoro = document.createElement("section");
      pomodoro.className = "mirror-assistant__pomodoro";

      const phase = document.createElement("p");
      phase.className = "mirror-assistant__pomodoro-phase";
      phase.textContent = this.getPomodoroPhaseLabel(
        this.pomodoroSnapshot.phase,
      );

      const time = document.createElement("p");
      time.className = "mirror-assistant__pomodoro-time";
      time.textContent = this.formatPomodoroTime(
        this.pomodoroSnapshot.remainingSeconds,
      );

      const session = document.createElement("p");
      session.className = "mirror-assistant__pomodoro-session";
      session.textContent =
        `Session ${this.pomodoroSnapshot.session}` +
        ` of ${this.config.sessionsBeforeLongBreak}` +
        ` • ${this.pomodoroSnapshot.running ? "Running" : "Paused"}`;

      pomodoro.appendChild(phase);
      pomodoro.appendChild(time);
      pomodoro.appendChild(session);

      if (this.pomodoroNotice) {
        const notice = document.createElement("p");
        notice.className = "mirror-assistant__pomodoro-notice";
        notice.textContent = this.pomodoroNotice;
        pomodoro.appendChild(notice);
      }

      wrapper.appendChild(pomodoro);
    }

    const response = document.createElement("p");
    response.className = "mirror-assistant__response";
    response.textContent = this.response;
    wrapper.appendChild(response);

    if (this.question) {
      const question = document.createElement("p");
      question.className = "mirror-assistant__question";
      question.textContent = this.question;
      wrapper.prepend(question);
    }

    const status = document.createElement("p");
    status.className = "mirror-assistant__status";
    status.textContent = this.state;
    wrapper.appendChild(status);

    return wrapper;
  },

  notificationReceived(notification, payload) {
    if (this.pomodoro) {
      const pomodoroActions = {
        POMODORO_START: "start",
        POMODORO_PAUSE: "pause",
        POMODORO_TOGGLE: "toggle",
        POMODORO_RESET: "reset",
        POMODORO_SKIP: "skip",
        POMODORO_RESET_ALL: "resetAll",
      };

      const action = pomodoroActions[notification];

      if (action) {
        this.pomodoroNotice = "";
        this.pomodoro[action]();
        return;
      }
    }

    if (notification !== "MIRROR_ASSISTANT_STATE" || !payload) {
      return;
    }

    const validStates = [
      "idle",
      "listening",
      "thinking",
      "speaking",
      "offline",
      "error",
    ];

    if (validStates.includes(payload.state)) {
      this.state = payload.state;
    }

    if (typeof payload.question === "string") {
      this.question = payload.question;
    }

    if (typeof payload.response === "string") {
      this.response = payload.response;
    }

    this.updateDom(300);
  },

  suspend() {
    if (this.pomodoro && this.pomodoro.running) {
      this.pomodoro.pause();
    }
  },
});

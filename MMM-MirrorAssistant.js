/* global Module */

Module.register("MMM-MirrorAssistant", {
  defaults: {
    idleMessage: "Ready",
    backendUrl: "http://127.0.0.1:5001",

    pomodoroEnabled: true,
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,

    // Optional development-only values for checking layouts without hardware.
    previewState: null,
    previewQuestion: "",
    previewResponse: "",
  },

  start() {
    const previewStates = [
      "idle",
      "listening",
      "thinking",
      "speaking",
      "offline",
      "error",
    ];
    this.state = previewStates.includes(this.config.previewState)
      ? this.config.previewState
      : "idle";
    this.question = this.config.previewQuestion;
    this.response = this.config.previewResponse;
    this.pomodoroNotice = "";
    this.pomodoroVisible = false;

    if (!this.config.pomodoroEnabled) {
      return;
    }

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
        this.pomodoroNotice =
          completedPhase === "focus"
            ? "Focus complete. Take a break."
            : "Break complete. Ready to focus?";
        this.updateDom();
      },
    );

    this.pomodoroSnapshot = this.pomodoro.getSnapshot();
  },

  getStyles() {
    return ["mirror-theme.css", "MMM-MirrorAssistant.css"];
  },

  getScripts() {
    return ["pomodoro.js"];
  },

  getStateLabel() {
    const labels = {
      idle: this.config.idleMessage,
      listening: "Listening",
      thinking: "Thinking",
      speaking: "Speaking",
      offline: "Offline",
      error: "Something went wrong",
    };

    return labels[this.state] || this.config.idleMessage;
  },

  createSignal() {
    const signal = document.createElement("div");
    signal.className = "mirror-assistant__signal";
    signal.setAttribute("aria-hidden", "true");

    for (let dotNumber = 0; dotNumber < 3; dotNumber += 1) {
      signal.appendChild(document.createElement("span"));
    }

    return signal;
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

  createPomodoroDom() {
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

    const progress = document.createElement("div");
    progress.className = "mirror-assistant__pomodoro-progress";
    progress.setAttribute(
      "aria-label",
      `Session ${this.pomodoroSnapshot.session} of ${this.config.sessionsBeforeLongBreak}`,
    );

    for (
      let sessionNumber = 1;
      sessionNumber <= this.config.sessionsBeforeLongBreak;
      sessionNumber += 1
    ) {
      const dot = document.createElement("span");
      dot.className = "mirror-assistant__pomodoro-dot";

      if (sessionNumber < this.pomodoroSnapshot.session) {
        dot.classList.add("mirror-assistant__pomodoro-dot--complete");
      } else if (sessionNumber === this.pomodoroSnapshot.session) {
        dot.classList.add("mirror-assistant__pomodoro-dot--current");
      }

      progress.appendChild(dot);
    }

    const timerState = document.createElement("p");
    timerState.className = "mirror-assistant__pomodoro-state";
    timerState.textContent = this.pomodoroSnapshot.running
      ? "In progress"
      : "Paused";

    pomodoro.appendChild(phase);
    pomodoro.appendChild(time);
    pomodoro.appendChild(progress);
    pomodoro.appendChild(timerState);

    if (this.pomodoroNotice) {
      const notice = document.createElement("p");
      notice.className = "mirror-assistant__pomodoro-notice";
      notice.textContent = this.pomodoroNotice;
      pomodoro.appendChild(notice);
    }

    return pomodoro;
  },

  getDom() {
    const wrapper = document.createElement("section");
    wrapper.className = `mirror-assistant mirror-assistant--${this.state}`;
    wrapper.setAttribute("aria-live", "polite");

    const shouldShowPomodoro =
      this.config.pomodoroEnabled &&
      this.pomodoroVisible &&
      this.pomodoroSnapshot &&
      this.state === "idle";

    if (shouldShowPomodoro) {
      wrapper.classList.add("mirror-assistant--pomodoro");
      wrapper.appendChild(this.createPomodoroDom());
      return wrapper;
    }

    wrapper.appendChild(this.createSignal());

    const status = document.createElement("p");
    status.className = "mirror-assistant__status";
    status.textContent = this.getStateLabel();
    wrapper.appendChild(status);

    if (this.question) {
      const question = document.createElement("p");
      question.className = "mirror-assistant__question";
      question.textContent = this.question;
      wrapper.appendChild(question);
    }

    if (this.response) {
      const response = document.createElement("p");
      response.className = "mirror-assistant__response";
      response.textContent = this.response;
      wrapper.appendChild(response);
    }

    return wrapper;
  },

  async askAssistant(question) {
    const cleanedQuestion = typeof question === "string" ? question.trim() : "";

    if (!cleanedQuestion) {
      this.notificationReceived("MIRROR_ASSISTANT_STATE", {
        state: "error",
        response: "Please ask a question.",
      });
      return;
    }

    this.notificationReceived("MIRROR_ASSISTANT_STATE", {
      state: "thinking",
      question: cleanedQuestion,
    });

    try {
      const response = await fetch(`${this.config.backendUrl}/api/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: cleanedQuestion }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Assistant request failed");
      }

      this.notificationReceived("MIRROR_ASSISTANT_STATE", {
        state: "speaking",
        question: cleanedQuestion,
        response: result.answer,
      });
    } catch (error) {
      console.error("Mirror assistant request failed:", error);
      this.notificationReceived("MIRROR_ASSISTANT_STATE", {
        state: "offline",
        response: "The assistant is unavailable right now.",
      });
    }
  },

  notificationReceived(notification, payload) {
    if (this.pomodoro) {
      const pomodoroActions = {
        POMODORO_START: "start",
        POMODORO_PAUSE: "pause",
        POMODORO_TOGGLE: "toggle",
        POMODORO_RESET: "reset",
        POMODORO_SKIP: "skip",
      };
      const action = pomodoroActions[notification];

      if (action) {
        this.pomodoroVisible = true;
        this.pomodoroNotice = "";
        this.pomodoro[action]();
        return;
      }

      if (notification === "POMODORO_RESET_ALL") {
        this.pomodoro.resetAll();
        this.pomodoroNotice = "";
        this.pomodoroVisible = false;
        this.updateDom(200);
        return;
      }

      if (notification === "POMODORO_HIDE") {
        this.pomodoroVisible = false;
        this.updateDom(200);
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
    } else if (
      ["idle", "listening", "offline", "error"].includes(this.state)
    ) {
      this.question = "";
    }

    if (typeof payload.response === "string") {
      this.response = payload.response;
    } else if (this.state === "offline") {
      this.response = "Voice services are unavailable.";
    } else if (this.state === "error") {
      this.response = "Please try again in a moment.";
    } else if (["idle", "listening", "thinking"].includes(this.state)) {
      this.response = "";
    }

    this.updateDom(300);
  },

  suspend() {
    if (this.pomodoro && this.pomodoro.running) {
      this.pomodoro.pause();
    }
  },

  stop() {
    if (this.pomodoro) {
      this.pomodoro.destroy();
    }
  },
});

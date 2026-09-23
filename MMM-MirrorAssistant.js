/* global Module */

Module.register("MMM-MirrorAssistant", {
  defaults: {
    idleMessage: "Ready when you are",
  },

  start() {
    this.state = "idle";
    this.question = "";
    this.response = this.config.idleMessage;
  },

  getStyles() {
    return ["MMM-MirrorAssistant.css"];
  },

  getDom() {
    const wrapper = document.createElement("section");
    wrapper.className = `mirror-assistant mirror-assistant--${this.state}`; //allows for different appear based on state

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
});

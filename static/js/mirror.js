const clockElement = document.querySelector("#clock");
const dateElement = document.querySelector("#date");

function updateDateAndTime() {
    const now = new Date();

    clockElement.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    dateElement.textContent = now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

updateDateAndTime();
setInterval(updateDateAndTime, 1000);
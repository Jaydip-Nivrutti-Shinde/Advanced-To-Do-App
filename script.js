const input = document.getElementById("inpu");
const addBtn = document.getElementById("addBtn");
const tasksDiv = document.getElementById("tasks");
const startTimeInput = document.getElementById("startTime");
const durationInput = document.getElementById("duration");
const userEmailInput = document.getElementById("userEmail");

startTimeInput.type = "time";

addBtn.addEventListener("click", () => {
  const taskText = input.value.trim();
  const startTime = startTimeInput.value;
  const duration = parseInt(durationInput.value);
  const userEmail = userEmailInput.value.trim();

  if (!taskText || !startTime || isNaN(duration) || duration <= 0 || !userEmail) return;

  const taskItem = document.createElement("div");
  taskItem.className = "task-item";
  taskItem.dataset.start = startTime;
  taskItem.dataset.duration = duration;
  taskItem.dataset.timerStarted = "false";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "check";

  const li = document.createElement("span");
  li.textContent = taskText;

  const startInfo = document.createElement("span");
  startInfo.className = "start-info";
  startInfo.textContent = `🕑 Starts at: ${startTime}`;

  const timerDisplay = document.createElement("span");
  timerDisplay.className = "timer";

  const btns = document.createElement("div");
  btns.className = "task-buttons";

  const emailStatus = document.createElement("span");
  emailStatus.className = "email-status";

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.className = "editBtn";
  editBtn.onclick = () => {
    const newText = prompt("Edit task:", li.textContent);
    if (newText) li.textContent = newText;
  };

  const infoBtn = document.createElement("button");
  infoBtn.textContent = "ℹ️";
  infoBtn.className = "infoBtn";
  infoBtn.onclick = () => {
    const start = taskItem.dataset.start;
    const duration = taskItem.dataset.duration;
    const started = taskItem.dataset.timerStarted;
    alert(`Start: ${start}\nDuration: ${duration} mins\nTimer started: ${started}`);
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.className = "delBtn";
  delBtn.onclick = () => {
    taskItem.remove();
    updateBatteryStatus();
  };

  checkbox.addEventListener("change", () => {
    taskItem.classList.toggle("completed", checkbox.checked);
    updateBatteryStatus();
  });

  btns.appendChild(editBtn);
  btns.appendChild(infoBtn);
  btns.appendChild(delBtn);

  taskItem.appendChild(emailStatus);
  taskItem.appendChild(checkbox);
  taskItem.appendChild(li);
  taskItem.appendChild(startInfo);
  taskItem.appendChild(timerDisplay);
  taskItem.appendChild(btns);

  tasksDiv.appendChild(taskItem);

  input.value = "";
  startTimeInput.value = "";
  durationInput.value = "";
  updateBatteryStatus();

  // Schedule Email Notification:
  scheduleEmailNotification(taskItem, taskText, startTime, userEmail, emailStatus);
});

function updateBatteryStatus() {
  const tasks = document.querySelectorAll(".task-item");
  const total = tasks.length;
  const completed = Array.from(tasks).filter(task =>
    task.classList.contains("completed")
  ).length;

  let completedPercent = 0;
  let remainingPercent = 0;

  if (total > 0) {
    completedPercent = Math.round((completed / total) * 100);
    remainingPercent = 100 - completedPercent;
  }

  const completedFill = document.getElementById("batteryCompletedFill");
  completedFill.style.height = `${completedPercent}%`;
  document.getElementById("batteryCompletedText").textContent = `${completedPercent}%`;
  completedFill.className = "battery-fill";

  if (completedPercent <= 30) completedFill.classList.add("completed-low");
  else if (completedPercent <= 70) completedFill.classList.add("completed-mid");
  else completedFill.classList.add("completed-high");

  const remainingFill = document.getElementById("batteryRemainingFill");
  remainingFill.style.height = `${remainingPercent}%`;
  document.getElementById("batteryRemainingText").textContent = `${remainingPercent}%`;
}

function updateLiveClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  document.getElementById("liveClock").textContent = `🕒 ${timeStr}`;
  checkTimers(now);
}
setInterval(updateLiveClock, 1000);

function checkTimers(now) {
  const tasks = document.querySelectorAll(".task-item");
  tasks.forEach(task => {
    const start = task.dataset.start;
    const duration = parseInt(task.dataset.duration);
    const timerStarted = task.dataset.timerStarted === "true";
    if (!start) return;

    const [h, m] = start.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(h, m, 0, 0);

    const endTime = new Date(startTime.getTime() + duration * 60000);
    const startInfo = task.querySelector(".start-info");
    const timerDisplay = task.querySelector(".timer");

    if (now >= startTime && now <= endTime) {
      task.dataset.timerStarted = "true";
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      startInfo.style.display = "none";
      timerDisplay.textContent = `⏳ ${min}m ${sec}s`;
    } else if (now > endTime && timerStarted) {
      startInfo.style.display = "none";
      timerDisplay.textContent = "✅ Time's up";
    }
  });
}

// Add this at the end:
function createBlueTick() {
  const tick = document.createElement("span");
  tick.textContent = "✅";
  tick.style.color = "blue";
  tick.style.marginRight = "5px";
  tick.title = "Email sent";
  return tick;
}

function createRedCross() {
  const cross = document.createElement("span");
  cross.textContent = "❌";
  cross.style.color = "red";
  cross.style.marginRight = "5px";
  cross.title = "Email failed";
  return cross;
}

function scheduleEmailNotification(taskItem, taskText, startTime, userEmail, emailStatusContainer) {
  const [h, m] = startTime.split(":").map(Number);
  const start = new Date();
  start.setHours(h, m, 0, 0);

  const reminderTime = new Date(start.getTime() - 2 * 60000); // 2 minutes before
  const now = new Date();
  const delay = reminderTime.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      fetch("https://script.google.com/macros/s/AKfycbxqXvpPHefFWbh_Kk3BIgCWtg_ixvUrHb1RJ3PhNCxhH9bipi4h9GlVRVUnus73PTkzRg/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, task: taskText, time: startTime })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          emailStatusContainer.appendChild(createBlueTick());
        } else {
          emailStatusContainer.appendChild(createRedCross());
        }
      })
      .catch(err => {
        console.error("❌ Email error:", err);
        emailStatusContainer.appendChild(createRedCross());
      });
    }, delay);
  }
}

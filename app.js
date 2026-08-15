/* =========================
   SCHOOL OS
========================= */


/* =========================
   DATA
========================= */

const subjects = [
  "Dějepis",
  "History",
  "Class Teacher Hour",
  "ZSV",
  "Mathematics",
  "Czech",
  "French",
  "English",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Integrated Science",
  "ICT",
  "PE",
  "Economics / Business / Finance"
];


const times = [
  ["", "", ""],
  ["", "8:00", "8:45"],
  ["", "8:50", "9:35"],
  ["", "9:50", "10:35"],
  ["", "10:40", "11:25"],
  ["", "11:30", "12:15"],
  ["", "12:20", "13:05"],
  ["", "13:15", "14:00"],
  ["", "14:05", "14:50"],
  ["", "14:55", "15:40"]
];


/* =========================
   TIMETABLE
========================= */

const timetable = {

  1: [
    "Mathematics",
    "English",
    "Dějepis",
    "Chemistry",
    "French",
    "ZSV",
    "PE",
    "Free",
    "Free"
  ],

  2: [
    "Czech",
    "Mathematics",
    "History",
    "Biology",
    "English",
    "Geography",
    "Free",
    "Free",
    "Free"
  ],

  3: [
    "Physics",
    "Mathematics",
    "Czech",
    "Integrated Science",
    "French",
    "English",
    "Free",
    "Free",
    "Free"
  ],

  4: [
    "Economics / Business / Finance",
    "Economics / Business / Finance",
    "Economics / Business / Finance",
    "Economics / Business / Finance",
    "Economics / Business / Finance",
    "Economics / Business / Finance",
    "Economics / Business / Finance",
    "Economics / Business / Finance",
    "Economics / Business / Finance"
  ],

  5: [
    "English",
    "Czech",
    "Mathematics",
    "Geography",
    "Biology",
    "Dějepis",
    "PE",
    "Free",
    "Free"
  ]

};


/* =========================
   STORAGE
========================= */

let tasks =
  JSON.parse(localStorage.getItem("schoolTasks")) || [];

let tests =
  JSON.parse(localStorage.getItem("schoolTests")) || [];

let events =
  JSON.parse(localStorage.getItem("schoolEvents")) || [];


function saveData() {

  localStorage.setItem(
    "schoolTasks",
    JSON.stringify(tasks)
  );

  localStorage.setItem(
    "schoolTests",
    JSON.stringify(tests)
  );

  localStorage.setItem(
    "schoolEvents",
    JSON.stringify(events)
  );

}


/* =========================
   DOM
========================= */

const appContent =
  document.getElementById("app-content");

const navButtons =
  document.querySelectorAll(".nav-button");


/* =========================
   HELPERS
========================= */

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }

  const date =
    new Date(dateString + "T00:00:00");

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

}


function daysUntil(dateString) {

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const date =
    new Date(dateString + "T00:00:00");

  return Math.ceil(
    (date - today) /
    (1000 * 60 * 60 * 24)
  );

}


function getTodayDay() {

  const day = new Date().getDay();

  return day === 0 ? 7 : day;

}


function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value ?? "";

  return div.innerHTML;

}


function emptyMessage(text) {

  return `
    <div class="empty">
      ${text}
    </div>
  `;

}


/* =========================
   NAVIGATION
========================= */

function setActive(page) {

  navButtons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.page === page
    );

  });

}


function showPage(page) {

  setActive(page);

  if (page === "home") {
    renderHome();
  }

  if (page === "tasks") {
    renderTasks();
  }

  if (page === "tests") {
    renderTests();
  }

  if (page === "calendar") {
    renderCalendar();
  }

  if (page === "timetable") {
    renderTimetable();
  }

  if (page === "subjects") {
    renderSubjects();
  }

}


navButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      showPage(
        button.dataset.page
      );

    }
  );

});


/* =========================
   HOME
========================= */

function renderHome() {

  const today =
    new Date();

  const hour =
    today.getHours();

  let greeting = "Good morning";

  if (hour >= 12 && hour < 18) {
    greeting = "Good afternoon";
  }

  if (hour >= 18) {
    greeting = "Good evening";
  }


  const todayDay =
    getTodayDay();

  const todaySchedule =
    timetable[todayDay] || [];


  const activeTasks =
    tasks.filter(
      task => !task.completed
    );


  const upcomingTests =
    [...tests]
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      )
      .slice(0, 3);


  let tomorrowDay =
    todayDay + 1;

  if (tomorrowDay > 5) {
    tomorrowDay = 1;
  }


  const tomorrowSchedule =
    timetable[tomorrowDay] || [];


  const scheduleHTML =
    todaySchedule.map(
      (subject, index) => {

        if (subject === "Free") {
          return "";
        }

        const time =
          times[index + 1];

        if (!time) {
          return "";
        }

        return `
          <div class="next-card">

            <div>

              <div class="next-label">
                ${time[1]}–${time[2]}
              </div>

              <div class="next-subject">
                ${escapeHTML(subject)}
              </div>

            </div>

          </div>
        `;

      }
    ).join("");


  const tomorrowHTML =
    tomorrowSchedule.map(
      (subject, index) => {

        if (subject === "Free") {
          return "";
        }

        const time =
          times[index + 1];

        if (!time) {
          return "";
        }

        return `
          <div class="tomorrow-item">

            <div class="tomorrow-subject">
              ${escapeHTML(subject)}
            </div>

            <div class="tomorrow-time">
              ${time[1]}–${time[2]}
            </div>

          </div>
        `;

      }
    ).join("");


  appContent.innerHTML = `

    <div class="greeting">

      <h1>
        ${greeting} 👋
      </h1>

      <p>
        Everything you need for school, in one place.
      </p>

      <div class="quick-actions">

        <button onclick="openTaskModal()">
          + Add Task
        </button>

        <button onclick="openTestModal()">
          + Add Test
        </button>

        <button onclick="openEventModal()">
          + Add Event
        </button>

      </div>

    </div>


    <div class="dashboard-grid">

      <section class="card">

        <h2>
          Today
        </h2>

        <p class="card-subtitle">
          Your schedule for today.
        </p>

        <div class="now-card">

          <div class="now-label">
            ${todaySchedule.length ? "School day" : "No classes"}
          </div>

          <div class="now-subject">
            ${todaySchedule.filter(
              subject => subject !== "Free"
            ).length} classes
          </div>

          <div class="now-time">
            ${today.toLocaleDateString(
              "en-GB",
              {
                weekday: "long",
                day: "numeric",
                month: "long"
              }
            )}
          </div>

        </div>

        ${scheduleHTML ||
          emptyMessage("No classes today.")}

      </section>


      <div>

        <section class="card">

          <h2>
            Tomorrow
          </h2>

          <p class="card-subtitle">
            A quick look at what's coming.
          </p>

          <div class="tomorrow-list">

            ${
              tomorrowHTML ||
              emptyMessage("No classes tomorrow.")
            }

          </div>

        </section>


        <section
          class="card"
          style="margin-top:20px"
        >

          <h2>
            Overview
          </h2>

          <p class="card-subtitle">
            Your school life at a glance.
          </p>

          <div class="progress-box">

            <div class="progress-label">

              <span>
                Open tasks
              </span>

              <strong>
                ${activeTasks.length}
              </strong>

            </div>

          </div>

          <div class="progress-box">

            <div class="progress-label">

              <span>
                Upcoming tests
              </span>

              <strong>
                ${upcomingTests.length}
              </strong>

            </div>

          </div>

        </section>

      </div>

    </div>

  `;

}


/* =========================
   TASKS
========================= */

function renderTasks() {

  const sortedTasks =
    [...tasks].sort(
      (a, b) =>
        new Date(a.due) -
        new Date(b.due)
    );


  let html = "";


  sortedTasks.forEach(task => {

    const days =
      daysUntil(task.due);


    let countdown =
      "";

    if (task.completed) {

      countdown =
        "Completed";

    } else if (days < 0) {

      countdown =
        "Overdue";

    } else if (days === 0) {

      countdown =
        "Due today";

    } else if (days === 1) {

      countdown =
        "Due tomorrow";

    } else {

      countdown =
        `${days} days`;

    }


    html += `

      <div
        class="task-item
        ${task.completed ? "completed" : ""}"
      >

        <input
          type="checkbox"
          class="check-task"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask('${task.id}')"
        >

        <div class="item-main">

          <div class="item-title">
            ${escapeHTML(task.name)}
          </div>

          <div class="item-meta">

            <span class="badge">
              ${escapeHTML(task.type)}
            </span>

            ${
              task.subject
                ? `<span class="badge">
                    ${escapeHTML(task.subject)}
                   </span>`
                : ""
            }

            ${formatDate(task.due)}

            · ${task.time} min

          </div>

        </div>

        <div class="countdown">
          ${countdown}
        </div>

        <button
          class="small-button"
          onclick="deleteTask('${task.id}')"
        >
          ×
        </button>

      </div>

    `;

  });


  appContent.innerHTML = `

    <div class="page-header">

      <div>

        <h1>
          Tasks
        </h1>

        <p class="page-description">
          Everything you need to get done.
        </p>

      </div>

      <button
        class="add-button"
        onclick="openTaskModal()"
      >
        + Add Task
      </button>

    </div>


    <section class="card">

      <div class="item-list">

        ${
          html ||
          emptyMessage(
            "No tasks yet. You're all caught up! ✨"
          )
        }

      </div>

    </section>

  `;

}


function toggleTask(id) {

  const task =
    tasks.find(
      item => item.id === id
    );

  if (!task) {
    return;
  }

  task.completed =
    !task.completed;

  saveData();

  renderTasks();

}


function deleteTask(id) {

  tasks =
    tasks.filter(
      task => task.id !== id
    );

  saveData();

  renderTasks();

}


/* =========================
   TESTS
========================= */

function renderTests() {

  const sortedTests =
    [...tests].sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );


  let html = "";


  sortedTests.forEach(test => {

    const days =
      daysUntil(test.date);


    let countdown =
      "";


    if (days < 0) {

      countdown =
        "Past";

    } else if (days === 0) {

      countdown =
        "Today";

    } else if (days === 1) {

      countdown =
        "Tomorrow";

    } else {

      countdown =
        `In ${days} days`;

    }


    html += `

      <div class="test-item">

        <div class="item-main">

          <div class="item-title">
            ${escapeHTML(test.topic)}
          </div>

          <div class="item-meta">

            <span class="badge">
              ${escapeHTML(test.subject)}
            </span>

            ${formatDate(test.date)}

            · Study:
            ${test.time} min

          </div>

          ${
            test.notes
              ? `
                <div class="test-notes">
                  ${escapeHTML(test.notes)}
                </div>
              `
              : ""
          }

        </div>

        <div class="countdown">
          ${countdown}
        </div>

        <button
          class="small-button"
          onclick="deleteTest('${test.id}')"
        >
          ×
        </button>

      </div>

    `;

  });


  appContent.innerHTML = `

    <div class="page-header">

      <div>

        <h1>
          Tests
        </h1>

        <p class="page-description">
          Never get surprised by a test again.
        </p>

      </div>

      <button
        class="add-button"
        onclick="openTestModal()"
      >
        + Add Test
      </button>

    </div>


    <section class="card">

      <div class="item-list">

        ${
          html ||
          emptyMessage(
            "No upcoming tests. 🎉"
          )
        }

      </div>

    </section>

  `;

}


function deleteTest(id) {

  tests =
    tests.filter(
      test => test.id !== id
    );

  saveData();

  renderTests();

}


/* =========================
   CALENDAR
========================= */

let calendarDate =
  new Date();


function renderCalendar() {

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();


  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const offset =
    firstDay === 0
      ? 6
      : firstDay - 1;


  let cells = "";


  for (
    let i = 0;
    i < offset;
    i++
  ) {

    cells += `
      <div class="calendar-day"></div>
    `;

  }


  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const dateString =
      `${year}-${String(
        month + 1
      ).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;


    const today =
      new Date();


    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();


    let eventsHTML = "";


    tasks
      .filter(
        task =>
          task.due === dateString
      )
      .forEach(task => {

        eventsHTML += `
          <div class="calendar-event calendar-task">
            ${escapeHTML(task.name)}
          </div>
        `;

      });


    tests
      .filter(
        test =>
          test.date === dateString
      )
      .forEach(test => {

        eventsHTML += `
          <div class="calendar-event calendar-test">
            Test: ${escapeHTML(test.subject)}
          </div>
        `;

      });


    events
      .filter(
        event =>
          event.date === dateString
      )
      .forEach(event => {

        eventsHTML += `
          <div class="calendar-event calendar-personal">
            ${escapeHTML(event.name)}
          </div>
        `;

      });


    cells += `

      <div
        class="calendar-day
        ${isToday ? "today" : ""}"
      >

        <div class="calendar-day-number">
          ${day}
        </div>

        ${eventsHTML}

      </div>

    `;

  }


  appContent.innerHTML = `

    <div class="page-header">

      <div>

        <h1>
          Calendar
        </h1>

        <p class="page-description">
          Your tasks, tests and events together.
        </p>

      </div>

      <button
        class="add-button"
        onclick="openEventModal()"
      >
        + Add Event
      </button>

    </div>


    <section class="card">

      <div class="calendar-header">

        <button
          class="calendar-arrow"
          onclick="changeMonth(-1)"
        >
          ‹
        </button>

        <h3>
          ${calendarDate.toLocaleDateString(
            "en-GB",
            {
              month: "long",
              year: "numeric"
            }
          )}
        </h3>

        <button
          class="calendar-arrow"
          onclick="changeMonth(1)"
        >
          ›
        </button>

      </div>


      <div class="calendar-weekdays">

        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>

      </div>


      <div class="calendar-grid">

        ${cells}

      </div>

    </section>

  `;

}


function changeMonth(amount) {

  calendarDate.setMonth(
    calendarDate.getMonth() + amount
  );

  renderCalendar();

}


/* =========================
   TIMETABLE
========================= */

function renderTimetable() {

  const dayNames = [
    "",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
  ];


  let html = "";


  for (
    let day = 1;
    day <= 5;
    day++
  ) {

    html += `

      <section
        class="card"
        style="margin-bottom:20px"
      >

        <h2>
          ${dayNames[day]}
        </h2>

        <p class="card-subtitle">
          Your regular timetable
        </p>

        <div class="schedule">

    `;


    timetable[day].forEach(
      (subject, index) => {

        const time =
          times[index + 1];


        if (!time) {
          return;
        }


        html += `

          <div class="schedule-row">

            <div class="schedule-time">
              ${time[1]}–${time[2]}
            </div>

            <div class="
              schedule-subject
              ${subject === "Free" ? "free" : ""}
            ">

              ${escapeHTML(subject)}

            </div>

          </div>

        `;

      }
    );


    html += `

        </div>

      </section>

    `;

  }


  appContent.innerHTML =
    html;

}


/* =========================
   SUBJECTS
========================= */

function renderSubjects() {

  let html = "";


  subjects.forEach(subject => {

    html += `

      <div class="subject-card">

        <strong>
          ${escapeHTML(subject)}
        </strong>

        <p>
          School subject
        </p>

      </div>

    `;

  });


  appContent.innerHTML = `

    <section class="card">

      <h2>
        Subjects
      </h2>

      <p class="card-subtitle">
        Your school subjects.
      </p>

      <div class="subject-grid">

        ${html}

      </div>

    </section>

  `;

}


/* =========================
   TASK MODAL
========================= */

function openTaskModal() {

  document
    .getElementById("task-modal")
    .classList.remove("hidden");

}


function closeTaskModal() {

  document
    .getElementById("task-modal")
    .classList.add("hidden");

}


document
  .getElementById("close-task-modal")
  .addEventListener(
    "click",
    closeTaskModal
  );


document
  .getElementById("cancel-task")
  .addEventListener(
    "click",
    closeTaskModal
  );


document
  .getElementById("task-type")
  .addEventListener(
    "change",
    event => {

      const subjectField =
        document.getElementById(
          "subject-field"
        );

      const subject =
        document.getElementById(
          "task-subject"
        );


      if (
        event.target.value === "other"
      ) {

        subjectField.style.display =
          "none";

        subject.required =
          false;

        subject.value =
          "";

      } else {

        subjectField.style.display =
          "flex";

        subject.required =
          true;

      }

    }
  );


document
  .getElementById("task-form")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const task = {

        id:
          Date.now().toString(),

        type:
          document.getElementById(
            "task-type"
          ).value,

        subject:
          document.getElementById(
            "task-subject"
          ).value,

        name:
          document.getElementById(
            "task-name"
          ).value,

        due:
          document.getElementById(
            "task-due"
          ).value,

        time:
          document.getElementById(
            "task-time"
          ).value,

        completed:
          false

      };


      tasks.push(task);

      saveData();

      event.target.reset();

      closeTaskModal();

      showPage("tasks");

    }
  );


/* =========================
   TEST MODAL
========================= */

function openTestModal() {

  document
    .getElementById("test-modal")
    .classList.remove("hidden");

}


function closeTestModal() {

  document
    .getElementById("test-modal")
    .classList.add("hidden");

}


document
  .getElementById("close-test-modal")
  .addEventListener(
    "click",
    closeTestModal
  );


document
  .getElementById("cancel-test")
  .addEventListener(
    "click",
    closeTestModal
  );


document
  .getElementById("test-form")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const test = {

        id:
          Date.now().toString(),

        subject:
          document.getElementById(
            "test-subject"
          ).value,

        topic:
          document.getElementById(
            "test-topic"
          ).value,

        date:
          document.getElementById(
            "test-date"
          ).value,

        time:
          document.getElementById(
            "test-time"
          ).value,

        notes:
          document.getElementById(
            "test-notes"
          ).value

      };


      tests.push(test);

      saveData();

      event.target.reset();

      closeTestModal();

      showPage("tests");

    }
  );


/* =========================
   EVENT MODAL
========================= */

function openEventModal() {

  document
    .getElementById("event-modal")
    .classList.remove("hidden");

}


function closeEventModal() {

  document
    .getElementById("event-modal")
    .classList.add("hidden");

}


document
  .getElementById("close-event-modal")
  .addEventListener(
    "click",
    closeEventModal
  );


document
  .getElementById("cancel-event")
  .addEventListener(
    "click",
    closeEventModal
  );


document
  .getElementById("event-form")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const newEvent = {

        id:
          Date.now().toString(),

        name:
          document.getElementById(
            "event-name"
          ).value,

        date:
          document.getElementById(
            "event-date"
          ).value,

        start:
          document.getElementById(
            "event-start"
          ).value,

        end:
          document.getElementById(
            "event-end"
          ).value

      };


      events.push(newEvent);

      saveData();

      event.target.reset();

      closeEventModal();

      showPage("calendar");

    }
  );


/* =========================
   CLOSE MODAL ON BACKDROP
========================= */

document
  .querySelectorAll(".modal")
  .forEach(modal => {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          modal.classList.add(
            "hidden"
          );

        }

      }
    );

  });


/* =========================
   START APP
========================= */

showPage("home");

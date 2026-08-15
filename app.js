/* =========================
   SCHOOL OS
========================= */


/* =========================
   BASIC DATA
========================= */

const appContent =
  document.getElementById("app-content");


const navButtons =
  document.querySelectorAll(".nav-button");


/* =========================
   SCHOOL TIMES
========================= */

const times = [
  null,

  ["1", "08:30", "09:15"],
  ["2", "09:20", "10:05"],
  ["3", "10:35", "11:20"],
  ["4", "11:25", "12:10"],
  ["5", "12:20", "13:05"],
  ["6", "13:10", "13:55"],
  ["7", "14:05", "14:50"],
  ["8", "14:55", "15:40"],
  ["9", "15:45", "16:30"]
];


/* =========================
   SUBJECTS
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


/* =========================
   TIMETABLE
========================= */

const timetable = {

  1: [
    "Dějepis",
    "History",
    "Class Teacher Hour",
    "ZSV",
    "Mathematics",
    "Czech",
    "Free",
    "English"
  ],

  2: [
    "PE",
    "PE",
    "Dějepis",
    "Physics",
    "Mathematics",
    "Free",
    "Chemistry",
    "French"
  ],

  3: [
    "English",
    "English",
    "Biology",
    "Geography",
    "Czech",
    "Czech",
    "Free",
    "History",
    "ZSV"
  ],

  4: [
    "Mathematics",
    "Mathematics",
    "French",
    "Physics",
    "Free",
    "Free",
    "Integrated Science",
    "Economics / Business / Finance",
    "Economics / Business / Finance"
  ],

  5: [
    "Czech",
    "ICT",
    "French",
    "English",
    "Chemistry",
    "Biology",
    "Free",
    "Geography"
  ]

};


/* =========================
   LOCAL STORAGE
========================= */

let tasks =
  JSON.parse(
    localStorage.getItem("schoolOS_tasks") || "[]"
  );


let tests =
  JSON.parse(
    localStorage.getItem("schoolOS_tests") || "[]"
  );


let events =
  JSON.parse(
    localStorage.getItem("schoolOS_events") || "[]"
  );


function saveData() {

  localStorage.setItem(
    "schoolOS_tasks",
    JSON.stringify(tasks)
  );

  localStorage.setItem(
    "schoolOS_tests",
    JSON.stringify(tests)
  );

  localStorage.setItem(
    "schoolOS_events",
    JSON.stringify(events)
  );

}


/* =========================
   HELPERS
========================= */

function todayString() {

  const date = new Date();

  return date.toISOString().split("T")[0];

}


function formatDate(dateString) {

  if (!dateString) return "";

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

  const today =
    new Date();

  today.setHours(0, 0, 0, 0);

  const target =
    new Date(dateString + "T00:00:00");

  target.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target - today) /
    (1000 * 60 * 60 * 24)
  );

}


function getDayNumber(date = new Date()) {

  const day = date.getDay();

  if (day === 0) return 7;

  return day;

}


function getTimeMinutes(time) {

  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;

}


function currentMinutes() {

  const now = new Date();

  return (
    now.getHours() * 60 +
    now.getMinutes()
  );

}


/* =========================
   HOME
========================= */

function renderHome() {

  const now =
    new Date();

  const hour =
    now.getHours();

  let greeting = "Good morning";

  if (hour >= 12 && hour < 18) {
    greeting = "Good afternoon";
  }

  if (hour >= 18) {
    greeting = "Good evening";
  }


  const day =
    getDayNumber(now);


  const todaySchedule =
    timetable[day] || [];


  const current =
    currentMinutes();


  let currentIndex = -1;
  let nextIndex = -1;


  todaySchedule.forEach(
    (subject, index) => {

      const time =
        times[index + 1];

      if (!time) return;

      const start =
        getTimeMinutes(time[1]);

      const end =
        getTimeMinutes(time[2]);


      if (
        current >= start &&
        current < end
      ) {
        currentIndex = index;
      }


      if (
        nextIndex === -1 &&
        current < start
      ) {
        nextIndex = index;
      }

    }
  );


  let currentSubject = "School day";

  let currentTime = "No class right now";


  if (currentIndex !== -1) {

    currentSubject =
      todaySchedule[currentIndex];

    const time =
      times[currentIndex + 1];

    currentTime =
      `${time[1]}–${time[2]}`;

  }


  let nextHTML =
    `<div class="empty">No more classes today.</div>`;


  if (nextIndex !== -1) {

    const subject =
      todaySchedule[nextIndex];

    const time =
      times[nextIndex + 1];


    nextHTML = `

      <div class="next-card">

        <div>

          <div class="next-label">
            Next
          </div>

          <div class="next-subject">
            ${subject}
          </div>

        </div>

        <div class="next-time">
          ${time[1]}–${time[2]}
        </div>

      </div>

    `;

  }


  const tomorrow =
    new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );


  let tomorrowHTML = "";


  if (
    tomorrow.getDay() !== 0 &&
    tomorrow.getDay() !== 6
  ) {

    const tomorrowDay =
      getDayNumber(tomorrow);

    const tomorrowSchedule =
      timetable[tomorrowDay] || [];


    tomorrowSchedule.forEach(
      (subject, index) => {

        const time =
          times[index + 1];

        tomorrowHTML += `

          <div class="tomorrow-item">

            <div class="tomorrow-subject">
              ${subject}
            </div>

            <div class="tomorrow-time">
              ${time[1]}–${time[2]}
            </div>

          </div>

        `;

      }
    );

  }


  if (!tomorrowHTML) {

    tomorrowHTML =
      `<div class="empty">
        No school tomorrow.
      </div>`;

  }


  const upcomingTests =
    tests
      .filter(test =>
        !test.completed &&
        daysUntil(test.date) >= 0
      )
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      )
      .slice(0, 3);


  let testsHTML = "";


  upcomingTests.forEach(test => {

    const days =
      daysUntil(test.date);


    let countdown =
      `${days} days left`;

    if (days === 0) {
      countdown = "Today";
    }

    if (days === 1) {
      countdown = "Tomorrow";
    }


    testsHTML += `

      <div class="test-item">

        <div class="item-main">

          <div class="item-title">
            ${test.subject}
          </div>

          <div class="item-meta">
            ${test.topic}
          </div>

        </div>

        <div class="countdown">
          ${countdown}
        </div>

      </div>

    `;

  });


  if (!testsHTML) {

    testsHTML =
      `<div class="empty">
        No upcoming tests.
      </div>`;

  }


  const pendingTasks =
    tasks.filter(
      task => !task.completed
    );


  const completedTasks =
    tasks.filter(
      task => task.completed
    );


  const totalTasks =
    tasks.length;


  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          completedTasks.length /
          totalTasks *
          100
        );


  const totalStudyMinutes =
    tests.reduce(
      (sum, test) =>
        sum + Number(test.time || 0),
      0
    );


  appContent.innerHTML = `

    <div class="greeting">

      <h1>
        ${greeting} 👋
      </h1>

      <p>
        Here's everything you need for today.
      </p>


      <div class="quick-actions">

        <button onclick="openTaskModal()">
          + Add task
        </button>

        <button onclick="openTestModal()">
          + Add test
        </button>

        <button onclick="openEventModal()">
          + Add event
        </button>

      </div>

    </div>


    <div class="dashboard-grid">


      <div>


        <section class="card">

          <h2>
            Today
          </h2>

          <p class="card-subtitle">
            Your school day
          </p>


          <div class="now-card">

            <div class="now-label">
              Now
            </div>

            <div class="now-subject">
              ${currentSubject}
            </div>

            <div class="now-time">
              ${currentTime}
            </div>

          </div>


          ${nextHTML}

        </section>


        <section
          class="card"
          style="margin-top:20px"
        >

          <h2>
            Tomorrow
          </h2>

          <p class="card-subtitle">
            A quick look ahead
          </p>

          <div class="tomorrow-list">

            ${tomorrowHTML}

          </div>

        </section>


      </div>


      <div>


        <section class="card">

          <h2>
            Upcoming tests
          </h2>

          <p class="card-subtitle">
            Don't let them sneak up on you.
          </p>

          <div class="item-list">

            ${testsHTML}

          </div>

        </section>


        <section
          class="card"
          style="margin-top:20px"
        >

          <h2>
            This week
          </h2>

          <p class="card-subtitle">
            Your school progress
          </p>


          <div class="progress-box">

            <div class="progress-label">

              <span>
                Tasks completed
              </span>

              <span>
                ${completedTasks.length}/${totalTasks}
              </span>

            </div>


            <div class="progress-track">

              <div
                class="progress-fill"
                style="width:${progress}%"
              ></div>

            </div>

          </div>


          <div
            style="
              margin-top:20px;
              color:#858a95;
              font-size:13px;
            "
          >

            ${pendingTasks.length}
            task${pendingTasks.length === 1 ? "" : "s"}
            remaining

            <br><br>

            ${tests.length}
            test${tests.length === 1 ? "" : "s"}
            planned

            <br><br>

            ${Math.round(totalStudyMinutes / 60 * 10) / 10}
            hours of study planned

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

    const due =
      daysUntil(task.due);


    let dueText =
      `${due} days left`;

    if (due === 0) {
      dueText = "Due today";
    }

    if (due === 1) {
      dueText = "Due tomorrow";
    }

    if (due < 0) {
      dueText = "Overdue";
    }


    html += `

      <div
        class="
          task-item
          ${task.completed ? "completed" : ""}
        "
      >

        <input
          class="check-task"
          type="checkbox"
          ${task.completed ? "checked" : ""}
          onchange="toggleTask('${task.id}')"
        >


        <div class="item-main">

          <div class="item-title">
            ${task.name}
          </div>

          <div class="item-meta">

            <span class="badge">
              ${task.type}
            </span>

            ${task.subject || "Other"}

            · ${formatDate(task.due)}

            · ${task.time} min

          </div>

        </div>


        <div class="countdown">
          ${dueText}
        </div>


        <div class="task-actions">

          <button
            class="small-button"
            onclick="editTask('${task.id}')"
          >
            ✎
          </button>

          <button
            class="small-button"
            onclick="deleteTask('${task.id}')"
          >
            ×
          </button>

        </div>

      </div>

    `;

  });


  if (!html) {

    html =
      `<div class="empty">
        No tasks yet. You're all caught up.
      </div>`;

  }


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
        + Add task
      </button>

    </div>


    <section class="card">

      <div class="item-list">

        ${html}

      </div>

    </section>

  `;

}


function toggleTask(id) {

  const task =
    tasks.find(
      task => task.id === id
    );


  if (!task) return;


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
   TASK MODAL
========================= */

let editingTaskId = null;


function openTaskModal(taskId = null) {

  const modal =
    document.getElementById(
      "task-modal"
    );


  editingTaskId =
    taskId;


  if (taskId) {

    const task =
      tasks.find(
        task => task.id === taskId
      );


    if (!task) return;


    document.getElementById(
      "task-type"
    ).value = task.type;


    document.getElementById(
      "task-subject"
    ).value = task.subject || "";


    document.getElementById(
      "task-name"
    ).value = task.name;


    document.getElementById(
      "task-due"
    ).value = task.due;


    document.getElementById(
      "task-time"
    ).value = task.time;

  } else {

    document
      .getElementById("task-form")
      .reset();


    document.getElementById(
      "task-due"
    ).value = todayString();

  }


  modal.classList.remove("hidden");

}


function editTask(id) {

  openTaskModal(id);

}


function closeTaskModal() {

  document
    .getElementById("task-modal")
    .classList.add("hidden");

  editingTaskId = null;

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

        subject.required = false;

        subject.value = "";

      } else {

        subjectField.style.display =
          "flex";

        subject.required = true;

      }

    }
  );


document
  .getElementById("task-form")
  .addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const taskData = {

        id:
          editingTaskId ||
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
          Number(
            document.getElementById(
              "task-time"
            ).value
          )

      };


      if (editingTaskId) {

        const index =
          tasks.findIndex(
            task =>
              task.id === editingTaskId
          );


        if (index !== -1) {

          taskData.completed =
            tasks[index].completed;

          tasks[index] =
            taskData;

        }

      } else {

        taskData.completed =
          false;

        tasks.push(taskData);

      }


      saveData();

      closeTaskModal();

      showPage("tasks");

    }
  );


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
      `${days} days left`;

    if (days === 0) {
      countdown = "Today";
    }

    if (days === 1) {
      countdown = "Tomorrow";
    }

    if (days < 0) {
      countdown = "Past";
    }


    html += `

      <div class="test-item">

        <div class="item-main">

          <div class="item-title">

            ${test.subject}

            <span class="badge">
              ${test.time} min study
            </span>

          </div>


          <div class="item-meta">

            ${test.topic}

            · ${formatDate(test.date)}

          </div>


          ${
            test.notes
              ? `
                <div class="test-notes">
                  ${test.notes}
                </div>
              `
              : ""
          }

        </div>


        <div class="countdown">
          ${countdown}
        </div>


        <div class="test-actions">

          <button
            class="small-button"
            onclick="editTest('${test.id}')"
          >
            ✎
          </button>

          <button
            class="small-button"
            onclick="deleteTest('${test.id}')"
          >
            ×
          </button>

        </div>

      </div>

    `;

  });


  if (!html) {

    html =
      `<div class="empty">
        No tests added yet.
      </div>`;

  }


  appContent.innerHTML = `

    <div class="page-header">

      <div>

        <h1>
          Tests
        </h1>

        <p class="page-description">
          Upcoming tests, topics and study time.
        </p>

      </div>


      <button
        class="add-button"
        onclick="openTestModal()"
      >
        + Add test
      </button>

    </div>


    <section class="card">

      <div class="item-list">

        ${html}

      </div>

    </section>

  `;

}


let editingTestId = null;


function openTestModal(testId = null) {

  const modal =
    document.getElementById(
      "test-modal"
    );


  editingTestId =
    testId;


  if (testId) {

    const test =
      tests.find(
        test => test.id === testId
      );


    if (!test) return;


    document.getElementById(
      "test-subject"
    ).value = test.subject;


    document.getElementById(
      "test-topic"
    ).value = test.topic;


    document.getElementById(
      "test-date"
    ).value = test.date;


    document.getElementById(
      "test-time"
    ).value = test.time;


    document.getElementById(
      "test-notes"
    ).value = test.notes || "";


  } else {

    document
      .getElementById("test-form")
      .reset();


    document.getElementById(
      "test-date"
    ).value = todayString();

  }


  modal.classList.remove("hidden");

}


function editTest(id) {

  openTestModal(id);

}


function deleteTest(id) {

  tests =
    tests.filter(
      test => test.id !== id
    );


  saveData();

  renderTests();

}


function closeTestModal() {

  document
    .getElementById("test-modal")
    .classList.add("hidden");

  editingTestId = null;

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


      const testData = {

        id:
          editingTestId ||
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
          Number(
            document.getElementById(
              "test-time"
            ).value
          ),

        notes:
          document.getElementById(
            "test-notes"
          ).value,

        completed: false

      };


      if (editingTestId) {

        const index =
          tests.findIndex(
            test =>
              test.id === editingTestId
          );


        if (index !== -1) {

          tests[index] =
            {
              ...tests[index],
              ...testData
            };

        }

      } else {

        tests.push(testData);

      }


      saveData();

      closeTestModal();

      showPage("tests");

    }
  );


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
    );


  let startDay =
    firstDay.getDay();

  if (startDay === 0) {
    startDay = 7;
  }


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const monthName =
    calendarDate.toLocaleDateString(
      "en-GB",
      {
        month: "long",
        year: "numeric"
      }
    );


  let cells = "";


  for (
    let i = 1;
    i < startDay;
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

    const date =
      new Date(
        year,
        month,
        day
      );


    const dateString =
      date.toISOString()
        .split("T")[0];


    const isToday =
      dateString === todayString();


    let dayEvents = "";


    events
      .filter(
        event =>
          event.date === dateString
      )
      .forEach(event => {

        dayEvents += `

          <div class="calendar-event calendar-personal">

            ${event.name}

          </div>

        `;

      });


    tasks
      .filter(
        task =>
          task.due === dateString
      )
      .forEach(task => {

        dayEvents += `

          <div class="calendar-event calendar-task">

            ✓ ${task.name}

          </div>

        `;

      });


    tests
      .filter(
        test =>
          test.date === dateString
      )
      .forEach(test => {

        dayEvents += `

          <div class="calendar-event calendar-test">

            🧪 ${test.subject}

          </div>

        `;

      });


    cells += `

      <div
        class="
          calendar-day
          ${isToday ? "today" : ""}
        "
      >

        <div class="calendar-day-number">
          ${day}
        </div>

        ${dayEvents}

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
          Tasks, tests and everything else in one place.
        </p>

      </div>


      <button
        class="add-button"
        onclick="openEventModal()"
      >
        + Add event
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
          ${monthName}
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
   EVENT MODAL
========================= */

function openEventModal() {

  document
    .getElementById("event-form")
    .reset();


  document.getElementById(
    "event-date"
  ).value = todayString();


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


      events.push({

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

      });


      saveData();

      closeEventModal();

      showPage("calendar");

    }
  );


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


        html += `

          <div class="schedule-row">

            <div class="schedule-time">
              ${time[1]}–${time[2]}
            </div>

            <div
              class="
                schedule-subject
                ${subject === "Free" ? "free" : ""}
              "
            >

              ${subject}

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
          ${subject}
        </strong>

        <p>
          School subject
        </p>

      </div>

    `;

  });


  appContent.innerHTML = `

    <div class="page-header">

      <div>

        <h1>
          Subjects
        </h1>

        <p class="page-description">
          Your school subjects.
        </p>

      </div>

    </div>


    <section class="card">

      <div class="subject-grid">

        ${html}

      </div>

    </section>

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
   START APP
========================= */

showPage("home");
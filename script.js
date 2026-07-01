// script.js

const monthsGrid = document.getElementById("monthsGrid");
const notesContainer = document.getElementById("notesContainer");

const prevYearBtn = document.getElementById("prevYear");
const nextYearBtn = document.getElementById("nextYear");
const yearDisplay = document.getElementById("yearDisplay");

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const pastelClasses = [
  "color-0",
  "color-1",
  "color-2",
  "color-3",
  "color-4",
  "color-5",
];

let activeYear = new Date().getFullYear();

const today = new Date();

const STORAGE_KEY = "fullmoon.pocketplanner.yearlylog";

let plannerData = {};
let yearlyData = {};

/* ---------- INIT ---------- */
loadYear(activeYear);
renderYear(activeYear);

/* ---------- YEAR BUTTONS ---------- */
function loadYear(year) {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  plannerData = saved?.data || {};
  plannerData[year] ??= {};
  yearlyData = plannerData[year];
}

prevYearBtn.addEventListener("click", () => {
  activeYear--;
  loadYear(activeYear);
  renderYear(activeYear);
});

nextYearBtn.addEventListener("click", () => {
  activeYear++;
  loadYear(activeYear);
  renderYear(activeYear);
});

/* ---------- RENDER YEAR ---------- */

function renderYear(year) {
  yearDisplay.textContent = year;

  monthsGrid.innerHTML = "";

  for (let month = 0; month < 12; month++) {
    const monthRow = document.createElement("div");
    monthRow.className = "month-row";

    /* LEFT CALENDAR */

    const monthCard = createMonth(year, month);

    /* RIGHT NOTES */

    const monthNotes = document.createElement("div");
    monthNotes.className = "month-notes";
    monthNotes.id = `notes-${month}`;

    monthRow.appendChild(monthCard);
    monthRow.appendChild(monthNotes);

    monthsGrid.appendChild(monthRow);

    renderMonthNotes(year, month);
  }

  scrollToCurrentMonth(year);
}

/* ---------- CREATE MONTH ---------- */

function createMonth(year, month) {
  const monthCard = document.createElement("div");
  monthCard.className = "month-card";
  monthCard.id = `month-${month}`;

  const title = document.createElement("h2");
  title.className = "month-title";
  title.textContent = monthNames[month];

  const weekdays = document.createElement("div");
  weekdays.className = "weekdays";

  weekdayNames.forEach((day) => {
    const span = document.createElement("span");
    span.textContent = day;
    weekdays.appendChild(span);
  });

  const daysGrid = document.createElement("div");
  daysGrid.className = "days-grid";

  const firstDay = new Date(year, month, 1).getDay();

  const totalDays = new Date(year, month + 1, 0).getDate();

  /* EMPTY BOXES */

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";

    daysGrid.appendChild(empty);
  }

  /* REAL DAYS */

  for (let day = 1; day <= totalDays; day++) {
    const dayEl = document.createElement("div");
    dayEl.className = "day";
    dayEl.textContent = day;

    const monthData = yearlyData[month] || {};

    /* TODAY */

    if (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    ) {
      dayEl.classList.add("today");
    }

    if (monthData[day]) {
      dayEl.classList.add(pastelClasses[monthData[day].colorIndex]);
    }

    /* CLICK */

    dayEl.addEventListener("click", () => {
      handleDayClick(year, month, day, dayEl);
    });

    daysGrid.appendChild(dayEl);
  }

  monthCard.appendChild(title);
  monthCard.appendChild(weekdays);
  monthCard.appendChild(daysGrid);

  return monthCard;
}

/* ---------- CLICK DAY ---------- */

function handleDayClick(year, month, day, element) {
  const monthData = yearlyData[month] ??= {};

  if (!monthData[day]) {
    monthData[day] = {
      colorIndex: 0,
      note: "",
    };
  } else {
    monthData[day].colorIndex++;

    /* REMOVE IF OVER */

    if (monthData[day].colorIndex >= pastelClasses.length) {
      delete monthData[day];

      if (Object.keys(monthData).length === 0) {
        delete yearlyData[month];
      }

      element.className = "day";

      if (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate()
      ) {
        element.classList.add("today");
      }

      saveData();
      renderMonthNotes(year, month);

      return;
    }
  }

  element.className = "day";

  element.classList.add(pastelClasses[monthData[day].colorIndex]);

  if (
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate()
  ) {
    element.classList.add("today");
  }

  saveData();

  renderMonthNotes(year, month);
}

/* ---------- NOTES ---------- */

function renderMonthNotes(year, month) {
  const container = document.getElementById(`notes-${month}`);

  container.innerHTML = "";

  const monthData = yearlyData[month] || {};

  const entries = Object.entries(monthData);

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="empty-note">
        No notes yet.
      </div>
    `;

    return;
  }

  entries.forEach(([key, value]) => {
    const d = key;

    const noteItem = document.createElement("div");
    noteItem.className = "note-item";

    noteItem.innerHTML = `

  <div class="note-line">

        <div class="note-badge ${pastelClasses[value.colorIndex]}">
        ${d}
        </div>

        <input
        type="text"
        class="note-input"
        placeholder=""
        value="${value.note || ""}"
        />

    </div>

    `;

    const input = noteItem.querySelector(".note-input");

    input.addEventListener("input", () => {
      monthData[key].note = input.value;

      saveData();
    });

    container.appendChild(noteItem);
  });
}

/* ---------- STORAGE ---------- */

function notifyDashboardSync() {
  if (window.parent !== window) {
    window.parent.postMessage(
      {
        type: "plannerChanged",
        planner: STORAGE_KEY,
      },
      "*",
    );
  }
}

function saveData() {
  plannerData[activeYear] = yearlyData;

  localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify({
      data: plannerData,

      updatedAt: Date.now(),
    }),
  );

  notifyDashboardSync();
}

/* ---------- AUTO SCROLL ---------- */

function scrollToCurrentMonth(year) {
  if (year !== today.getFullYear()) return;

  setTimeout(() => {
    const currentMonth = document.getElementById(`month-${today.getMonth()}`);
    const main = document.querySelector("main");

    if (currentMonth && main) {
      main.scrollTo({
        left: currentMonth.parentElement.offsetLeft,
        behavior: "smooth",
      });
    }
  }, 100);
}

lucide.createIcons();

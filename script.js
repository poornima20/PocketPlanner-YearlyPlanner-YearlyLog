// script.js

const monthsGrid = document.getElementById("monthsGrid");
const notesContainer = document.getElementById("notesContainer");

const prevYearBtn = document.getElementById("prevYear");
const nextYearBtn = document.getElementById("nextYear");
const yearDisplay = document.getElementById("yearDisplay");

const monthNames = [
  "January","February","March","April",
  "May","June","July","August",
  "September","October","November","December"
];

const weekdayNames = ["S","M","T","W","T","F","S"];

const pastelClasses = [
  "color-0",
  "color-1",
  "color-2",
  "color-3",
  "color-4",
  "color-5"
];

let activeYear = new Date().getFullYear();

const today = new Date();

const STORAGE_KEY = "fullmoon.pocketplanner.yearlylog";

let yearlyData =
  JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

/* ---------- INIT ---------- */

renderYear(activeYear);

/* ---------- YEAR BUTTONS ---------- */

prevYearBtn.addEventListener("click", () => {
  activeYear--;
  renderYear(activeYear);
});

nextYearBtn.addEventListener("click", () => {
  activeYear++;
  renderYear(activeYear);
});

/* ---------- RENDER YEAR ---------- */

function renderYear(year){

  yearDisplay.textContent = year;

  monthsGrid.innerHTML = "";

  for(let month = 0; month < 12; month++){

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

function createMonth(year, month){

  const monthCard = document.createElement("div");
  monthCard.className = "month-card";
  monthCard.id = `month-${month}`;

  const title = document.createElement("h2");
  title.className = "month-title";
  title.textContent = monthNames[month];

  const weekdays = document.createElement("div");
  weekdays.className = "weekdays";

  weekdayNames.forEach(day => {
    const span = document.createElement("span");
    span.textContent = day;
    weekdays.appendChild(span);
  });

  const daysGrid = document.createElement("div");
  daysGrid.className = "days-grid";

  const firstDay = new Date(year, month, 1).getDay();

  const totalDays = new Date(year, month + 1, 0).getDate();

  /* EMPTY BOXES */

  for(let i = 0; i < firstDay; i++){

    const empty = document.createElement("div");
    empty.className = "day empty";

    daysGrid.appendChild(empty);
  }

  /* REAL DAYS */

  for(let day = 1; day <= totalDays; day++){

    const dayEl = document.createElement("div");
    dayEl.className = "day";
    dayEl.textContent = day;

    const key = getDateKey(year, month, day);

    /* TODAY */

    if(
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    ){
      dayEl.classList.add("today");
    }

    /* SAVED COLOR */

    if(yearlyData[key]){

      dayEl.classList.add(
        pastelClasses[yearlyData[key].colorIndex]
      );
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

function handleDayClick(year, month, day, element){

  const key = getDateKey(year, month, day);

  /* NEW */

  if(!yearlyData[key]){

    yearlyData[key] = {
      colorIndex:0,
      note:""
    };

  }else{

    yearlyData[key].colorIndex++;

    /* REMOVE IF OVER */

    if(yearlyData[key].colorIndex >= pastelClasses.length){

      delete yearlyData[key];

      element.className = "day";

      if(
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate()
      ){
        element.classList.add("today");
      }

      saveData();
      renderMonthNotes(year, month);

      return;
    }
  }

  element.className = "day";

  element.classList.add(
    pastelClasses[yearlyData[key].colorIndex]
  );

  if(
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate()
  ){
    element.classList.add("today");
  }

  saveData();

  renderMonthNotes(year, month);
}

/* ---------- NOTES ---------- */

function renderMonthNotes(year, month){

  const container = document.getElementById(`notes-${month}`);

  container.innerHTML = "";

  const entries = Object.entries(yearlyData)
    .filter(([key]) => {

      const [y,m] = key.split("-");

      return Number(y) === year && Number(m) === month;
    });

  if(entries.length === 0){

    container.innerHTML = `
      <div class="empty-note">
        No notes yet.
      </div>
    `;

    return;
  }

  entries.forEach(([key, value]) => {

    const [y,m,d] = key.split("-");

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

    yearlyData[key].note = input.value;

    saveData();
    });

    container.appendChild(noteItem);

  });
}

/* ---------- STORAGE ---------- */

function saveData(){

  localStorage.setItem(
  STORAGE_KEY,
  JSON.stringify(yearlyData)
);
}

/* ---------- DATE KEY ---------- */

function getDateKey(year, month, day){

  return `${year}-${month}-${day}`;
}

/* ---------- AUTO SCROLL ---------- */

function scrollToCurrentMonth(year){

  if(year !== today.getFullYear()) return;

  setTimeout(() => {

    const currentMonth = document.getElementById(
      `month-${today.getMonth()}`
    );

    if(currentMonth){

      currentMonth.scrollIntoView({
        behavior:"smooth",
        block:"center"
      });

    }

  }, 300);
}

lucide.createIcons();
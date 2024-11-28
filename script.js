/**
 * @typedef {Object} PersonOnShift
 * @property {string} [0] - The first person's name in the shift.
 * @property {string} [1] - The second person's name in the shift.
 */

/**
 * @typedef {Object} PersonOnOff
 * @property {string} [0] - The first person's name who is off.
 * @property {string} [1] - The second person's name who is off.
 * @property {string} [2] - The third person's name who is off.
 */

/**
 * @typedef {Object} ScheduleCycle
 * @property {PersonOnShift[]} shifts - An array of person who are on shifts for the day.
 * @property {PersonOnOff} off - An array of names of person who are off that day.
 */

/**
 * @typedef {ScheduleCycle[]} ScheduleCyclePattern - An array of cycle days.
 */

/**
 * @typedef {Object} Schedule
 * @property {string} date - The date of the schedule.
 * @property {PersonOnShift} shifts - The shifts for the day.
 * @property {PersonOnOff} off - The names of people who are off that day.
 */

/**
 * ScheduleBuilder class to manage and display the schedule.
 */
class ScheduleBuilder {
  constructor() {
    this.schedulePatternUrl = "schedule-pattern.json";
    this.scheduleTable = document.getElementById("schedule-table");
    this.dateRangeLabel = document.getElementById("date-range");
    this.startDateInput = document.getElementById("start");
    this.endDateInput = document.getElementById("end");
    this.form = document.getElementById("date-form");
    this.loader = document.getElementById("loader");

    this.form.addEventListener("submit", (event) => this.onFormSubmit(event));
    window.addEventListener("popstate", () => this.onPopState());
  }

  /**
   * Show the loader.
   */
  showLoader() {
    this.loader.style.display = "block";
  }

  /**
   * Hide the loader.
   */
  hideLoader() {
    this.loader.style.display = "none";
  }

  /**
   * Fetch the cycle pattern data from the JSON file.
   * @returns {Promise<ScheduleCyclePattern>} The cycle pattern data.
   */
  async fetchSchedulePattern() {
    try {
      const response = await fetch(this.schedulePatternUrl);
      /** @type {ScheduleCyclePattern} */
      const cyclePattern = await response.json();

      return cyclePattern;
    } catch (error) {
      alert("Failed to get shift pattern data.");
      return [];
    }
  }

  /**
   * Calculate the schedule based on the start and end dates.
   * @param {Date} startDate - The start date.
   * @param {Date} endDate - The end date.
   * @param {ScheduleCyclePattern} cyclePattern - The cycle pattern data.
   * @returns {Schedule[]} The calculated schedule.
   */
  getSchedule(startDate, endDate, cyclePattern) {
    const schedules = [];
    const cycleLength = cyclePattern.length;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOffset = Math.floor((currentDate - new Date(2024, 4, 17)) / (1000 * 60 * 60 * 24));
      const dayOfCycle = ((dayOffset % cycleLength) + cycleLength) % cycleLength;

      /** @type {Schedule} */
      const schedule = {
        date: currentDate.toLocaleString("id", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Jakarta",
        }),
        shifts: [cyclePattern[dayOfCycle].shifts[0], cyclePattern[dayOfCycle].shifts[1], cyclePattern[dayOfCycle].shifts[2]],
        off: cyclePattern[dayOfCycle].off,
      };
      schedules.push(schedule);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
  }

  /**
   * Update the URL query parameters with the selected start and end dates.
   * @param {string} start - The start date.
   * @param {string} end - The end date.
   */
  updateQueryParams(start, end) {
    const url = new URL(window.location.href);
    url.searchParams.set("start", start);
    url.searchParams.set("end", end);
    window.history.pushState({ start, end }, "", url);
  }

  /**
   * @typedef {Object} DateDataQueryParams
   * @property {string} start - The start date.
   * @property {string} end - The end date.
   * Retrieve the query parameters from the URL.
   * @returns {DateDataQueryParams} The start and end dates from the query parameters.
   */
  getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      start: params.get("start"),
      end: params.get("end"),
    };
  }

  /*
   * Handle the form submission to calculate and display the schedule.
   * @param {Event} event - The form submission event.
   * @returns {Promise<void>} The promise to update the schedule table.
   */
  async onFormSubmit(event) {
    event.preventDefault();
    const start = this.startDateInput.value;
    const end = this.endDateInput.value;

    if (start && end) {
      this.showLoader(); // Show the loader
      this.updateQueryParams(start, end);
      const startDate = new Date(start);
      const endDate = new Date(end);
      const cyclePattern = await this.fetchSchedulePattern();
      const schedule = this.getSchedule(startDate, endDate, cyclePattern);

      // this.scheduleTable.innerHTML = `
      //   <tr>
      //     <th>Date</th>
      //     <th>Shift 1</th>
      //     <th>Shift 2</th>
      //     <th>Shift 3</th>
      //     <th>Off</th>
      //   </tr>
      // `;

      this.scheduleTable.innerHTML = "";
      schedule.forEach((day) => {
        const row = `
          <tr class="${
            day.date ===
            new Date().toLocaleString("id", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "Asia/Jakarta",
            })
              ? "highlight"
              : ""
          }">
            <td>${day.date}</td>
            <td>${day.shifts[0].join(" - ")}</td>
            <td>${day.shifts[1].join(" - ")}</td>
            <td>${day.shifts[2].join(" - ")}</td>
            <td>${day.off.join(" - ")}</td>
          </tr>
        `;
        this.scheduleTable.insertAdjacentHTML("beforeend", row);
      });

      this.dateRangeLabel.textContent = `From ${start} to ${end}`;
      this.hideLoader(); // Hide the loader
    }
  }

  /**
   * Handle the popstate event to update the form and table based on history state.
   */
  async onPopState() {
    const { start, end } = this.getQueryParams();
    if (start && end) {
      this.startDateInput.value = start;
      this.endDateInput.value = end;
      this.showLoader(); // Show the loader
      const startDate = new Date(start);
      const endDate = new Date(end);
      const cyclePattern = await this.fetchSchedulePattern();
      const schedule = this.getSchedule(startDate, endDate, cyclePattern);

      // this.scheduleTable.innerHTML = `
      //   <tr>
      //     <th>Date</th>
      //     <th>Shift 1</th>
      //     <th>Shift 2</th>
      //     <th>Shift 3</th>
      //     <th>Off</th>
      //   </tr>
      // `;
      this.scheduleTable.innerHTML = "";

      schedule.forEach((day) => {
        const row = `
          <tr class="${
            day.date ===
            new Date().toLocaleString("id", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "Asia/Jakarta",
            })
              ? "highlight"
              : ""
          }">
            <td>${day.date}</td>
            <td>${day.shifts[0].join(" - ")}</td>
            <td>${day.shifts[1].join(" - ")}</td>
            <td>${day.shifts[2].join(" - ")}</td>
            <td>${day.off.join(" - ")}</td>
          </tr>
        `;
        this.scheduleTable.insertAdjacentHTML("beforeend", row);
      });

      this.dateRangeLabel.textContent = `From ${start} to ${end}`;
      this.hideLoader(); // Hide the loader
    }
  }

  /**
   * Initialize the form with default or query parameter dates and trigger form submission.
   */
  async init() {
    const { start, end } = this.getQueryParams();
    const today = new Date();
    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() - 1);
    const defaultEnd = new Date(today);
    defaultEnd.setDate(today.getDate() + 7);

    this.startDateInput.value = start || defaultStart.toISOString().split("T")[0];
    this.endDateInput.value = end || defaultEnd.toISOString().split("T")[0];

    this.form.dispatchEvent(new Event("submit"));
  }
}

// Initialize the ScheduleBuilder when the window loads.
const scheduleBuilder = new ScheduleBuilder();
window.onload = () => scheduleBuilder.init();
// window.onload = () => {};
// window.addEventListener("load", () => {
//   if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.register("/pwabuilder-sw.js");
//   }
// });

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
 * @typedef {Object} DateDataQueryParams
 * @property {string} start - The start date.
 * @property {string} end - The end date.
 */

/**
 * ScheduleBuilder class to manage and display the schedule.
 */
class ScheduleBuilder {
  constructor() {
    this.schedulePatternUrl = "schedule-pattern.json";
    this.scheduleTable = document.getElementById("schedule-table");
    this.scheduleMobile = document.getElementById("schedule-mobile");
    this.todayDate = document.getElementById("today-date");
    this.dateRangeLabel = document.getElementById("date-range");
    this.startDateInput = document.getElementById("start");
    this.endDateInput = document.getElementById("end");
    this.form = document.getElementById("date-form");
    this.loader = document.getElementById("loader");

    this.bindEvents();
    this.init();
  }

  /**
   * Bind all event listeners
   */
  bindEvents() {
    this.form.addEventListener("submit", (event) => this.onFormSubmit(event));
    window.addEventListener("popstate", () => this.onPopState());
  }

  /**
   * Show the loader.
   */
  showLoader() {
    this.loader.style.display = "flex";
  }

  /**
   * Hide the loader.
   */
  hideLoader() {
    this.loader.style.display = "none";
  }

  /**
   * Get current date formatted for comparison
   * @returns {string} Formatted current date
   */
  getCurrentDateString() {
    return new Date().toLocaleString("id", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    });
  }

  /**
   * Fetch the cycle pattern data from the JSON file.
   * @returns {Promise<ScheduleCyclePattern>} The cycle pattern data.
   */
  async fetchSchedulePattern() {
    try {
      const response = await fetch(this.schedulePatternUrl);
      return await response.json();
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
    const baseDate = new Date(2024, 4, 15);
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOffset = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));
      const dayOfCycle = ((dayOffset % cycleLength) + cycleLength) % cycleLength;
      const cycleDay = cyclePattern[dayOfCycle];

      schedules.push({
        date: currentDate.toLocaleString("id", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Jakarta",
        }),
        shifts: [cycleDay.shifts[0], cycleDay.shifts[1], cycleDay.shifts[2]],
        off: cycleDay.off,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
  }

  /**
   * Render mobile card view for schedule
   * @param {Schedule[]} schedule - The schedule data
   */
  renderMobileView(schedule) {
    const today = this.getCurrentDateString();
    
    if (this.todayDate) {
      this.todayDate.innerHTML = `Today : ${today}`;
    }
    
    this.scheduleMobile.innerHTML = schedule.map((day, index) => {
      const isToday = day.date === today;
      return `
        <div class="schedule-card ${isToday ? 'highlight scroll-to-today' : ''}" ${isToday ? 'id="today-mobile"' : ''}>
          <div class="schedule-date">
            ${isToday ? '<div class="indicator"><span class="indicator-item badge badge-primary badge-xs">Today</span>' : ''}
            ${day.date}
            ${isToday ? '</div>' : ''}
          </div>
          <div class="shift-grid">
            <div class="shift-item">
              <div class="text-xs opacity-60 mb-1">Shift 1</div>
              <div class="font-medium">${day.shifts[0].join(" • ")}</div>
            </div>
            <div class="shift-item">
              <div class="text-xs opacity-60 mb-1">Shift 2</div>
              <div class="font-medium">${day.shifts[1].join(" • ")}</div>
            </div>
            <div class="shift-item">
              <div class="text-xs opacity-60 mb-1">Shift 3</div>
              <div class="font-medium">${day.shifts[2].join(" • ")}</div>
            </div>
            <div class="shift-item off">
              <div class="text-xs opacity-60 mb-1">Off</div>
              <div class="font-medium">${day.off.join(" • ")}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Auto-scroll to today's item on mobile
    this.scrollToToday('today-mobile');
  }

  /**
   * Render desktop table view for schedule
   * @param {Schedule[]} schedule - The schedule data
   */
  renderDesktopView(schedule) {
    const today = this.getCurrentDateString();
    
    this.scheduleTable.innerHTML = schedule.map((day, index) => {
      const isToday = day.date === today;
      return `
        <tr class="${isToday ? "highlight scroll-to-today" : ""}" ${isToday ? 'id="today-desktop"' : ''}>
          <td class="font-medium">
            ${isToday ? '<div class="indicator text-sm"><span class="indicator-item indicator-top badge badge-primary badge-sm">Today</span>' : ''}
            ${day.date}
            ${isToday ? '</div>' : ''}
          </td>
          <td>${day.shifts[0].join(" • ")}</td>
          <td>${day.shifts[1].join(" • ")}</td>
          <td>${day.shifts[2].join(" • ")}</td>
          <td>${day.off.join(" • ")}</td>
        </tr>
      `;
    }).join('');

    // Auto-scroll to today's item on desktop
    this.scrollToToday('today-desktop');
  }

  /**
   * Render schedule for both mobile and desktop views
   * @param {Schedule[]} schedule - The schedule data
   */
  renderSchedule(schedule) {
    this.renderMobileView(schedule);
    this.renderDesktopView(schedule);
  }

  /**
   * Auto-scroll to today's item with smooth animation
   * @param {string} elementId - ID of the element to scroll to
   */
  scrollToToday(elementId) {
    setTimeout(() => {
      const todayElement = document.getElementById(elementId);
      if (todayElement) {
        todayElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 300); // Delay to ensure DOM is fully rendered
  }

  /**
   * Format date range using Indonesian locale
   * @param {string} start - Start date string
   * @param {string} end - End date string
   * @returns {string} Formatted date range
   */
  formatDateRange(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    const formattedStart = startDate.toLocaleDateString('id-ID', options);
    const formattedEnd = endDate.toLocaleDateString('id-ID', options);
    return `${formattedStart} - ${formattedEnd}`;
  }

  /**
   * Generate and display schedule based on date range
   * @param {string} start - Start date string
   * @param {string} end - End date string
   */
  async generateSchedule(start, end) {
    if (!start || !end) return;

    this.showLoader();
    
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const cyclePattern = await this.fetchSchedulePattern();
      const schedule = this.getSchedule(startDate, endDate, cyclePattern);

      this.renderSchedule(schedule);
      this.dateRangeLabel.textContent = `Date Range : ${this.formatDateRange(start, end)}`;
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule');
    } finally {
      this.hideLoader();
    }
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

  /**
   * Get default date range (yesterday to next week)
   * @returns {DateDataQueryParams} Default start and end dates
   */
  getDefaultDateRange() {
    const today = new Date();
    const defaultStart = new Date(today);
    const defaultEnd = new Date(today);
    
    defaultStart.setDate(today.getDate() - 1);
    defaultEnd.setDate(today.getDate() + 7);

    return {
      start: defaultStart.toISOString().split("T")[0],
      end: defaultEnd.toISOString().split("T")[0]
    };
  }

  /**
   * Handle the form submission to calculate and display the schedule.
   * @param {Event} event - The form submission event.
   */
  async onFormSubmit(event) {
    event.preventDefault();
    const start = this.startDateInput.value;
    const end = this.endDateInput.value;

    if (start && end) {
      this.updateQueryParams(start, end);
      await this.generateSchedule(start, end);
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
      await this.generateSchedule(start, end);
    }
  }

  /**
   * Initialize the form with default or query parameter dates and trigger form submission.
   */
  async init() {
    const queryParams = this.getQueryParams();
    const defaultRange = this.getDefaultDateRange();
    
    this.startDateInput.value = queryParams.start || defaultRange.start;
    this.endDateInput.value = queryParams.end || defaultRange.end;

    // Auto-generate schedule on page load
    await this.generateSchedule(this.startDateInput.value, this.endDateInput.value);
  }
}

/**
 * Theme management functions
 */
const ThemeManager = {
  /**
   * Update theme toggle button appearance
   * @param {string} theme - Current theme
   */
  updateToggleButton(theme) {
    const button = document.getElementById('theme-toggle');
    if (!button) return;

    const svg = button.querySelector('svg');
    if (svg) {
      if (theme === 'dark') {
        // Show sun icon when in dark mode (click to switch to light)
        svg.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        `;
      } else {
        // Show moon icon when in light mode (click to switch to dark)
        svg.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"></path>
        `;
      }
    }
  },

  /**
   * Set specific theme
   * @param {string} theme - Theme name
   */
  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateToggleButton(theme);
  },

  /**
   * Toggle between light and dark themes
   */
  toggle() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.set(newTheme);
  },

  /**
   * Initialize theme from localStorage or default to light
   */
  init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.set(savedTheme);
  }
};

/**
 * Global theme toggle function for HTML onclick
 */
function toggleTheme() {
  ThemeManager.toggle();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  new ScheduleBuilder();
});

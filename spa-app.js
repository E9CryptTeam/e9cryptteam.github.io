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
 * SPA Router for managing views
 */
class SPARouter {
  constructor() {
    this.currentView = 'current-schedule';
    this.views = {
      'current-schedule': document.getElementById('current-schedule'),
      'q4-schedule': document.getElementById('q4-schedule')
    };
    this.navButtons = {
      'current-schedule': document.getElementById('nav-current'),
      'q4-schedule': document.getElementById('nav-q4')
    };
    
    this.bindEvents();
    this.initRoute();
  }

  bindEvents() {
    // Bind navigation buttons
    Object.keys(this.navButtons).forEach(viewId => {
      this.navButtons[viewId].addEventListener('click', (e) => {
        this.addClickFeedback(e.currentTarget);
        this.navigateTo(viewId);
      });
      
      // Add touch feedback for better mobile interaction
      this.navButtons[viewId].addEventListener('touchstart', () => {
        this.navButtons[viewId].style.transform = 'scale(0.95)';
      });
      
      this.navButtons[viewId].addEventListener('touchend', () => {
        setTimeout(() => {
          this.navButtons[viewId].style.transform = '';
        }, 150);
      });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.view) {
        this.showView(event.state.view, false);
      }
    });
  }

  addClickFeedback(button) {
    // Haptic feedback for supported devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Visual feedback animation
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 100);
  }

  navigateTo(viewId) {
    this.showView(viewId, true);
  }

  showView(viewId, pushState = true) {
    // Hide all views
    Object.keys(this.views).forEach(id => {
      this.views[id].style.display = 'none';
    });

    // Remove active class from all nav buttons
    Object.keys(this.navButtons).forEach(id => {
      this.navButtons[id].classList.remove('dock-active');
    });

    // Show selected view
    if (this.views[viewId]) {
      this.views[viewId].style.display = 'block';
      this.navButtons[viewId].classList.add('dock-active');
      this.currentView = viewId;

      // Update URL
      if (pushState) {
        const url = new URL(window.location);
        url.searchParams.set('view', viewId);
        history.pushState({ view: viewId }, '', url);
      }
    }
  }

  initRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewFromUrl = urlParams.get('view');
    
    if (viewFromUrl && this.views[viewFromUrl]) {
      this.showView(viewFromUrl, false);
    } else {
      this.showView('current-schedule', false);
    }
  }
}

/**
 * Base ScheduleBuilder class with common functionality
 */
class BaseScheduleBuilder {
  constructor(config) {
    this.schedulePatternUrl = config.patternUrl;
    this.scheduleTable = document.getElementById(config.tableId);
    this.scheduleMobile = document.getElementById(config.mobileId);
    this.todayDate = document.getElementById(config.todayDateId);
    this.dateRangeLabel = document.getElementById(config.dateRangeId);
    this.startDateInput = document.getElementById(config.startId);
    this.endDateInput = document.getElementById(config.endId);
    this.form = document.getElementById(config.formId);
    this.loader = document.getElementById(config.loaderId);
    this.baseDate = config.baseDate || new Date(2024, 4, 15);
    this.shiftCount = config.shiftCount || 3;

    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener("submit", (event) => this.onFormSubmit(event));
  }

  showLoader() {
    this.loader.style.display = "flex";
  }

  hideLoader() {
    this.loader.style.display = "none";
  }

  getCurrentDateString() {
    return new Date().toLocaleString("id", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    });
  }

  async fetchSchedulePattern() {
    try {
      const response = await fetch(this.schedulePatternUrl);
      return await response.json();
    } catch (error) {
      alert("Failed to get shift pattern data.");
      return [];
    }
  }

  getSchedule(startDate, endDate, cyclePattern) {
    const schedules = [];
    const cycleLength = cyclePattern.length;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOffset = Math.floor((currentDate - this.baseDate) / (1000 * 60 * 60 * 24));
      const dayOfCycle = ((dayOffset % cycleLength) + cycleLength) % cycleLength;
      const cycleDay = cyclePattern[dayOfCycle];

      const shifts = this.shiftCount === 3 
        ? [cycleDay.shifts[0], cycleDay.shifts[1], cycleDay.shifts[2]]
        : [cycleDay.shifts[0], cycleDay.shifts[1]];

      schedules.push({
        date: currentDate.toLocaleString("id", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Jakarta",
        }),
        shifts: shifts,
        off: cycleDay.off,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
  }

  renderMobileView(schedule) {
    const today = this.getCurrentDateString();
    
    if (this.todayDate) {
      this.todayDate.innerHTML = `Today : ${today}`;
    }
    
    this.scheduleMobile.innerHTML = schedule.map((day) => {
      const isToday = day.date === today;
      const shiftsHtml = day.shifts.map((shift, index) => `
        <div class="shift-item">
          <div class="text-xs opacity-60 mb-1">Shift ${index + 1}</div>
          <div class="font-medium">${shift.join(" • ")}</div>
        </div>
      `).join('');

      return `
        <div class="schedule-card ${isToday ? 'highlight scroll-to-today' : ''}" ${isToday ? 'id="today-mobile"' : ''}>
          <div class="schedule-date">
            ${isToday ? '<div class="indicator"><span class="indicator-item badge badge-primary badge-xs">Today</span>' : ''}
            ${day.date}
            ${isToday ? '</div>' : ''}
          </div>
          <div class="shift-grid">
            ${shiftsHtml}
            <div class="shift-item off">
              <div class="text-xs opacity-60 mb-1">Off</div>
              <div class="font-medium">${day.off.join(" • ")}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.scrollToToday('today-mobile');
  }

  renderDesktopView(schedule) {
    const today = this.getCurrentDateString();
    
    this.scheduleTable.innerHTML = schedule.map((day) => {
      const isToday = day.date === today;
      const shiftsHtml = day.shifts.map(shift => `<td>${shift.join(" • ")}</td>`).join('');
      
      return `
        <tr class="${isToday ? "highlight scroll-to-today" : ""}" ${isToday ? 'id="today-desktop"' : ''}>
          <td class="font-medium">
            ${isToday ? '<div class="indicator text-sm"><span class="indicator-item indicator-top badge badge-primary badge-sm">Today</span>' : ''}
            ${day.date}
            ${isToday ? '</div>' : ''}
          </td>
          ${shiftsHtml}
          <td>${day.off.join(" • ")}</td>
        </tr>
      `;
    }).join('');

    this.scrollToToday('today-desktop');
  }

  renderSchedule(schedule) {
    this.renderMobileView(schedule);
    this.renderDesktopView(schedule);
  }

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
    }, 300);
  }

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

  updateQueryParams(start, end) {
    const url = new URL(window.location.href);
    url.searchParams.set("start", start);
    url.searchParams.set("end", end);
    window.history.replaceState(history.state, "", url);
  }

  getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      start: params.get("start"),
      end: params.get("end"),
    };
  }

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

  async onFormSubmit(event) {
    event.preventDefault();
    const start = this.startDateInput.value;
    const end = this.endDateInput.value;

    if (start && end) {
      this.updateQueryParams(start, end);
      await this.generateSchedule(start, end);
    }
  }

  async init() {
    const queryParams = this.getQueryParams();
    const defaultRange = this.getDefaultDateRange();
    
    this.startDateInput.value = queryParams.start || defaultRange.start;
    this.endDateInput.value = queryParams.end || defaultRange.end;

    await this.generateSchedule(this.startDateInput.value, this.endDateInput.value);
  }
}

/**
 * Current Schedule Builder
 */
class CurrentScheduleBuilder extends BaseScheduleBuilder {
  constructor() {
    super({
      patternUrl: "schedule-pattern.json",
      tableId: "schedule-table",
      mobileId: "schedule-mobile",
      todayDateId: "today-date",
      dateRangeId: "date-range",
      startId: "start",
      endId: "end",
      formId: "date-form",
      loaderId: "loader",
      baseDate: new Date(2024, 4, 15),
      shiftCount: 3
    });
  }
}

/**
 * Q4 Schedule Builder
 */
class Q4ScheduleBuilder extends BaseScheduleBuilder {
  constructor() {
    super({
      patternUrl: "pattern-q4.json",
      tableId: "q4-schedule-table",
      mobileId: "q4-schedule-mobile",
      todayDateId: "q4-today-date",
      dateRangeId: "q4-date-range",
      startId: "q4-start",
      endId: "q4-end",
      formId: "q4-date-form",
      loaderId: "q4-loader",
      baseDate: new Date(2024, 9, 1), // October 1, 2024 for Q4
      shiftCount: 2
    });
  }
}

/**
 * Theme management functions
 */
const ThemeManager = {
  updateToggleButton(theme) {
    const button = document.getElementById('theme-toggle');
    if (!button) return;

    const svg = button.querySelector('svg');
    if (svg) {
      if (theme === 'dark') {
        svg.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        `;
      } else {
        svg.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"></path>
        `;
      }
    }
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateToggleButton(theme);
  },

  toggle() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.set(newTheme);
  },

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

/**
 * App initialization
 */
class ScheduleApp {
  constructor() {
    this.router = new SPARouter();
    this.currentSchedule = new CurrentScheduleBuilder();
    this.q4Schedule = new Q4ScheduleBuilder();
    
    this.init();
  }

  async init() {
    ThemeManager.init();
    
    // Initialize both schedule builders
    await this.currentSchedule.init();
    await this.q4Schedule.init();
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ScheduleApp();
});
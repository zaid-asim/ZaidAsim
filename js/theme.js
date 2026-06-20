/* ============================================================
   theme.js — Dark/Light Theme Toggle
   Reads/writes 'za_theme' to localStorage, applies transition
   class, updates button icon, and dispatches theme change event.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'za_theme';
  var DEFAULT_THEME = 'dark';
  var currentTheme = DEFAULT_THEME;

  function applyTheme(theme, animate) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update button icons
    var btns = document.querySelectorAll('[data-theme-toggle], #themeToggle');
    btns.forEach(function (btn) {
      var icon = btn.querySelector('.theme-icon, i, svg');
      if (icon) {
        // Simple text swap
        if (theme === 'dark') {
          btn.title = 'Switch to Light Mode';
        } else {
          btn.title = 'Switch to Dark Mode';
        }
      }
      // Update emoji/text in button if present
      if (btn.dataset.moonIcon && btn.dataset.sunIcon) {
        btn.innerHTML = theme === 'dark' ? btn.dataset.sunIcon : btn.dataset.moonIcon;
      }
    });

    // Transition animation
    if (animate) {
      document.body.classList.add('theme-transitioning');
      setTimeout(function () {
        document.body.classList.remove('theme-transitioning');
      }, 500);
    }

    // Dispatch event for achievements & other listeners
    window.dispatchEvent(
      new CustomEvent('za_theme_changed', { detail: { theme: theme } })
    );
  }

  function toggle() {
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme, true);
    return newTheme;
  }

  // Expose globally
  window.toggleTheme = toggle;

  window.initTheme = function () {
    // Read stored theme
    var stored = localStorage.getItem(STORAGE_KEY);
    currentTheme = stored || DEFAULT_THEME;
    applyTheme(currentTheme, false);

    // Bind toggle buttons
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-toggle], #themeToggle');
      if (btn) {
        e.preventDefault();
        toggle();
      }
    });

    // Inject transition style
    var style = document.createElement('style');
    style.textContent =
      '.theme-transitioning,.theme-transitioning *{' +
        'transition:background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease !important;' +
      '}';
    document.head.appendChild(style);
  };
})();

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

  // Scroll theme observer
  function initScrollThemeObserver() {
    var showcases = document.querySelectorAll('.showcase-item');
    var sections = document.querySelectorAll('section[id]');
    
    var projectThemes = {
      'swadesh-ai': { primary: '#ff00dc', secondary: '#8b00ff' }, // magenta/purple
      'chronos': { primary: '#00d4aa', secondary: '#00e5ff' },    // teal/cyan
      'titan': { primary: '#6c3bff', secondary: '#ff00dc' },      // purple/magenta
      'qta-x': { primary: '#ff3366', secondary: '#ff0055' },      // pink/rose
      'android-xr-research': { primary: '#00e5ff', secondary: '#0989d8' }, // cyan/blue
      'crafty-kids': { primary: '#ff8c00', secondary: '#ffd700' }, // orange/yellow
      'storm-of-kings': { primary: '#ffd700', secondary: '#ff8c00' }, // yellow/orange
      'homies': { primary: '#0989d8', secondary: '#6c3bff' }      // blue/purple
    };

    function applyAccentTheme(primary, secondary) {
      var root = document.documentElement;
      root.style.setProperty('--color-accent-primary', primary);
      root.style.setProperty('--color-accent-secondary', secondary);
      root.style.setProperty('--gradient-brand', 'linear-gradient(135deg, ' + primary + ', ' + secondary + ')');
      root.style.setProperty('--color-text-accent', primary);
      root.style.setProperty('--color-text-link', primary);

      window.dispatchEvent(new CustomEvent('za_accent_changed', {
        detail: { primary: primary, secondary: secondary }
      }));
    }

    // Observe showcase items for project-specific accent shifts
    if (showcases.length > 0) {
      var showObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var btn = entry.target.querySelector('[data-project-id]');
            if (btn) {
              var pId = btn.getAttribute('data-project-id');
              var theme = projectThemes[pId];
              if (theme) {
                applyAccentTheme(theme.primary, theme.secondary);
              }
            }
          }
        });
      }, { rootMargin: '-25% 0px -35% 0px', threshold: 0.1 });

      showcases.forEach(function (item) {
        showObserver.observe(item);
      });
    }

    // Observe sections for overall layout accent shifts
    if (sections.length > 0) {
      var secObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            // Check if we are inside showcase list (handled by showcase observer)
            if (id === 'projects') return;

            if (id === 'hero' || id === 'contact' || id === 'footer') {
              applyAccentTheme('#0989d8', '#6c3bff'); // default blue/purple
            } else if (id === 'about' || id === 'founder') {
              applyAccentTheme('#6c3bff', '#ff00dc'); // purple/magenta
            } else if (id === 'ideas') {
              applyAccentTheme('#00d4aa', '#00e5ff'); // teal/cyan
            } else if (id === 'music') {
              applyAccentTheme('#ff00dc', '#8b00ff'); // magenta/purple
            }
          }
        });
      }, { rootMargin: '-30% 0px -40% 0px' });

      sections.forEach(function (sec) {
        secObserver.observe(sec);
      });
    }
  }

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

    // Initialize scroll dynamic theme observer
    if (typeof IntersectionObserver !== 'undefined') {
      initScrollThemeObserver();
    }
  };
})();

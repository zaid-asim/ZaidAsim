/* --- main.js --- */
/* ============================================================
   main.js — App Initialization & Orchestration
   Calls all module init functions, sets up copy-email,
   smooth scroll, and prints console ASCII art.
   ============================================================ */
(function () {
  'use strict';

  /* ---- Stylized Console Logo ---- */
  function printConsoleLogo() {
    var logo = [
      '',
      '  ███████╗ █████╗ ',
      '  ╚══███╔╝██╔══██╗',
      '    ███╔╝ ███████║',
      '   ███╔╝  ██╔══██║',
      '  ███████╗██║  ██║',
      '  ╚══════╝╚═╝  ╚═╝',
      '',
      '  ZaidAsim.com — Premium Portfolio',
      '  Built with ❤️ and vanilla JS',
      '',
    ].join('\n');

    console.log(
      '%c' + logo,
      'color: #8B00FF; font-family: monospace; font-size: 12px; font-weight: bold; text-shadow: 0 0 10px rgba(139,0,255,0.5);'
    );
  }

  /* ---- Copy Email ---- */
  function setupCopyEmail() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-copy-email], [data-email], #copyEmail');
      if (!btn) return;

      var email = btn.dataset.copyEmail || btn.dataset.email || btn.textContent.trim();
      if (!email) return;

      navigator.clipboard
        .writeText(email)
        .then(function () {
          var original = btn.textContent;
          btn.textContent = '✓ Copied!';
          btn.classList.add('copied');
          if (typeof window.showZaNotification === 'function') {
            window.showZaNotification('Email copied to clipboard successfully!', 'success');
          }

          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('copied');
          }, 2000);
        })
        .catch(function () {
          // Fallback for older browsers
          var textarea = document.createElement('textarea');
          textarea.value = email;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            var original = btn.textContent;
            btn.textContent = '✓ Copied!';
            if (typeof window.showZaNotification === 'function') {
              window.showZaNotification('Email copied to clipboard successfully!', 'success');
            }
            setTimeout(function () {
              btn.textContent = original;
            }, 2000);
          } catch (err) {
            console.warn('[main] Copy failed:', err);
          }
          document.body.removeChild(textarea);
        });
    });
  }

  /* ---- Main Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    printConsoleLogo();

    // 1. Theme (first to avoid FOUC)
    if (typeof window.initTheme === 'function') {
      window.initTheme();
    }

    // 2. Three.js Background
    if (typeof window.initThreeBackground === 'function') {
      var container = document.getElementById('canvasContainer');
      if (container) {
        window.initThreeBackground(container);
      }
    }

    // 3. Parallax
    if (typeof window.initParallax === 'function') {
      window.initParallax();
    }

    // 4. Scroll Animations
    if (typeof window.initScrollAnimations === 'function') {
      window.initScrollAnimations();
    }

    // 5. Navigation
    if (typeof window.initNav === 'function') {
      window.initNav();
    }

    // 6. Custom Cursor
    if (typeof window.initCursor === 'function') {
      window.initCursor();
    }

    // 7. HUD & Achievements
    if (typeof window.initHUD === 'function') {
      window.initHUD();
    }

    // 8. Command Palette
    if (typeof window.initCommandPalette === 'function') {
      window.initCommandPalette();
    }

    setupCopyEmail();

    console.log('[ZA] All systems initialized ✓');
  });
})();

;
/* --- theme.js --- */
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
      'titan-nano': { primary: '#6c3bff', secondary: '#ff00dc' }, // purple/magenta
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

;
/* --- nav.js --- */
/* ============================================================
   nav.js — Sticky Navigation + Scroll Spy + Mobile Menu
   Auto-hides on scroll down, shows on scroll up, highlights
   active section link, toggles mobile menu overlay.
   ============================================================ */
(function () {
  'use strict';

  var nav = null;
  var lastScrollY = 0;
  var scrollThreshold = 50;
  var ticking = false;

  /* ---- Sticky + Hide/Show ---- */
  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function () {
      var currentScrollY = window.scrollY || window.pageYOffset || 0;

      // Add/remove 'scrolled' class
      if (currentScrollY > scrollThreshold) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        nav.classList.add('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    });
  }

  /* ---- Scroll Spy ---- */
  function setupScrollSpy() {
    var sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    // Only spy on internal page anchors, not global page links
    var navLinks = document.querySelectorAll('nav a[href^="#"]');
    if (navLinks.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            navLinks.forEach(function (link) {
              var href = link.getAttribute('href');
              if (href === '#' + id || href === 'index.html#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---- Mobile Menu ---- */
  function setupMobileMenu() {
    var hamburger = document.querySelector(
      '#mobileMenuBtn, .hamburger, .menu-toggle, [data-menu-toggle], .nav-hamburger'
    );
    if (!hamburger) return;

    var navMenuWrapper = document.querySelector('#navMenuWrapper');

    hamburger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      hamburger.classList.toggle('active');
      if (navMenuWrapper) {
        navMenuWrapper.classList.toggle('active');
      }
      document.body.classList.toggle('menu-open');
    });

    // Close mobile menu on link click
    var menuLinks = document.querySelectorAll(
      '.nav-links a, .mobile-menu-overlay a, .mobile-nav-link'
    );
    menuLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        if (navMenuWrapper) {
          navMenuWrapper.classList.remove('active');
        }
        document.body.classList.remove('menu-open');
      });
    });

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        hamburger.classList.remove('active');
        if (navMenuWrapper) {
          navMenuWrapper.classList.remove('active');
        }
        document.body.classList.remove('menu-open');
      }
    });
  }

  /* ---- Path-based active link highlighting ---- */
  function updateActiveNavLink() {
    var pathname = window.location.pathname;
    // Normalize path by stripping leading/trailing slashes and .html extension
    var cleanPath = pathname.replace(/^\/|\/$/g, '').replace(/\.html$/, '');

    var activeLinkHref = '/';

    if (cleanPath === '' || cleanPath === 'index') {
      activeLinkHref = '/';
    } else if (cleanPath.indexOf('ideas/youtube') === 0) {
      activeLinkHref = '/ideas/youtube';
    } else if (cleanPath.indexOf('projects') === 0) {
      activeLinkHref = '/projects';
    } else if (cleanPath.indexOf('biography') === 0) {
      activeLinkHref = '/biography';
    } else if (cleanPath.indexOf('ideas') === 0) {
      activeLinkHref = '/ideas';
    } else if (cleanPath.indexOf('support') === 0) {
      activeLinkHref = '/support';
    } else if (cleanPath.indexOf('contact') === 0) {
      activeLinkHref = '/contact';
    }

    var navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      
      // Normalize href
      var cleanHref = href.replace(/^\/|\/$/g, '').replace(/\.html$/, '');
      var targetCleanHref = activeLinkHref.replace(/^\/|\/$/g, '');

      if (cleanHref === targetCleanHref) {
        link.classList.add('active');
      } else {
        // Only strip if it's a page link (starts with '/')
        if (href.startsWith('/')) {
          link.classList.remove('active');
        }
      }
    });
  }

  /* ---- Init ---- */
  window.initNav = function () {
    nav = document.querySelector('.main-nav, nav, .navbar, .nav, header nav');
    if (!nav) {
      console.warn('[nav] No nav element found.');
      return;
    }

    // Ensure nav has necessary base styles for hide/show
    nav.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1), background 0.3s ease';

    // Inject nav-hidden rule
    var style = document.createElement('style');
    style.textContent =
      '.nav-hidden { transform: translateY(-100%) !important; }' +
      '.scrolled { backdrop-filter: blur(12px); }';
    document.head.appendChild(style);

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Auto highlight active nav link on page load
    updateActiveNavLink();
    
    setupScrollSpy();
    setupMobileMenu();

    // Initial check
    onScroll();
  };
})();

;
/* --- cursor.js --- */
/* ============================================================
   cursor.js — Custom Cursor with GPU-Accelerated Trailing Glow
   Sleek precision dot + hardware-accelerated trailing target ring.
   Optimized with translate3d and no transition conflicts for snappy response.
   ============================================================ */
(function () {
  'use strict';

  var LERP_FACTOR = 0.28; // Snappier tracking

  var dot = null;
  var ring = null;
  var mouseX = 0;
  var mouseY = 0;
  var ringX = 0;
  var ringY = 0;
  var animId = null;
  var isHovering = false;
  var isPressed = false;

  var dotSize = 8;
  var ringSize = 32;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function createElements() {
    // Dot Element
    dot = document.getElementById('cursorDot');
    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'cursor-dot';
      dot.id = 'cursorDot';
      document.body.appendChild(dot);
    }
    var ds = dot.style;
    ds.position = 'fixed';
    ds.top = '0';
    ds.left = '0';
    ds.width = dotSize + 'px';
    ds.height = dotSize + 'px';
    ds.borderRadius = '50%';
    ds.background = 'var(--color-primary, #8B00FF)';
    ds.pointerEvents = 'none';
    ds.zIndex = '99999';
    // Center it relative to translate3d
    ds.marginTop = -(dotSize / 2) + 'px';
    ds.marginLeft = -(dotSize / 2) + 'px';
    ds.transition = 'background 0.25s ease, width 0.2s, height 0.2s';
    ds.willChange = 'transform';
    ds.boxShadow = '0 0 8px var(--color-primary-glow)';

    // Ring Element
    ring = document.getElementById('cursorRing');
    if (!ring) {
      ring = document.createElement('div');
      ring.className = 'cursor-ring';
      ring.id = 'cursorRing';
      document.body.appendChild(ring);
    }
    var rs = ring.style;
    rs.position = 'fixed';
    rs.top = '0';
    rs.left = '0';
    rs.width = ringSize + 'px';
    rs.height = ringSize + 'px';
    rs.borderRadius = '50%';
    rs.border = '1px solid rgba(255, 0, 220, 0.4)';
    rs.pointerEvents = 'none';
    rs.zIndex = '99999';
    rs.marginTop = -(ringSize / 2) + 'px';
    rs.marginLeft = -(ringSize / 2) + 'px';
    rs.transition = 'border-color 0.25s ease, box-shadow 0.25s, width 0.25s, height 0.25s, margin-top 0.25s, margin-left 0.25s';
    rs.willChange = 'transform';
  }

  var cursorInitialized = false;

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!cursorInitialized) {
      cursorInitialized = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
  }

  function animate() {
    // Snappy GPU translation
    ringX = lerp(ringX, mouseX, LERP_FACTOR);
    ringY = lerp(ringY, mouseY, LERP_FACTOR);

    // Apply transform via hardware-accelerated translate3d (No layout reflows)
    dot.style.transform = 'translate3d(' + mouseX + 'px, ' + mouseY + 'px, 0) scale(' + (isPressed ? 0.6 : (isHovering ? 0.5 : 1)) + ')';
    ring.style.transform = 'translate3d(' + ringX + 'px, ' + ringY + 'px, 0) scale(' + (isHovering ? 1.4 : 1) + ')';

    animId = requestAnimationFrame(animate);
  }

  function onMouseEnterInteractive() {
    isHovering = true;
    ring.style.borderColor = 'rgba(255, 0, 220, 0.9)';
    ring.style.boxShadow = '0 0 12px rgba(255, 0, 220, 0.4), inset 0 0 8px rgba(255, 0, 220, 0.2)';
    dot.style.background = '#FFFFFF'; // White center core when hovering
  }

  function onMouseLeaveInteractive() {
    isHovering = false;
    ring.style.borderColor = 'rgba(255, 0, 220, 0.4)';
    ring.style.boxShadow = 'none';
    dot.style.background = 'var(--color-primary, #8B00FF)';
  }

  function onMouseDown() {
    isPressed = true;
  }

  function onMouseUp() {
    isPressed = false;
  }

  function setupInteractiveHovers() {
    var selector = 'a, button, .card, .social-card, .project-card, .music-card, .idea-card, [role="button"], input, textarea, select, .map-pulse-dot';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(selector)) {
        onMouseEnterInteractive();
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(selector)) {
        onMouseLeaveInteractive();
      }
    });
  }

  /* ---- Init ---- */
  window.initCursor = function () {
    // Skip on touch-only devices
    if (window.matchMedia('(hover: none)').matches) return;

    createElements();
    setupInteractiveHovers();

    // Start cursor as invisible
    dot.style.opacity = '0';
    ring.style.opacity = '0';

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousedown', onMouseDown, { passive: true });
    document.addEventListener('mouseup', onMouseUp, { passive: true });

    // Hide default cursor
    var style = document.createElement('style');
    style.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(style);

    // Center start positions
    ringX = window.innerWidth / 2;
    ringY = window.innerHeight / 2;
    mouseX = ringX;
    mouseY = ringY;
    
    animate();
  };
})();

;
/* --- loader.js --- */
/* ============================================================
   loader.js — Loader & Cinematic Hero Intro Sequence
   Handles loading bar percentage, CRT screen-on scanline sweep,
   spring-loaded hero letter fall-in, and stats ticker start.
   ============================================================ */
(function () {
  'use strict';

  function initLoader() {
    var loaderOverlay = document.querySelector('.loader-overlay');
    var progressBar = document.querySelector('.loader-progress-bar');
    var progressText = document.querySelector('.loader-text');
    var crtScanline = document.querySelector('.crt-scanline');
    var skipBtn = document.getElementById('skipIntroBtn');
    var heroName = document.getElementById('heroName');
    
    if (!loaderOverlay) return;

    var introPlayed = sessionStorage.getItem('za_intro_played') === 'true';

    // If already played in session, skip intro animations
    if (introPlayed) {
      loaderOverlay.style.display = 'none';
      if (crtScanline) crtScanline.style.display = 'none';
      if (skipBtn) skipBtn.style.display = 'none';
      
      // Make all letters landed immediately
      if (heroName) {
        var letters = heroName.querySelectorAll('.hero-letter');
        letters.forEach(function (letter) {
          letter.classList.add('landed');
        });
      }

      // Refresh ScrollTrigger once everything renders
      setTimeout(function () {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 500);
      return;
    }

    // Show skip button after 1s
    setTimeout(function () {
      if (skipBtn) {
        skipBtn.classList.add('show');
      }
    }, 1000);

    // Simulate resource loading progress
    var progress = 0;
    var loaderPercent = document.getElementById('loaderPercent') || progressText;
    var loaderSystemInfo = document.getElementById('loaderSystemInfo');
    
    var interval = setInterval(function () {
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(endLoading, 300);
      }
      if (progressBar) progressBar.style.width = progress + '%';
      if (loaderPercent) loaderPercent.textContent = progress + '%';
      if (loaderSystemInfo) {
        loaderSystemInfo.textContent = 'SECURE CORE: LOADING MODULES ' + progress + '%';
      } else if (progressText) {
        progressText.textContent = 'Initializing Systems... ' + progress + '%';
      }
    }, 80);

    function skipIntro() {
      clearInterval(interval);
      sessionStorage.setItem('za_intro_played', 'true');
      loaderOverlay.classList.add('fade-out');
      if (skipBtn) skipBtn.classList.remove('show');
      
      if (heroName) {
        var letters = heroName.querySelectorAll('.hero-letter');
        letters.forEach(function (letter) {
          letter.classList.add('landed');
        });
      }

      // Play start sound if initialized
      if (window.soundEngine && typeof window.soundEngine.playIntro === 'function') {
        window.soundEngine.playIntro();
      }

      // Snappy ScrollTrigger refresh
      setTimeout(function () {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 300);
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', skipIntro);
    }

    function endLoading() {
      // Hide loader
      loaderOverlay.classList.add('fade-out');
      if (skipBtn) skipBtn.classList.remove('show');

      // Trigger CRT Scanline Sweep
      if (crtScanline) {
        crtScanline.style.opacity = '1';
        crtScanline.style.transition = 'top 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s';
        setTimeout(function () {
          crtScanline.style.top = '100%';
          crtScanline.style.opacity = '0';
        }, 50);
      }

      // Play start sound
      if (window.soundEngine && typeof window.soundEngine.playIntro === 'function') {
        window.soundEngine.playIntro();
      }

      // Animate letters one-by-one (staggered)
      if (heroName) {
        var letters = heroName.querySelectorAll('.hero-letter');
        letters.forEach(function (letter, idx) {
          setTimeout(function () {
            letter.classList.add('landed');
            
            // Play a mechanical letter tick sound for each landing letter
            if (window.soundEngine && typeof window.soundEngine.playTick === 'function') {
              window.soundEngine.playTick();
            }
          }, idx * 120 + 200); // 120ms stagger, starts after 200ms
        });

        // Trigger ScrollTrigger refresh once all letters have landed and layout settles
        setTimeout(function () {
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
            console.log('[ZA] ScrollTrigger refreshed after cinematic entry.');
          }
        }, letters.length * 120 + 500);
      } else {
        setTimeout(function () {
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }, 500);
      }

      sessionStorage.setItem('za_intro_played', 'true');
    }
  }

  // Register on window
  window.initLoader = initLoader;
})();

;
/* --- hud.js --- */
/* ============================================================
   hud.js — Developer Console HUD + Achievements
   XP/Level system, achievement toasts, global interaction
   tracking, and retro terminal HUD widget.
   ============================================================ */
(function () {
  'use strict';

  var LEVEL_NAMES = [
    'Junior Dev',
    'Script Wrangler',
    'Artisan Architect',
    'Keyboard Cowboy',
    'Antigravity Hacker',
  ];

  var ACHIEVEMENTS = {
    explorer:   { title: '🧭 Explorer — Scrolled 3+ Sections',   xp: 50 },
    networker:  { title: '🤝 Networker — Clicked a Social Card',  xp: 30 },
    night_owl:  { title: '🌙 Night Owl — Dark Mode Activated',    xp: 20 },
    commander:  { title: '⌨️ Commander — Opened Command Palette', xp: 40 },
    fan:        { title: '📺 Fan — Clicked YouTube Link',          xp: 25 },
    easter_egg: { title: '🥚 Easter Egg — Found the Secret!',     xp: 100 },
    booted:     { title: '🚀 System Online — ZA-OS Shell Loaded', xp: 50 },
    hacker:     { title: '👾 Hacker — Opened Terminal Emulator', xp: 40 },
    the_architect: { title: '📐 The Architect — Altered System Accents', xp: 30 },
    game_master: { title: '🏆 Game Master — Solved Hacking Minigame', xp: 50 },
    sudo_hacker: { title: '💀 Sudo Hacker — Invoked Root Override', xp: 50 },
  };

  var state = {
    level: 0,
    xp: 0,
    hudEl: null,
    xpBarFill: null,
    levelLabel: null,
    xpLabel: null,
    soundBtn: null,
  };

  var lastHovered = null;

  /* ---- Persistence ---- */
  function loadState() {
    state.level = parseInt(localStorage.getItem('za_dev_level') || '0', 10);
    state.xp    = parseInt(localStorage.getItem('za_dev_xp') || '0', 10);
    if (isNaN(state.level)) state.level = 0;
    if (isNaN(state.xp)) state.xp = 0;
  }

  function saveState() {
    localStorage.setItem('za_dev_level', state.level.toString());
    localStorage.setItem('za_dev_xp', state.xp.toString());
  }

  function getThreshold() {
    return (state.level + 1) * 200;
  }

  /* ---- XP System ---- */
  function addXP(amount) {
    if (amount <= 0) return;
    state.xp += amount;

    var threshold = getThreshold();
    while (state.xp >= threshold && state.level < LEVEL_NAMES.length - 1) {
      state.xp -= threshold;
      state.level++;
      threshold = getThreshold();
      if (window.soundSynth) window.soundSynth.playLevelUp();
    }

    // Cap at max level
    if (state.level >= LEVEL_NAMES.length - 1) {
      state.level = LEVEL_NAMES.length - 1;
      if (state.xp > getThreshold()) state.xp = getThreshold();
    }

    saveState();
    updateHUD();
  }

  /* ---- HUD DOM ---- */
  function createHUD() {
    var hud = document.createElement('div');
    hud.className = 'dev-hud';
    hud.setAttribute('role', 'status');
    hud.setAttribute('aria-label', 'Developer Console Status');

    hud.innerHTML =
      '<div class="dev-hud__header">' +
        '<div class="dev-hud__dots">' +
          '<span class="dev-hud__dot dev-hud__dot--red"></span>' +
          '<span class="dev-hud__dot dev-hud__dot--yellow"></span>' +
          '<span class="dev-hud__dot dev-hud__dot--green"></span>' +
        '</div>' +
        '<span class="dev-hud__title">DEV_CONSOLE_STATUS</span>' +
      '</div>' +
      '<div class="dev-hud__body">' +
        '<div class="dev-hud__level"></div>' +
        '<div class="dev-hud__xp-row">' +
          '<div class="dev-hud__xp-bar">' +
            '<div class="dev-hud__xp-fill"></div>' +
          '</div>' +
          '<span class="dev-hud__xp-label"></span>' +
        '</div>' +
      '</div>';

    // Styles
    var s = hud.style;
    s.position = 'fixed';
    s.bottom = '1.5rem';
    s.right = '1.5rem';
    s.zIndex = '9998';
    s.background = 'rgba(10,12,28,0.92)';
    s.border = '1px solid rgba(139,0,255,0.3)';
    s.borderRadius = '12px';
    s.padding = '0';
    s.fontFamily = '"JetBrains Mono", "Fira Code", monospace';
    s.fontSize = '11px';
    s.color = '#c4b5fd';
    s.minWidth = '220px';
    s.backdropFilter = 'blur(12px)';
    s.boxShadow = '0 8px 32px rgba(139,0,255,0.15)';
    s.overflow = 'hidden';
    s.userSelect = 'none';

    document.body.appendChild(hud);
    state.hudEl = hud;

    // Header styling
    var header = hud.querySelector('.dev-hud__header');
    header.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(139,0,255,0.1);border-bottom:1px solid rgba(139,0,255,0.15);';

    var dotsContainer = hud.querySelector('.dev-hud__dots');
    dotsContainer.style.cssText = 'display:flex;gap:4px;';

    hud.querySelectorAll('.dev-hud__dot').forEach(function (dot) {
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;';
    });
    hud.querySelector('.dev-hud__dot--red').style.background = '#ff5f57';
    hud.querySelector('.dev-hud__dot--yellow').style.background = '#febc2e';
    hud.querySelector('.dev-hud__dot--green').style.background = '#28c840';

    var title = hud.querySelector('.dev-hud__title');
    title.style.cssText = 'font-size:9px;letter-spacing:1.5px;opacity:0.6;text-transform:uppercase;';

    // Body
    var body = hud.querySelector('.dev-hud__body');
    body.style.cssText = 'padding:10px 12px;display:flex;flex-direction:column;gap:6px;';

    state.levelLabel = hud.querySelector('.dev-hud__level');
    state.levelLabel.style.cssText = 'font-weight:700;color:#a78bfa;font-size:12px;';

    var xpRow = hud.querySelector('.dev-hud__xp-row');
    xpRow.style.cssText = 'display:flex;align-items:center;gap:8px;';

    var xpBar = hud.querySelector('.dev-hud__xp-bar');
    xpBar.style.cssText = 'flex:1;height:6px;background:rgba(139,0,255,0.15);border-radius:3px;overflow:hidden;';

    state.xpBarFill = hud.querySelector('.dev-hud__xp-fill');
    state.xpBarFill.style.cssText = 'height:100%;background:linear-gradient(90deg,#8B00FF,#FF00DC);border-radius:3px;transition:width 0.4s ease;width:0%;';

    state.xpLabel = hud.querySelector('.dev-hud__xp-label');
    state.xpLabel.style.cssText = 'font-size:9px;opacity:0.7;white-space:nowrap;';


  }

  function updateHUD() {
    if (!state.hudEl) return;
    var threshold = getThreshold();
    var pct = threshold > 0 ? Math.min((state.xp / threshold) * 100, 100) : 0;
    var name = LEVEL_NAMES[state.level] || LEVEL_NAMES[LEVEL_NAMES.length - 1];

    state.levelLabel.textContent = 'Lv.' + state.level + ' — ' + name;
    state.xpBarFill.style.width = pct + '%';
    state.xpLabel.textContent = state.xp + ' / ' + threshold + ' XP';


  }

  /* ---- Achievement Toasts ---- */
  function showToast(title, xp) {
    var toast = document.createElement('div');
    toast.className = 'za-toast';
    toast.innerHTML =
      '<div style="font-weight:700;margin-bottom:2px;">' + title + '</div>' +
      '<div style="font-size:10px;opacity:0.7;">+' + xp + ' XP</div>';

    var ts = toast.style;
    ts.position = 'fixed';
    ts.top = '1.5rem';
    ts.right = '-350px';
    ts.zIndex = '10000';
    ts.background = 'rgba(10,12,28,0.95)';
    ts.border = '1px solid rgba(139,0,255,0.4)';
    ts.borderRadius = '10px';
    ts.padding = '12px 18px';
    ts.fontFamily = '"JetBrains Mono", "Fira Code", monospace';
    ts.fontSize = '12px';
    ts.color = '#e9d5ff';
    ts.backdropFilter = 'blur(12px)';
    ts.boxShadow = '0 8px 32px rgba(139,0,255,0.25)';
    ts.transition = 'right 0.5s cubic-bezier(0.16,1,0.3,1)';
    ts.maxWidth = '320px';

    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.style.right = '1.5rem';
    });

    setTimeout(function () {
      toast.style.right = '-350px';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 500);
    }, 4000);
  }

  function handleAchievement(e) {
    var detail = e.detail;
    if (!detail || !detail.id) return;

    var key = 'za_ach_' + detail.id;
    if (sessionStorage.getItem(key)) return; // already shown
    sessionStorage.setItem(key, '1');

    var ach = ACHIEVEMENTS[detail.id];
    var title = detail.title || (ach ? ach.title : 'Achievement Unlocked');
    var xp    = detail.xp    || (ach ? ach.xp : 10);

    if (window.soundSynth) window.soundSynth.playAchievement();
    showToast(title, xp);
    addXP(xp);
  }

  /* ---- Global Event Delegation ---- */
  function setupDelegation() {
    // Clicks on interactive elements
    document.addEventListener('click', function (e) {
      var target = e.target.closest('a, button, [role="button"], .social-card');
      if (!target) return;
      if (window.soundSynth) window.soundSynth.playSelect();
      addXP(2);
    });

    // Hover sounds
    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest('a, button, [role="button"], .card, .social-card, .nav-link');
      if (!target || target === lastHovered) return;
      lastHovered = target;
      if (window.soundSynth) window.soundSynth.playClick();
    });
  }

  /* ---- Achievement Triggers ---- */
  function setupAchievementTriggers() {
    // Explorer: scroll past 3 sections
    var sectionsViewed = new Set();
    var sections = document.querySelectorAll('section[id]');

    if (sections.length > 0) {
      var sectionObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              sectionsViewed.add(entry.target.id);
              if (sectionsViewed.size >= 3) {
                window.dispatchEvent(
                  new CustomEvent('za_achievement', {
                    detail: { id: 'explorer', title: ACHIEVEMENTS.explorer.title, xp: ACHIEVEMENTS.explorer.xp },
                  })
                );
              }
            }
          });
        },
        { threshold: 0.3 }
      );
      sections.forEach(function (s) { sectionObs.observe(s); });
    }

    // Networker: social card click
    document.addEventListener('click', function (e) {
      if (e.target.closest('.social-card')) {
        window.dispatchEvent(
          new CustomEvent('za_achievement', {
            detail: { id: 'networker', title: ACHIEVEMENTS.networker.title, xp: ACHIEVEMENTS.networker.xp },
          })
        );
      }
    });

    // Fan: YouTube link
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href*="youtube"], a[href*="youtu.be"]');
      if (link) {
        window.dispatchEvent(
          new CustomEvent('za_achievement', {
            detail: { id: 'fan', title: ACHIEVEMENTS.fan.title, xp: ACHIEVEMENTS.fan.xp },
          })
        );
      }
    });

    // Easter egg: footer easter egg
    document.addEventListener('click', function (e) {
      if (e.target.closest('.easter-egg, [data-easter-egg]')) {
        window.dispatchEvent(
          new CustomEvent('za_achievement', {
            detail: { id: 'easter_egg', title: ACHIEVEMENTS.easter_egg.title, xp: ACHIEVEMENTS.easter_egg.xp },
          })
        );
      }
    });

    // Night owl: listen for theme changes
    window.addEventListener('za_theme_changed', function (e) {
      if (e.detail && e.detail.theme === 'dark') {
        window.dispatchEvent(
          new CustomEvent('za_achievement', {
            detail: { id: 'night_owl', title: ACHIEVEMENTS.night_owl.title, xp: ACHIEVEMENTS.night_owl.xp },
          })
        );
      }
    });

    // Commander: listen for palette open
    window.addEventListener('za_palette_opened', function () {
      window.dispatchEvent(
        new CustomEvent('za_achievement', {
          detail: { id: 'commander', title: ACHIEVEMENTS.commander.title, xp: ACHIEVEMENTS.commander.xp },
        })
      );
    });

    // Trigger loaded achievement after a delay
    setTimeout(function () {
      window.dispatchEvent(
        new CustomEvent('za_achievement', {
          detail: { id: 'booted', title: ACHIEVEMENTS.booted.title, xp: ACHIEVEMENTS.booted.xp },
        })
      );
    }, 1500);
  }

  /* ---- Init ---- */
  window.initHUD = function () {
    loadState();
    createHUD();
    updateHUD();
    setupDelegation();
    setupAchievementTriggers();

    window.addEventListener('za_achievement', handleAchievement);
  };
})();

;
/* --- command-palette.js --- */
/* ============================================================
   command-palette.js — Ctrl+K Command Palette
   Full-screen overlay with search, keyboard navigation,
   and action execution.
   ============================================================ */
(function () {
  'use strict';

  var isOpen = false;
  var selectedIdx = 0;
  var overlay = null;
  var input = null;
  var listEl = null;
  var filteredActions = [];

  var isMac = navigator.platform && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  var modKey = isMac ? '⌘' : 'Ctrl';

  var isPlayingHum = false;

  function toggleAmbientHum() {
    if (window.soundSynth) {
      if (!isPlayingHum) {
        window.soundSynth.startAmbientLoop();
        isPlayingHum = true;
        if (window.hudEngine && typeof window.hudEngine.addXP === 'function') {
          window.hudEngine.addXP(20, 'Activated: Ambient Drone Loop');
        }
      } else {
        window.soundSynth.stopAmbientLoop();
        isPlayingHum = false;
      }
    }
  }

  function activateChaosMode() {
    if (window.soundEngine && typeof window.soundEngine.playGlitch === 'function') {
      window.soundEngine.playGlitch();
    }
    var headings = document.querySelectorAll('h1, h2, h3');
    var chars = '!@#$%^&*?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    headings.forEach(function (h) {
      var original = h.textContent;
      var count = 0;
      var interval = setInterval(function () {
        var scrambled = '';
        for (var i = 0; i < original.length; i++) {
          scrambled += original[i] === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
        }
        h.textContent = scrambled;
        count++;
        if (count > 12) {
          clearInterval(interval);
          h.textContent = original;
        }
      }, 50);
    });
    if (window.hudEngine && typeof window.hudEngine.addXP === 'function') {
      window.hudEngine.addXP(40, 'Activated: Chaos Scramble Protocol');
    }
  }

  function displayAboutSite() {
    var info = [
      '==============================================',
      '  ZAIDASIM.COM — TECHNICAL STACK OVERLAY       ',
      '==============================================',
      '  Core Engine   : Vanilla JS (ECMAScript 6)   ',
      '  3D Context    : Three.js (WebGL WebGLRenderer)',
      '  Animations    : GSAP & ScrollTrigger        ',
      '  Synthesizer   : Web Audio API Oscillator    ',
      '  Hosting       : Cloudflare Pages            ',
      '  Design System : Cozy Dark Mode / Slate Light',
      '=============================================='
    ].join('\n');
    console.log('%c' + info, 'color: #8B00FF; font-family: monospace; font-size: 11px; font-weight: bold;');
    if (window.hudEngine && typeof window.hudEngine.addXP === 'function') {
      window.hudEngine.addXP(10, 'Accessed: Core System Logs');
    }
    if (typeof window.showZaNotification === 'function') {
      window.showZaNotification('Tech stack specifications printed to the developer console log.', 'success');
    }
  }

  function navigateToRoute(path, hash) {
    var isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.endsWith('/');
    if (path === '/' && isHomePage && hash) {
      var el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    if (window.location.pathname === path && !hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.href = path + (hash || '');
  }

  var ACTIONS = [
    { icon: '🏠', label: 'Home',          shortcut: '',          action: function () { navigateToRoute('/', '#hero'); } },
    { icon: '👤', label: 'About',         shortcut: '',          action: function () { navigateToRoute('/', '#about'); } },
    { icon: '💼', label: 'Projects',      shortcut: '',          action: function () { navigateToRoute('/projects'); } },
    { icon: '📖', label: 'Biography',     shortcut: '',          action: function () { navigateToRoute('/biography'); } },
    { icon: '🎵', label: 'Music & Audio', shortcut: '',          action: function () { navigateToRoute('/', '#music'); } },
    { icon: '🧪', label: 'Ideas Lab',     shortcut: '',          action: function () { navigateToRoute('/ideas'); } },
    { icon: '📺', label: 'YouTube',       shortcut: '',          action: function () { navigateToRoute('/ideas/youtube'); } },
    { icon: '🌐', label: 'Socials',       shortcut: '',          action: function () { navigateToRoute('/', '#socials'); } },
    { icon: '✉️', label: 'Contact',       shortcut: '',          action: function () { navigateToRoute('/contact'); } },
    { icon: '🌟', label: 'The Vision',     shortcut: '',          action: function () { navigateToRoute('/', '#vision'); } },
    { icon: '🎨', label: 'Toggle Theme',  shortcut: modKey + '+T', action: function () { if (window.toggleTheme) window.toggleTheme(); } },
    { icon: '🔊', label: 'Toggle Sound',  shortcut: modKey + '+M', action: function () { if (window.soundSynth) window.soundSynth.toggleMute(); } },
    { icon: '🌌', label: 'Play Ambient Hum', shortcut: '',       action: function () { toggleAmbientHum(); } },
    { icon: '💀', label: 'Activate Chaos Mode', shortcut: '',    action: function () { activateChaosMode(); } },
    { icon: '🔒', label: 'About this Site', shortcut: '',        action: function () { displayAboutSite(); } }
  ];

  /* ---- DOM Creation ---- */
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'cmd-palette-overlay';
    var os = overlay.style;
    os.position = 'fixed';
    os.top = '0';
    os.left = '0';
    os.width = '100%';
    os.height = '100%';
    os.zIndex = '10001';
    os.background = 'rgba(5,8,22,0.8)';
    os.backdropFilter = 'blur(12px)';
    os.display = 'none';
    os.justifyContent = 'center';
    os.alignItems = 'flex-start';
    os.paddingTop = '18vh';

    var modal = document.createElement('div');
    modal.className = 'cmd-palette-modal';
    var ms = modal.style;
    ms.background = 'rgba(15,18,35,0.98)';
    ms.border = '1px solid rgba(139,0,255,0.3)';
    ms.borderRadius = '16px';
    ms.width = '100%';
    ms.maxWidth = '560px';
    ms.margin = '0 1rem';
    ms.overflow = 'hidden';
    ms.boxShadow = '0 24px 80px rgba(139,0,255,0.2)';
    ms.fontFamily = '"Inter", "JetBrains Mono", sans-serif';

    // Search input
    input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type a command…';
    input.className = 'cmd-palette-input';
    var is = input.style;
    is.width = '100%';
    is.padding = '16px 20px';
    is.background = 'transparent';
    is.border = 'none';
    is.borderBottom = '1px solid rgba(139,0,255,0.15)';
    is.outline = 'none';
    is.color = '#e9d5ff';
    is.fontSize = '15px';
    is.fontFamily = 'inherit';
    is.boxSizing = 'border-box';

    // Action list
    listEl = document.createElement('div');
    listEl.className = 'cmd-palette-list';
    listEl.style.cssText = 'max-height:340px;overflow-y:auto;padding:8px 0;';

    modal.appendChild(input);
    modal.appendChild(listEl);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Events
    input.addEventListener('input', onSearch);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });
  }

  function renderList() {
    listEl.innerHTML = '';

    for (var i = 0; i < filteredActions.length; i++) {
      (function (idx) {
        var act = filteredActions[idx];
        var item = document.createElement('div');
        item.className = 'cmd-palette-item';
        item.dataset.idx = idx;

        item.innerHTML =
          '<span style="font-size:18px;margin-right:12px;">' + act.icon + '</span>' +
          '<span style="flex:1;color:#e9d5ff;font-size:14px;">' + act.label + '</span>' +
          (act.shortcut
            ? '<span style="font-size:11px;opacity:0.4;font-family:monospace;">' + act.shortcut + '</span>'
            : '');

        var ds = item.style;
        ds.display = 'flex';
        ds.alignItems = 'center';
        ds.padding = '10px 20px';
        ds.cursor = 'pointer';
        ds.transition = 'background 0.15s';
        ds.borderRadius = '0';

        if (idx === selectedIdx) {
          ds.background = 'rgba(139,0,255,0.15)';
        }

        item.addEventListener('mouseenter', function () {
          selectedIdx = idx;
          highlightSelected();
        });

        item.addEventListener('click', function () {
          executeAction(idx);
        });

        listEl.appendChild(item);
      })(i);
    }
  }

  function highlightSelected() {
    var items = listEl.querySelectorAll('.cmd-palette-item');
    for (var i = 0; i < items.length; i++) {
      items[i].style.background =
        i === selectedIdx ? 'rgba(139,0,255,0.15)' : 'transparent';
    }

    // Auto-scroll into view
    if (items[selectedIdx]) {
      items[selectedIdx].scrollIntoView({ block: 'nearest' });
    }
  }

  function onSearch() {
    var query = input.value.toLowerCase().trim();
    selectedIdx = 0;

    if (!query) {
      filteredActions = ACTIONS.slice();
    } else {
      filteredActions = ACTIONS.filter(function (a) {
        return a.label.toLowerCase().indexOf(query) !== -1;
      });
    }

    renderList();
  }

  function executeAction(idx) {
    var act = filteredActions[idx];
    if (!act) return;
    closeOverlay();
    if (window.soundSynth) window.soundSynth.playSelect();
    act.action();
  }

  /* ---- Open / Close ---- */
  function openOverlay() {
    if (!overlay) createOverlay();
    isOpen = true;
    overlay.style.display = 'flex';
    input.value = '';
    selectedIdx = 0;
    filteredActions = ACTIONS.slice();
    renderList();

    requestAnimationFrame(function () {
      input.focus();
    });

    window.dispatchEvent(new CustomEvent('za_palette_opened'));
  }

  function closeOverlay() {
    if (!overlay) return;
    isOpen = false;
    overlay.style.display = 'none';
  }

  function toggleOverlay() {
    if (isOpen) closeOverlay();
    else openOverlay();
  }

  /* ---- Keyboard ---- */
  function onKeyDown(e) {
    // Ctrl+K / Cmd+K toggle
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleOverlay();
      return;
    }

    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeOverlay();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, filteredActions.length - 1);
      highlightSelected();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      highlightSelected();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      executeAction(selectedIdx);
      return;
    }
  }

  /* ---- Floating Trigger ---- */
  function createTriggerButton() {
    var btn = document.createElement('button');
    btn.className = 'cmd-trigger-btn';
    btn.setAttribute('aria-label', 'Open command palette');
    btn.textContent = modKey + 'K';

    var bs = btn.style;
    bs.position = 'fixed';
    bs.bottom = '1.5rem';
    bs.left = '1.5rem';
    bs.zIndex = '9998';
    bs.background = 'rgba(10,12,28,0.9)';
    bs.border = '1px solid rgba(139,0,255,0.3)';
    bs.borderRadius = '20px';
    bs.padding = '6px 14px';
    bs.color = '#a78bfa';
    bs.fontFamily = '"JetBrains Mono", monospace';
    bs.fontSize = '11px';
    bs.cursor = 'pointer';
    bs.backdropFilter = 'blur(8px)';
    bs.transition = 'border-color 0.2s, transform 0.2s';
    bs.letterSpacing = '0.5px';

    btn.addEventListener('mouseenter', function () {
      bs.borderColor = 'rgba(139,0,255,0.6)';
      bs.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', function () {
      bs.borderColor = 'rgba(139,0,255,0.3)';
      bs.transform = 'scale(1)';
    });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openOverlay();
    });

    document.body.appendChild(btn);
  }

  /* ---- Init ---- */
  window.initCommandPalette = function () {
    document.addEventListener('keydown', onKeyDown);
    createTriggerButton();

    // Make the header's hotkey hint clickable as well
    var hint = document.getElementById('cmdPaletteHint');
    if (hint) {
      hint.style.cursor = 'pointer';
      hint.addEventListener('click', function (e) {
        e.stopPropagation();
        openOverlay();
      });
    }
  };
})();

;
/* --- terminal.js --- */
(function () {
  'use strict';

  let terminalEl = null;
  let outputEl = null;
  let inputEl = null;
  let isOpen = false;
  
  // Game state
  let gameActive = false;
  let secretCode = 0;
  let attemptsLeft = 0;

  // Command history
  const commandHistory = [];
  let historyIndex = -1;

  // Matrix canvas state
  let matrixCanvas = null;
  let matrixInterval = null;
  let matrixAnimId = null;

  // Sound triggers helper
  function playSound(type) {
    if (!window.soundEngine) return;
    if (type === 'click' && typeof window.soundEngine.playClick === 'function') {
      window.soundEngine.playClick();
    } else if (type === 'select' && typeof window.soundEngine.playSelect === 'function') {
      window.soundEngine.playSelect();
    } else if (type === 'glitch' && typeof window.soundEngine.playGlitch === 'function') {
      window.soundEngine.playGlitch();
    }
  }

  // Create terminal overlay DOM
  function createTerminal() {
    terminalEl = document.createElement('div');
    terminalEl.className = 'za-terminal';
    terminalEl.id = 'za-terminal';

    terminalEl.innerHTML = `
      <div class="za-terminal-header">
        <span class="za-terminal-header-title">ZA-OS [v2.0.0] - Secure Terminal Emulator</span>
        <button class="za-terminal-header-close" id="za-terminal-close">EXIT</button>
      </div>
      <div class="za-terminal-output" id="za-terminal-output"></div>
      <div class="za-terminal-input-line">
        <span class="za-terminal-prompt" id="za-terminal-prompt">guest@za-os:~$</span>
        <input type="text" class="za-terminal-input" id="za-terminal-input" autocomplete="off" spellcheck="false" autofocus />
      </div>
    `;

    document.body.appendChild(terminalEl);

    outputEl = document.getElementById('za-terminal-output');
    inputEl = document.getElementById('za-terminal-input');

    // Close button event
    document.getElementById('za-terminal-close').addEventListener('click', closeTerminal);

    // Maintain input focus when clicking terminal area
    terminalEl.addEventListener('click', function (e) {
      if (e.target !== document.getElementById('za-terminal-close')) {
        inputEl.focus();
      }
    });

    // Handle inputs
    inputEl.addEventListener('keydown', handleInputKey);

    // Initial message
    printLine("ZA-OS(R) System Shell Emulator loaded.", "system-output");
    printLine("Type 'help' to review active system directives.", "success-output");
    printLine("", "system-output");
  }

  function printLine(text, className) {
    if (!outputEl) return;
    const line = document.createElement('div');
    line.className = 'za-terminal-line ' + (className || '');
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function toggleTerminal() {
    if (isOpen) {
      closeTerminal();
    } else {
      openTerminal();
    }
  }

  function openTerminal() {
    if (!terminalEl) createTerminal();
    isOpen = true;
    terminalEl.classList.add('active');
    playSound('select');
    
    // Disable main body scroll
    document.body.style.overflow = 'hidden';

    // Dispatch achievement event
    window.dispatchEvent(new CustomEvent('za_achievement', {
      detail: { id: 'hacker', title: '👾 Hacker — Opened Terminal Emulator', xp: 40 }
    }));

    setTimeout(function () {
      if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
      }
    }, 100);
  }

  function closeTerminal() {
    if (!terminalEl) return;
    isOpen = false;
    terminalEl.classList.remove('active');
    playSound('click');

    // Restore body scroll
    document.body.style.overflow = '';
  }

  // Keyboard router inside terminal input
  function handleInputKey(e) {
    if (e.key === 'Enter') {
      const val = inputEl.value;
      inputEl.value = '';
      if (gameActive) {
        processGameGuess(val);
      } else {
        executeCommand(val);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closeTerminal();
      return;
    }

    // Command history traversal
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        if (historyIndex > 0) {
          historyIndex--;
        } else if (historyIndex === -1) {
          historyIndex = commandHistory.length - 1;
        }
        inputEl.value = commandHistory[historyIndex];
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex !== -1) {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          inputEl.value = commandHistory[historyIndex];
        } else {
          historyIndex = -1;
          inputEl.value = '';
        }
      }
      return;
    }
  }

  // Command parser
  function executeCommand(cmdStr) {
    const rawCmd = cmdStr.trim();
    if (!rawCmd) return;

    // Push history
    commandHistory.push(rawCmd);
    historyIndex = -1;

    // Echo
    printLine("guest@za-os:~$ " + rawCmd, "command-echo");

    const parts = rawCmd.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        printLine("Available ZA-OS Directives:", "system-output");
        printLine("  about      - Brief overview of developer persona", "system-output");
        printLine("  projects   - Directory list of active software modules", "system-output");
        printLine("  cat <name> - Print detailed specifications of a project (e.g. cat homies)", "system-output");
        printLine("  theme <c>  - Re-map system accent styling (blue, purple, teal, orange, magenta)", "system-output");
        printLine("  skills     - View capabilities radar vector metrics", "system-output");
        printLine("  game       - Initialize hacker guess PIN bypass routine", "system-output");
        printLine("  sudo <cmd> - Attempt root authorization override (e.g. sudo rm -rf /)", "system-output");
        printLine("  matrix     - Toggle falling matrix buffer backdrop", "system-output");
        printLine("  clear      - Clear buffer output", "system-output");
        printLine("  exit       - Shutdown terminal shell", "system-output");
        break;

      case 'clear':
        if (outputEl) outputEl.innerHTML = '';
        break;

      case 'exit':
      case 'close':
        closeTerminal();
        break;

      case 'whoami':
        printLine("guest (status: ACTIVE_CLIENT, host: " + (window.location.hostname || "local_host") + ")", "system-output");
        break;

      case 'about':
        printLine("Developer: Zaid Asim", "system-output");
        printLine("Role     : Full-Stack Engineer, Game Developer & UI Architect", "system-output");
        printLine("Brief    : Focused on building ultra-fluid, deeply interactive, and aesthetic software.", "system-output");
        printLine("Origin   : India 🇮🇳", "system-output");
        break;

      case 'projects':
      case 'ls':
        printLine("Listing projects directory: /root/projects", "system-output");
        printLine("  swadesh    - Swadesh AI language localisation system", "system-output");
        printLine("  urgeguard  - UrgeGuard focus extension blocker", "system-output");
        printLine("  homies     - Homies RPG soundtrack listener", "system-output");
        printLine("  chronos    - Chronos real-time monitoring dashboard", "system-output");
        printLine("Type 'cat <name>' to retrieve details.", "success-output");
        break;

      case 'cat':
        if (!args[0]) {
          printLine("Error: cat requires target project identifier. E.g. 'cat swadesh'", "error-output");
        } else {
          const target = args[0].toLowerCase();
          if (target === 'swadesh') {
            printLine(">> FILE PATH: /root/projects/swadesh.log", "accent");
            printLine("Project   : Swadesh AI Platform", "system-output");
            printLine("Role      : Lead Architect & Founder", "system-output");
            printLine("Tech Stack: FastAPI, Node.js, Web Audio API, Docker", "system-output");
            printLine("Details   : Bridges local dialect splits inside India via automated speech localisation.", "system-output");
          } else if (target === 'urgeguard') {
            printLine(">> FILE PATH: /root/projects/urgeguard.log", "accent");
            printLine("Project   : UrgeGuard Focus Utility", "system-output");
            printLine("Role      : Solo Creator", "system-output");
            printLine("Tech Stack: JavaScript (WebExtensions), SQLite database, CSS3 variables", "system-output");
            printLine("Details   : Employs cognitive friction systems to disrupt addictive browsing cycles.", "system-output");
          } else if (target === 'homies') {
            printLine(">> FILE PATH: /root/projects/homies.log", "accent");
            printLine("Project   : Homies RPG Visualiser", "system-output");
            printLine("Role      : Game Programmer & Audio Lead", "system-output");
            printLine("Tech Stack: Unity Engine, C# scripting, WebGL, procedural WebAudio synth", "system-output");
            printLine("Details   : Gamified music environment linking active soundwaves with achievements.", "system-output");
          } else if (target === 'chronos') {
            printLine(">> FILE PATH: /root/projects/chronos.log", "accent");
            printLine("Project   : Chronos System Monitor", "system-output");
            printLine("Role      : Frontend Core Engineer", "system-output");
            printLine("Tech Stack: React, D3.js charting, WebGL shader canvas, Node.js", "system-output");
            printLine("Details   : Real-time telemetry dashboard monitoring host status and connection maps.", "system-output");
          } else {
            printLine("Error: File or directory '/root/projects/" + args[0] + "' not found.", "error-output");
          }
        }
        break;

      case 'skills':
        printLine(">> SYSTEM PROFILE METRICS:", "accent");
        printLine("  Frontend Tech  [====================] 95% (Expert)", "system-output");
        printLine("  Backend Systems[==================--] 90% (Advanced)", "system-output");
        printLine("  Game Programming[====================] 95% (Expert)", "system-output");
        printLine("  AI Integrations[==================--] 90% (Advanced)", "system-output");
        printLine("  Cloud & DevOps [================----] 80% (Competent)", "system-output");
        break;

      case 'theme':
        if (!args[0]) {
          printLine("Error: Theme requires color parameter. Options: blue, purple, teal, orange, magenta", "error-output");
        } else {
          const colorName = args[0].toLowerCase();
          const changed = setAccentTheme(colorName);
          if (changed) {
            printLine("Accent variables updated successfully. Shifted to '" + colorName + "' mode.", "success-output");
            playSound('select');
          } else {
            printLine("Error: Unknown accent color '" + args[0] + "'. Use: blue, purple, teal, orange, magenta", "error-output");
          }
        }
        break;

      case 'sudo':
        if (!args[0]) {
          printLine("sudo: target command execution required.", "error-output");
        } else {
          const action = args.join(' ');
          if (action === 'rm -rf /' || action === 'rm -rf') {
            printLine("CRITICAL WARNING: INITIATING KERNEL OVERRIDE PROTOCOL...", "error-output");
            printLine("UNMOUNTING ROOT FILE DIRECTORY... DELETING SYSTEM MODULES...", "error-output");
            setTimeout(triggerGlitchDestruction, 1000);
          } else {
            printLine("guest is not in the sudoers file. This incident will be reported to admin.", "error-output");
          }
        }
        break;

      case 'matrix':
        toggleMatrixRain();
        break;

      case 'game':
        initBypassGame();
        break;

      default:
        printLine("Error: Shell directive '" + cmd + "' unresolved. Type 'help' for instructions.", "error-output");
    }
  }

  // Set Global CSS Accent overrides
  function setAccentTheme(color) {
    const themes = {
      blue: { primary: '#0989d8', secondary: '#6c3bff' },
      purple: { primary: '#6c3bff', secondary: '#ff00dc' },
      teal: { primary: '#00d4aa', secondary: '#00e5ff' },
      orange: { primary: '#ff8c00', secondary: '#ffd700' },
      magenta: { primary: '#ff00dc', secondary: '#8b00ff' }
    };
    if (!themes[color]) return false;

    const t = themes[color];
    document.documentElement.style.setProperty('--color-accent-primary', t.primary);
    document.documentElement.style.setProperty('--color-accent-secondary', t.secondary);
    document.documentElement.style.setProperty('--gradient-brand', `linear-gradient(135deg, ${t.primary}, ${t.secondary})`);
    document.documentElement.style.setProperty('--color-text-accent', t.primary);
    document.documentElement.style.setProperty('--color-text-link', t.primary);

    // Fire event for theme updates (recolors background canvas etc.)
    window.dispatchEvent(new CustomEvent('za_theme_changed', { detail: { theme: color } }));

    // Achievement award
    window.dispatchEvent(new CustomEvent('za_achievement', {
      detail: { id: 'the_architect', title: '📐 The Architect — Altered System Accents', xp: 30 }
    }));

    return true;
  }

  // Hacking Bypass Minigame
  function initBypassGame() {
    gameActive = true;
    secretCode = Math.floor(Math.random() * 900) + 100; // 100 to 999
    attemptsLeft = 6;

    printLine("========================================================", "accent");
    printLine("[ZA-OS SECURITY ROUTINE BYPASS ACTIVATED]", "warning");
    printLine("CRACK THE 3-DIGIT ACCESS PIN (100 - 999)", "system-output");
    printLine("You have 6 attempts remaining. Type your guess code:", "success-output");
    printLine("========================================================", "accent");

    document.getElementById('za-terminal-prompt').textContent = "guess@bypass:~$";
  }

  function processGameGuess(val) {
    const guessText = val.trim();
    printLine("guess@bypass:~$ " + guessText, "command-echo");

    const guessNum = parseInt(guessText, 10);
    if (isNaN(guessNum) || guessNum < 100 || guessNum > 999) {
      printLine("Error: Bypass code must be a 3-digit integer (100-999). Try again.", "error-output");
      return;
    }

    attemptsLeft--;

    if (guessNum === secretCode) {
      printLine("[BYPASS SUCCESSFUL: CORE INTRUSION ACTIVE]", "success-output");
      printLine("Access granted. You successfully overridden the gateway.", "success-output");
      playSound('select');
      
      // Dispatch Achievement
      window.dispatchEvent(new CustomEvent('za_achievement', {
        detail: { id: 'game_master', title: '🏆 Game Master — Solved Hacking Minigame', xp: 50 }
      }));

      exitBypassGame();
    } else if (attemptsLeft <= 0) {
      printLine("[BYPASS ATTEMPT EXPIRED: INTRUSION DETECTED]", "error-output");
      printLine("Access locked. Security node hardened. Key was: " + secretCode, "error-output");
      playSound('glitch');
      exitBypassGame();
    } else {
      playSound('click');
      if (guessNum > secretCode) {
        printLine("  Hint: Code [" + guessNum + "] is TOO HIGH. Target value is lower.", "warning");
      } else {
        printLine("  Hint: Code [" + guessNum + "] is TOO LOW. Target value is higher.", "warning");
      }
      printLine("  Attempts remaining: " + attemptsLeft, "system-output");
    }
  }

  function exitBypassGame() {
    gameActive = false;
    document.getElementById('za-terminal-prompt').textContent = "guest@za-os:~$";
  }

  // Sudo rm -rf destruction effect
  function triggerGlitchDestruction() {
    playSound('glitch');
    closeTerminal();

    if (window.gsap) {
      const timeline = window.gsap.timeline({
        onComplete: () => {
          // Reset style override
          window.gsap.set(document.body, { clearProps: "all" });
          alert("RESTABLISHING KERNEL... SECURE BUFFER RESTORED. SYSTEM REBOOTED.");
          // Reload the page to restore system state
          window.location.reload();
        }
      });

      timeline.to(document.body, { duration: 0.1, skewX: 18, ease: "power4.inOut" })
              .to(document.body, { duration: 0.05, skewX: -25, scaleY: 0.7, filter: "hue-rotate(120deg) blur(3px) invert(1)" })
              .to(document.body, { duration: 0.15, skewX: 10, scaleX: 1.3, filter: "hue-rotate(240deg) invert(1) contrast(4)" })
              .to(document.body, { duration: 0.1, x: 70, y: -40, rotate: 3 })
              .to(document.body, { duration: 0.25, x: -80, y: 50, skewY: 15, filter: "none" })
              .to(document.body, { duration: 0.1, scale: 0.8, filter: "invert(0)" })
              .to(document.body, { duration: 0.4, rotate: 0, scale: 1, ease: "elastic.out(1, 0.3)" });
    } else {
      document.body.style.filter = "hue-rotate(180deg) invert(1) blur(2px)";
      setTimeout(() => {
        document.body.style.filter = "";
        alert("SECURE REBOOT COMPLETED.");
        window.location.reload();
      }, 1500);
    }

    // Sudo Hacker achievement
    window.dispatchEvent(new CustomEvent('za_achievement', {
      detail: { id: 'sudo_hacker', title: '💀 Sudo Hacker — Invoked Root Override', xp: 50 }
    }));
  }

  // Falling Matrix Rain effect
  function toggleMatrixRain() {
    if (matrixCanvas) {
      // Turn off
      printLine("Matrix animation pipeline detached.", "warning");
      clearInterval(matrixInterval);
      cancelAnimationFrame(matrixAnimId);
      matrixCanvas.remove();
      matrixCanvas = null;
      return;
    }

    printLine("Spawning Matrix cascade overlay... Type 'matrix' again to toggle off.", "success-output");

    matrixCanvas = document.createElement('canvas');
    matrixCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;opacity:0.15;pointer-events:none;';
    terminalEl.appendChild(matrixCanvas);

    const ctx = matrixCanvas.getContext('2d');
    
    function resizeCanvas() {
      if (!matrixCanvas) return;
      matrixCanvas.width = terminalEl.offsetWidth;
      matrixCanvas.height = terminalEl.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = Array(columns).fill(1);
    
    // Japanese katakana and numbers/alphabet
    const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function draw() {
      if (!matrixCanvas) return;
      ctx.fillStyle = 'rgba(2, 4, 10, 0.06)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      ctx.fillStyle = '#00e676';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    function loop() {
      draw();
      matrixAnimId = requestAnimationFrame(loop);
    }

    loop();
  }

  // Keyboard shortcut listener
  document.addEventListener('keydown', function (e) {
    // Ignore key bindings in standard input forms
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      // Still allow Ctrl + ~ shortcut even in input fields
      if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        toggleTerminal();
      }
      return;
    }

    // Toggle on backtick key alone
    if (e.key === '`') {
      e.preventDefault();
      toggleTerminal();
      return;
    }

    // Toggle on Ctrl + ` or Ctrl + ~
    if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
      e.preventDefault();
      toggleTerminal();
      return;
    }

    // Toggle on Command + Shift + T (alt shortcut)
    if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      toggleTerminal();
      return;
    }
  });

  // Expose toggle globally so Command Palette can call it
  window.toggleTerminal = toggleTerminal;
})();

;
/* --- scroll-animations.js --- */
/* ============================================================
   scroll-animations.js — GSAP ScrollTrigger Orchestration
   Viewport-triggered animations, scroll progress bar, and
   smooth anchor scrolling.
   ============================================================ */
(function () {
  'use strict';

  function setupAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const animatables = document.querySelectorAll('[data-animate]');

    animatables.forEach(function (el) {
      const type = el.dataset.animate;

      switch (type) {
        case 'fade-up':
          gsap.from(el, {
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 60,
            filter: 'blur(8px)',
            duration: 1,
            ease: 'power3.out',
            clearProps: 'filter',
          });
          break;

        case 'fade-left':
          gsap.from(el, {
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 0,
            x: -80,
            duration: 1,
            ease: 'power3.out',
          });
          break;

        case 'fade-right':
          gsap.from(el, {
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 0,
            x: 80,
            duration: 1,
            ease: 'power3.out',
          });
          break;

        case 'scale-in':
          gsap.from(el, {
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 0,
            scale: 0.85,
            duration: 1,
            ease: 'power3.out',
          });
          break;

        case 'stagger-up':
          gsap.from(el.children, {
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 60,
            filter: 'blur(8px)',
            duration: 1,
            ease: 'power3.out',
            stagger: 0.1,
            clearProps: 'filter',
          });
          break;
      }
    });
  }

  function setupScrollProgress() {
    window.addEventListener(
      'scroll',
      function () {
        const scrollTop = window.scrollY || window.pageYOffset || 0;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
        document.documentElement.style.setProperty(
          '--scroll-progress',
          progress.toString()
        );
      },
      { passive: true }
    );
  }

  function setupSmoothScroll() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY;

      // Verify that ScrollToPlugin is loaded in GSAP
      if (typeof gsap !== 'undefined' && gsap.plugins && gsap.plugins.scrollTo) {
        gsap.to(window, {
          scrollTo: { y: offsetTop, autoKill: true },
          duration: 1,
          ease: 'power3.inOut',
        });
      } else {
        // Safe native smooth scrolling fallback
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  }

  window.initScrollAnimations = function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[scroll-animations] GSAP or ScrollTrigger not loaded.');
      return;
    }

    setupAnimations();
    setupScrollProgress();
    setupSmoothScroll();
  };
})();

;
/* --- parallax.js --- */
/* ============================================================
   parallax.js — Multi-Layer Parallax Engine
   Smooth scroll & mouse-driven parallax with lerp interpolation.
   ============================================================ */
(function () {
  'use strict';

  const LERP_FACTOR = 0.08;

  let scrollElements  = [];
  let mouseElements   = [];
  let currentScroll   = 0;
  let targetScroll    = 0;
  let currentMouseX   = 0;
  let currentMouseY   = 0;
  let targetMouseX    = 0;
  let targetMouseY    = 0;
  let heroSection     = null;
  let animId          = null;

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function gatherElements() {
    scrollElements = [];
    mouseElements  = [];

    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      const speed = parseFloat(el.dataset.speed) || 0.1;
      scrollElements.push({ el: el, speed: speed, currentY: 0 });
    });

    document.querySelectorAll('[data-mouse-parallax]').forEach(function (el) {
      const speed = parseFloat(el.dataset.mouseSpeed || el.dataset.speed) || 0.02;
      mouseElements.push({ el: el, speed: speed, currentX: 0, currentY: 0 });
    });
  }

  function onScroll() {
    targetScroll = window.scrollY || window.pageYOffset || 0;
  }

  function onMouseMove(e) {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    // Only track when hero is in view
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetMouseX = (e.clientX - cx) / cx; // -1 to 1
    targetMouseY = (e.clientY - cy) / cy; // -1 to 1
  }

  function update() {
    // Lerp scroll
    currentScroll = lerp(currentScroll, targetScroll, LERP_FACTOR);

    for (let i = 0; i < scrollElements.length; i++) {
      const item = scrollElements[i];
      const targetY = currentScroll * item.speed;
      item.currentY = lerp(item.currentY, targetY, LERP_FACTOR);
      item.el.style.transform = 'translateY(' + (-item.currentY) + 'px)';
    }

    // Lerp mouse
    currentMouseX = lerp(currentMouseX, targetMouseX, LERP_FACTOR);
    currentMouseY = lerp(currentMouseY, targetMouseY, LERP_FACTOR);

    for (let i = 0; i < mouseElements.length; i++) {
      const item = mouseElements[i];
      const tx = currentMouseX * item.speed * 40;
      const ty = currentMouseY * item.speed * 40;
      item.currentX = lerp(item.currentX, tx, LERP_FACTOR);
      item.currentY = lerp(item.currentY, ty, LERP_FACTOR);
      item.el.style.transform =
        'translate(' + item.currentX + 'px, ' + item.currentY + 'px)';
    }

    animId = requestAnimationFrame(update);
  }

  window.initParallax = function () {
    heroSection = document.querySelector('.hero, #hero, [data-hero]');
    gatherElements();

    if (scrollElements.length === 0 && mouseElements.length === 0) return;

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    onScroll();
    update();
  };
})();

;
/* --- modals.js --- */
/* ============================================================
   modals.js — Project Detail Modals & Magnetic Buttons
   Manages custom popups for project case studies and magnetic
   button animations on hover.
   ============================================================ */
(function () {
  'use strict';

  var projectData = {
    'swadesh-ai': {
      title: 'Swadesh AI',
      tagline: 'The Intelligent Context Engine for a Connected World',
      story: '<h4>The Vision</h4><p>Built as the flagship AI platform of Zaid Asim Softwares, Swadesh AI explores the boundary of context-aware natural language processing. I designed the architecture to handle complex query pipelines, integrating custom embedding stores and local language model endpoints. It was an exercise in understanding both low-level vector mathematical representations and high-level client-facing API response interfaces.</p><h4>The Development</h4><p>The system was built to operate efficiently on limited hardware by implementing intelligent semantic caching. By storing past interactions and evaluating their semantic similarity to new prompts, the engine avoids redundant LLM invocations, reducing response latency by up to 75% for repeated queries.</p>',
      learned: 'Building Swadesh AI taught me the limits of current AI architectures and how robust cache systems and semantic indexing can make AI response times 4x faster. I learned that data ingestion pipelines are 90% of the battle in AI development.',
      tech: ['Python', 'PyTorch', 'n8n', 'FastAPI', 'VectorDB', 'LLMs'],
      status: '🏆 Active Development',
      image: 'assets/swadesh-ai.png',
      link: 'swadesh.html'
    },
    'crafty-kids': {
      title: 'Crafty Kids of India',
      tagline: 'Preserving Indian Heritage Through Playful Innovation',
      story: '<h4>The Vision</h4><p>As a massive creative breakthrough, Crafty Kids of India was designed as an interactive educational experience showcasing India\'s rich history of toys, arts, and crafts. The game teaches children regional histories, block printing, woodcarving, and clay design within a beautifully rendered virtual playground.</p><h4>The Accolades</h4><p>This project had the honor of being recognized at the prestigious STEM Innovation League for its contribution to digital heritage preservation. It proved that gaming is a powerful medium for educational and cultural dissemination.</p>',
      learned: 'This project taught me how to scale assets, build kid-friendly UI architectures, and validate educational concepts with real user testing groups. Translating physical crafts into interactive virtual mechanics was an incredible design challenge.',
      tech: ['Unity', 'C#', 'Blender', 'UI Toolkit', 'Android SDK'],
      status: '🏆 Award-Winning',
      image: 'assets/crafty-kids.png',
      link: '#contact'
    },
    'storm-of-kings': {
      title: 'Storm of Kings',
      tagline: 'An Episodic 2D RPG World Built on Narrative Depth',
      story: '<h4>The Vision</h4><p>Storm of Kings is a 2D RPG built with Unity. I wanted to tell a long-form story with branching dialogues, complex state logic, and epic battles. The character dialog tree runs on a custom node-graph interpreter that I wrote myself, allowing story arcs to merge or deviate based on player reputation values.</p><h4>The Aesthetics</h4><p>It contains pixel art that I hand-crafted and animated in Aseprite to capture a warm, cozy nostalgia, paired with procedural audio cues that match the weather patterns of the map.</p>',
      learned: 'Writing a node-based dialogue interpreter in C# taught me the value of clean data representation and serialization. I learned that game storytelling requires a tight coupling of narrative design and systems engineering.',
      tech: ['Unity', 'C#', 'Aseprite', 'Node Graph', 'JSON Data'],
      status: '🚧 In Development',
      image: 'assets/storm-of-kings.png',
      link: '#contact'
    },
    'homies': {
      title: 'Homies',
      tagline: 'GTA-Inspired Open-World Life Simulator',
      story: '<h4>The Vision</h4><p>Homies represents my ambition for large-scale systems. It simulates a living sandbox city complete with player property ownership, street races, currency-based business ventures, and a dynamic community ecosystem. I developed custom vehicle controller physics to simulate realistic tire friction, drifting, and collisions.</p><h4>The Audio Dimension</h4><p>An unreleased soundtrack album was composed specifically for my game homies, featuring english hip hop tracks like "Hustlaa Hustlaa" to back the street aesthetics and keep the atmosphere high-energy.</p>',
      learned: 'Designing sandbox ecosystems taught me how to manage hundreds of active game elements without causing CPU bottlenecks. It also taught me the importance of audio design in establishing environmental context and player immersion.',
      tech: ['Unity', 'C#', 'Web Audio API', 'FMOD', 'Vehicle Physics'],
      status: '🚧 Alpha Phase',
      image: 'assets/homies.png',
      link: '#music'
    },
    'urgeguard': {
      title: 'UrgeGuard AI',
      tagline: 'Gamified Habit Tracker Built on Behavioral Psychology',
      story: '<h4>The Vision</h4><p>UrgeGuard AI gamifies self-discipline by turning positive habits into RPG-style quests. Users earn experience points, battle virtual monsters representing bad habits, and unlock achievements. The project was designed, prototyped, and pitched to Rebirth Games, receiving incredible praise for its UI execution and psychological reward structures.</p><h4>Psychological Mechanics</h4><p>The application implements variable reward schedules and positive reinforcement loops to motivate users to maintain long-term streaks, transforming tedious tracking into an addictive progression system.</p>',
      learned: 'I learned how to integrate gamified mechanics into standard utility apps. Behavioral design requires delicate balancing—if the game elements are too complex, users ignore the utility; if they are too simple, they lose motivation.',
      tech: ['React', 'CSS Glassmorphism', 'Tailwind CSS', 'LocalStorage'],
      status: '✅ Prototype Complete',
      image: 'assets/urgeguard.png',
      link: '#contact'
    },
    'zaid-asim-softwares': {
      title: 'Zaid Asim Softwares',
      tagline: 'UDYAM-Registered Enterprise Delivering Future Solutions',
      story: '<h4>The Enterprise</h4><p>Zaid Asim Softwares is my official registered business entity (UDYAM-KR-15-0069715) based in India. It serves as the legal and operational structure for all my digital creations, enterprise services, and AI research integrations. We deliver custom software development, Web automation, high-performance UI designs, and local regional software deployments.</p><h4>Core Services</h4><p>We build premium web portfolios, multi-agent automated content engines, custom databases, and interactive game projects. Our goal is to bring world-class engineering solutions directly to businesses.</p>',
      learned: 'Operating a registered enterprise taught me the business side of engineering—tax laws, business registration, contract negotiations, invoicing, and client relationship management. It made me realize that writing code is only half the puzzle of building a successful studio.',
      tech: ['Full Stack', 'n8n Automation', 'Cloudflare Pages', 'API Systems'],
      status: '✅ UDYAM Registered',
      image: 'assets/zaid-asim-softwares.png',
      link: '#contact'
    },
    'chronos': {
      title: 'Project Chronos',
      tagline: 'Causal Fault Diagnostics Infrastructure for Heterogeneous Systems',
      story: '<h4>The Vision</h4><p>Project Chronos is a hardware-topology-aware multimodal causal evidence fusion platform designed for modern mixed-criticality systems. It resolves timing interactions, cache QoS bottlenecks, and scheduling latencies by reasoning over degraded or incomplete observability data from trace fabrics, PMUs, and hypervisors.</p><h4>The Diagnostics Approach</h4><p>Instead of guessing exact execution paths, Chronos models system states directly through "Pressure Epochs" (sustained states of resource contention) and handles clock domain uncertainties logically within physical platform boundaries, eliminating correlation hallucinations.</p>',
      learned: 'Building Chronos taught me how hardware interconnects, SMMU mappings, and virtualization layers propagate latency. I learned to model time as a range of uncertainty and use physical topology to bounds causality in distributed environments.',
      tech: ['Causal Logic', 'Observability', 'PMUs', 'System Tracing', 'Virtualization'],
      status: '🚧 Research Phase',
      image: 'assets/chronos.png',
      link: '#contact'
    },
    'titan': {
      title: 'TITAN',
      tagline: 'Executable Intelligence Operating System',
      story: '<h4>The Vision</h4><p>TITAN is an executable intelligence operating system that treats reasoning as a searchable, verifiable process rather than next-token prediction. It organizes knowledge into dynamic graphs, caches references, and coordinates actions via a compact planning core to deliver high-quality, offline intelligence on budget mobile devices.</p><h4>The Architecture</h4><p>TITAN decouples intelligence from parameter scaling by combining a semantic memory store, a knowledge graph, a retrieval engine, candidate generation search, and verification fabrics that automatically test outputs for accuracy prior to release.</p>',
      learned: 'Designing TITAN taught me that cognitive system architectures can make small models perform with greater precision than large models alone. I learned to structure executable action graphs and integrate compile-time verification loops.',
      tech: ['Reasoning Graphs', 'Semantic Memory', 'n8n Automation', 'Offline AI', 'Verification Fabric'],
      status: '🚧 Prototype Phase',
      image: 'assets/titan.png',
      link: '#contact'
    },
    'qta-x': {
      title: 'QTA-X',
      tagline: 'Validation-Gated Atomic Manufacturing Platform',
      story: '<h4>The Vision</h4><p>QTA-X is a next-generation Validation-Gated Atomic Manufacturing Platform designed to design, validate, and orchestrate atomic-scale fabrication systems. It features isolated operating modes: Cryogenic Baseline (Mode A), Laser-assisted Atomic Manufacturing (Mode B), Recovery and Isolation (Mode C), and Defect Characterization/Sensing (Mode D) to enforce scientific reproducibility and claim integrity.</p><h4>The Digital Twin</h4><p>A multiphysics digital twin continuously models heat transfer, gas transport, vibration coupling, and uncertainty propagation to predict outcomes and manage risks before actual cryogenic experiments occur.</p>',
      learned: 'Designing QTA-X taught me that separating fabrication from characterization is crucial. Operating cryogenic baseline steps before manufacturing eliminates vibrational/thermal noise correlation mistakes completely.',
      tech: ['Cryogenics', 'Vacuum Systems', 'Laser Deposition', 'Digital Twin', 'Scientific Governance'],
      status: '🚧 Research Phase',
      image: 'assets/qta-x.png',
      link: '#contact'
    },
    'android-xr-research': {
      title: 'Android XR Systems Research',
      tagline: 'Spatial systems analysis, Qualcomm platform bottlenecks & bystander-privacy gates',
      story: '<h4>The Research</h4><p>A deep systems-level review paper exploring the scaling Moats and hard limits of Android XR devices (Snapdragon AR1/AR2 architectures). The paper outlines the necessary hardware-visible recording gates and event-triggered vision pipelines required for all-day smart glasses.</p><h4>Inventions Proposed</h4><p>The paper proposes intent-aware AI compression, speculative edge-cloud decoding orchestrators, and social interaction modes to overcome vergence-accommodation display conflicts and power constraints.</p>',
      learned: 'This research taught me that smart glasses are ultimately a low-power sensing and edge orchestration problem. Tiered scheduling (local to edge to cloud) is the absolute moat for comfortable spatial computing.',
      tech: ['Android XR', 'Spatial Computing', 'Qualcomm AR1/AR2', 'Event Sensing', 'Edge AI', 'Gemini'],
      status: '📚 Research Paper',
      image: 'assets/android-xr.png',
      link: '/android-xr-research'
    }
  };

  function initModals() {
    var modalOverlay = document.getElementById('projectModal');
    var closeBtn = document.querySelector('.modal-close-btn');

    if (!modalOverlay) return;

    // Listen to deep dive buttons
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-project-id]');
      if (!btn) return;
      if (btn.tagName === 'A') return; // Let links navigate directly

      var projectId = btn.dataset.projectId;
      var data = projectData[projectId];
      if (!data) return;

      openModal(data);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });

    function openModal(data) {
      document.getElementById('modalImage').src = data.image;
      document.getElementById('modalImage').alt = data.title;
      document.getElementById('modalTitle').textContent = data.title;
      document.getElementById('modalTagline').textContent = data.tagline;
      document.getElementById('modalStory').innerHTML = data.story;
      document.getElementById('modalLearned').textContent = data.learned;
      document.getElementById('modalStatus').textContent = data.status;

      // Populate tech list
      var techList = document.getElementById('modalTechList');
      techList.innerHTML = '';
      data.tech.forEach(function (t) {
        var span = document.createElement('span');
        span.className = 'sidebar-tech-tag';
        span.textContent = t;
        techList.appendChild(span);
      });

      // Bind action button
      var actionBtn = document.getElementById('modalActionBtn');
      if (actionBtn) {
        actionBtn.setAttribute('href', data.link);
        if (data.title === 'Swadesh AI') {
          actionBtn.textContent = 'Explore Project';
        } else if (data.title === 'Homies') {
          actionBtn.textContent = 'Explore Soundtrack';
        } else {
          actionBtn.textContent = 'Collaborate on Project';
        }
        actionBtn.onclick = function() {
           closeModal();
        };
      }

      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      if (window.soundEngine && typeof window.soundEngine.playSuccess === 'function') {
        window.soundEngine.playSuccess();
      }
    }

    function closeModal() {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
      
      if (window.soundEngine && typeof window.soundEngine.playTick === 'function') {
        window.soundEngine.playTick();
      }
    }
  }

  // 2. Magnetic Buttons Effect
  function initMagneticButtons() {
    var magneticBtns = document.querySelectorAll('.contact-btn, .primary-btn, .secondary-btn, .youtube-subscribe-btn');

    magneticBtns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        // Pull button towards cursor
        btn.style.transform = 'translate(' + x * 0.35 + 'px, ' + y * 0.35 + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  window.initModals = function () {
    initModals();
    initMagneticButtons();
  };
})();

;
/* --- visionary.js --- */
/* ============================================================
   visionary.js — Visionary Section Mesh & Scroll Parallax Orbs
   Generates a morphing 3D geometry in the Visionary section
   background and shifts ambient glow orbs on scroll.
   ============================================================ */
(function () {
  'use strict';

  var scene, camera, renderer, morphMesh;
  var originalVertices = [];
  var isHidden = false;

  function initVisionMesh() {
    var container = document.getElementById('visionCanvasContainer');
    if (!container || typeof THREE === 'undefined') return;

    var width = container.clientWidth || window.innerWidth;
    var height = container.clientHeight || 500;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 250;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    var canvas = renderer.domElement;
    container.appendChild(canvas);

    // Create complex icosahedron geometry
    var geometry = new THREE.IcosahedronGeometry(75, 2);
    
    // Save original position attributes for vertex warping
    var posAttr = geometry.attributes.position;
    for (var i = 0; i < posAttr.count; i++) {
      originalVertices.push({
        x: posAttr.getX(i),
        y: posAttr.getY(i),
        z: posAttr.getZ(i)
      });
    }

    var material = new THREE.MeshBasicMaterial({
      color: 0xFF00DC,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    morphMesh = new THREE.Mesh(geometry, material);
    scene.add(morphMesh);

    // Animation variables
    var clock = new THREE.Clock();

    function animate() {
      if (isHidden) {
        requestAnimationFrame(animate);
        return;
      }

      var time = clock.getElapsedTime();

      // Slowly rotate mesh
      morphMesh.rotation.y = time * 0.05;
      morphMesh.rotation.x = time * 0.03;

      // Morph vertex coordinates
      var pos = morphMesh.geometry.attributes.position;
      for (var i = 0; i < pos.count; i++) {
        var orig = originalVertices[i];
        
        // Sine wave warps based on spatial coordinate and time
        var waveX = Math.sin(time * 1.5 + orig.y * 0.05) * 6;
        var waveY = Math.cos(time * 1.3 + orig.z * 0.05) * 6;
        var waveZ = Math.sin(time * 1.8 + orig.x * 0.05) * 6;

        pos.setXYZ(
          i,
          orig.x + waveX,
          orig.y + waveY,
          orig.z + waveZ
        );
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    // Handle resizing
    window.addEventListener('resize', function () {
      if (!camera || !renderer) return;
      var w = container.clientWidth || window.innerWidth;
      var h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    document.addEventListener('visibilitychange', function () {
      isHidden = document.hidden;
    });
  }

  // 2. Scroll Linked Parallax Orbs
  function initParallaxOrbs() {
    var orbBlue = document.querySelector('.orb-blue');
    var orbPurple = document.querySelector('.orb-purple');
    var orbMagenta = document.querySelector('.orb-magenta');

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY || window.pageYOffset;

      if (orbBlue) {
        orbBlue.style.transform = 'translate3d(' + (scrollY * 0.1) + 'px, ' + (scrollY * 0.05) + 'px, 0)';
      }
      if (orbPurple) {
        orbPurple.style.transform = 'translate3d(' + (scrollY * -0.08) + 'px, ' + (scrollY * -0.05) + 'px, 0)';
      }
      if (orbMagenta) {
        orbMagenta.style.transform = 'translate3d(' + (scrollY * 0.05) + 'px, ' + (scrollY * -0.08) + 'px, 0)';
      }
    }, { passive: true });
  }

  window.initVisionary = function () {
    initVisionMesh();
    initParallaxOrbs();
  };
})();

;
/* --- radar.js --- */
/* ============================================================
   radar.js — Skills Radar Chart Canvas & Animated Counters
   Draws an interactive 8-axis canvas radar chart with gradients
   and glow effects, and handles counting up stats numbers.
   ============================================================ */
(function () {
  'use strict';

  // 1. Stats Counter Animation
  function initCounters() {
    var counters = document.querySelectorAll('.giant-counter-val');
    
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var target = entry.target;
          var endValue = parseInt(target.dataset.targetVal, 10);
          animateValue(target, 0, endValue, 1500);
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });

    function animateValue(obj, start, end, duration) {
      var startTime = null;
      function step(currentTime) {
        if (!startTime) startTime = currentTime;
        var progress = currentTime - startTime;
        var progressRatio = Math.min(progress / duration, 1);
        
        // easeOutQuad curve
        var ease = progressRatio * (2 - progressRatio);
        var current = Math.floor(ease * (end - start) + start);
        
        obj.textContent = current + (obj.dataset.suffix || '');
        if (progress < duration) {
          window.requestAnimationFrame(step);
        } else {
          obj.textContent = end + (obj.dataset.suffix || '');
        }
      }
      window.requestAnimationFrame(step);
    }
  }

  // 2. Interactive Canvas Radar Chart
  function initRadarChart() {
    var canvas = document.getElementById('skillsRadarCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    // Set canvas dimensions
    var width = 380;
    var height = 380;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    var axes = [
      { name: 'Game Dev', val: 9.5, desc: 'Unity, Godot, gameplay loops' },
      { name: 'AI/ML', val: 9.0, desc: 'n8n pipelines, LLMs, NLP context' },
      { name: 'Web Dev', val: 8.5, desc: 'HTML/CSS/JS, animations, SPAs' },
      { name: 'Design/3D', val: 8.0, desc: 'Blender models, vector designs' },
      { name: 'YouTube', val: 7.5, desc: 'Content creation, video editing' },
      { name: 'Business', val: 9.0, desc: 'ZA Softwares founder, branding' },
      { name: 'Music', val: 8.0, desc: 'Composition, lyrics, soundscapes' },
      { name: 'Hardware', val: 8.5, desc: 'Architecture, graphic card research' }
    ];

    var numAxes = axes.length;
    var center = { x: width / 2, y: height / 2 };
    var radius = 130;
    var mouseX = 0;
    var mouseY = 0;
    var activeAxisIndex = -1;

    function getCoords(index, value, maxVal) {
      var angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
      var r = (value / maxVal) * radius;
      return {
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      };
    }

    function drawGrid() {
      // Concentric background polygons (5 levels)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      for (var lvl = 1; lvl <= 5; lvl++) {
        var val = (10 / 5) * lvl;
        ctx.beginPath();
        for (var i = 0; i < numAxes; i++) {
          var pt = getCoords(i, val, 10);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw axis lines from center
      for (var i = 0; i < numAxes; i++) {
        var outerPt = getCoords(i, 10, 10);
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(outerPt.x, outerPt.y);
        ctx.stroke();
      }
    }

    function drawGlowPolygon() {
      // Draw glowing skills shape
      var gradient = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, radius);
      gradient.addColorStop(0, 'rgba(20, 0, 255, 0.15)');
      gradient.addColorStop(0.5, 'rgba(139, 0, 255, 0.25)');
      gradient.addColorStop(1, 'rgba(255, 0, 220, 0.35)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      for (var i = 0; i < numAxes; i++) {
        var pt = getCoords(i, axes[i].val, 10);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fill();

      // Outer boundary stroke
      ctx.strokeStyle = '#8B00FF';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FF00DC';
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    function drawLabels() {
      ctx.font = '500 11px var(--font-mono)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (var i = 0; i < numAxes; i++) {
        var labelPt = getCoords(i, 11.8, 10);
        
        // Highlight active label
        if (i === activeAxisIndex) {
          ctx.fillStyle = '#FF00DC';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#FF00DC';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        }

        ctx.fillText(axes[i].name, labelPt.x, labelPt.y);
        ctx.shadowBlur = 0;
      }
    }

    function drawTooltip() {
      if (activeAxisIndex === -1) return;

      var axis = axes[activeAxisIndex];
      
      // Draw tooltip box in the middle/top
      ctx.fillStyle = 'rgba(9, 14, 36, 0.9)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      var boxW = 180;
      var boxH = 50;
      var boxX = center.x - boxW / 2;
      var boxY = center.y - 25;

      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px var(--font-display)';
      ctx.textAlign = 'center';
      ctx.fillText(axis.name + ': ' + axis.val + '/10', center.x, center.y - 10);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px var(--font-mono)';
      ctx.fillText(axis.desc, center.x, center.y + 10);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawGlowPolygon();
      drawLabels();
      drawTooltip();
    }

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Find closest axis
      var dx = mouseX - center.x;
      var dy = mouseY - center.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius + 30) {
        var angle = Math.atan2(dy, dx) + Math.PI / 2; // offset for 12 o'clock
        if (angle < 0) angle += Math.PI * 2;
        
        var sector = Math.PI * 2 / numAxes;
        var approxIdx = Math.round(angle / sector) % numAxes;
        
        if (approxIdx !== activeAxisIndex) {
          activeAxisIndex = approxIdx;
          draw();
          
          if (window.soundEngine && typeof window.soundEngine.playTick === 'function') {
             window.soundEngine.playTick();
          }
        }
      } else {
        if (activeAxisIndex !== -1) {
          activeAxisIndex = -1;
          draw();
        }
      }
    });

    canvas.addEventListener('mouseleave', function () {
      activeAxisIndex = -1;
      draw();
    });

    // Initial render
    draw();
  }

  // Register on window
  window.initRadarChart = function () {
    initCounters();
    initRadarChart();
  };
})();

;
/* --- tilt.js --- */
/* ============================================================
   tilt.js — 3D Holographic Card Tilt & Depth Shift
   Provides modern mouse-movement interactive rotation to
   cards, including opposite translation of inner graphics.
   ============================================================ */
(function () {
  'use strict';

  function initTilt() {
    var cards = document.querySelectorAll('[data-tilt], .project-card, .music-card');

    if (window.innerWidth < 768) {
      // Disable on mobile for performance
      return;
    }

    cards.forEach(function (card) {
      // Inject holographic shine element dynamically if not present
      var shine = card.querySelector('.card-shine');
      if (!shine) {
        shine = document.createElement('div');
        shine.className = 'card-shine';
        shine.style.position = 'absolute';
        shine.style.inset = '0';
        shine.style.pointerEvents = 'none';
        shine.style.borderRadius = 'inherit';
        shine.style.zIndex = '5';
        shine.style.opacity = '0';
        shine.style.transition = 'opacity 0.25s ease';
        card.appendChild(shine);
      }

      card.addEventListener('mouseenter', function () {
        shine.style.opacity = '0.7';
      });

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left; // x position inside element
        var y = e.clientY - rect.top;  // y position inside element

        var width = rect.width;
        var height = rect.height;

        // Calculate rotation degrees (-10 to 10 deg range)
        var rotateY = ((x / width) - 0.5) * 16;
        var rotateX = (0.5 - (y / height)) * 16;

        // Apply rotation to card container
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';

        // Parallax depth shift on inner image (move slightly opposite)
        var img = card.querySelector('img');
        if (img) {
          var moveX = ((x / width) - 0.5) * -12;
          var moveY = ((y / height) - 0.5) * -12;
          img.style.transform = 'scale(1.05) translate3d(' + moveX + 'px, ' + moveY + 'px, 0)';
        }

        // Apply holographic light reflection to shine element
        var px = (x / width) * 100;
        var py = (y / height) * 100;
        shine.style.background = 'radial-gradient(circle at ' + px + '% ' + py + '%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 60%), linear-gradient(135deg, rgba(20, 0, 255, 0.05) 0%, rgba(255, 0, 220, 0.05) 100%)';
      });

      card.addEventListener('mouseleave', function () {
        // Reset smoothly
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        shine.style.opacity = '0';
        
        var img = card.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1) translate3d(0, 0, 0)';
        }
      });
    });
  }

  window.initTilt = initTilt;
})();

;
/* --- easter-eggs.js --- */
/* ============================================================
   easter-eggs.js — Secrets & Hidden Achievements
   Implements 3 hidden interactive easter eggs that award XP
   and trigger visuals: Coffee clicks, Typing "ZAID", and Logo clicks.
   ============================================================ */
(function () {
  'use strict';

  // 1. Coffee Emoji Click (5 times)
  function initCoffeeEgg() {
    var coffeeBtn = document.getElementById('easterEgg');
    if (!coffeeBtn) return;

    var clicks = 0;
    coffeeBtn.addEventListener('click', function () {
      clicks++;
      
      // Pitch bend sound
      if (window.soundEngine && typeof window.soundEngine.playTick === 'function') {
        window.soundEngine.playTick();
      }

      if (clicks === 5) {
        clicks = 0; // reset
        
        // Print ASCII celebrate in console
        var coffeeASCII = [
          '      (  )   (  )',
          '       ) )    ) )',
          '      ( (    ( (',
          '    .___________.',
          '    |           | -.',
          '    |  CAFFEINE |  |',
          '    |  BOOST!   |  |',
          '    |           | -\'',
          '    `-----------\'',
          '   🏆 XP Awarded: +500 XP'
        ].join('\n');
        console.log('%c' + coffeeASCII, 'color: #00E676; font-family: monospace; font-size: 14px; font-weight: bold;');

        // Award achievement
        if (window.hudEngine && typeof window.hudEngine.awardAchievement === 'function') {
          window.hudEngine.awardAchievement('Caffeine Overload', 500);
        }
        
        if (window.soundEngine && typeof window.soundEngine.playSuccess === 'function') {
          window.soundEngine.playSuccess();
        }
      }
    });
  }

  // 2. Typing "ZAID"
  function initTypeEgg() {
    var buffer = '';
    var code = 'zaid';

    document.addEventListener('keydown', function (e) {
      if (e.key) {
        buffer += e.key.toLowerCase();
        
        // Limit buffer length
        if (buffer.length > 10) {
          buffer = buffer.substring(buffer.length - 4);
        }

        if (buffer.endsWith(code)) {
          buffer = ''; // reset
          
          // Glitch sound
          if (window.soundEngine && typeof window.soundEngine.playGlitch === 'function') {
            window.soundEngine.playGlitch();
          }

          // Visual effect: scatter hero name letters
          var heroName = document.getElementById('heroName');
          if (heroName) {
            var letters = heroName.querySelectorAll('.hero-letter');
            
            // Add a scatter animation
            letters.forEach(function (letter) {
              var randomX = (Math.random() - 0.5) * 150;
              var randomY = (Math.random() - 0.5) * 150;
              var randomRot = (Math.random() - 0.5) * 360;
              
              letter.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s';
              letter.style.transform = 'translate3d(' + randomX + 'px, ' + randomY + 'px, 0) rotate(' + randomRot + 'deg)';
              letter.style.opacity = '0.5';

              // Return to center after 1.2s
              setTimeout(function () {
                letter.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.8s';
                letter.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
                letter.style.opacity = '1';
              }, 1200);
            });
          }

          // Award achievement
          if (window.hudEngine && typeof window.hudEngine.awardAchievement === 'function') {
            window.hudEngine.awardAchievement('Hacker Protocol Actived', 250);
          }
        }
      }
    });
  }

  // 3. Logo Fast Clicks (3 times in 1 second)
  function initLogoEgg() {
    var logo = document.querySelector('.nav-logo');
    if (!logo) return;

    var clickTimes = [];
    logo.addEventListener('click', function (e) {
      // If it's a click to jump to home, prevent default to let the user enjoy the egg if they spam
      var now = Date.now();
      clickTimes.push(now);

      // Keep only last 3 click timestamps
      if (clickTimes.length > 3) {
        clickTimes.shift();
      }

      if (clickTimes.length === 3 && (clickTimes[2] - clickTimes[0] < 1000)) {
        // Prevent anchor jump if spammed
        e.preventDefault();
        clickTimes = []; // reset

        // Play spacey warp sound
        if (window.soundEngine && typeof window.soundEngine.playWarp === 'function') {
          window.soundEngine.playWarp();
        }

        // Trigger console classified dump
        var classifiedIntel = [
          '==============================================',
          '  ZAID ASIM SOFTWARES — CLASSIFIED PROJECTS    ',
          '==============================================',
          '  [CODEDUMP] Project Aeroxnet : ACTIVE_RECON',
          '  [CODEDUMP] AI Memory Bridge : PHASING_GRID',
          '  [CODEDUMP] Cloud Handheld   : PROTOTYPING_STAGE',
          '  [CODEDUMP] ZA Sentinel      : INACTIVE_STANDBY',
          '=============================================='
        ].join('\n');
        console.warn(classifiedIntel);

        // Award achievement
        if (window.hudEngine && typeof window.hudEngine.awardAchievement === 'function') {
          window.hudEngine.awardAchievement('Classified Terminal Access', 150);
        }
      }
    });
  }

  window.initEasterEggs = function () {
    initCoffeeEgg();
    initTypeEgg();
    initLogoEgg();
  };
})();

;
/* --- sound.js --- */
/* ============================================================
   sound.js — Web Audio API Synthesizer
   Procedural UI sounds: click, select, level-up chord,
   achievement chime. Mute state persisted via localStorage.
   ============================================================ */
(function () {
  'use strict';

  function SoundSynthesizer() {
    this.ctx = null;
    this.initialized = false;
    this.muted = false;
    this._lastClick = 0;
    this._lastSelect = 0;
    this._boundInit = null;
  }

  SoundSynthesizer.prototype.init = function () {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      this.muted = false; // Always start unmuted
      localStorage.removeItem('za_sound_muted');
    } catch (err) {
      console.warn('[sound] Web Audio API not available:', err);
    }
  };

  SoundSynthesizer.prototype._ensureCtx = function () {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  };

  SoundSynthesizer.prototype.playClick = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var now = performance.now();
    if (now - this._lastClick < 30) return;
    this._lastClick = now;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

    gain.gain.setValueAtTime(0.45, t); // Boosted from 0.12
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  };

  SoundSynthesizer.prototype.playSelect = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var now = performance.now();
    if (now - this._lastSelect < 30) return;
    this._lastSelect = now;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);

    gain.gain.setValueAtTime(0.60, t); // Boosted from 0.20
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  };

  SoundSynthesizer.prototype.playLevelUp = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    // C-Major chord: C4 E4 G4 C5
    var freqs = [261.63, 329.63, 392.0, 523.25];

    for (var i = 0; i < freqs.length; i++) {
      (function (freq, delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.55, t + delay); // Boosted from 0.18
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.1);
      })(freqs[i], i * 0.08);
    }
  };

  SoundSynthesizer.prototype.playAchievement = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;

    // Vibrato chime: A5 then E6 with LFO
    var notes = [880, 1318.51];

    for (var i = 0; i < notes.length; i++) {
      (function (freq, delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var lfo = ctx.createOscillator();
        var lfoGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);

        // LFO for vibrato
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(16, t + delay);
        lfoGain.gain.setValueAtTime(12, t + delay);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.60, t + delay); // Boosted from 0.20
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(t + delay);
        osc.start(t + delay);
        lfo.stop(t + delay + 0.35);
        osc.stop(t + delay + 0.35);
      })(notes[i], i * 0.15);
    }
  };

  SoundSynthesizer.prototype.playIntro = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.6);
    osc.frequency.exponentialRampToValueAtTime(150, t + 1.2);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.50, t + 0.4); // Boosted from 0.15
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    // Apply lowpass filter
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 1.25);
  };

  SoundSynthesizer.prototype.playTick = function () {
    this.playClick();
  };

  SoundSynthesizer.prototype.playSuccess = function () {
    this.playLevelUp();
  };

  SoundSynthesizer.prototype.playWarp = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(1500, t + 0.8);

    gain.gain.setValueAtTime(0.50, t); // Boosted from 0.15
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.85);
  };

  SoundSynthesizer.prototype.playGlitch = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    
    // Simulate crackle using short random noise bursts
    for (var i = 0; i < 6; i++) {
      (function (delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2000 + Math.random() * 4000, t + delay);
        
        gain.gain.setValueAtTime(0.40, t + delay); // Boosted from 0.10
        gain.gain.setValueAtTime(0.0001, t + delay + 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.025);
      })(i * 0.05 * Math.random());
    }
  };

  var ambientOsc = null;
  var ambientGain = null;

  SoundSynthesizer.prototype.startAmbientLoop = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;
    if (ambientOsc) return; // already running

    var ctx = this.ctx;
    var t = ctx.currentTime;

    ambientOsc = ctx.createOscillator();
    ambientGain = ctx.createGain();

    ambientOsc.type = 'sine';
    ambientOsc.frequency.setValueAtTime(55, t); // Low A hum

    // Modulate with another LFO
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, t); // very slow breathing
    lfoGain.gain.setValueAtTime(2, t);

    lfo.connect(lfoGain);
    lfoGain.connect(ambientOsc.frequency);

    ambientGain.gain.setValueAtTime(0.04, t);

    ambientOsc.connect(ambientGain);
    ambientGain.connect(ctx.destination);
    
    lfo.start(t);
    ambientOsc.start(t);
  };

  SoundSynthesizer.prototype.stopAmbientLoop = function () {
    if (ambientOsc) {
      try {
        ambientOsc.stop();
      } catch (e) {}
      ambientOsc = null;
      ambientGain = null;
    }
  };

  SoundSynthesizer.prototype.toggleMute = function () {
    this._ensureCtx();
    this.muted = !this.muted;
    localStorage.setItem('za_sound_muted', this.muted.toString());
    if (this.muted) {
      this.stopAmbientLoop();
    }
    return this.muted;
  };

  SoundSynthesizer.prototype.isMuted = function () {
    return this.muted;
  };

  // Create singleton
  var synth = new SoundSynthesizer();

  // Auto-init on first user interaction
  function autoInit() {
    synth.init();
    synth._ensureCtx();
    document.removeEventListener('click', autoInit);
    document.removeEventListener('touchstart', autoInit);
    document.removeEventListener('keydown', autoInit);
  }
  document.addEventListener('click', autoInit, { once: true });
  document.addEventListener('touchstart', autoInit, { once: true });
  document.addEventListener('keydown', autoInit, { once: true });

  // Ensure unmuted by default
  synth.muted = false;

  window.soundSynth = synth;
  window.soundEngine = synth; // Alias for loader & easter eggs
})();

;
/* --- v2-upgrades.js --- */
/* ============================================================
   v2-upgrades.js — Version 2.0 Feature Orchestrator
   Handles: Hero text scramble, Typewriter subtitle rotation,
   Section entry warp whooshes, Map interactions, and Command
   Palette expansions.
   ============================================================ */
(function () {
  'use strict';

  // 1. Single Letter Scramble on Hover
  function wrapHeroNameLetters() {
    var heroName = document.getElementById('heroName');
    if (!heroName) return;
    var childNodes = Array.prototype.slice.call(heroName.childNodes);
    var html = '';
    childNodes.forEach(function (node) {
      if (node.nodeType === 3) { // TEXT_NODE
        var text = node.textContent;
        for (var i = 0; i < text.length; i++) {
          var char = text[i];
          if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
            html += char;
          } else {
            html += '<span class="hero-letter landed">' + char + '</span>';
          }
        }
      } else if (node.nodeName === 'BR') {
        html += '<br>';
      } else if (node.nodeName === 'SPAN') {
        var text = node.textContent;
        var style = node.getAttribute('style') || '';
        html += '<span style="' + style + '">';
        for (var i = 0; i < text.length; i++) {
          var char = text[i];
          if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
            html += char;
          } else {
            html += '<span class="hero-letter landed">' + char + '</span>';
          }
        }
        html += '</span>';
      } else {
        html += node.outerHTML || '';
      }
    });
    heroName.innerHTML = html;
  }

  function initTextScramble() {
    wrapHeroNameLetters();
    var letters = document.querySelectorAll('.hero-letter');
    var chars = '!@#$%^&*?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    letters.forEach(function (letter) {
      var originalText = letter.textContent;
      var isScrambling = false;

      letter.addEventListener('mouseenter', function () {
        if (isScrambling) return;
        isScrambling = true;

        // Play glitch click sound
        if (window.soundEngine && typeof window.soundEngine.playGlitch === 'function') {
          window.soundEngine.playGlitch();
        }

        var count = 0;
        var maxCycles = 8;
        var interval = setInterval(function () {
          letter.textContent = chars[Math.floor(Math.random() * chars.length)];
          count++;

          if (count >= maxCycles) {
            clearInterval(interval);
            letter.textContent = originalText;
            isScrambling = false;
          }
        }, 30);
      });
    });
  }

  // 2. Rotating Typewriter Subtitle
  function initTypewriterRotation() {
    var taglineEl = document.getElementById('taglineText');
    if (!taglineEl) return;

    var taglines = [
      'Creator · Technologist · Game Developer · Founder',
      'AI Builder · Storyteller · Inventor · Dreamer',
      'Crafting the Future from India 🇮🇳',
      'UDYAM-KR-15-0069715 · Building Since Day One'
    ];

    var textIndex = 0;
    var isDeleting = false;
    var currentText = taglines[0];
    var letterIndex = currentText.length;
    var speed = 60; // typing speed
    var waitTime = 3000; // time before deleting

    function type() {
      var target = taglines[textIndex];
      
      if (isDeleting) {
        currentText = target.substring(0, letterIndex - 1);
        letterIndex--;
        speed = 30; // deleting speed is faster
      } else {
        currentText = target.substring(0, letterIndex + 1);
        letterIndex++;
        speed = 60;
      }

      taglineEl.textContent = currentText;

      // Handle transitions
      if (!isDeleting && letterIndex === target.length) {
        isDeleting = true;
        speed = waitTime; // wait before delete
      } else if (isDeleting && letterIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % taglines.length;
        speed = 500; // short pause before typing next
      }

      setTimeout(type, speed);
    }

    // Start rotation loop (wait initial waitTime)
    setTimeout(type, waitTime);
  }

  // 3. Section Entry Warp & Procedural Whooshes (Throttled)
  function initSectionWarp() {
    var sections = document.querySelectorAll('section');
    var lastWhooshTime = 0;
    var whooshThrottle = 2000; // ms

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var sec = entry.target;
          sec.classList.add('warped-in');
          
          // Trigger whoosh sound (throttled)
          var now = Date.now();
          if (now - lastWhooshTime > whooshThrottle) {
            lastWhooshTime = now;
            if (window.soundEngine && typeof window.soundEngine.playWarp === 'function') {
              window.soundEngine.playWarp();
            }
          }

          // Trigger chapter XP reward if biography section
          if (sec.id === 'biography') {
             // Initial award, then handles inside bio scroll
          }
        }
      });
    }, { threshold: 0.15 });

    sections.forEach(function (sec) {
      sec.classList.add('warp-init');
      observer.observe(sec);
      
      // Fallback: force reveal after 2.5s in case observer fails to trigger
      setTimeout(function () {
        sec.classList.add('warped-in');
      }, 2500);
    });
  }

  // 3b. Ambient Rising Cosmic Stars (Visual Depth)
  function initFloatingStars() {
    var container = document.createElement('div');
    container.className = 'ambient-stars-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-2;overflow:hidden;';
    document.body.appendChild(container);

    for (var i = 0; i < 30; i++) {
      var star = document.createElement('div');
      star.className = 'ambient-star';
      var size = Math.random() * 3 + 1;
      star.style.cssText = 'position:absolute;background:rgba(255,255,255,' + (Math.random() * 0.4 + 0.1) + ');border-radius:50%;pointer-events:none;';
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      
      if (size > 2.5) {
        star.style.boxShadow = '0 0 8px rgba(255,255,255,0.7)';
      }

      var duration = Math.random() * 25 + 20; // 20s to 45s
      var delay = Math.random() * -25;
      star.style.animation = 'float-up-star ' + duration + 's linear infinite';
      star.style.animationDelay = delay + 's';

      container.appendChild(star);
    }

    var style = document.createElement('style');
    style.textContent = 
      '@keyframes float-up-star {' +
      '  0% { transform: translateY(105vh) translateX(0); opacity: 0; }' +
      '  10% { opacity: 1; }' +
      '  90% { opacity: 1; }' +
      '  100% { transform: translateY(-5vh) translateX(40px); opacity: 0; }' +
      '}';
    document.head.appendChild(style);
  }

  // 4. Map Interactive Pulse Dots
  function initMapInteractions() {
    var dots = document.querySelectorAll('.map-pulse-dot');
    var tooltip = document.getElementById('mapTooltip');
    var mapContainer = document.querySelector('.map-visual-container');

    if (!dots.length || !mapContainer) return;

    // Create tooltip if not exists
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'mapTooltip';
      tooltip.className = 'map-tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.background = 'rgba(9, 14, 36, 0.9)';
      tooltip.style.border = '1px solid rgba(255, 0, 220, 0.3)';
      tooltip.style.padding = '0.5rem 1rem';
      tooltip.style.borderRadius = '6px';
      tooltip.style.color = '#fff';
      tooltip.style.fontFamily = 'var(--font-mono)';
      tooltip.style.fontSize = '0.75rem';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.opacity = '0';
      tooltip.style.transition = 'opacity 0.3s, transform 0.3s';
      tooltip.style.zIndex = '5';
      tooltip.style.whiteSpace = 'nowrap';
      mapContainer.appendChild(tooltip);
    }

    dots.forEach(function (dot) {
      var name = dot.dataset.locationName;
      var info = dot.dataset.locationInfo;

      dot.addEventListener('mouseenter', function () {
        tooltip.innerHTML = '<strong>' + name + '</strong><br>' + info;
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translate(-50%, -120%)';
        
        // Position tooltip relative to dot container
        var dotRect = dot.getBoundingClientRect();
        var mapRect = mapContainer.getBoundingClientRect();
        var left = dotRect.left - mapRect.left + dotRect.width / 2;
        var top = dotRect.top - mapRect.top;

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';

        // Play tick sound
        if (window.soundEngine && typeof window.soundEngine.playTick === 'function') {
          window.soundEngine.playTick();
        }
      });

      dot.addEventListener('mouseleave', function () {
        tooltip.style.opacity = '0';
      });

      dot.addEventListener('click', function () {
        if (window.hudEngine && typeof window.hudEngine.addXP === 'function') {
          window.hudEngine.addXP(10, 'Discovered: ' + name);
        }
        if (window.soundEngine && typeof window.soundEngine.playSuccess === 'function') {
          window.soundEngine.playSuccess();
        }
      });
    });
  }

  // 5. Biography Timeline Scrolling Fill
  function initBioTimelineScroll() {
    var timeline = document.querySelector('.biography-timeline');
    var progressLine = document.querySelector('.bio-timeline-progress');
    var chapters = document.querySelectorAll('.bio-chapter');

    if (!timeline || !progressLine || !chapters.length) return;

    var readChapters = {};

    window.addEventListener('scroll', function () {
      var rect = timeline.getBoundingClientRect();
      var winH = window.innerHeight;
      
      // Calculate how far we are down the timeline
      var startY = rect.top;
      var totalH = rect.height;
      var scrolled = -startY + (winH * 0.5); // centered trigger line

      var percent = Math.min(Math.max(scrolled / totalH * 100, 0), 100);
      progressLine.style.height = percent + '%';

      // Chapter micro-rewards (+5 XP per read chapter)
      chapters.forEach(function (chapter, idx) {
        var chRect = chapter.getBoundingClientRect();
        if (chRect.top < winH * 0.6 && chRect.bottom > 0) {
          if (!readChapters[idx]) {
            readChapters[idx] = true;
            if (window.hudEngine && typeof window.hudEngine.addXP === 'function') {
              window.hudEngine.addXP(5, 'Chapter ' + (idx + 1) + ' Read');
            }
          }
        }
      });
    }, { passive: true });
  }

  // 6. Biography Era Breaks Parallax Scroll
  function initBioParallax() {
    var breaks = document.querySelectorAll('.bio-chapter-break');
    window.addEventListener('scroll', function () {
      var winH = window.innerHeight;
      breaks.forEach(function (brk) {
        var rect = brk.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          var bg = brk.querySelector('.bio-chapter-break-bg');
          if (bg) {
            var progress = (winH - rect.top) / (winH + rect.height);
            var translateY = (progress - 0.5) * 50; // shift up/down
            bg.style.transform = 'translateY(' + translateY + 'px)';
          }
        }
      });
    }, { passive: true });
  }

  // Init all V2 orchestration on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    initTextScramble();
    initTypewriterRotation();
    initSectionWarp();
    initFloatingStars();
    initMapInteractions();
    initBioTimelineScroll();
    initBioParallax();

    // Call child module inits if exported
    if (typeof window.initLoader === 'function') window.initLoader();
    if (typeof window.initModals === 'function') window.initModals();
    if (typeof window.initRadarChart === 'function') window.initRadarChart();
    if (typeof window.initVisionary === 'function') window.initVisionary();
    if (typeof window.initEasterEggs === 'function') window.initEasterEggs();
    if (typeof window.initTilt === 'function') window.initTilt();

    console.log('[ZA] V2 System overlays loaded successfully.');
  });
})();

;
/* --- three-bg.js --- */
/* ============================================================
   three-bg.js — 3D Particle Constellation & Spiral Galaxy Background
   Premium interactive triple-layer background:
   - Layer 1 (Deep): Slowly rotating double-arm spiral galaxy
   - Layer 2 (Mid): Floating wireframe shapes (icosahedrons & octahedrons)
   - Layer 3 (Close): Interactive particle constellation system
   Includes scroll-driven camera zoom out ("leaving orbit" effect).
   ============================================================ */
(function () {
  'use strict';

  const isMobile         = typeof window !== 'undefined' && window.innerWidth < 768;
  const PARTICLE_COUNT   = isMobile ? 300 : 1200;
  const GALAXY_COUNT     = isMobile ? 500 : 1800;
  const SPREAD           = 600;
  const PARTICLE_SIZE    = 2.2;
  const LINE_PROXIMITY   = 110;
  const LINE_OPACITY     = 0.12;
  const REPULSE_RADIUS   = 180;
  const REPULSE_FORCE    = 7;
  const IDLE_ROTATION_Y  = 0.0002;
  const SCROLL_ROT_FACTOR = 0.0001;
  const SCROLL_Z_FACTOR   = 0.7; // Enhanced zoom out effect on scroll

  const COLORS = [
    new THREE.Color(0x0989d8), // blue
    new THREE.Color(0x6c3bff), // violet
    new THREE.Color(0x00d4aa), // teal
  ];

  let scene, camera, renderer;
  let particleSystem, lineMesh, galaxySystem, wireframeGroup;
  let positions, originalPositions, colors, originalColors, velocities;
  let mouse = { x: 0, y: 0, ndcX: 0, ndcY: 0 };
  let scrollY = 0;
  let animId = null;
  let isHidden = false;

  // 1. Layer 3 (Close): Interactive Constellation Particles
  function createConstellationParticles() {
    const geometry = new THREE.BufferGeometry();
    positions         = new Float32Array(PARTICLE_COUNT * 3);
    originalPositions = new Float32Array(PARTICLE_COUNT * 3);
    colors            = new Float32Array(PARTICLE_COUNT * 3);
    originalColors    = new Float32Array(PARTICLE_COUNT * 3);
    velocities        = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = SPREAD * (0.3 + Math.random() * 0.7);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      originalPositions[i3]     = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      velocities[i3]     = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      colors[i3]     = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      originalColors[i3]     = color.r;
      originalColors[i3 + 1] = color.g;
      originalColors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: PARTICLE_SIZE,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  function createConstellationLines() {
    const maxLines = PARTICLE_COUNT * 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeometry  = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0989d8,
      transparent: true,
      opacity: LINE_OPACITY,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);
  }

  function updateConstellationLines() {
    const linePositions = lineMesh.geometry.attributes.position.array;
    let vertexCount = 0;
    const proxSq = LINE_PROXIMITY * LINE_PROXIMITY;

    // Dynamic performance sampling stride
    const stride = PARTICLE_COUNT > 500 ? 5 : 3;
    for (let i = 0; i < PARTICLE_COUNT; i += stride) {
      const ix = positions[i * 3];
      const iy = positions[i * 3 + 1];
      const iz = positions[i * 3 + 2];

      for (let j = i + stride; j < PARTICLE_COUNT; j += stride) {
        const jx = positions[j * 3];
        const jy = positions[j * 3 + 1];
        const jz = positions[j * 3 + 2];

        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < proxSq) {
          const idx = vertexCount * 3;
          linePositions[idx]     = ix;
          linePositions[idx + 1] = iy;
          linePositions[idx + 2] = iz;
          linePositions[idx + 3] = jx;
          linePositions[idx + 4] = jy;
          linePositions[idx + 5] = jz;
          vertexCount += 2;

          if (vertexCount >= linePositions.length / 3 - 2) break;
        }
      }
      if (vertexCount >= linePositions.length / 3 - 2) break;
    }

    lineMesh.geometry.setDrawRange(0, vertexCount);
    lineMesh.geometry.attributes.position.needsUpdate = true;
  }

  // 2. Layer 1 (Deep): Spiral Galaxy
  function createSpiralGalaxy() {
    const geometry = new THREE.BufferGeometry();
    const galPositions = new Float32Array(GALAXY_COUNT * 3);
    const galColors = new Float32Array(GALAXY_COUNT * 3);

    const arms = 2;
    for (let i = 0; i < GALAXY_COUNT; i++) {
      const i3 = i * 3;
      const arm = i % arms;
      
      // Logarithmic spiral geometry
      const theta = (i / GALAXY_COUNT) * Math.PI * 10; // Wraps 5 times
      const angle = theta + (arm * Math.PI);
      const r = 80 + (i / GALAXY_COUNT) * 550; // Inner gap + spread

      // Add noise expansion for volumetric arms
      const noiseX = (Math.random() - 0.5) * 60 * (r / 250 + 0.3);
      const noiseY = (Math.random() - 0.5) * 60 * (r / 250 + 0.3);
      const noiseZ = (Math.random() - 0.5) * 35;

      galPositions[i3]     = r * Math.cos(angle) + noiseX;
      galPositions[i3 + 1] = r * Math.sin(angle) + noiseY;
      galPositions[i3 + 2] = noiseZ;

      // Color mapping: cores are white-ish/teal, arms are blue/violet
      const coreMix = 1.0 - Math.min(r / 350, 1.0);
      const c = new THREE.Color();
      if (coreMix > 0.4) {
        c.lerpColors(new THREE.Color(0xffffff), new THREE.Color(0x00d4aa), (coreMix - 0.4) / 0.6);
      } else {
        c.lerpColors(new THREE.Color(0x0989d8), new THREE.Color(0x6c3bff), r / 600);
      }

      galColors[i3]     = c.r;
      galColors[i3 + 1] = c.g;
      galColors[i3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(galPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(galColors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    galaxySystem = new THREE.Points(geometry, material);
    
    // Tilt the galaxy slightly for an aesthetic angle
    galaxySystem.rotation.x = Math.PI / 3.5; 
    scene.add(galaxySystem);
  }

  // 3. Layer 2 (Mid): Floating Wireframe Geometries
  function createWireframeGeometries() {
    wireframeGroup = new THREE.Group();
    const shapesCount = 7;

    for (let i = 0; i < shapesCount; i++) {
      const radius = 10 + Math.random() * 20;
      // Alternate between Octahedrons and Icosahedrons
      const geom = (i % 2 === 0) 
        ? new THREE.OctahedronGeometry(radius, 0)
        : new THREE.IcosahedronGeometry(radius, 0);

      const mat = new THREE.MeshBasicMaterial({
        color: COLORS[i % COLORS.length],
        wireframe: true,
        transparent: true,
        opacity: 0.08, // Subtle
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geom, mat);
      
      // Random coordinates dispersed in 3D
      mesh.position.set(
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 500
      );

      // Store random spin velocities
      mesh.userData = {
        spinX: (Math.random() - 0.5) * 0.015,
        spinY: (Math.random() - 0.5) * 0.015,
        floatSpeed: 0.25 + Math.random() * 0.5,
        floatRange: 15 + Math.random() * 20,
        startY: mesh.position.y
      };

      wireframeGroup.add(mesh);
    }

    scene.add(wireframeGroup);
  }

  function updateWireframeGeometries(time) {
    wireframeGroup.children.forEach(function (mesh) {
      mesh.rotation.x += mesh.userData.spinX;
      mesh.rotation.y += mesh.userData.spinY;
      
      // Slow hovering float
      mesh.position.y = mesh.userData.startY + Math.sin(time * mesh.userData.floatSpeed) * mesh.userData.floatRange;
    });
  }

  function projectMouseTo3D() {
    const vec = new THREE.Vector3(mouse.ndcX, mouse.ndcY, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));
  }

  function updateConstellationParticles(time) {
    const mousePos = projectMouseTo3D();
    const repulseSq = REPULSE_RADIUS * REPULSE_RADIUS;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];

      // Mouse repulsion (including Z dimension for true volumetric 3D interaction)
      const dx = px - mousePos.x;
      const dy = py - mousePos.y;
      const dz = pz; // mousePos.z is 0
      const distSq = dx * dx + dy * dy + dz * dz * 0.15; // weighted Z for a deeper feeling

      if (distSq < repulseSq && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / REPULSE_RADIUS) * REPULSE_FORCE;
        velocities[i3]     += (dx / dist) * force * 0.08;
        velocities[i3 + 1] += (dy / dist) * force * 0.08;
        velocities[i3 + 2] += (dz / dist) * force * 0.04;
      }

      // Gentle 3D flow/sway field (simulates cosmic wind)
      const freq = 0.004;
      const noiseX = Math.sin(py * freq + time * 0.25) * Math.cos(pz * freq + time * 0.2) * 0.09;
      const noiseY = Math.cos(px * freq + time * 0.22) * Math.sin(pz * freq + time * 0.28) * 0.09;
      const noiseZ = Math.sin(px * freq + time * 0.2) * Math.cos(py * freq + time * 0.25) * 0.09;

      velocities[i3]     += noiseX;
      velocities[i3 + 1] += noiseY;
      velocities[i3 + 2] += noiseZ;

      // Spring physics back to original positions
      velocities[i3]     += (originalPositions[i3]     - px) * 0.004;
      velocities[i3 + 1] += (originalPositions[i3 + 1] - py) * 0.004;
      velocities[i3 + 2] += (originalPositions[i3 + 2] - pz) * 0.004;

      // Damping friction
      velocities[i3]     *= 0.93;
      velocities[i3 + 1] *= 0.93;
      velocities[i3 + 2] *= 0.93;

      // Move particle
      positions[i3]     += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Organic shimmering/twinkling of individual stars
      const shimmer = 0.65 + 0.35 * Math.sin(time * 2.5 + i * 0.7);
      colors[i3]     = originalColors[i3] * shimmer;
      colors[i3 + 1] = originalColors[i3 + 1] * shimmer;
      colors[i3 + 2] = originalColors[i3 + 2] * shimmer;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;
  }

  let lineUpdateCounter = 0;
  const clock = new THREE.Clock();

  function animate() {
    if (isHidden) {
      animId = requestAnimationFrame(animate);
      return;
    }

    const time = clock.getElapsedTime();

    // Rotate systems
    particleSystem.rotation.y += IDLE_ROTATION_Y;
    lineMesh.rotation.y = particleSystem.rotation.y;
    
    // Galaxy rotation
    galaxySystem.rotation.z += 0.0006;
    galaxySystem.rotation.y = Math.sin(time * 0.05) * 0.1; // slow tilt breathing

    // Update mid wireframes
    updateWireframeGeometries(time);

    // Scroll updates (Zoom out + rotate camera angle)
    const scrollDelta = window.scrollY || window.pageYOffset || 0;
    particleSystem.rotation.x = scrollDelta * SCROLL_ROT_FACTOR;
    lineMesh.rotation.x = particleSystem.rotation.x;
    galaxySystem.rotation.x = (Math.PI / 3.5) + scrollDelta * SCROLL_ROT_FACTOR * 0.5;

    // Dramatic scroll zoom-out
    camera.position.z = 800 + scrollDelta * SCROLL_Z_FACTOR;

    // Slow breathing of the entire spiral galaxy
    const scale = 1.0 + 0.04 * Math.sin(time * 0.15);
    galaxySystem.scale.set(scale, scale, scale);

    updateConstellationParticles(time);

    // Constellation line calculation throttled to every 3rd frame
    lineUpdateCounter++;
    if (lineUpdateCounter % 3 === 0) {
      updateConstellationLines();
    }

    renderer.render(scene, camera);
    animId = requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.ndcX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onVisibility() {
    isHidden = document.hidden;
  }

  window.initThreeBackground = function (container) {
    if (!container || typeof THREE === 'undefined') {
      console.warn('[three-bg] Three.js or container not found.');
      return;
    }

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 800;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    container.appendChild(canvas);

    // Build layers
    createSpiralGalaxy();
    createWireframeGeometries();
    createConstellationParticles();
    createConstellationLines();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    animate();
  };
})();

/* ── Custom UI Enhancements: Scroll-To-Top, Search Filtering, and Toasts ── */
(function() {
  'use strict';

  // 1. Toast Notification System
  window.showZaNotification = function(message, type) {
    type = type || 'info';
    var container = document.querySelector('.za-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'za-toast-container';
        document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'za-custom-toast';
    
    var icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = '<span class="za-toast-icon">' + icon + '</span><span class="za-toast-msg">' + message + '</span>';
    container.appendChild(toast);

    // Play click/tap sound for notification if synth exists
    if (window.soundSynth && typeof window.soundSynth.playSuccess === 'function' && type === 'success') {
        window.soundSynth.playSuccess();
    } else if (window.soundSynth && typeof window.soundSynth.playClick === 'function') {
        window.soundSynth.playClick();
    }

    // Dismiss logic
    setTimeout(function() {
        toast.classList.add('fade-out');
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 350);
    }, 4000);
  };

  // 2. Inject Scroll-To-Top Button
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.createElement('button');
    btn.className = 'scroll-to-top-btn';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        if (window.soundSynth && typeof window.soundSynth.playClick === 'function') {
            window.soundSynth.playClick();
        }
    });

    // 3. Search and Dynamic Filtering logic for Projects and Ideas pages
    initSearchFilter();
  });

  function initSearchFilter() {
    var projectsGrid = document.getElementById('projectsGrid');
    var ideasGrid = document.getElementById('ideasGrid');

    if (!projectsGrid && !ideasGrid) return;

    var searchInput = document.getElementById('catalogSearch');
    if (!searchInput) return;

    var filterContainer = document.querySelector('.filter-container');
    var resultsBadge = document.getElementById('searchResultsBadge');
    
    var cardSelector = projectsGrid ? '.portfolio-card' : '.blueprint-card';
    var cards = document.querySelectorAll(cardSelector);
    var parentGrid = projectsGrid || ideasGrid;

    // Create a "No Results Found" element to show when filtering yields 0 matches
    var noResults = document.createElement('div');
    noResults.className = 'no-results-card';
    noResults.style.display = 'none';
    noResults.innerHTML = '<h3>No results found</h3><p>Try refining your search terms or selecting another category.</p>';
    parentGrid.appendChild(noResults);

    function filterItems() {
        var query = searchInput.value.toLowerCase().trim();
        var activeFilterBtn = filterContainer ? filterContainer.querySelector('.filter-btn.active') : null;
        var category = activeFilterBtn ? (activeFilterBtn.dataset.filter || activeFilterBtn.dataset.category) : 'all';

        var visibleCount = 0;

        cards.forEach(function(card) {
            var title = card.querySelector('.portfolio-title, .blueprint-title');
            var desc = card.querySelector('.portfolio-desc, .blueprint-desc');
            var techTags = card.querySelectorAll('.portfolio-tech-tag, .blueprint-tech-tag');
            
            var titleText = title ? title.textContent.toLowerCase() : '';
            var descText = desc ? desc.textContent.toLowerCase() : '';
            
            var techText = '';
            techTags.forEach(function(tag) {
                techText += ' ' + tag.textContent.toLowerCase();
            });

            var cardCategory = card.dataset.category || card.getAttribute('data-category') || '';
            
            var matchesSearch = titleText.indexOf(query) !== -1 || 
                                descText.indexOf(query) !== -1 || 
                                techText.indexOf(query) !== -1;
                                
            var matchesCategory = (category === 'all' || cardCategory === category);

            if (matchesSearch && matchesCategory) {
                if (card.style.display !== 'flex') {
                    card.style.display = 'flex';
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' });
                    }
                }
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update badge count
        if (resultsBadge) {
            if (query === '') {
                resultsBadge.style.display = 'none';
            } else {
                resultsBadge.style.display = 'block';
                resultsBadge.textContent = 'Showing ' + visibleCount + ' of ' + cards.length + ' matches';
            }
        }

        // Show/hide "No Results" card
        if (visibleCount === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }

    // Listen to typing in the search bar
    searchInput.addEventListener('input', filterItems);

    // Re-filter when user clicks category buttons
    if (filterContainer) {
        var filterButtons = filterContainer.querySelectorAll('.filter-btn');
        filterButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                // Wait slightly for category active class toggle script to execute
                setTimeout(filterItems, 50);
            });
        });
    }
  }

})();

;

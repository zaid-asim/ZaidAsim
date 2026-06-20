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

    var navLinks = document.querySelectorAll('.nav-link, nav a[href^="#"]');

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
    setupScrollSpy();
    setupMobileMenu();

    // Initial check
    onScroll();
  };
})();

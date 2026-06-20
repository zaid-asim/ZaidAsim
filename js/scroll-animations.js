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

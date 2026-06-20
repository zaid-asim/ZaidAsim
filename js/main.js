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

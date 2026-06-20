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

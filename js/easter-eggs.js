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

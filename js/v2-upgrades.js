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
        if (!sec.classList.contains('warped-in')) { sec.classList.add('warped-in');
      } }, 2500);
    });
  }

  // 3b. Ambient Rising Cosmic Stars (Visual Depth)
  function initFloatingStars() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

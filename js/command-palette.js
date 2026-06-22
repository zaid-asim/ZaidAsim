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
  }

  var ACTIONS = [
    { icon: '🏠', label: 'Home',          shortcut: '',          action: function () { scrollToSection('#hero'); } },
    { icon: '👤', label: 'About',         shortcut: '',          action: function () { scrollToSection('#about'); } },
    { icon: '💼', label: 'Projects',      shortcut: '',          action: function () { scrollToSection('#projects'); } },
    { icon: '📖', label: 'Biography',     shortcut: '',          action: function () { scrollToSection('#biography'); } },
    { icon: '🎵', label: 'Music & Audio', shortcut: '',          action: function () { scrollToSection('#music'); } },
    { icon: '🧪', label: 'Ideas Lab',     shortcut: '',          action: function () { scrollToSection('#ideas'); } },
    { icon: '📺', label: 'YouTube',       shortcut: '',          action: function () { scrollToSection('#youtube'); } },
    { icon: '🌐', label: 'Socials',       shortcut: '',          action: function () { scrollToSection('#socials'); } },
    { icon: '✉️', label: 'Contact',       shortcut: '',          action: function () { scrollToSection('#contact'); } },
    { icon: '🌟', label: 'The Vision',     shortcut: '',          action: function () { scrollToSection('#vision'); } },
    { icon: '🎨', label: 'Toggle Theme',  shortcut: modKey + '+T', action: function () { if (window.toggleTheme) window.toggleTheme(); } },
    { icon: '🔊', label: 'Toggle Sound',  shortcut: modKey + '+M', action: function () { if (window.soundSynth) window.soundSynth.toggleMute(); } },
    { icon: '🌌', label: 'Play Ambient Hum', shortcut: '',       action: function () { toggleAmbientHum(); } },
    { icon: '💀', label: 'Activate Chaos Mode', shortcut: '',    action: function () { activateChaosMode(); } },
    { icon: '🔒', label: 'About this Site', shortcut: '',        action: function () { displayAboutSite(); } }
  ];

  function scrollToSection(selector) {
    var el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/' + selector;
    }
  }

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
  };
})();

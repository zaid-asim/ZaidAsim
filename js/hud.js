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

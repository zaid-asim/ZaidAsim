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

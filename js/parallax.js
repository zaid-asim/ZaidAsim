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

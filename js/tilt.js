/* ============================================================
   tilt.js — 3D Holographic Card Tilt & Depth Shift
   Provides modern mouse-movement interactive rotation to
   cards, including opposite translation of inner graphics.
   ============================================================ */
(function () {
  'use strict';

  function initTilt() {
    var cards = document.querySelectorAll('[data-tilt], .project-card, .music-card');

    if (window.innerWidth < 768) {
      // Disable on mobile for performance
      return;
    }

    cards.forEach(function (card) {
      // Inject holographic shine element dynamically if not present
      var shine = card.querySelector('.card-shine');
      if (!shine) {
        shine = document.createElement('div');
        shine.className = 'card-shine';
        shine.style.position = 'absolute';
        shine.style.inset = '0';
        shine.style.pointerEvents = 'none';
        shine.style.borderRadius = 'inherit';
        shine.style.zIndex = '5';
        shine.style.opacity = '0';
        shine.style.transition = 'opacity 0.25s ease';
        card.appendChild(shine);
      }

      card.addEventListener('mouseenter', function () {
        shine.style.opacity = '0.7';
      });

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left; // x position inside element
        var y = e.clientY - rect.top;  // y position inside element

        var width = rect.width;
        var height = rect.height;

        // Calculate rotation degrees (-10 to 10 deg range)
        var rotateY = ((x / width) - 0.5) * 16;
        var rotateX = (0.5 - (y / height)) * 16;

        // Apply rotation to card container
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';

        // Parallax depth shift on inner image (move slightly opposite)
        var img = card.querySelector('img');
        if (img) {
          var moveX = ((x / width) - 0.5) * -12;
          var moveY = ((y / height) - 0.5) * -12;
          img.style.transform = 'scale(1.05) translate3d(' + moveX + 'px, ' + moveY + 'px, 0)';
        }

        // Apply holographic light reflection to shine element
        var px = (x / width) * 100;
        var py = (y / height) * 100;
        shine.style.background = 'radial-gradient(circle at ' + px + '% ' + py + '%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 60%), linear-gradient(135deg, rgba(20, 0, 255, 0.05) 0%, rgba(255, 0, 220, 0.05) 100%)';
      });

      card.addEventListener('mouseleave', function () {
        // Reset smoothly
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        shine.style.opacity = '0';
        
        var img = card.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1) translate3d(0, 0, 0)';
        }
      });
    });
  }

  window.initTilt = initTilt;
})();

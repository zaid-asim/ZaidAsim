/* ============================================================
   radar.js — Skills Radar Chart Canvas & Animated Counters
   Draws an interactive 8-axis canvas radar chart with gradients
   and glow effects, and handles counting up stats numbers.
   ============================================================ */
(function () {
  'use strict';

  // 1. Stats Counter Animation
  function initCounters() {
    var counters = document.querySelectorAll('.giant-counter-val');
    
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var target = entry.target;
          var endValue = parseInt(target.dataset.targetVal, 10);
          animateValue(target, 0, endValue, 1500);
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });

    function animateValue(obj, start, end, duration) {
      var startTime = null;
      function step(currentTime) {
        if (!startTime) startTime = currentTime;
        var progress = currentTime - startTime;
        var progressRatio = Math.min(progress / duration, 1);
        
        // easeOutQuad curve
        var ease = progressRatio * (2 - progressRatio);
        var current = Math.floor(ease * (end - start) + start);
        
        obj.textContent = current + (obj.dataset.suffix || '');
        if (progress < duration) {
          window.requestAnimationFrame(step);
        } else {
          obj.textContent = end + (obj.dataset.suffix || '');
        }
      }
      window.requestAnimationFrame(step);
    }
  }

  // 2. Interactive Canvas Radar Chart
  function initRadarChart() {
    var canvas = document.getElementById('skillsRadarCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    // Set canvas dimensions
    var width = 380;
    var height = 380;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    var axes = [
      { name: 'Game Dev', val: 9.5, desc: 'Unity, Godot, gameplay loops' },
      { name: 'AI/ML', val: 9.0, desc: 'n8n pipelines, LLMs, NLP context' },
      { name: 'Web Dev', val: 8.5, desc: 'HTML/CSS/JS, animations, SPAs' },
      { name: 'Design/3D', val: 8.0, desc: 'Blender models, vector designs' },
      { name: 'YouTube', val: 7.5, desc: 'Content creation, video editing' },
      { name: 'Business', val: 9.0, desc: 'ZA Softwares founder, branding' },
      { name: 'Music', val: 8.0, desc: 'Composition, lyrics, soundscapes' },
      { name: 'Hardware', val: 8.5, desc: 'Architecture, graphic card research' }
    ];

    var numAxes = axes.length;
    var center = { x: width / 2, y: height / 2 };
    var radius = 130;
    var mouseX = 0;
    var mouseY = 0;
    var activeAxisIndex = -1;

    function getCoords(index, value, maxVal) {
      var angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
      var r = (value / maxVal) * radius;
      return {
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      };
    }

    function drawGrid() {
      // Concentric background polygons (5 levels)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      for (var lvl = 1; lvl <= 5; lvl++) {
        var val = (10 / 5) * lvl;
        ctx.beginPath();
        for (var i = 0; i < numAxes; i++) {
          var pt = getCoords(i, val, 10);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw axis lines from center
      for (var i = 0; i < numAxes; i++) {
        var outerPt = getCoords(i, 10, 10);
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(outerPt.x, outerPt.y);
        ctx.stroke();
      }
    }

    function drawGlowPolygon() {
      // Draw glowing skills shape
      var gradient = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, radius);
      gradient.addColorStop(0, 'rgba(20, 0, 255, 0.15)');
      gradient.addColorStop(0.5, 'rgba(139, 0, 255, 0.25)');
      gradient.addColorStop(1, 'rgba(255, 0, 220, 0.35)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      for (var i = 0; i < numAxes; i++) {
        var pt = getCoords(i, axes[i].val, 10);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fill();

      // Outer boundary stroke
      ctx.strokeStyle = '#8B00FF';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FF00DC';
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    function drawLabels() {
      ctx.font = '500 11px var(--font-mono)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (var i = 0; i < numAxes; i++) {
        var labelPt = getCoords(i, 11.8, 10);
        
        // Highlight active label
        if (i === activeAxisIndex) {
          ctx.fillStyle = '#FF00DC';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#FF00DC';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        }

        ctx.fillText(axes[i].name, labelPt.x, labelPt.y);
        ctx.shadowBlur = 0;
      }
    }

    function drawTooltip() {
      if (activeAxisIndex === -1) return;

      var axis = axes[activeAxisIndex];
      
      // Draw tooltip box in the middle/top
      ctx.fillStyle = 'rgba(9, 14, 36, 0.9)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      var boxW = 180;
      var boxH = 50;
      var boxX = center.x - boxW / 2;
      var boxY = center.y - 25;

      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px var(--font-display)';
      ctx.textAlign = 'center';
      ctx.fillText(axis.name + ': ' + axis.val + '/10', center.x, center.y - 10);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px var(--font-mono)';
      ctx.fillText(axis.desc, center.x, center.y + 10);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawGlowPolygon();
      drawLabels();
      drawTooltip();
    }

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Find closest axis
      var dx = mouseX - center.x;
      var dy = mouseY - center.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius + 30) {
        var angle = Math.atan2(dy, dx) + Math.PI / 2; // offset for 12 o'clock
        if (angle < 0) angle += Math.PI * 2;
        
        var sector = Math.PI * 2 / numAxes;
        var approxIdx = Math.round(angle / sector) % numAxes;
        
        if (approxIdx !== activeAxisIndex) {
          activeAxisIndex = approxIdx;
          draw();
          
          if (window.soundEngine && typeof window.soundEngine.playTick === 'function') {
             window.soundEngine.playTick();
          }
        }
      } else {
        if (activeAxisIndex !== -1) {
          activeAxisIndex = -1;
          draw();
        }
      }
    });

    canvas.addEventListener('mouseleave', function () {
      activeAxisIndex = -1;
      draw();
    });

    // Initial render
    draw();
  }

  // Register on window
  window.initRadarChart = function () {
    initCounters();
    initRadarChart();
  };
})();

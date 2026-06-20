/* ============================================================
   visionary.js — Visionary Section Mesh & Scroll Parallax Orbs
   Generates a morphing 3D geometry in the Visionary section
   background and shifts ambient glow orbs on scroll.
   ============================================================ */
(function () {
  'use strict';

  var scene, camera, renderer, morphMesh;
  var originalVertices = [];
  var isHidden = false;

  function initVisionMesh() {
    var container = document.getElementById('visionCanvasContainer');
    if (!container || typeof THREE === 'undefined') return;

    var width = container.clientWidth || window.innerWidth;
    var height = container.clientHeight || 500;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 250;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    var canvas = renderer.domElement;
    container.appendChild(canvas);

    // Create complex icosahedron geometry
    var geometry = new THREE.IcosahedronGeometry(75, 2);
    
    // Save original position attributes for vertex warping
    var posAttr = geometry.attributes.position;
    for (var i = 0; i < posAttr.count; i++) {
      originalVertices.push({
        x: posAttr.getX(i),
        y: posAttr.getY(i),
        z: posAttr.getZ(i)
      });
    }

    var material = new THREE.MeshBasicMaterial({
      color: 0xFF00DC,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    morphMesh = new THREE.Mesh(geometry, material);
    scene.add(morphMesh);

    // Animation variables
    var clock = new THREE.Clock();

    function animate() {
      if (isHidden) {
        requestAnimationFrame(animate);
        return;
      }

      var time = clock.getElapsedTime();

      // Slowly rotate mesh
      morphMesh.rotation.y = time * 0.05;
      morphMesh.rotation.x = time * 0.03;

      // Morph vertex coordinates
      var pos = morphMesh.geometry.attributes.position;
      for (var i = 0; i < pos.count; i++) {
        var orig = originalVertices[i];
        
        // Sine wave warps based on spatial coordinate and time
        var waveX = Math.sin(time * 1.5 + orig.y * 0.05) * 6;
        var waveY = Math.cos(time * 1.3 + orig.z * 0.05) * 6;
        var waveZ = Math.sin(time * 1.8 + orig.x * 0.05) * 6;

        pos.setXYZ(
          i,
          orig.x + waveX,
          orig.y + waveY,
          orig.z + waveZ
        );
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    // Handle resizing
    window.addEventListener('resize', function () {
      if (!camera || !renderer) return;
      var w = container.clientWidth || window.innerWidth;
      var h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    document.addEventListener('visibilitychange', function () {
      isHidden = document.hidden;
    });
  }

  // 2. Scroll Linked Parallax Orbs
  function initParallaxOrbs() {
    var orbBlue = document.querySelector('.orb-blue');
    var orbPurple = document.querySelector('.orb-purple');
    var orbMagenta = document.querySelector('.orb-magenta');

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY || window.pageYOffset;

      if (orbBlue) {
        orbBlue.style.transform = 'translate3d(' + (scrollY * 0.1) + 'px, ' + (scrollY * 0.05) + 'px, 0)';
      }
      if (orbPurple) {
        orbPurple.style.transform = 'translate3d(' + (scrollY * -0.08) + 'px, ' + (scrollY * -0.05) + 'px, 0)';
      }
      if (orbMagenta) {
        orbMagenta.style.transform = 'translate3d(' + (scrollY * 0.05) + 'px, ' + (scrollY * -0.08) + 'px, 0)';
      }
    }, { passive: true });
  }

  window.initVisionary = function () {
    initVisionMesh();
    initParallaxOrbs();
  };
})();

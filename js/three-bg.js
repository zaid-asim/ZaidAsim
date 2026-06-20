/* ============================================================
   three-bg.js — 3D Particle Constellation & Spiral Galaxy Background
   Premium interactive triple-layer background:
   - Layer 1 (Deep): Slowly rotating double-arm spiral galaxy
   - Layer 2 (Mid): Floating wireframe shapes (icosahedrons & octahedrons)
   - Layer 3 (Close): Interactive particle constellation system
   Includes scroll-driven camera zoom out ("leaving orbit" effect).
   ============================================================ */
(function () {
  'use strict';

  const PARTICLE_COUNT   = 1200;
  const GALAXY_COUNT     = 1800;
  const SPREAD           = 600;
  const PARTICLE_SIZE    = 2.2;
  const LINE_PROXIMITY   = 110;
  const LINE_OPACITY     = 0.12;
  const REPULSE_RADIUS   = 180;
  const REPULSE_FORCE    = 7;
  const IDLE_ROTATION_Y  = 0.0002;
  const SCROLL_ROT_FACTOR = 0.0001;
  const SCROLL_Z_FACTOR   = 0.7; // Enhanced zoom out effect on scroll

  const COLORS = [
    new THREE.Color(0x0989d8), // blue
    new THREE.Color(0x6c3bff), // violet
    new THREE.Color(0x00d4aa), // teal
  ];

  let scene, camera, renderer;
  let particleSystem, lineMesh, galaxySystem, wireframeGroup;
  let positions, originalPositions, colors, velocities;
  let mouse = { x: 0, y: 0, ndcX: 0, ndcY: 0 };
  let scrollY = 0;
  let animId = null;
  let isHidden = false;

  // 1. Layer 3 (Close): Interactive Constellation Particles
  function createConstellationParticles() {
    const geometry = new THREE.BufferGeometry();
    positions         = new Float32Array(PARTICLE_COUNT * 3);
    originalPositions = new Float32Array(PARTICLE_COUNT * 3);
    colors            = new Float32Array(PARTICLE_COUNT * 3);
    velocities        = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = SPREAD * (0.3 + Math.random() * 0.7);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      originalPositions[i3]     = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      velocities[i3]     = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      colors[i3]     = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: PARTICLE_SIZE,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  function createConstellationLines() {
    const maxLines = PARTICLE_COUNT * 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeometry  = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0989d8,
      transparent: true,
      opacity: LINE_OPACITY,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);
  }

  function updateConstellationLines() {
    const linePositions = lineMesh.geometry.attributes.position.array;
    let vertexCount = 0;
    const proxSq = LINE_PROXIMITY * LINE_PROXIMITY;

    // Performance sampling: check every 5th particle
    for (let i = 0; i < PARTICLE_COUNT; i += 5) {
      const ix = positions[i * 3];
      const iy = positions[i * 3 + 1];
      const iz = positions[i * 3 + 2];

      for (let j = i + 5; j < PARTICLE_COUNT; j += 5) {
        const jx = positions[j * 3];
        const jy = positions[j * 3 + 1];
        const jz = positions[j * 3 + 2];

        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < proxSq) {
          const idx = vertexCount * 3;
          linePositions[idx]     = ix;
          linePositions[idx + 1] = iy;
          linePositions[idx + 2] = iz;
          linePositions[idx + 3] = jx;
          linePositions[idx + 4] = jy;
          linePositions[idx + 5] = jz;
          vertexCount += 2;

          if (vertexCount >= linePositions.length / 3 - 2) break;
        }
      }
      if (vertexCount >= linePositions.length / 3 - 2) break;
    }

    lineMesh.geometry.setDrawRange(0, vertexCount);
    lineMesh.geometry.attributes.position.needsUpdate = true;
  }

  // 2. Layer 1 (Deep): Spiral Galaxy
  function createSpiralGalaxy() {
    const geometry = new THREE.BufferGeometry();
    const galPositions = new Float32Array(GALAXY_COUNT * 3);
    const galColors = new Float32Array(GALAXY_COUNT * 3);

    const arms = 2;
    for (let i = 0; i < GALAXY_COUNT; i++) {
      const i3 = i * 3;
      const arm = i % arms;
      
      // Logarithmic spiral geometry
      const theta = (i / GALAXY_COUNT) * Math.PI * 10; // Wraps 5 times
      const angle = theta + (arm * Math.PI);
      const r = 80 + (i / GALAXY_COUNT) * 550; // Inner gap + spread

      // Add noise expansion for volumetric arms
      const noiseX = (Math.random() - 0.5) * 60 * (r / 250 + 0.3);
      const noiseY = (Math.random() - 0.5) * 60 * (r / 250 + 0.3);
      const noiseZ = (Math.random() - 0.5) * 35;

      galPositions[i3]     = r * Math.cos(angle) + noiseX;
      galPositions[i3 + 1] = r * Math.sin(angle) + noiseY;
      galPositions[i3 + 2] = noiseZ;

      // Color mapping: cores are white-ish/teal, arms are blue/violet
      const coreMix = 1.0 - Math.min(r / 350, 1.0);
      const c = new THREE.Color();
      if (coreMix > 0.4) {
        c.lerpColors(new THREE.Color(0xffffff), new THREE.Color(0x00d4aa), (coreMix - 0.4) / 0.6);
      } else {
        c.lerpColors(new THREE.Color(0x0989d8), new THREE.Color(0x6c3bff), r / 600);
      }

      galColors[i3]     = c.r;
      galColors[i3 + 1] = c.g;
      galColors[i3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(galPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(galColors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    galaxySystem = new THREE.Points(geometry, material);
    
    // Tilt the galaxy slightly for an aesthetic angle
    galaxySystem.rotation.x = Math.PI / 3.5; 
    scene.add(galaxySystem);
  }

  // 3. Layer 2 (Mid): Floating Wireframe Geometries
  function createWireframeGeometries() {
    wireframeGroup = new THREE.Group();
    const shapesCount = 7;

    for (let i = 0; i < shapesCount; i++) {
      const radius = 10 + Math.random() * 20;
      // Alternate between Octahedrons and Icosahedrons
      const geom = (i % 2 === 0) 
        ? new THREE.OctahedronGeometry(radius, 0)
        : new THREE.IcosahedronGeometry(radius, 0);

      const mat = new THREE.MeshBasicMaterial({
        color: COLORS[i % COLORS.length],
        wireframe: true,
        transparent: true,
        opacity: 0.08, // Subtle
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geom, mat);
      
      // Random coordinates dispersed in 3D
      mesh.position.set(
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 500
      );

      // Store random spin velocities
      mesh.userData = {
        spinX: (Math.random() - 0.5) * 0.015,
        spinY: (Math.random() - 0.5) * 0.015,
        floatSpeed: 0.25 + Math.random() * 0.5,
        floatRange: 15 + Math.random() * 20,
        startY: mesh.position.y
      };

      wireframeGroup.add(mesh);
    }

    scene.add(wireframeGroup);
  }

  function updateWireframeGeometries(time) {
    wireframeGroup.children.forEach(function (mesh) {
      mesh.rotation.x += mesh.userData.spinX;
      mesh.rotation.y += mesh.userData.spinY;
      
      // Slow hovering float
      mesh.position.y = mesh.userData.startY + Math.sin(time * mesh.userData.floatSpeed) * mesh.userData.floatRange;
    });
  }

  function projectMouseTo3D() {
    const vec = new THREE.Vector3(mouse.ndcX, mouse.ndcY, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));
  }

  function updateConstellationParticles() {
    const mousePos = projectMouseTo3D();
    const repulseSq = REPULSE_RADIUS * REPULSE_RADIUS;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Mouse repulsion
      const dx = positions[i3]     - mousePos.x;
      const dy = positions[i3 + 1] - mousePos.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < repulseSq && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / REPULSE_RADIUS) * REPULSE_FORCE;
        velocities[i3]     += (dx / dist) * force * 0.08;
        velocities[i3 + 1] += (dy / dist) * force * 0.08;
      }

      // Spring physics back to original positions
      velocities[i3]     += (originalPositions[i3]     - positions[i3])     * 0.004;
      velocities[i3 + 1] += (originalPositions[i3 + 1] - positions[i3 + 1]) * 0.004;
      velocities[i3 + 2] += (originalPositions[i3 + 2] - positions[i3 + 2]) * 0.004;

      // Damping friction
      velocities[i3]     *= 0.93;
      velocities[i3 + 1] *= 0.93;
      velocities[i3 + 2] *= 0.93;

      // Move particle
      positions[i3]     += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  let lineUpdateCounter = 0;
  const clock = new THREE.Clock();

  function animate() {
    if (isHidden) {
      animId = requestAnimationFrame(animate);
      return;
    }

    const time = clock.getElapsedTime();

    // Rotate systems
    particleSystem.rotation.y += IDLE_ROTATION_Y;
    lineMesh.rotation.y = particleSystem.rotation.y;
    
    // Galaxy rotation
    galaxySystem.rotation.z += 0.0006;
    galaxySystem.rotation.y = Math.sin(time * 0.05) * 0.1; // slow tilt breathing

    // Update mid wireframes
    updateWireframeGeometries(time);

    // Scroll updates (Zoom out + rotate camera angle)
    const scrollDelta = window.scrollY || window.pageYOffset || 0;
    particleSystem.rotation.x = scrollDelta * SCROLL_ROT_FACTOR;
    lineMesh.rotation.x = particleSystem.rotation.x;
    galaxySystem.rotation.x = (Math.PI / 3.5) + scrollDelta * SCROLL_ROT_FACTOR * 0.5;

    // Dramatic scroll zoom-out
    camera.position.z = 800 + scrollDelta * SCROLL_Z_FACTOR;

    updateConstellationParticles();

    // Constellation line calculation throttled to every 3rd frame
    lineUpdateCounter++;
    if (lineUpdateCounter % 3 === 0) {
      updateConstellationLines();
    }

    renderer.render(scene, camera);
    animId = requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.ndcX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onVisibility() {
    isHidden = document.hidden;
  }

  window.initThreeBackground = function (container) {
    if (!container || typeof THREE === 'undefined') {
      console.warn('[three-bg] Three.js or container not found.');
      return;
    }

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 800;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    container.appendChild(canvas);

    // Build layers
    createSpiralGalaxy();
    createWireframeGeometries();
    createConstellationParticles();
    createConstellationLines();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    animate();
  };
})();

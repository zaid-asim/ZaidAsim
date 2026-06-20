/* ============================================================
   modals.js — Project Detail Modals & Magnetic Buttons
   Manages custom popups for project case studies and magnetic
   button animations on hover.
   ============================================================ */
(function () {
  'use strict';

  var projectData = {
    'swadesh-ai': {
      title: 'Swadesh AI',
      tagline: 'The Intelligent Context Engine for a Connected World',
      story: '<h4>The Vision</h4><p>Built as the flagship AI platform of Zaid Asim Softwares, Swadesh AI explores the boundary of context-aware natural language processing. I designed the architecture to handle complex query pipelines, integrating custom embedding stores and local language model endpoints. It was an exercise in understanding both low-level vector mathematical representations and high-level client-facing API response interfaces.</p><h4>The Development</h4><p>The system was built to operate efficiently on limited hardware by implementing intelligent semantic caching. By storing past interactions and evaluating their semantic similarity to new prompts, the engine avoids redundant LLM invocations, reducing response latency by up to 75% for repeated queries.</p>',
      learned: 'Building Swadesh AI taught me the limits of current AI architectures and how robust cache systems and semantic indexing can make AI response times 4x faster. I learned that data ingestion pipelines are 90% of the battle in AI development.',
      tech: ['Python', 'PyTorch', 'n8n', 'FastAPI', 'VectorDB', 'LLMs'],
      status: '🏆 Active Development',
      image: 'assets/swadesh-ai.png',
      link: 'swadesh.html'
    },
    'crafty-kids': {
      title: 'Crafty Kids of India',
      tagline: 'Preserving Indian Heritage Through Playful Innovation',
      story: '<h4>The Vision</h4><p>As a massive creative breakthrough, Crafty Kids of India was designed as an interactive educational experience showcasing India\'s rich history of toys, arts, and crafts. The game teaches children regional histories, block printing, woodcarving, and clay design within a beautifully rendered virtual playground.</p><h4>The Accolades</h4><p>This project had the honor of being recognized at the prestigious STEM Innovation League for its contribution to digital heritage preservation. It proved that gaming is a powerful medium for educational and cultural dissemination.</p>',
      learned: 'This project taught me how to scale assets, build kid-friendly UI architectures, and validate educational concepts with real user testing groups. Translating physical crafts into interactive virtual mechanics was an incredible design challenge.',
      tech: ['Unity', 'C#', 'Blender', 'UI Toolkit', 'Android SDK'],
      status: '🏆 Award-Winning',
      image: 'assets/crafty-kids.png',
      link: '#contact'
    },
    'storm-of-kings': {
      title: 'Storm of Kings',
      tagline: 'An Episodic 2D RPG World Built on Narrative Depth',
      story: '<h4>The Vision</h4><p>Storm of Kings is a 2D RPG built with Unity. I wanted to tell a long-form story with branching dialogues, complex state logic, and epic battles. The character dialog tree runs on a custom node-graph interpreter that I wrote myself, allowing story arcs to merge or deviate based on player reputation values.</p><h4>The Aesthetics</h4><p>It contains pixel art that I hand-crafted and animated in Aseprite to capture a warm, cozy nostalgia, paired with procedural audio cues that match the weather patterns of the map.</p>',
      learned: 'Writing a node-based dialogue interpreter in C# taught me the value of clean data representation and serialization. I learned that game storytelling requires a tight coupling of narrative design and systems engineering.',
      tech: ['Unity', 'C#', 'Aseprite', 'Node Graph', 'JSON Data'],
      status: '🚧 In Development',
      image: 'assets/storm-of-kings.png',
      link: '#contact'
    },
    'homies': {
      title: 'Homies',
      tagline: 'GTA-Inspired Open-World Life Simulator',
      story: '<h4>The Vision</h4><p>Homies represents my ambition for large-scale systems. It simulates a living sandbox city complete with player property ownership, street races, currency-based business ventures, and a dynamic community ecosystem. I developed custom vehicle controller physics to simulate realistic tire friction, drifting, and collisions.</p><h4>The Audio Dimension</h4><p>An unreleased soundtrack album was composed specifically for my game homies, featuring english hip hop tracks like "Hustlaa Hustlaa" to back the street aesthetics and keep the atmosphere high-energy.</p>',
      learned: 'Designing sandbox ecosystems taught me how to manage hundreds of active game elements without causing CPU bottlenecks. It also taught me the importance of audio design in establishing environmental context and player immersion.',
      tech: ['Unity', 'C#', 'Web Audio API', 'FMOD', 'Vehicle Physics'],
      status: '🚧 Alpha Phase',
      image: 'assets/homies.png',
      link: '#music'
    },
    'urgeguard': {
      title: 'UrgeGuard AI',
      tagline: 'Gamified Habit Tracker Built on Behavioral Psychology',
      story: '<h4>The Vision</h4><p>UrgeGuard AI gamifies self-discipline by turning positive habits into RPG-style quests. Users earn experience points, battle virtual monsters representing bad habits, and unlock achievements. The project was designed, prototyped, and pitched to Rebirth Games, receiving incredible praise for its UI execution and psychological reward structures.</p><h4>Psychological Mechanics</h4><p>The application implements variable reward schedules and positive reinforcement loops to motivate users to maintain long-term streaks, transforming tedious tracking into an addictive progression system.</p>',
      learned: 'I learned how to integrate gamified mechanics into standard utility apps. Behavioral design requires delicate balancing—if the game elements are too complex, users ignore the utility; if they are too simple, they lose motivation.',
      tech: ['React', 'CSS Glassmorphism', 'Tailwind CSS', 'LocalStorage'],
      status: '✅ Prototype Complete',
      image: 'assets/urgeguard.png',
      link: '#contact'
    },
    'zaid-asim-softwares': {
      title: 'Zaid Asim Softwares',
      tagline: 'UDYAM-Registered Enterprise Delivering Future Solutions',
      story: '<h4>The Enterprise</h4><p>Zaid Asim Softwares is my official registered business entity (UDYAM-KR-15-0069715) based in India. It serves as the legal and operational structure for all my digital creations, enterprise services, and AI research integrations. We deliver custom software development, Web automation, high-performance UI designs, and local regional software deployments.</p><h4>Core Services</h4><p>We build premium web portfolios, multi-agent automated content engines, custom databases, and interactive game projects. Our goal is to bring world-class engineering solutions directly to businesses.</p>',
      learned: 'Operating a registered enterprise taught me the business side of engineering—tax laws, business registration, contract negotiations, invoicing, and client relationship management. It made me realize that writing code is only half the puzzle of building a successful studio.',
      tech: ['Full Stack', 'n8n Automation', 'Cloudflare Pages', 'API Systems'],
      status: '✅ UDYAM Registered',
      image: 'assets/zaid-asim-softwares.png',
      link: '#contact'
    }
  };

  function initModals() {
    var modalOverlay = document.getElementById('projectModal');
    var closeBtn = document.querySelector('.modal-close-btn');

    if (!modalOverlay) return;

    // Listen to deep dive buttons
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-project-id]');
      if (!btn) return;

      var projectId = btn.dataset.projectId;
      var data = projectData[projectId];
      if (!data) return;

      openModal(data);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });

    function openModal(data) {
      document.getElementById('modalImage').src = data.image;
      document.getElementById('modalImage').alt = data.title;
      document.getElementById('modalTitle').textContent = data.title;
      document.getElementById('modalTagline').textContent = data.tagline;
      document.getElementById('modalStory').innerHTML = data.story;
      document.getElementById('modalLearned').textContent = data.learned;
      document.getElementById('modalStatus').textContent = data.status;

      // Populate tech list
      var techList = document.getElementById('modalTechList');
      techList.innerHTML = '';
      data.tech.forEach(function (t) {
        var span = document.createElement('span');
        span.className = 'sidebar-tech-tag';
        span.textContent = t;
        techList.appendChild(span);
      });

      // Bind action button
      var actionBtn = document.getElementById('modalActionBtn');
      if (actionBtn) {
        actionBtn.setAttribute('href', data.link);
        if (data.title === 'Swadesh AI') {
          actionBtn.textContent = 'Explore Project';
        } else if (data.title === 'Homies') {
          actionBtn.textContent = 'Explore Soundtrack';
        } else {
          actionBtn.textContent = 'Collaborate on Project';
        }
        actionBtn.onclick = function() {
           closeModal();
        };
      }

      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      if (window.soundEngine && typeof window.soundEngine.playSuccess === 'function') {
        window.soundEngine.playSuccess();
      }
    }

    function closeModal() {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
      
      if (window.soundEngine && typeof window.soundEngine.playTick === 'function') {
        window.soundEngine.playTick();
      }
    }
  }

  // 2. Magnetic Buttons Effect
  function initMagneticButtons() {
    var magneticBtns = document.querySelectorAll('.contact-btn, .primary-btn, .secondary-btn, .youtube-subscribe-btn');

    magneticBtns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        // Pull button towards cursor
        btn.style.transform = 'translate(' + x * 0.35 + 'px, ' + y * 0.35 + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  window.initModals = function () {
    initModals();
    initMagneticButtons();
  };
})();

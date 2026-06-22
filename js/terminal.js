(function () {
  'use strict';

  let terminalEl = null;
  let outputEl = null;
  let inputEl = null;
  let isOpen = false;
  
  // Game state
  let gameActive = false;
  let secretCode = 0;
  let attemptsLeft = 0;

  // Command history
  const commandHistory = [];
  let historyIndex = -1;

  // Matrix canvas state
  let matrixCanvas = null;
  let matrixInterval = null;
  let matrixAnimId = null;

  // Sound triggers helper
  function playSound(type) {
    if (!window.soundEngine) return;
    if (type === 'click' && typeof window.soundEngine.playClick === 'function') {
      window.soundEngine.playClick();
    } else if (type === 'select' && typeof window.soundEngine.playSelect === 'function') {
      window.soundEngine.playSelect();
    } else if (type === 'glitch' && typeof window.soundEngine.playGlitch === 'function') {
      window.soundEngine.playGlitch();
    }
  }

  // Create terminal overlay DOM
  function createTerminal() {
    terminalEl = document.createElement('div');
    terminalEl.className = 'za-terminal';
    terminalEl.id = 'za-terminal';

    terminalEl.innerHTML = `
      <div class="za-terminal-header">
        <span class="za-terminal-header-title">ZA-OS [v2.0.0] - Secure Terminal Emulator</span>
        <button class="za-terminal-header-close" id="za-terminal-close">EXIT</button>
      </div>
      <div class="za-terminal-output" id="za-terminal-output"></div>
      <div class="za-terminal-input-line">
        <span class="za-terminal-prompt" id="za-terminal-prompt">guest@za-os:~$</span>
        <input type="text" class="za-terminal-input" id="za-terminal-input" autocomplete="off" spellcheck="false" autofocus />
      </div>
    `;

    document.body.appendChild(terminalEl);

    outputEl = document.getElementById('za-terminal-output');
    inputEl = document.getElementById('za-terminal-input');

    // Close button event
    document.getElementById('za-terminal-close').addEventListener('click', closeTerminal);

    // Maintain input focus when clicking terminal area
    terminalEl.addEventListener('click', function (e) {
      if (e.target !== document.getElementById('za-terminal-close')) {
        inputEl.focus();
      }
    });

    // Handle inputs
    inputEl.addEventListener('keydown', handleInputKey);

    // Initial message
    printLine("ZA-OS(R) System Shell Emulator loaded.", "system-output");
    printLine("Type 'help' to review active system directives.", "success-output");
    printLine("", "system-output");
  }

  function printLine(text, className) {
    if (!outputEl) return;
    const line = document.createElement('div');
    line.className = 'za-terminal-line ' + (className || '');
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function toggleTerminal() {
    if (isOpen) {
      closeTerminal();
    } else {
      openTerminal();
    }
  }

  function openTerminal() {
    if (!terminalEl) createTerminal();
    isOpen = true;
    terminalEl.classList.add('active');
    playSound('select');
    
    // Disable main body scroll
    document.body.style.overflow = 'hidden';

    // Dispatch achievement event
    window.dispatchEvent(new CustomEvent('za_achievement', {
      detail: { id: 'hacker', title: '👾 Hacker — Opened Terminal Emulator', xp: 40 }
    }));

    setTimeout(function () {
      if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
      }
    }, 100);
  }

  function closeTerminal() {
    if (!terminalEl) return;
    isOpen = false;
    terminalEl.classList.remove('active');
    playSound('click');

    // Restore body scroll
    document.body.style.overflow = '';
  }

  // Keyboard router inside terminal input
  function handleInputKey(e) {
    if (e.key === 'Enter') {
      const val = inputEl.value;
      inputEl.value = '';
      if (gameActive) {
        processGameGuess(val);
      } else {
        executeCommand(val);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closeTerminal();
      return;
    }

    // Command history traversal
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        if (historyIndex > 0) {
          historyIndex--;
        } else if (historyIndex === -1) {
          historyIndex = commandHistory.length - 1;
        }
        inputEl.value = commandHistory[historyIndex];
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex !== -1) {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          inputEl.value = commandHistory[historyIndex];
        } else {
          historyIndex = -1;
          inputEl.value = '';
        }
      }
      return;
    }
  }

  // Command parser
  function executeCommand(cmdStr) {
    const rawCmd = cmdStr.trim();
    if (!rawCmd) return;

    // Push history
    commandHistory.push(rawCmd);
    historyIndex = -1;

    // Echo
    printLine("guest@za-os:~$ " + rawCmd, "command-echo");

    const parts = rawCmd.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        printLine("Available ZA-OS Directives:", "system-output");
        printLine("  about      - Brief overview of developer persona", "system-output");
        printLine("  projects   - Directory list of active software modules", "system-output");
        printLine("  cat <name> - Print detailed specifications of a project (e.g. cat homies)", "system-output");
        printLine("  theme <c>  - Re-map system accent styling (blue, purple, teal, orange, magenta)", "system-output");
        printLine("  skills     - View capabilities radar vector metrics", "system-output");
        printLine("  game       - Initialize hacker guess PIN bypass routine", "system-output");
        printLine("  sudo <cmd> - Attempt root authorization override (e.g. sudo rm -rf /)", "system-output");
        printLine("  matrix     - Toggle falling matrix buffer backdrop", "system-output");
        printLine("  clear      - Clear buffer output", "system-output");
        printLine("  exit       - Shutdown terminal shell", "system-output");
        break;

      case 'clear':
        if (outputEl) outputEl.innerHTML = '';
        break;

      case 'exit':
      case 'close':
        closeTerminal();
        break;

      case 'whoami':
        printLine("guest (status: ACTIVE_CLIENT, host: " + (window.location.hostname || "local_host") + ")", "system-output");
        break;

      case 'about':
        printLine("Developer: Zaid Asim", "system-output");
        printLine("Role     : Full-Stack Engineer, Game Developer & UI Architect", "system-output");
        printLine("Brief    : Focused on building ultra-fluid, deeply interactive, and aesthetic software.", "system-output");
        printLine("Origin   : India 🇮🇳", "system-output");
        break;

      case 'projects':
      case 'ls':
        printLine("Listing projects directory: /root/projects", "system-output");
        printLine("  swadesh    - Swadesh AI language localisation system", "system-output");
        printLine("  urgeguard  - UrgeGuard focus extension blocker", "system-output");
        printLine("  homies     - Homies RPG soundtrack listener", "system-output");
        printLine("  chronos    - Chronos real-time monitoring dashboard", "system-output");
        printLine("Type 'cat <name>' to retrieve details.", "success-output");
        break;

      case 'cat':
        if (!args[0]) {
          printLine("Error: cat requires target project identifier. E.g. 'cat swadesh'", "error-output");
        } else {
          const target = args[0].toLowerCase();
          if (target === 'swadesh') {
            printLine(">> FILE PATH: /root/projects/swadesh.log", "accent");
            printLine("Project   : Swadesh AI Platform", "system-output");
            printLine("Role      : Lead Architect & Founder", "system-output");
            printLine("Tech Stack: FastAPI, Node.js, Web Audio API, Docker", "system-output");
            printLine("Details   : Bridges local dialect splits inside India via automated speech localisation.", "system-output");
          } else if (target === 'urgeguard') {
            printLine(">> FILE PATH: /root/projects/urgeguard.log", "accent");
            printLine("Project   : UrgeGuard Focus Utility", "system-output");
            printLine("Role      : Solo Creator", "system-output");
            printLine("Tech Stack: JavaScript (WebExtensions), SQLite database, CSS3 variables", "system-output");
            printLine("Details   : Employs cognitive friction systems to disrupt addictive browsing cycles.", "system-output");
          } else if (target === 'homies') {
            printLine(">> FILE PATH: /root/projects/homies.log", "accent");
            printLine("Project   : Homies RPG Visualiser", "system-output");
            printLine("Role      : Game Programmer & Audio Lead", "system-output");
            printLine("Tech Stack: Unity Engine, C# scripting, WebGL, procedural WebAudio synth", "system-output");
            printLine("Details   : Gamified music environment linking active soundwaves with achievements.", "system-output");
          } else if (target === 'chronos') {
            printLine(">> FILE PATH: /root/projects/chronos.log", "accent");
            printLine("Project   : Chronos System Monitor", "system-output");
            printLine("Role      : Frontend Core Engineer", "system-output");
            printLine("Tech Stack: React, D3.js charting, WebGL shader canvas, Node.js", "system-output");
            printLine("Details   : Real-time telemetry dashboard monitoring host status and connection maps.", "system-output");
          } else {
            printLine("Error: File or directory '/root/projects/" + args[0] + "' not found.", "error-output");
          }
        }
        break;

      case 'skills':
        printLine(">> SYSTEM PROFILE METRICS:", "accent");
        printLine("  Frontend Tech  [====================] 95% (Expert)", "system-output");
        printLine("  Backend Systems[==================--] 90% (Advanced)", "system-output");
        printLine("  Game Programming[====================] 95% (Expert)", "system-output");
        printLine("  AI Integrations[==================--] 90% (Advanced)", "system-output");
        printLine("  Cloud & DevOps [================----] 80% (Competent)", "system-output");
        break;

      case 'theme':
        if (!args[0]) {
          printLine("Error: Theme requires color parameter. Options: blue, purple, teal, orange, magenta", "error-output");
        } else {
          const colorName = args[0].toLowerCase();
          const changed = setAccentTheme(colorName);
          if (changed) {
            printLine("Accent variables updated successfully. Shifted to '" + colorName + "' mode.", "success-output");
            playSound('select');
          } else {
            printLine("Error: Unknown accent color '" + args[0] + "'. Use: blue, purple, teal, orange, magenta", "error-output");
          }
        }
        break;

      case 'sudo':
        if (!args[0]) {
          printLine("sudo: target command execution required.", "error-output");
        } else {
          const action = args.join(' ');
          if (action === 'rm -rf /' || action === 'rm -rf') {
            printLine("CRITICAL WARNING: INITIATING KERNEL OVERRIDE PROTOCOL...", "error-output");
            printLine("UNMOUNTING ROOT FILE DIRECTORY... DELETING SYSTEM MODULES...", "error-output");
            setTimeout(triggerGlitchDestruction, 1000);
          } else {
            printLine("guest is not in the sudoers file. This incident will be reported to admin.", "error-output");
          }
        }
        break;

      case 'matrix':
        toggleMatrixRain();
        break;

      case 'game':
        initBypassGame();
        break;

      default:
        printLine("Error: Shell directive '" + cmd + "' unresolved. Type 'help' for instructions.", "error-output");
    }
  }

  // Set Global CSS Accent overrides
  function setAccentTheme(color) {
    const themes = {
      blue: { primary: '#0989d8', secondary: '#6c3bff' },
      purple: { primary: '#6c3bff', secondary: '#ff00dc' },
      teal: { primary: '#00d4aa', secondary: '#00e5ff' },
      orange: { primary: '#ff8c00', secondary: '#ffd700' },
      magenta: { primary: '#ff00dc', secondary: '#8b00ff' }
    };
    if (!themes[color]) return false;

    const t = themes[color];
    document.documentElement.style.setProperty('--color-accent-primary', t.primary);
    document.documentElement.style.setProperty('--color-accent-secondary', t.secondary);
    document.documentElement.style.setProperty('--gradient-brand', `linear-gradient(135deg, ${t.primary}, ${t.secondary})`);
    document.documentElement.style.setProperty('--color-text-accent', t.primary);
    document.documentElement.style.setProperty('--color-text-link', t.primary);

    // Fire event for theme updates (recolors background canvas etc.)
    window.dispatchEvent(new CustomEvent('za_theme_changed', { detail: { theme: color } }));

    // Achievement award
    window.dispatchEvent(new CustomEvent('za_achievement', {
      detail: { id: 'the_architect', title: '📐 The Architect — Altered System Accents', xp: 30 }
    }));

    return true;
  }

  // Hacking Bypass Minigame
  function initBypassGame() {
    gameActive = true;
    secretCode = Math.floor(Math.random() * 900) + 100; // 100 to 999
    attemptsLeft = 6;

    printLine("========================================================", "accent");
    printLine("[ZA-OS SECURITY ROUTINE BYPASS ACTIVATED]", "warning");
    printLine("CRACK THE 3-DIGIT ACCESS PIN (100 - 999)", "system-output");
    printLine("You have 6 attempts remaining. Type your guess code:", "success-output");
    printLine("========================================================", "accent");

    document.getElementById('za-terminal-prompt').textContent = "guess@bypass:~$";
  }

  function processGameGuess(val) {
    const guessText = val.trim();
    printLine("guess@bypass:~$ " + guessText, "command-echo");

    const guessNum = parseInt(guessText, 10);
    if (isNaN(guessNum) || guessNum < 100 || guessNum > 999) {
      printLine("Error: Bypass code must be a 3-digit integer (100-999). Try again.", "error-output");
      return;
    }

    attemptsLeft--;

    if (guessNum === secretCode) {
      printLine("[BYPASS SUCCESSFUL: CORE INTRUSION ACTIVE]", "success-output");
      printLine("Access granted. You successfully overridden the gateway.", "success-output");
      playSound('select');
      
      // Dispatch Achievement
      window.dispatchEvent(new CustomEvent('za_achievement', {
        detail: { id: 'game_master', title: '🏆 Game Master — Solved Hacking Minigame', xp: 50 }
      }));

      exitBypassGame();
    } else if (attemptsLeft <= 0) {
      printLine("[BYPASS ATTEMPT EXPIRED: INTRUSION DETECTED]", "error-output");
      printLine("Access locked. Security node hardened. Key was: " + secretCode, "error-output");
      playSound('glitch');
      exitBypassGame();
    } else {
      playSound('click');
      if (guessNum > secretCode) {
        printLine("  Hint: Code [" + guessNum + "] is TOO HIGH. Target value is lower.", "warning");
      } else {
        printLine("  Hint: Code [" + guessNum + "] is TOO LOW. Target value is higher.", "warning");
      }
      printLine("  Attempts remaining: " + attemptsLeft, "system-output");
    }
  }

  function exitBypassGame() {
    gameActive = false;
    document.getElementById('za-terminal-prompt').textContent = "guest@za-os:~$";
  }

  // Sudo rm -rf destruction effect
  function triggerGlitchDestruction() {
    playSound('glitch');
    closeTerminal();

    if (window.gsap) {
      const timeline = window.gsap.timeline({
        onComplete: () => {
          // Reset style override
          window.gsap.set(document.body, { clearProps: "all" });
          alert("RESTABLISHING KERNEL... SECURE BUFFER RESTORED. SYSTEM REBOOTED.");
          // Reload the page to restore system state
          window.location.reload();
        }
      });

      timeline.to(document.body, { duration: 0.1, skewX: 18, ease: "power4.inOut" })
              .to(document.body, { duration: 0.05, skewX: -25, scaleY: 0.7, filter: "hue-rotate(120deg) blur(3px) invert(1)" })
              .to(document.body, { duration: 0.15, skewX: 10, scaleX: 1.3, filter: "hue-rotate(240deg) invert(1) contrast(4)" })
              .to(document.body, { duration: 0.1, x: 70, y: -40, rotate: 3 })
              .to(document.body, { duration: 0.25, x: -80, y: 50, skewY: 15, filter: "none" })
              .to(document.body, { duration: 0.1, scale: 0.8, filter: "invert(0)" })
              .to(document.body, { duration: 0.4, rotate: 0, scale: 1, ease: "elastic.out(1, 0.3)" });
    } else {
      document.body.style.filter = "hue-rotate(180deg) invert(1) blur(2px)";
      setTimeout(() => {
        document.body.style.filter = "";
        alert("SECURE REBOOT COMPLETED.");
        window.location.reload();
      }, 1500);
    }

    // Sudo Hacker achievement
    window.dispatchEvent(new CustomEvent('za_achievement', {
      detail: { id: 'sudo_hacker', title: '💀 Sudo Hacker — Invoked Root Override', xp: 50 }
    }));
  }

  // Falling Matrix Rain effect
  function toggleMatrixRain() {
    if (matrixCanvas) {
      // Turn off
      printLine("Matrix animation pipeline detached.", "warning");
      clearInterval(matrixInterval);
      cancelAnimationFrame(matrixAnimId);
      matrixCanvas.remove();
      matrixCanvas = null;
      return;
    }

    printLine("Spawning Matrix cascade overlay... Type 'matrix' again to toggle off.", "success-output");

    matrixCanvas = document.createElement('canvas');
    matrixCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;opacity:0.15;pointer-events:none;';
    terminalEl.appendChild(matrixCanvas);

    const ctx = matrixCanvas.getContext('2d');
    
    function resizeCanvas() {
      if (!matrixCanvas) return;
      matrixCanvas.width = terminalEl.offsetWidth;
      matrixCanvas.height = terminalEl.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = Array(columns).fill(1);
    
    // Japanese katakana and numbers/alphabet
    const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function draw() {
      if (!matrixCanvas) return;
      ctx.fillStyle = 'rgba(2, 4, 10, 0.06)';
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      ctx.fillStyle = '#00e676';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    function loop() {
      draw();
      matrixAnimId = requestAnimationFrame(loop);
    }

    loop();
  }

  // Keyboard shortcut listener
  document.addEventListener('keydown', function (e) {
    // Ignore key bindings in standard input forms
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      // Still allow Ctrl + ~ shortcut even in input fields
      if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        toggleTerminal();
      }
      return;
    }

    // Toggle on backtick key alone
    if (e.key === '`') {
      e.preventDefault();
      toggleTerminal();
      return;
    }

    // Toggle on Ctrl + ` or Ctrl + ~
    if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
      e.preventDefault();
      toggleTerminal();
      return;
    }

    // Toggle on Command + Shift + T (alt shortcut)
    if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      toggleTerminal();
      return;
    }
  });

  // Expose toggle globally so Command Palette can call it
  window.toggleTerminal = toggleTerminal;
})();

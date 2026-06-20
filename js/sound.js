/* ============================================================
   sound.js — Web Audio API Synthesizer
   Procedural UI sounds: click, select, level-up chord,
   achievement chime. Mute state persisted via localStorage.
   ============================================================ */
(function () {
  'use strict';

  function SoundSynthesizer() {
    this.ctx = null;
    this.initialized = false;
    this.muted = false;
    this._lastClick = 0;
    this._lastSelect = 0;
    this._boundInit = null;
  }

  SoundSynthesizer.prototype.init = function () {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      this.muted = false; // Always start unmuted
      localStorage.removeItem('za_sound_muted');
    } catch (err) {
      console.warn('[sound] Web Audio API not available:', err);
    }
  };

  SoundSynthesizer.prototype._ensureCtx = function () {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  };

  SoundSynthesizer.prototype.playClick = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var now = performance.now();
    if (now - this._lastClick < 30) return;
    this._lastClick = now;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

    gain.gain.setValueAtTime(0.45, t); // Boosted from 0.12
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  };

  SoundSynthesizer.prototype.playSelect = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var now = performance.now();
    if (now - this._lastSelect < 30) return;
    this._lastSelect = now;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);

    gain.gain.setValueAtTime(0.60, t); // Boosted from 0.20
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  };

  SoundSynthesizer.prototype.playLevelUp = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    // C-Major chord: C4 E4 G4 C5
    var freqs = [261.63, 329.63, 392.0, 523.25];

    for (var i = 0; i < freqs.length; i++) {
      (function (freq, delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.55, t + delay); // Boosted from 0.18
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.1);
      })(freqs[i], i * 0.08);
    }
  };

  SoundSynthesizer.prototype.playAchievement = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;

    // Vibrato chime: A5 then E6 with LFO
    var notes = [880, 1318.51];

    for (var i = 0; i < notes.length; i++) {
      (function (freq, delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var lfo = ctx.createOscillator();
        var lfoGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);

        // LFO for vibrato
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(16, t + delay);
        lfoGain.gain.setValueAtTime(12, t + delay);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.60, t + delay); // Boosted from 0.20
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(t + delay);
        osc.start(t + delay);
        lfo.stop(t + delay + 0.35);
        osc.stop(t + delay + 0.35);
      })(notes[i], i * 0.15);
    }
  };

  SoundSynthesizer.prototype.playIntro = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.6);
    osc.frequency.exponentialRampToValueAtTime(150, t + 1.2);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.50, t + 0.4); // Boosted from 0.15
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    // Apply lowpass filter
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 1.25);
  };

  SoundSynthesizer.prototype.playTick = function () {
    this.playClick();
  };

  SoundSynthesizer.prototype.playSuccess = function () {
    this.playLevelUp();
  };

  SoundSynthesizer.prototype.playWarp = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(1500, t + 0.8);

    gain.gain.setValueAtTime(0.50, t); // Boosted from 0.15
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.85);
  };

  SoundSynthesizer.prototype.playGlitch = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;

    var ctx = this.ctx;
    var t = ctx.currentTime;
    
    // Simulate crackle using short random noise bursts
    for (var i = 0; i < 6; i++) {
      (function (delay) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2000 + Math.random() * 4000, t + delay);
        
        gain.gain.setValueAtTime(0.40, t + delay); // Boosted from 0.10
        gain.gain.setValueAtTime(0.0001, t + delay + 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.025);
      })(i * 0.05 * Math.random());
    }
  };

  var ambientOsc = null;
  var ambientGain = null;

  SoundSynthesizer.prototype.startAmbientLoop = function () {
    this._ensureCtx();
    if (this.muted || !this.ctx) return;
    if (ambientOsc) return; // already running

    var ctx = this.ctx;
    var t = ctx.currentTime;

    ambientOsc = ctx.createOscillator();
    ambientGain = ctx.createGain();

    ambientOsc.type = 'sine';
    ambientOsc.frequency.setValueAtTime(55, t); // Low A hum

    // Modulate with another LFO
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, t); // very slow breathing
    lfoGain.gain.setValueAtTime(2, t);

    lfo.connect(lfoGain);
    lfoGain.connect(ambientOsc.frequency);

    ambientGain.gain.setValueAtTime(0.04, t);

    ambientOsc.connect(ambientGain);
    ambientGain.connect(ctx.destination);
    
    lfo.start(t);
    ambientOsc.start(t);
  };

  SoundSynthesizer.prototype.stopAmbientLoop = function () {
    if (ambientOsc) {
      try {
        ambientOsc.stop();
      } catch (e) {}
      ambientOsc = null;
      ambientGain = null;
    }
  };

  SoundSynthesizer.prototype.toggleMute = function () {
    this._ensureCtx();
    this.muted = !this.muted;
    localStorage.setItem('za_sound_muted', this.muted.toString());
    if (this.muted) {
      this.stopAmbientLoop();
    }
    return this.muted;
  };

  SoundSynthesizer.prototype.isMuted = function () {
    return this.muted;
  };

  // Create singleton
  var synth = new SoundSynthesizer();

  // Auto-init on first user interaction
  function autoInit() {
    synth.init();
    synth._ensureCtx();
    document.removeEventListener('click', autoInit);
    document.removeEventListener('touchstart', autoInit);
    document.removeEventListener('keydown', autoInit);
  }
  document.addEventListener('click', autoInit, { once: true });
  document.addEventListener('touchstart', autoInit, { once: true });
  document.addEventListener('keydown', autoInit, { once: true });

  // Ensure unmuted by default
  synth.muted = false;

  window.soundSynth = synth;
  window.soundEngine = synth; // Alias for loader & easter eggs
})();

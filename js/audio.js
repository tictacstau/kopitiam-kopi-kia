/**
 * Kopitiam Kopi Kia - Web Audio API Sound Generator Engine
 * Synthesizes all game audio dynamically (SFX + Kopitiam Ambient Background)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;

    // Ambient Kopitiam Background Audio Nodes
    this.ambientGain = null;
    this.ambientFilter = null;
    this.ambientSource = null;
    this.ambientTimer = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.isAmbientPlaying && !this.isMuted) {
      this.startKopitiamAmbient();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopKopitiamAmbient();
    } else {
      this.init();
      this.startKopitiamAmbient();
    }
    return this.isMuted;
  }

  /**
   * Start Synthesized Kopitiam Ambient Background Sound Loop
   * Simulates coffee shop room acoustics, distant chatter, and cup clinks
   */
  startKopitiamAmbient() {
    if (this.isAmbientPlaying || this.isMuted) return;
    this.isAmbientPlaying = true;

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 4; // 4 second loop
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.015 * white) / 1.015;
      lastOut = data[i];
    }

    this.ambientSource = this.ctx.createBufferSource();
    this.ambientSource.buffer = buffer;
    this.ambientSource.loop = true;

    // Lowpass filter for warm indoor coffee stall acoustic room hum
    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = 'lowpass';
    this.ambientFilter.frequency.setValueAtTime(550, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.5); // Subtle background hum

    this.ambientSource.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    this.ambientSource.start();

    // Schedule random ambient cup/saucer clinks every 3-7 seconds
    this.scheduleRandomAmbience();
  }

  stopKopitiamAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientGain) {
      this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    }
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
    }
  }

  scheduleRandomAmbience() {
    if (!this.isAmbientPlaying || this.isMuted) return;

    const delay = Math.floor(Math.random() * 4000) + 3000;
    this.ambientTimer = setTimeout(() => {
      if (this.isAmbientPlaying && !this.isMuted) {
        this.playDistantCupClink();
        this.scheduleRandomAmbience();
      }
    }, delay);
  }

  /**
   * Distant Kopitiam Ceramic Cup/Saucer Clink
   */
  playDistantCupClink() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const randomPitch = 1800 + Math.random() * 800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(randomPitch, now);
    osc.frequency.exponentialRampToValueAtTime(randomPitch * 0.85, now + 0.15);

    gain.gain.setValueAtTime(0.04, now); // Very soft distant clink
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Synthesize liquid pouring sound effect
   */
  playPourSound(duration = 0.6) {
    if (this.isMuted) return;
    this.init();

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + duration);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }

  playIceSound() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const pings = [2800, 3400, 4100];

    pings.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.04 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.1);
    });
  }

  playCanPopSound() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const pop = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    pop.type = 'triangle';
    pop.frequency.setValueAtTime(1400, now);
    pop.frequency.exponentialRampToValueAtTime(300, now + 0.06);

    popGain.gain.setValueAtTime(0.4, now);
    popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    pop.connect(popGain);
    popGain.connect(this.ctx.destination);
    pop.start(now);
    pop.stop(now + 0.06);

    this.playPourSound(0.5);
  }

  playDispenserSound() {
    if (this.isMuted) return;
    this.init();
    this.playPourSound(0.7);
  }

  playKaChing() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const freqs = [1318.51, 1760.00, 2637.02];
    freqs.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);

      gain.gain.setValueAtTime(0, now + index * 0.06);
      gain.gain.linearRampToValueAtTime(0.3, now + index * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.4);
    });

    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);
  }

  playErrorSound() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(145, now);
    osc2.frequency.setValueAtTime(153, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  playMugGrab() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playSugarSound() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }
}

window.soundEngine = new SoundEngine();

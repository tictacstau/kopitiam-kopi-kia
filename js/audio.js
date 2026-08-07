/**
 * Kopitiam Kopi Kia - Web Audio API & Custom Audio Sound Generator Engine
 * Plays custom Kopitiam Hawker Background Ambience MP3 + Synthesized SFX & UI Fanfares
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;

    // Custom Background Ambient Audio Track
    this.bgAudio = new Audio('audio/kopitiam_ambient.mp3');
    this.bgAudio.loop = true;
    this.bgAudio.volume = 0.35;
    this.isBgPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.isBgPlaying && !this.isMuted) {
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

  startKopitiamAmbient() {
    if (this.isMuted || !this.bgAudio) return;

    try {
      const playPromise = this.bgAudio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          this.isBgPlaying = true;
        }).catch(err => {
          console.log('Audio autoplay waiting for user interaction:', err);
        });
      } else {
        this.isBgPlaying = true;
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  stopKopitiamAmbient() {
    this.bgAudio.pause();
    this.isBgPlaying = false;
  }

  /**
   * UI Menu Click Sound
   */
  playMenuClick() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Shop Purchase Chime
   */
  playShopBuy() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.25);
    });
  }

  /**
   * Level Victory Fanfare
   */
  playVictoryFanfare() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major arpeggio

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
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

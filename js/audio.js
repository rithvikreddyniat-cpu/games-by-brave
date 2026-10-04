// Sound Effects & Ambient Audio System via Web Audio API (Generated in code, no audio files)
class AudioSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.rainNode = null;
    this.rainGain = null;
    this.inkHumNode = null;
    this.inkHumGain = null;

    // Load initial mute state from localStorage safely
    try {
      const stored = localStorage.getItem('snakeNoirMuted');
      if (stored !== null) {
        this.isMuted = JSON.parse(stored);
      }
    } catch (e) {
      console.warn(e);
    }

    this.initUserInteractionListeners();
  }

  initUserInteractionListeners() {
    if (typeof window === 'undefined') return;
    const unlockAudio = () => {
      this.unlock();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
  }

  unlock() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn(e);
    }
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    try {
      localStorage.setItem('snakeNoirMuted', JSON.stringify(this.isMuted));
    } catch (e) {
      console.warn(e);
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
    }

    if (this.isMuted) {
      this.rainStop(0.1);
      this.inkHumStop(0.1);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  createNoiseBuffer(durationSec = 1.0) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSec;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  clue() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Tone 1: 660 Hz sine
      const osc1 = this.ctx.createOscillator();
      const g1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(660, now);
      g1.gain.setValueAtTime(0.3, now);
      g1.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc1.connect(g1);
      g1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.09);

      // Tone 2: 880 Hz sine
      const osc2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.09);
      g2.gain.setValueAtTime(0.3, now + 0.09);
      g2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc2.connect(g2);
      g2.connect(this.masterGain);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.18);
    } catch (e) {
      console.warn(e);
    }
  }

  erase() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(0.3);
      if (!noiseBuffer) return;

      const src = this.ctx.createBufferSource();
      src.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      src.start(now);
      src.stop(now + 0.3);
    } catch (e) {
      console.warn(e);
    }
  }

  twist() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Low 55 Hz boom with fast decay
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.5);

      // Short noise crack
      const noiseBuffer = this.createNoiseBuffer(0.1);
      if (noiseBuffer) {
        const nSrc = this.ctx.createBufferSource();
        nSrc.buffer = noiseBuffer;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.5, now);
        nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        nSrc.connect(nGain);
        nGain.connect(this.masterGain);
        nSrc.start(now);
        nSrc.stop(now + 0.1);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  death() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn(e);
    }
  }

  click() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(500, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.warn(e);
    }
  }

  caseSolved() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 784.00]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const t = now + i * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  flip() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(0.06);
      if (!noiseBuffer) return;
      const src = this.ctx.createBufferSource();
      src.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      src.start(now);
      src.stop(now + 0.06);
    } catch (e) {
      console.warn(e);
    }
  }

  ending() {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [130.81, 155.56, 196.00]; // C minor chord
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 1.5);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  rainStart(fadeDuration = 1.0) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain || this.rainNode) return;

    try {
      const now = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(3.0);
      if (!noiseBuffer) return;

      const src = this.ctx.createBufferSource();
      src.buffer = noiseBuffer;
      src.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + fadeDuration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      src.start(now);
      this.rainNode = src;
      this.rainGain = gain;
    } catch (e) {
      console.warn(e);
    }
  }

  rainStop(fadeDuration = 1.0) {
    if (!this.rainNode || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.rainGain) {
        this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, now);
        this.rainGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
      }
      const node = this.rainNode;
      this.rainNode = null;
      this.rainGain = null;
      setTimeout(() => {
        try { node.stop(); node.disconnect(); } catch (e) {}
      }, fadeDuration * 1000 + 50);
    } catch (e) {
      console.warn(e);
    }
  }

  inkHumStart(fadeDuration = 1.0) {
    if (this.isMuted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain || this.inkHumNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(70, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + fadeDuration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      this.inkHumNode = osc;
      this.inkHumGain = gain;
    } catch (e) {
      console.warn(e);
    }
  }

  inkHumStop(fadeDuration = 1.0) {
    if (!this.inkHumNode || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.inkHumGain) {
        this.inkHumGain.gain.setValueAtTime(this.inkHumGain.gain.value, now);
        this.inkHumGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
      }
      const node = this.inkHumNode;
      this.inkHumNode = null;
      this.inkHumGain = null;
      setTimeout(() => {
        try { node.stop(); node.disconnect(); } catch (e) {}
      }, fadeDuration * 1000 + 50);
    } catch (e) {
      console.warn(e);
    }
  }
}

export const sfx = new AudioSystem();

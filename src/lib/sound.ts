// Web Audio API 16-Bit Sound Synthesizer for Retro UI & Chiptune Playback

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play crisp 16-bit click sound
  playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Ignore audio restriction errors
    }
  }

  // Play posting completion chime (16-bit fanfare)
  playPostChime() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = this.ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  // Play note for chiptune synthesizer
  playNote(freq: number, duration: number = 0.25, waveType: OscillatorType = 'square') {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = waveType;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Play a sequence of notes (for 16-bit music attachments)
  playSequence(notes: Array<{ note: string; duration: number }>, tempo: number = 120, onComplete?: () => void) {
    this.initCtx();
    if (!this.ctx) return;

    const noteToFreq: Record<string, number> = {
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
      'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
      'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
      'C6': 1046.50
    };

    let currentTime = this.ctx.currentTime;
    const beatDuration = 60 / tempo;

    notes.forEach((item, index) => {
      const freq = noteToFreq[item.note] || 440;
      const durationSec = item.duration * beatDuration;

      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.12, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + durationSec * 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(currentTime);
      osc.stop(currentTime + durationSec * 0.9);

      currentTime += durationSec;

      if (index === notes.length - 1 && onComplete) {
        setTimeout(onComplete, (currentTime - this.ctx.currentTime) * 1000);
      }
    });
  }
}

export const soundFx = new SoundManager();

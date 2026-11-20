import type { AudioSettings } from '../types/game';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings = {
    muted: false,
    sfxVolume: 0.55,
    musicEnabled: false,
    musicVolume: 0,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('diwan_audio_settings');
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<AudioSettings>;
          this.settings = {
            muted: Boolean(parsed.muted),
            sfxVolume: typeof parsed.sfxVolume === 'number' ? parsed.sfxVolume : 0.55,
            musicEnabled: false,
            musicVolume: 0,
          };
        }
      } catch {
        // Ignore storage errors
      }
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AudioSettings>): AudioSettings {
    this.settings = {
      ...this.settings,
      ...partial,
      musicEnabled: false,
      musicVolume: 0,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('diwan_audio_settings', JSON.stringify(this.settings));
      } catch {
        // Ignore storage errors
      }
    }
    return this.getSettings();
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.14,
    delay = 0
  ): void {
    if (this.settings.muted || this.settings.sfxVolume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const volume = gainPeak * this.settings.sfxVolume;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(520, 0.055, 'triangle', 0.12);
  }

  public playSelect(): void {
    this.playTone(440, 0.09, 'sine', 0.13, 0);
    this.playTone(659.25, 0.12, 'sine', 0.12, 0.055);
  }

  public playNavigate(): void {
    this.playTone(392, 0.08, 'sine', 0.09, 0);
    this.playTone(493.88, 0.09, 'sine', 0.08, 0.04);
  }

  public playPoint(): void {
    this.playTone(698.46, 0.08, 'triangle', 0.13, 0);
    this.playTone(880, 0.14, 'sine', 0.14, 0.06);
  }

  public playWin(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.24, 'triangle', 0.15, idx * 0.085);
    });
  }

  public playLose(): void {
    this.playTone(349.23, 0.18, 'sine', 0.11, 0);
    this.playTone(293.66, 0.26, 'sine', 0.1, 0.14);
  }

  public playDraw(): void {
    this.playTone(440, 0.15, 'sine', 0.1, 0);
    this.playTone(523.25, 0.18, 'sine', 0.1, 0.09);
  }

  public playPlayerJoin(): void {
    this.playTone(587.33, 0.1, 'sine', 0.11, 0);
    this.playTone(783.99, 0.16, 'sine', 0.12, 0.08);
  }

  public playError(): void {
    this.playTone(220, 0.12, 'sawtooth', 0.06, 0);
  }
}

export const soundEngine = new SoundEngine();

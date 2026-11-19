// src/services/audio/soundEngine.ts

export type SoundEvent =
  | 'tap'
  | 'tabSwitch'
  | 'correct'
  | 'wrong'
  | 'comboUp'
  | 'bookmark'
  | 'coin'
  | 'heartLoss'
  | 'heartRestore'
  | 'purchase'
  | 'rankUp'
  | 'timerWarning';

export interface ISoundEngine {
  play(event: SoundEvent, options?: { comboCount?: number }): void;
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
}

/**
 * Phase 1: Procedural Web Audio API sound synthesizer.
 * Creates AudioContext lazily upon the first user interaction. Zero external audio assets required.
 */
export class ProceduralWebAudioSoundEngine implements ISoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(params: {
    freqStart: number;
    freqEnd?: number;
    durationMs: number;
    delayMs?: number;
    type?: OscillatorType;
    gain?: number;
  }): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const {
      freqStart,
      freqEnd = freqStart,
      durationMs,
      delayMs = 0,
      type = 'sine',
      gain = 0.08,
    } = params;

    const startTime = ctx.currentTime + delayMs / 1000;
    const stopTime = startTime + durationMs / 1000;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), stopTime);
    }

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(stopTime + 0.01);
  }

  play(event: SoundEvent, options?: { comboCount?: number }): void {
    if (!this.enabled) return;

    try {
      switch (event) {
        case 'tap':
          this.playTone({
            freqStart: 420,
            freqEnd: 260,
            durationMs: 40,
            type: 'triangle',
            gain: 0.07,
          });
          break;

        case 'tabSwitch':
          this.playTone({
            freqStart: 520,
            freqEnd: 640,
            durationMs: 32,
            type: 'sine',
            gain: 0.06,
          });
          break;

        case 'correct': {
          // Pitch rises by 1 semitone per combo step up to 8!
          const comboSteps = Math.min(8, Math.max(0, (options?.comboCount ?? 1) - 1));
          const semitoneRatio = Math.pow(2, comboSteps / 12);
          const rootFreq = 523.25 * semitoneRatio; // C5 shifted
          const thirdFreq = 659.25 * semitoneRatio; // E5 shifted
          this.playTone({
            freqStart: rootFreq,
            durationMs: 95,
            type: 'triangle',
            gain: 0.1,
          });
          this.playTone({
            freqStart: thirdFreq,
            durationMs: 160,
            delayMs: 75,
            type: 'triangle',
            gain: 0.11,
          });
          break;
        }

        case 'wrong':
          this.playTone({
            freqStart: 240,
            freqEnd: 195,
            durationMs: 110,
            type: 'sine',
            gain: 0.09,
          });
          this.playTone({
            freqStart: 190,
            freqEnd: 155,
            durationMs: 160,
            delayMs: 95,
            type: 'sine',
            gain: 0.09,
          });
          break;

        case 'comboUp':
          // Bright 3-note ascending arpeggio
          this.playTone({ freqStart: 587.33, durationMs: 80, delayMs: 0, type: 'triangle', gain: 0.09 });
          this.playTone({ freqStart: 739.99, durationMs: 80, delayMs: 65, type: 'triangle', gain: 0.1 });
          this.playTone({ freqStart: 880.0, durationMs: 150, delayMs: 130, type: 'triangle', gain: 0.11 });
          break;

        case 'bookmark':
          this.playTone({ freqStart: 784, durationMs: 55, delayMs: 0, type: 'sine', gain: 0.07 });
          this.playTone({ freqStart: 1046.5, durationMs: 95, delayMs: 50, type: 'sine', gain: 0.08 });
          break;

        case 'coin':
          // Classic B5 -> E6 double metallic pling
          this.playTone({ freqStart: 987.77, durationMs: 70, delayMs: 0, type: 'sine', gain: 0.09 });
          this.playTone({ freqStart: 1318.51, durationMs: 190, delayMs: 65, type: 'sine', gain: 0.1 });
          break;

        case 'heartLoss':
          this.playTone({
            freqStart: 320,
            freqEnd: 140,
            durationMs: 180,
            type: 'triangle',
            gain: 0.1,
          });
          break;

        case 'heartRestore':
          // Warm C5 -> E5 -> G5 arpeggio
          this.playTone({ freqStart: 523.25, durationMs: 90, delayMs: 0, type: 'sine', gain: 0.09 });
          this.playTone({ freqStart: 659.25, durationMs: 90, delayMs: 75, type: 'sine', gain: 0.09 });
          this.playTone({ freqStart: 783.99, durationMs: 170, delayMs: 150, type: 'sine', gain: 0.1 });
          break;

        case 'purchase':
          // 4-note joyful fanfare
          this.playTone({ freqStart: 523.25, durationMs: 75, delayMs: 0, type: 'triangle', gain: 0.09 });
          this.playTone({ freqStart: 659.25, durationMs: 75, delayMs: 65, type: 'triangle', gain: 0.09 });
          this.playTone({ freqStart: 783.99, durationMs: 75, delayMs: 130, type: 'triangle', gain: 0.1 });
          this.playTone({ freqStart: 1046.5, durationMs: 210, delayMs: 195, type: 'triangle', gain: 0.11 });
          break;

        case 'rankUp':
          // Full C5 -> E5 -> G5 -> C6 chord spread
          this.playTone({ freqStart: 523.25, durationMs: 120, delayMs: 0, type: 'triangle', gain: 0.1 });
          this.playTone({ freqStart: 659.25, durationMs: 120, delayMs: 90, type: 'triangle', gain: 0.1 });
          this.playTone({ freqStart: 783.99, durationMs: 120, delayMs: 180, type: 'triangle', gain: 0.11 });
          this.playTone({ freqStart: 1046.5, durationMs: 340, delayMs: 270, type: 'triangle', gain: 0.12 });
          break;

        case 'timerWarning':
          this.playTone({ freqStart: 880, durationMs: 55, delayMs: 0, type: 'sine', gain: 0.08 });
          this.playTone({ freqStart: 880, durationMs: 55, delayMs: 110, type: 'sine', gain: 0.08 });
          break;
      }
    } catch {
      // Never crash on Web Audio restrictions
    }
  }
}

/**
 * Phase 2 Adapter Skeleton: maps SoundEvent -> /assets/sfx/${event}.wav with AudioBuffer caching.
 */
export class WavAssetSoundEngine implements ISoundEngine {
  private enabled = true;
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  isEnabled(): boolean {
    return this.enabled;
  }
  play(_event: SoundEvent): void {
    if (!this.enabled) return;
    // Phase 2 implementation loads /assets/sfx/${_event}.wav
  }
}

export const soundEngine: ISoundEngine = new ProceduralWebAudioSoundEngine();

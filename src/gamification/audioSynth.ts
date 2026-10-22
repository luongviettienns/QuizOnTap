/**
 * Offline Web Audio Synthesizer
 * Generates crisp, pleasant melodic tones without downloading external audio files.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtxClass) return null;

  if (!audioCtx) {
    try {
      audioCtx = new AudioCtxClass();
    } catch {
      return null;
    }
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

export type ToneType = 'correct' | 'wrong' | 'victory' | 'click' | 'flip' | 'alert' | 'complete';

export function isAudioMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('quizontap_mute') === 'true';
  } catch {
    return false;
  }
}

export function playTone(type: ToneType, soundEnabled: boolean = true): void {
  if (!soundEnabled || isAudioMuted()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    if (type === 'correct') {
      // Cheerful 2-note arpeggio (E5 -> A5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.setValueAtTime(880.0, now + 0.1); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.setValueAtTime(880.0, now + 0.1);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'wrong') {
      // Soft gentle boop (Eb3 -> D3)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(155.56, now); // Eb3
      osc.frequency.linearRampToValueAtTime(146.83, now + 0.25); // D3

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'victory') {
      // Celebratory fanfare (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        gain.gain.setValueAtTime(0.18, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } else if (type === 'complete') {
      // Satisfying chord triad (C5 -> F5 -> A5)
      const notes = [523.25, 698.46, 880.0];
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        gain.gain.setValueAtTime(0.14, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.32);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.32);
      });
    } else if (type === 'flip') {
      // Tactile card whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'alert') {
      // Gentle reminder ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'click') {
      // Crisp click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // Graceful fallback: audio autoplay policies or unsupported browser
  }
}

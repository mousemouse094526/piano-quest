// Short synthesized notes for right answers (D5). Sound is never allowed to break the
// game: every Web Audio call is wrapped and failures are dropped silently (D20).

/** Safari 17+ Audio Session API; `playback` keeps sound on when an iPhone is set to silent. */
type NavigatorWithAudioSession = Navigator & { audioSession?: { type: string } };

const ATTACK_S = 0.01;
const DECAY_S = 0.4;
const PEAK_GAIN = 0.3;
/** Exponential ramps cannot reach 0, so envelopes start and end here. */
const SILENT_GAIN = 0.0001;

export type NotePlayer = {
  /** Call inside the tap or key press that turns sound on: browsers unlock audio only there. */
  prepare: () => void;
  /** Plays `hz` briefly; creates the context first if `prepare` never ran (e.g. `sound=on` in the URL). */
  play: (hz: number) => void;
};

export function createNotePlayer(
  makeContext: () => AudioContext = () => new AudioContext(),
): NotePlayer {
  let context: AudioContext | null = null;

  function prepare() {
    try {
      if (!context) {
        const { audioSession } = navigator as NavigatorWithAudioSession;
        if (audioSession) audioSession.type = 'playback';
        context = makeContext();
      }
      // D20: resume on every press. Autoplay policy (or an iOS interruption) can leave the
      // context suspended until a user gesture resumes it; on a running one it is a no-op.
      context.resume().catch(() => {});
    } catch {
      context = null;
    }
  }

  function play(hz: number) {
    prepare();
    if (!context) return;
    try {
      const t = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(hz, t);
      gain.gain.setValueAtTime(SILENT_GAIN, t);
      gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, t + ATTACK_S);
      gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, t + ATTACK_S + DECAY_S);
      oscillator.connect(gain).connect(context.destination);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(t);
      oscillator.stop(t + ATTACK_S + DECAY_S);
    } catch {
      // D20: a broken audio stack only costs the sound.
    }
  }

  return { prepare, play };
}

/** The app's one player; one `AudioContext` serves every Round. */
export const notePlayer = createNotePlayer();

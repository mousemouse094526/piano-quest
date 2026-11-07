import { describe, expect, test, vi } from 'vitest';
import { createNotePlayer } from './notePlayer';

/** Just enough of an `AudioContext` for `play`; `vi.fn` records the calls. */
function fakeContext(state: AudioContextState = 'running') {
  const node = () => ({ connect: vi.fn((next) => next), disconnect: vi.fn() });
  const param = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  const oscillator = {
    ...node(),
    type: 'sine',
    frequency: param(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  };
  return {
    state,
    currentTime: 0,
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => ({ ...node(), gain: param() })),
    oscillator,
  };
}

describe('note player', () => {
  test('plays the given frequency once per call', () => {
    const ctx = fakeContext();
    const player = createNotePlayer(() => ctx as unknown as AudioContext);
    player.play(392);
    expect(ctx.oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(392, 0);
    expect(ctx.oscillator.start).toHaveBeenCalledOnce();
    expect(ctx.oscillator.stop).toHaveBeenCalledOnce();
  });

  test('a suspended context is resumed when a note plays', () => {
    const ctx = fakeContext('suspended');
    const player = createNotePlayer(() => ctx as unknown as AudioContext);
    player.play(440);
    expect(ctx.resume).toHaveBeenCalled();
  });

  test('one context serves every play', () => {
    const make = vi.fn(() => fakeContext() as unknown as AudioContext);
    const player = createNotePlayer(make);
    player.prepare();
    player.play(261.63);
    player.play(293.66);
    expect(make).toHaveBeenCalledOnce();
  });

  test('no Web Audio (constructor throws) → play does not throw', () => {
    const player = createNotePlayer(() => {
      throw new ReferenceError('AudioContext is not defined');
    });
    expect(() => player.prepare()).not.toThrow();
    expect(() => player.play(392)).not.toThrow();
  });

  test('a node call that throws, or a rejected resume, is swallowed', async () => {
    const ctx = fakeContext('suspended');
    ctx.resume.mockImplementation(() =>
      Promise.reject(new DOMException('closed', 'InvalidStateError')),
    );
    ctx.createOscillator.mockImplementation(() => {
      throw new Error('InvalidStateError');
    });
    const player = createNotePlayer(() => ctx as unknown as AudioContext);
    expect(() => player.play(392)).not.toThrow();
    // Let the rejected promise settle; an unhandled rejection would fail the run.
    await Promise.resolve();
  });
});

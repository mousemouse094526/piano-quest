import { describe, expect, test } from 'vitest';
import { reduce, results, startRound, timeLeft } from './round';
import type { Choice, Direction, RoundState, Settings } from './types';

const count10: Settings = { mode: 'count', len: 10, dir: 'solfege-to-letter' };

function rightChoice(s: RoundState): Choice {
  return {
    kind: s.current.ask === 'solfege' ? 'letter' : 'solfege',
    note: s.current.note,
  };
}

function wrongChoice(s: RoundState): Choice {
  const right = rightChoice(s);
  return { ...right, note: right.note === 7 ? 1 : ((right.note + 1) as Choice['note']) };
}

function answer(s: RoundState, choice: Choice, now: number): RoundState {
  return reduce(s, { type: 'answer', choice, now });
}

describe('count mode', () => {
  test('10 right answers → finished, accuracy 100', () => {
    let s = startRound(count10, 1);
    for (let i = 0; i < 10; i++) s = answer(s, rightChoice(s), i * 500);
    expect(s.status).toBe('finished');
    expect(results(s).accuracy).toBe(100);
  });

  test('3 wrong of 10 → 3 misses with prompt, answer and correct note; accuracy 70', () => {
    let s = startRound(count10, 2);
    const expected: { prompt: RoundState['current']; answered: number }[] = [];
    for (let i = 0; i < 10; i++) {
      if ([3, 6, 9].includes(i)) {
        const choice = wrongChoice(s);
        expected.push({ prompt: s.current, answered: choice.note });
        s = answer(s, choice, i * 500);
      } else {
        s = answer(s, rightChoice(s), i * 500);
      }
    }
    const r = results(s);
    expect(r.wrong).toBe(3);
    expect(r.misses).toEqual(expected);
    for (const m of r.misses) expect(m.answered).not.toBe(m.prompt.note);
    expect(r.accuracy).toBe(70);
  });

  test('one answer per 1000 ms from t=0 to t=9000, all right → 67 notes/min, 0.90 s each', () => {
    let s = startRound(count10, 3);
    for (let i = 0; i < 10; i++) s = answer(s, rightChoice(s), i * 1000);
    const r = results(s);
    expect(r.notesPerMinute).toBe(67);
    expect(r.secondsPerAnswer).toBe(0.9);
  });
});

describe('time mode', () => {
  const time15: Settings = { mode: 'time', len: 15, dir: 'solfege-to-letter' };

  test('first answer at t=0, tick at t=15000 → finished, endedAt 15000', () => {
    let s = startRound(time15, 4);
    s = answer(s, rightChoice(s), 0);
    expect(s.status).toBe('running');
    s = reduce(s, { type: 'tick', now: 14_999 });
    expect(s.status).toBe('running');
    s = reduce(s, { type: 'tick', now: 15_000 });
    expect(s.status).toBe('finished');
    expect(s.endedAt).toBe(15_000);
  });

  test('answer at t=16000 after first answer at t=0 → finished at 15000, late answer not counted', () => {
    let s = startRound(time15, 5);
    s = answer(s, rightChoice(s), 0);
    s = answer(s, rightChoice(s), 16_000);
    expect(s.status).toBe('finished');
    expect(s.endedAt).toBe(15_000);
    expect(results(s).correct).toBe(1);
    expect(results(s).wrong).toBe(0);
  });

  test('time left: full length before the first answer, counts down after, never below 0', () => {
    let s = startRound(time15, 15);
    expect(timeLeft(s, 99_999)).toBe(15_000);
    s = answer(s, rightChoice(s), 1000);
    expect(timeLeft(s, 5000)).toBe(11_000);
    expect(timeLeft(s, 20_000)).toBe(0);
    expect(timeLeft(startRound(count10, 1), 0)).toBeNull();
  });

  test('no answer yet → tick at any time stays ready', () => {
    let s = startRound(time15, 6);
    s = reduce(s, { type: 'tick', now: 1_000_000 });
    expect(s.status).toBe('ready');
    expect(s.startedAt).toBeNull();
  });
});

describe('zen mode', () => {
  const zen: Settings = { mode: 'zen', dir: 'solfege-to-letter' };

  test('end after 5 answers → finished', () => {
    let s = startRound(zen, 7);
    for (let i = 0; i < 5; i++) s = answer(s, rightChoice(s), i * 700);
    s = reduce(s, { type: 'end', now: 4000 });
    expect(s.status).toBe('finished');
    expect(s.endedAt).toBe(4000);
    expect(results(s).correct).toBe(5);
  });

  test('end after a single answer → speed is null (D25)', () => {
    let s = startRound(zen, 8);
    s = answer(s, rightChoice(s), 2000);
    s = reduce(s, { type: 'end', now: 7000 });
    expect(s.status).toBe('finished');
    expect(results(s).notesPerMinute).toBeNull();
    expect(results(s).secondsPerAnswer).toBeNull();
  });

  test('end before any answer → stays ready', () => {
    const s = reduce(startRound(zen, 9), { type: 'end', now: 5000 });
    expect(s.status).toBe('ready');
  });
});

describe('prompts', () => {
  function sequence(dir: Direction, seed: number, n: number) {
    let s = startRound({ mode: 'zen', dir }, seed);
    const seen = [s.current];
    for (let i = 0; i < n - 1; i++) {
      s = answer(s, rightChoice(s), i);
      seen.push(s.current);
    }
    return seen;
  }

  test('same seed → same prompt order', () => {
    expect(sequence('mixed', 42, 50)).toEqual(sequence('mixed', 42, 50));
    expect(sequence('mixed', 42, 50)).not.toEqual(sequence('mixed', 43, 50));
  });

  test.each<Direction>(['solfege-to-letter', 'letter-to-solfege', 'mixed'])(
    '1000 prompts in %s → no note twice in a row',
    (dir) => {
      const seen = sequence(dir, 1234, 1000);
      for (let i = 1; i < seen.length; i++) expect(seen[i]?.note).not.toBe(seen[i - 1]?.note);
    },
  );

  test('fixed directions ask the matching side; mixed asks both', () => {
    expect(sequence('solfege-to-letter', 1, 30).every((p) => p.ask === 'solfege')).toBe(true);
    expect(sequence('letter-to-solfege', 1, 30).every((p) => p.ask === 'letter')).toBe(true);
    const asks = new Set(sequence('mixed', 1, 30).map((p) => p.ask));
    expect(asks).toEqual(new Set(['solfege', 'letter']));
  });

  test('start shows the current prompt and 3 upcoming, not timed yet', () => {
    const s = startRound(count10, 10);
    expect(s.status).toBe('ready');
    expect(s.upcoming).toHaveLength(3);
    expect(s.startedAt).toBeNull();
  });
});

describe('ignored events', () => {
  test('mixed: a key from the other key set (letters for a letter Prompt) is ignored, not a miss', () => {
    let s = startRound({ mode: 'count', len: 10, dir: 'mixed' }, 11);
    s = answer(s, rightChoice(s), 0);
    const before = s;
    const wrongSet: Choice = {
      ...rightChoice(s),
      kind: rightChoice(s).kind === 'letter' ? 'solfege' : 'letter',
    };
    s = answer(s, wrongSet, 100);
    expect(s).toEqual(before);
    expect(s.misses).toHaveLength(0);
  });

  test('events after finished change nothing', () => {
    let s = startRound(count10, 12);
    for (let i = 0; i < 10; i++) s = answer(s, rightChoice(s), i * 100);
    const done = s;
    s = answer(s, rightChoice(s), 5000);
    s = reduce(s, { type: 'tick', now: 99_999 });
    s = reduce(s, { type: 'end', now: 99_999 });
    expect(s).toEqual(done);
  });

  test('start after finished begins a new ready round', () => {
    let s = startRound(count10, 13);
    for (let i = 0; i < 10; i++) s = answer(s, rightChoice(s), i * 100);
    s = reduce(s, { type: 'start', settings: count10, seed: 14 });
    expect(s.status).toBe('ready');
    expect(s.correct).toBe(0);
  });
});

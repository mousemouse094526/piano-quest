import { describe, expect, test } from 'vitest';
import { reduce, startRound } from '../engine/round';
import type { Choice, Note, RoundState, Settings, Side } from '../engine/types';
import { buildShareText } from './shareText';

const SKETCH_URL =
  'https://mousemouse094526.github.io/piano-quest/#/?mode=count&len=10&dir=solfege-to-letter&script=th&sound=off';

function rightChoice(s: RoundState): Choice {
  return { kind: s.current.ask === 'solfege' ? 'letter' : 'solfege', note: s.current.note };
}

/** The next note up, wrapping B → C: G is answered A, B is answered C. */
function wrongChoice(s: RoundState): Choice {
  const right = rightChoice(s);
  return { ...right, note: ((right.note % 7) + 1) as Note };
}

function answer(s: RoundState, choice: Choice, now: number): RoundState {
  return reduce(s, { type: 'answer', choice, now });
}

/** A zen Round of `misses` wrong answers then one right one, ended with `Esc`. */
function zenRound(dir: Settings['dir'], misses: number): RoundState {
  let s = startRound({ mode: 'zen', dir }, 3);
  for (let i = 0; i < misses; i++) s = answer(s, wrongChoice(s), i * 1000);
  s = answer(s, rightChoice(s), misses * 1000);
  return reduce(s, { type: 'end', now: misses * 1000 });
}

/** The miss rows of a Share text, between the heading and the blank line after them. */
function missRows(text: string): string[] {
  const lines = text.split('\n');
  const start = lines.indexOf('ข้อที่ผิด (โจทย์ / ตอบ / ที่ถูก)') + 1;
  return lines.slice(start, lines.indexOf('', start));
}

describe('buildShareText', () => {
  test('count 10 ไทย โด→C, 8 right 2 wrong in 15 s → the first sketch, every character', () => {
    // Seed 1 asks ซอล first and ที fourth; those two are answered wrong.
    let s = startRound({ mode: 'count', len: 10, dir: 'solfege-to-letter' }, 1);
    for (let i = 0; i < 10; i++) {
      const choice = i === 0 || i === 3 ? wrongChoice(s) : rightChoice(s);
      // First answer at 0 s, last at 15 s.
      s = answer(s, choice, (i * 15_000) / 9);
    }
    expect(buildShareText(s, 'th', SKETCH_URL)).toBe(
      [
        'Piano Quest — ผลรอบนี้',
        'count 10 ข้อ · โด→C · ไทย',
        '',
        'ถูก 8',
        'ผิด 2',
        'ความแม่น 80%',
        'โน้ตต่อนาที 32',
        'เวลาเฉลี่ยต่อข้อ 1.50 วินาที',
        '',
        'ข้อที่ผิด (โจทย์ / ตอบ / ที่ถูก)',
        'ซอล / A / G',
        'ที / C / B',
        '',
        `เล่นค่าเดียวกัน: ${SKETCH_URL}`,
      ].join('\n'),
    );
  });

  test('zen, one right answer → both speeds "—" and no misses', () => {
    let s = startRound({ mode: 'zen', dir: 'mixed' }, 1);
    s = answer(s, rightChoice(s), 0);
    s = reduce(s, { type: 'end', now: 4000 });
    expect(buildShareText(s, 'en', 'URL')).toBe(
      [
        'Piano Quest — ผลรอบนี้',
        'zen · สลับ · อังกฤษ',
        '',
        'ถูก 1',
        'ผิด 0',
        'ความแม่น 100%',
        'โน้ตต่อนาที —',
        'เวลาเฉลี่ยต่อข้อ —',
        '',
        'ไม่ผิดสักข้อ',
        '',
        'เล่นค่าเดียวกัน: URL',
      ].join('\n'),
    );
  });

  test('mixed ไทย → each row reads the Prompt, the answer and the right note on their own sides', () => {
    // G asked as a letter is answered ฟา; ซอล asked in solfège is answered A; the rest right.
    const wrongFor = (note: Note, ask: Side): Choice | null => {
      if (note !== 5) return null;
      return ask === 'letter' ? { kind: 'solfege', note: 4 } : { kind: 'letter', note: 6 };
    };
    const missed = new Set<Side>();
    let s = startRound({ mode: 'zen', dir: 'mixed' }, 1);
    for (let i = 0; missed.size < 2 && i < 200; i++) {
      const wrong = missed.has(s.current.ask) ? null : wrongFor(s.current.note, s.current.ask);
      if (wrong) missed.add(s.current.ask);
      s = answer(s, wrong ?? rightChoice(s), i * 1000);
    }
    s = reduce(s, { type: 'end', now: 200_000 });
    expect(new Set(missRows(buildShareText(s, 'th', 'URL')))).toEqual(
      new Set(['G / ฟา / ซอล', 'ซอล / A / G']),
    );
  });

  test('27 misses → the first 20 rows in answer order, then how many more', () => {
    const s = zenRound('solfege-to-letter', 27);
    const rows = missRows(buildShareText(s, 'th', 'URL'));
    expect(rows).toHaveLength(21);
    expect(rows.at(-1)).toBe('และอีก 7 ข้อ');
    expect(missRows(buildShareText({ ...s, misses: s.misses.slice(0, 20) }, 'th', 'URL'))).toEqual(
      rows.slice(0, 20),
    );
  });

  // The 20-row cap is what keeps a long zen Round short enough to send in one chat message.
  test('1,000 misses → no longer than 1,000 characters', () => {
    expect(buildShareText(zenRound('mixed', 1000), 'th', SKETCH_URL).length).toBeLessThanOrEqual(
      1000,
    );
  });
});

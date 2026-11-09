import { answerKind, results } from '../engine/round';
import type { Miss, RoundState } from '../engine/types';
import type { Script } from '../search';
import { asPercent, asSeconds, asWhole, NO_VALUE } from './format';
import { noteLabel, promptLabel, roundLabel } from './labels';

/** share-results D7: `zen` and `time` 120 can miss hundreds; past this the text says how many more. */
const MAX_MISS_ROWS = 20;

/**
 * share-results D4, D7: the Share text of a finished Round — its settings, the five Results
 * numbers, the misses, and a link that plays the same settings (`url`, the page's address).
 * No name and no date (ADR-0008). Layout: `docs/features/share-results/sketch-share-text.md`.
 */
export function buildShareText(state: RoundState, script: Script, url: string): string {
  const r = results(state);
  const orNone = (n: number | null, format: (n: number) => string) =>
    n === null ? NO_VALUE : format(n);
  // On screen the unit sits in the label; in a chat message it reads after the number.
  const seconds = orNone(r.secondsPerAnswer, (n) => `${asSeconds(n)} วินาที`);
  return [
    'Piano Quest — ผลรอบนี้',
    roundLabel(state.settings, script),
    '',
    `ถูก ${asWhole(r.correct)}`,
    `ผิด ${asWhole(r.wrong)}`,
    `ความแม่น ${asPercent(r.accuracy)}`,
    `โน้ตต่อนาที ${orNone(r.notesPerMinute, asWhole)}`,
    `เวลาเฉลี่ยต่อข้อ ${seconds}`,
    '',
    ...missLines(r.misses, script),
    '',
    `เล่นค่าเดียวกัน: ${url}`,
  ].join('\n');
}

/** `โจทย์ / ตอบ / ที่ถูก` per miss in answer order, as the Results table reads them (D7). */
function missLines(misses: Miss[], script: Script): string[] {
  if (misses.length === 0) return ['ไม่ผิดสักข้อ'];
  const rows = misses.slice(0, MAX_MISS_ROWS).map((miss) => {
    const side = answerKind(miss.prompt);
    return [
      promptLabel(miss.prompt, script),
      noteLabel(miss.answered, side, script),
      noteLabel(miss.prompt.note, side, script),
    ].join(' / ');
  });
  const more = misses.length - rows.length;
  return ['ข้อที่ผิด (โจทย์ / ตอบ / ที่ถูก)', ...rows, ...(more > 0 ? [`และอีก ${more} ข้อ`] : [])];
}

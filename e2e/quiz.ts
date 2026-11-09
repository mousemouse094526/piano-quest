import { expect, type Locator, type Page } from '@playwright/test';
import { NOTES } from '../src/features/note-name-quiz/engine/notes';
import type { Note } from '../src/features/note-name-quiz/engine/types';
import { keySetOf } from '../src/features/note-name-quiz/hooks/keys';
import type { KeymapSearch } from '../src/features/note-name-quiz/search';

// Helpers shared by the e2e specs: they read the screen the way a Player does.

export const START_HINT = 'กดปุ่มคำตอบเพื่อเริ่ม';
export const ALL_NOTES = Object.keys(NOTES).map(Number) as Note[];

/** spec.md › Data keys, as the URL writes them (D34). */
export const DEFAULT_KEYS: KeymapSearch = { 'letter-keys': 'CDEFGAB', 'solfege-keys': '1234567' };

/** The Prompt on screen, the note that answers it, one that misses it, and their keys. */
export async function readPrompt(page: Page, keys: KeymapSearch = DEFAULT_KEYS) {
  const prompt = page.getByTestId('prompt');
  const label = (await prompt.textContent())?.trim() ?? '';
  const right = ALL_NOTES.find((n) => {
    const info = NOTES[n];
    return [info.letter, info.th, info.en].includes(label);
  });
  if (!right) throw new Error(`unknown Prompt "${label}"`);
  // spec.md › Data: a letter Prompt is answered with the solfège keys, and the other way round.
  const askedLetter = NOTES[right].letter === label;
  const answerKeys = keySetOf(askedLetter ? keys['solfege-keys'] : keys['letter-keys']);
  if (!answerKeys) throw new Error('not a valid Keymap');
  const keyOf = (n: Note) => answerKeys[n];
  const wrong = ((right % 7) + 1) as Note; // the next note up, wrapping B → C
  return { label, right, wrong, keyOf, askedLetter };
}

/** Each answer moves on to a new Prompt (never the same note twice in a row), or to Results. */
export async function waitForNextPrompt(page: Page, label: string) {
  const samePrompt = page.getByTestId('prompt').filter({ hasText: new RegExp(`^${label}$`) });
  await expect(samePrompt).toHaveCount(0);
}

export async function answer(page: Page, right: boolean) {
  const p = await readPrompt(page);
  await page.keyboard.press(p.keyOf(right ? p.right : p.wrong));
  await waitForNextPrompt(page, p.label);
}

/** The on-screen button for `note`; buttons run C–B (or โด–ที) left to right. */
export function answerButton(page: Page, note: Note) {
  return answerButtons(page).nth(note - 1);
}

/** A tap on a phone, a click on desktop: both answer (D6). */
export async function press(button: Locator, isMobile: boolean) {
  await (isMobile ? button.tap() : button.click());
}

export function resultsHeading(page: Page) {
  return page.getByRole('heading', { name: 'ผลรอบนี้' });
}

/** Replaces Web Audio with a stub that counts the notes started. */
export async function countNotesPlayed(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { notesPlayed: number };
    w.notesPlayed = 0;
    const param = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
    const node = () => ({ connect: (next: unknown) => next, disconnect() {} });
    window.AudioContext = class {
      state = 'running';
      currentTime = 0;
      destination = {};
      resume = () => Promise.resolve();
      createGain = () => ({ ...node(), gain: param });
      createOscillator = () => ({
        ...node(),
        frequency: param,
        start: () => {
          w.notesPlayed += 1;
        },
        stop() {},
      });
    } as unknown as typeof AudioContext;
  });
  return () => page.evaluate(() => (window as unknown as { notesPlayed: number }).notesPlayed);
}

export function answerButtons(page: Page) {
  return page.getByTestId('answer-row').getByRole('button');
}

export function stat(page: Page, label: string) {
  return page
    .locator('dl > div')
    .filter({ has: page.locator('dt', { hasText: new RegExp(`^${label}$`) }) })
    .locator('dd');
}

/** Fails the test on any console error or uncaught page error. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}
/** Fails unless the page has no sideways scroll at `width` px. */
export async function expectNoSidewaysScroll(page: Page, width: number) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(width);
}

import { expect, type Locator, type Page, test } from '@playwright/test';
import { NOTES } from '../src/features/note-name-quiz/engine/notes';
import type { Note } from '../src/features/note-name-quiz/engine/types';

// spec.md › Seams › 2: one Round played through the real UI. Keys go through
// `page.keyboard`, never synthetic events, so focus rules apply as for a Player.

const START_HINT = 'กดปุ่มคำตอบเพื่อเริ่ม';
const ALL_NOTES = Object.keys(NOTES).map(Number) as Note[];

/** The Prompt on screen, the note that answers it, one that misses it, and their keys. */
async function readPrompt(page: Page) {
  const prompt = page.getByTestId('prompt');
  const label = (await prompt.textContent())?.trim() ?? '';
  const right = ALL_NOTES.find((n) => {
    const info = NOTES[n];
    return [info.letter, info.th, info.en].includes(label);
  });
  if (!right) throw new Error(`unknown Prompt "${label}"`);
  // spec.md › Data: a letter Prompt is answered with 1–7, a solfège Prompt with C–B.
  const askedLetter = NOTES[right].letter === label;
  const keyOf = (n: Note) => (askedLetter ? `Digit${n}` : `Key${NOTES[n].letter}`);
  const wrong = ((right % 7) + 1) as Note; // the next note up, wrapping B → C
  return { label, right, wrong, keyOf };
}

/** Each answer moves on to a new Prompt (never the same note twice in a row), or to Results. */
async function waitForNextPrompt(page: Page, label: string) {
  const samePrompt = page.getByTestId('prompt').filter({ hasText: new RegExp(`^${label}$`) });
  await expect(samePrompt).toHaveCount(0);
}

async function answer(page: Page, right: boolean) {
  const p = await readPrompt(page);
  await page.keyboard.press(p.keyOf(right ? p.right : p.wrong));
  await waitForNextPrompt(page, p.label);
}

/** The on-screen button for `note`; buttons run C–B (or โด–ที) left to right. */
function answerButton(page: Page, note: Note) {
  return answerButtons(page).nth(note - 1);
}

/** A tap on a phone, a click on desktop: both answer (D6). */
async function press(button: Locator, isMobile: boolean) {
  await (isMobile ? button.tap() : button.click());
}

function resultsHeading(page: Page) {
  return page.getByRole('heading', { name: 'ผลรอบนี้' });
}

/** Replaces Web Audio with a stub that counts the notes started. */
async function countNotesPlayed(page: Page) {
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

function answerButtons(page: Page) {
  return page.getByTestId('answer-row').getByRole('button');
}

function stat(page: Page, label: string) {
  return page
    .locator('dl > div')
    .filter({ has: page.locator('dt', { hasText: new RegExp(`^${label}$`) }) })
    .locator('dd');
}

/** Fails the test on any console error or uncaught page error. */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

test('count 10 with 2 misses → miss counter 2, Results list 2 answers', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  for (let i = 0; i < 10; i++) {
    await answer(page, i !== 3 && i !== 7);
    if (i === 3) await expect(page.getByTestId('miss-count')).toHaveText('ผิด 1');
    if (i === 8) await expect(page.getByTestId('miss-count')).toHaveText('ผิด 2');
  }
  await expect(resultsHeading(page)).toBeVisible();
  await expect(stat(page, 'ผิด')).toHaveText('2');
  await expect(page.getByTestId('miss-list').locator('tbody tr')).toHaveCount(2);
});

test('a miss marks the Prompt and the pressed button', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  await expect(page.getByTestId('prompt')).not.toHaveAttribute('data-missed');
  const { wrong } = await readPrompt(page);
  await answerButton(page, wrong).click();
  await expect(page.getByTestId('prompt')).toHaveAttribute('data-missed', 'true');
  await expect(answerButton(page, wrong).getByTestId('miss-mark')).toBeAttached();
});

test('holding G answers once', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  // The app must be mounted (its key listener attached) before the first key.
  await expect(page.getByTestId('prompt')).toBeVisible();
  // Repeated `down` without `up` is sent as key repeat (`event.repeat`).
  await page.keyboard.down('KeyG');
  await page.keyboard.down('KeyG');
  await page.keyboard.down('KeyG');
  await page.keyboard.up('KeyG');
  await expect(page.getByTestId('answered')).toHaveText(/1\/10/);
});

test('tapping the on-screen buttons plays a whole Round', async ({ page, isMobile }) => {
  await page.goto('#/?mode=count&len=10');
  for (let i = 0; i < 10; i++) {
    const p = await readPrompt(page);
    await press(answerButton(page, p.right), isMobile);
    await waitForNextPrompt(page, p.label);
  }
  await expect(resultsHeading(page)).toBeVisible();
  await expect(stat(page, 'ถูก')).toHaveText('10');
});

test('Enter or Space after a tap does not answer again', async ({ page, isMobile }) => {
  await page.goto('#/?mode=count&len=10');
  await press(answerButton(page, (await readPrompt(page)).right), isMobile);
  await expect(page.getByTestId('answered')).toHaveText(/1\/10/);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(page.getByTestId('answered')).toHaveText(/1\/10/);
});

test('button labels follow the Direction, with shortcut hints', async ({ page }) => {
  await page.goto('#/?mode=count&len=10&dir=letter-to-solfege&script=th');
  await expect(answerButtons(page)).toHaveText(['โด1', 'เร2', 'มี3', 'ฟา4', 'ซอล5', 'ลา6', 'ที7']);
  await page.goto('#/?mode=count&len=10&dir=solfege-to-letter');
  await expect(answerButtons(page)).toHaveText(['CC', 'DD', 'EE', 'FF', 'GG', 'AA', 'BB']);
});

test('375 px wide → the 7 buttons fit on one row', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('#/?mode=count&len=10&dir=letter-to-solfege');
  const boxes = await Promise.all(
    (await answerButtons(page).all()).map(async (b) => {
      const box = await b.boundingBox();
      if (!box) throw new Error('button not rendered');
      return box;
    }),
  );
  expect(new Set(boxes.map((b) => Math.round(b.y))).size).toBe(1);
  const right = Math.max(...boxes.map((b) => b.x + b.width));
  expect(right).toBeLessThanOrEqual(375);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(375);
});

test('Tab mid-Round restarts and keeps focus', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  await answer(page, true);
  await expect(page.getByText(START_HINT)).toBeHidden();
  const gameArea = page.getByRole('region', { name: 'พื้นที่เกม' });
  await expect(gameArea).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByText(START_HINT)).toBeVisible();
  await expect(page.getByTestId('answered')).toHaveText(/0\/10/);
  await expect(gameArea).toBeFocused();
});

test('Tab on Results → a new Game, clock not started', async ({ page }) => {
  await page.goto('#/?mode=time&len=15');
  await answer(page, true);
  await expect(resultsHeading(page)).toBeVisible({ timeout: 20_000 });
  await page.keyboard.press('Tab');
  await expect(page.getByText(START_HINT)).toBeVisible();
  const timer = page.getByRole('timer');
  await expect(timer).toHaveText('15');
  await page.waitForTimeout(1500); // the clock would have moved by now if it were running
  await expect(timer).toHaveText('15');
});

test('zen: 3 answers then Esc → Results', async ({ page }) => {
  await page.goto('#/?mode=zen');
  for (let i = 0; i < 3; i++) await answer(page, true);
  await page.keyboard.press('Escape');
  await expect(resultsHeading(page)).toBeVisible();
  await expect(stat(page, 'ถูก')).toHaveText('3');
});

test('English Script goes in the URL and survives a refresh', async ({ page }) => {
  await page.goto('#/?mode=count&len=10&dir=solfege-to-letter');
  const doReMi = new RegExp(`^(${ALL_NOTES.map((n) => NOTES[n].en).join('|')})$`);
  await page.getByRole('radio', { name: 'อังกฤษ' }).click();
  await expect(page).toHaveURL(/script=en/);
  await expect(page.getByTestId('prompt')).toHaveText(doReMi);
  await page.reload();
  await expect(page.getByRole('radio', { name: 'อังกฤษ' })).toBeChecked();
  await expect(page.getByTestId('prompt')).toHaveText(doReMi);
});

test('sound on mid-Round keeps the counter; a right answer logs no error', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('#/?mode=count&len=10');
  await answer(page, true);
  await answer(page, true);
  await page.getByRole('button', { name: 'เสียง' }).click();
  await expect(page).toHaveURL(/sound=on/);
  await expect(page.getByTestId('answered')).toHaveText(/2\/10/);
  // Mode bar clicks keep focus on the game area, so answer keys still work (D26).
  await answer(page, true);
  await expect(page.getByTestId('answered')).toHaveText(/3\/10/);
  expect(errors).toEqual([]);
});

test('sound on: a right answer plays a note, a wrong one does not', async ({ page }) => {
  const notesPlayed = await countNotesPlayed(page);
  await page.goto('#/?mode=count&len=10&sound=on');
  await answer(page, true);
  expect(await notesPlayed()).toBe(1);
  await answer(page, false);
  expect(await notesPlayed()).toBe(1);
});

test('Web Audio that throws → the Round goes on, no console error', async ({ page }) => {
  await page.addInitScript(() => {
    // Simulates a browser without working Web Audio.
    window.AudioContext = class {
      constructor() {
        throw new Error('no audio here');
      }
    } as unknown as typeof AudioContext;
  });
  const errors = watchErrors(page);
  await page.goto('#/?mode=count&len=10&sound=on');
  await answer(page, true);
  await answer(page, true);
  await expect(page.getByTestId('answered')).toHaveText(/2\/10/);
  expect(errors).toEqual([]);
});

test('after a Round, storage and cookies stay empty', async ({ page, context }) => {
  await page.goto('#/?mode=zen&sound=on');
  for (let i = 0; i < 3; i++) await answer(page, i !== 1);
  await page.keyboard.press('Escape');
  await expect(resultsHeading(page)).toBeVisible();
  const stored = await page.evaluate(() => [
    window.localStorage.length,
    window.sessionStorage.length,
  ]);
  expect(stored).toEqual([0, 0]);
  expect(await context.cookies()).toEqual([]);
});

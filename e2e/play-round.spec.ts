import { expect, test } from '@playwright/test';
import { NOTES } from '../src/features/note-name-quiz/engine/notes';
import {
  ALL_NOTES,
  answer,
  answerButton,
  answerButtons,
  countNotesPlayed,
  expectNoSidewaysScroll,
  press,
  readPrompt,
  resultsHeading,
  START_HINT,
  stat,
  waitForNextPrompt,
  watchErrors,
} from './quiz';

// spec.md › Seams › 2: one Round played through the real UI. Keys go through
// `page.keyboard`, never synthetic events, so focus rules apply as for a Player.

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

test('a miss shakes the Prompt and marks the pressed button with X', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  const prompt = page.getByTestId('prompt');
  await expect(prompt).toHaveCSS('animation-name', 'none');
  const { wrong } = await readPrompt(page);
  await answerButton(page, wrong).click();
  // The shake (or, with reduced motion, the red flash) plays on the new Prompt.
  await expect(prompt).toHaveCSS('animation-name', /^miss/);
  await expect(answerButton(page, wrong).getByTestId('miss-mark')).toBeVisible();
});

test('a right answer flashes the pressed button, with no X', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  const { right } = await readPrompt(page);
  await answerButton(page, right).click();
  await expect(answerButton(page, right)).toHaveCSS('animation-name', 'hit');
  await expect(answerButton(page, right).getByTestId('miss-mark')).toHaveCount(0);
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

test('Ctrl, Cmd or Alt with an answer key does not answer', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  await expect(page.getByTestId('prompt')).toBeVisible();
  const p = await readPrompt(page);
  for (const modifier of ['Control', 'Meta', 'Alt']) {
    await page.keyboard.press(`${modifier}+${p.keyOf(p.right)}`);
  }
  await expect(page.getByText(START_HINT)).toBeVisible();
  await expect(page.getByTestId('answered')).toHaveText(/0\/10/);
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
  await expectNoSidewaysScroll(page, 375);
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
  // A fake clock: the 15 s Round and the idle check run without real waiting.
  await page.clock.install();
  await page.goto('#/?mode=time&len=15');
  await answer(page, true);
  await page.clock.runFor(15_000);
  await expect(resultsHeading(page)).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByText(START_HINT)).toBeVisible();
  const timer = page.getByRole('timer');
  await expect(timer).toHaveText('15');
  await page.clock.runFor(2_000);
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

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

test('a miss shakes the missed Prompt beside the new one and marks the button with X', async ({
  page,
}) => {
  await page.goto('#/?mode=count&len=10');
  const { label, wrong } = await readPrompt(page);
  await answerButton(page, wrong).click();
  await waitForNextPrompt(page, label);
  // D44: the miss reads as the old Prompt's; the new Prompt looks as any other.
  const missed = page.getByTestId('missed-prompt');
  await expect(missed).toHaveText(label);
  await expect(missed).toHaveCSS('animation-name', 'miss, miss-fade');
  await expect(page.getByTestId('prompt')).toHaveCSS('animation-name', 'none');
  await expect(answerButton(page, wrong).getByTestId('miss-mark')).toBeVisible();
  await expect(missed).toBeInViewport({ ratio: 1 });
  // It fades out, so a long look at the new Prompt shows no red beside it.
  await expect(missed).toHaveCSS('opacity', '0');
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

test('before the first answer, the Game says how the Mode ends and how to answer', async ({
  page,
}) => {
  const howToAnswer = page.getByText('กดปุ่มบนคีย์บอร์ดตามป้ายเล็กใต้ปุ่มคำตอบ หรือแตะปุ่ม');
  await page.goto('#/?mode=time&len=30');
  await expect(page.getByText('ตอบให้ได้มากที่สุดก่อนหมดเวลา (30 วินาที)')).toBeVisible();
  await expect(howToAnswer).toBeVisible();
  await page.goto('#/?mode=count&len=10');
  await expect(page.getByText('ตอบให้ครบทุกข้อ เร็วที่สุด (10 ข้อ)')).toBeVisible();
  await page.goto('#/?mode=zen');
  await expect(page.getByText('ไม่จับเวลา เล่นไปจนกดจบรอบ')).toBeVisible();
  // "Mode bar" is the team's word, never the Player's (D44).
  await expect(page.getByText('Mode bar')).toHaveCount(0);
  await answer(page, true);
  await expect(howToAnswer).toBeHidden();
});

test('mixed: a key from the other set says which keys answer, no miss', async ({ page }) => {
  await page.goto('#/?mode=count&len=10&dir=mixed');
  const p = await readPrompt(page);
  await page.keyboard.press(p.askedLetter ? 'KeyC' : 'Digit1');
  // A letter Prompt is answered with the solfège keys, and the other way round.
  const keys = p.askedLetter ? '1 2 3 4 5 6 7' : 'C D E F G A B';
  const hint = page.getByRole('status').filter({ hasText: 'ข้อนี้ตอบด้วยปุ่ม' });
  await expect(hint).toHaveText(`ข้อนี้ตอบด้วยปุ่ม ${keys}`);
  await expect(page.getByTestId('miss-count')).toHaveText('ผิด 0');
  await page.keyboard.press(p.keyOf(p.right));
  await waitForNextPrompt(page, p.label);
  await expect(hint).toHaveCount(0);
});

test('focus in the Mode bar → the bottom bar says Esc goes back to the game', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'no keyboard hints on a touch screen (D44)');
  await page.goto('#/?mode=count&len=10');
  const backHint = page.getByText('กลับเข้าเกม');
  await expect(page.getByText('ไปที่การตั้งค่า')).toBeVisible();
  await expect(backHint).toBeHidden();
  await page.keyboard.press('Shift+Tab');
  await expect(backHint).toBeVisible();
  await expect(page.getByText('ไปที่การตั้งค่า')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('region', { name: 'พื้นที่เกม' })).toBeFocused();
  await expect(backHint).toBeHidden();
});

test('touch screen: no keyboard hints, and answer buttons tall enough for a thumb', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'a phone only');
  await page.goto('#/?mode=zen');
  await expect(page.getByTestId('prompt')).toBeVisible();
  await expect(page.getByText('ไปที่การตั้งค่า')).toBeHidden();
  await expect(page.getByText('Shift+Tab')).toBeHidden();
  // `pointer-coarse:min-h-16` in AnswerRow (D44).
  for (const button of await answerButtons(page).all()) {
    expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(64);
  }
  await answer(page, true);
  await page.getByRole('button', { name: 'จบรอบ' }).tap();
  const again = page.getByRole('button', { name: 'เล่นอีกรอบ' });
  await expect(again).toBeVisible();
  await expect(again.locator('kbd')).toBeHidden();
});

test('English Script → Direction labels read in English too', async ({ page }) => {
  await page.goto('#/?mode=count&len=10&script=en');
  for (const name of ['Do→C', 'C→Do', 'สลับ']) {
    await expect(page.getByRole('radio', { name })).toBeVisible();
  }
  await page.getByRole('radio', { name: 'ไทย' }).click();
  await expect(page.getByRole('radio', { name: 'โด→C' })).toBeVisible();
});

for (const { right, wrong, accuracy } of [
  { right: 8, wrong: 0, accuracy: 100 },
  { right: 6, wrong: 2, accuracy: 75 },
]) {
  test(`Results ${right} right, ${wrong} wrong count up with numbers that agree on every frame`, async ({
    page,
  }) => {
    // A fake clock steps the count-up frame by frame. React commits a frame on its own
    // schedule, which the fake clock does not hold, so each frame is read in one go.
    await page.clock.install();
    await page.goto('#/?mode=zen');
    for (let i = 0; i < right + wrong; i++) await answer(page, i >= wrong);
    await page.keyboard.press('Escape');
    await expect(resultsHeading(page)).toBeVisible();
    const stats = page.locator('dl');
    const read = () =>
      stats.evaluate((dl) => {
        const value = (label: string) =>
          [...dl.querySelectorAll('div')]
            .find((d) => d.querySelector('dt')?.textContent === label)
            ?.querySelector('dd')?.textContent;
        return {
          right: Number(value('ถูก')),
          wrong: Number(value('ผิด')),
          accuracy: value('ความแม่น'),
        };
      });
    // A little past the 600 ms count-up, so the last step lands on the final numbers.
    for (let t = 0; t < 700; t += 50) {
      const shown = await read();
      const answered = shown.right + shown.wrong;
      const agrees = answered === 0 ? 0 : Math.round((shown.right / answered) * 100);
      expect(shown.accuracy).toBe(`${agrees}%`);
      await page.clock.runFor(50);
    }
    expect(await read()).toEqual({ right, wrong, accuracy: `${accuracy}%` });
  });
}

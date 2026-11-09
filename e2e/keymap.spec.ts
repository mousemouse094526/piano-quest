import { expect, type Page, test } from '@playwright/test';
import {
  answer,
  answerButton,
  answerButtons,
  DEFAULT_KEYS,
  expectNoSidewaysScroll,
  press,
  readPrompt,
  resultsHeading,
  START_HINT,
  stat,
  waitForNextPrompt,
  watchErrors,
} from './quiz';

// spec.md › Seams › 2, the Keymap: in the URL (D32–D34, D38) and set in the Keymap
// dialog (D35–D37, D39, D40). Keys go through `page.keyboard`, so the Dialog and the
// game's `window` listener both see them.

/** Letters on the home row, solfège left at the defaults. */
const HOME_ROW_KEYS = { ...DEFAULT_KEYS, 'letter-keys': 'ASDFGHJ' };

test('no Keymap in the URL → the default Keymap is written in full', async ({ page }) => {
  await page.goto('#/');
  await expect(page).toHaveURL(/letter-keys=CDEFGAB/);
  // The router quotes values JSON could read as a number (D34).
  await expect(page).toHaveURL(/solfege-keys=%221234567%22/);
});

test('a bad Keymap falls back to the defaults, with no error', async ({ page }) => {
  const errors = watchErrors(page);
  // A repeated key, too short, and a key outside the table (a space).
  for (const bad of ['letter-keys=AAAAAAA', 'letter-keys=ASDFGH', 'letter-keys=ASDFGH%20']) {
    // A fresh load each time: the router writes the parsed URL back on load, not on a
    // hash change within the page.
    await page.goto('about:blank');
    await page.goto(`#/?mode=count&len=10&${bad}`);
    await expect(answerButtons(page)).toHaveText(['CC', 'DD', 'EE', 'FF', 'GG', 'AA', 'BB']);
    await expect(page).toHaveURL(/letter-keys=CDEFGAB/);
  }
  expect(errors).toEqual([]);
});

test('letter-keys=ASDFGHJ: the bound keys answer and label the buttons', async ({ page }) => {
  await page.goto(`#/?mode=count&len=10&letter-keys=${HOME_ROW_KEYS['letter-keys']}`);
  // Each button reads its note, then the key that answers it.
  await expect(answerButtons(page)).toHaveText(['CA', 'DS', 'ED', 'FF', 'GG', 'AH', 'BJ']);
  const p = await readPrompt(page, HOME_ROW_KEYS);
  await page.keyboard.press(p.keyOf(p.right));
  await waitForNextPrompt(page, p.label);
  await expect(page.getByTestId('answered')).toHaveText(/1\/10/);
  await expect(page.getByTestId('miss-count')).toHaveText('ผิด 0');
  // C is no longer bound to anything, so it does nothing.
  await page.keyboard.press('KeyC');
  await expect(page.getByTestId('answered')).toHaveText(/1\/10/);
  await expect(page.getByTestId('miss-count')).toHaveText('ผิด 0');
});

test('symbol keys are labelled as on a US QWERTY keyboard', async ({ page }) => {
  await page.goto(`#/?letter-keys=${encodeURIComponent(";',./[]")}`);
  await expect(answerButtons(page)).toHaveText(['C;', "D'", 'E,', 'F.', 'G/', 'A[', 'B]']);
  await page.goto(`#/?letter-keys=${encodeURIComponent('\\-=`QWE')}`);
  await expect(answerButtons(page)).toHaveText(['C\\', 'D-', 'E=', 'F`', 'GQ', 'AW', 'BE']);
});

test('a Keymap typed without quotes reads, and survives a refresh', async ({ page }) => {
  await page.goto('#/?dir=letter-to-solfege&solfege-keys=7654321');
  const labels = ['โด7', 'เร6', 'มี5', 'ฟา4', 'ซอล3', 'ลา2', 'ที1'];
  await expect(answerButtons(page)).toHaveText(labels);
  await page.reload();
  await expect(answerButtons(page)).toHaveText(labels);
  await expect(page).toHaveURL(/solfege-keys=%227654321%22/);
});

test('Numpad answers as the digit row', async ({ page }) => {
  await page.goto('#/?mode=count&len=10&dir=letter-to-solfege');
  const p = await readPrompt(page);
  await page.keyboard.press(`Numpad${p.right}`);
  await waitForNextPrompt(page, p.label);
  await expect(page.getByTestId('answered')).toHaveText(/1\/10/);
  await expect(page.getByTestId('miss-count')).toHaveText('ผิด 0');
});

test('mixed: a key from the other bound set flashes the hint, no miss', async ({ page }) => {
  await page.goto(`#/?mode=count&len=10&dir=mixed&letter-keys=${HOME_ROW_KEYS['letter-keys']}`);
  const p = await readPrompt(page, HOME_ROW_KEYS);
  // A letter Prompt wants a solfège key, so a letter key (KeyA answers C) is the other set.
  await page.keyboard.press(p.askedLetter ? 'KeyA' : 'Digit1');
  await expect(answerButtons(page).first().locator('kbd')).toHaveCSS('animation-name', 'hint');
  await expect(page.getByTestId('answered')).toHaveText(/0\/10/);
  await expect(page.getByTestId('miss-count')).toHaveText('ผิด 0');
});

test('with a Keymap, tapping the buttons plays a whole Round', async ({ page, isMobile }) => {
  await page.goto(`#/?mode=count&len=10&letter-keys=${HOME_ROW_KEYS['letter-keys']}`);
  for (let i = 0; i < 10; i++) {
    const p = await readPrompt(page, HOME_ROW_KEYS);
    await press(answerButton(page, p.right), isMobile);
    await waitForNextPrompt(page, p.label);
  }
  await expect(resultsHeading(page)).toBeVisible();
  await expect(stat(page, 'ถูก')).toHaveText('10');
});

// Keymap dialog (D35–D37, D39, D40). Keys go through `page.keyboard`, so the Dialog and
// the game's `window` listener both see them.

function openButton(page: Page) {
  return page.getByRole('button', { name: 'ปุ่มลัด' });
}

function dialog(page: Page) {
  return page.getByRole('dialog', { name: 'ปุ่มลัด' });
}

/** One Answer's row in the Dialog: `side` is the column's legend, e.g. `C–B` or `โด–ที`. */
function row(page: Page, side: string, answer: string) {
  return dialog(page)
    .getByRole('group', { name: side })
    .getByRole('button', { name: new RegExp(`^${answer}`) });
}

async function openKeymap(page: Page) {
  await openButton(page).click();
  await expect(dialog(page)).toBeVisible();
}

test('bind โด to Q → in the URL and on the button, and it survives a refresh', async ({ page }) => {
  await page.goto('#/?mode=count&len=10&dir=letter-to-solfege');
  await openKeymap(page);
  await row(page, 'โด–ที', 'โด').click();
  await expect(row(page, 'โด–ที', 'โด')).toContainText('กดปุ่มที่ต้องการ…');
  await page.keyboard.press('KeyQ');
  await expect(page).toHaveURL(/solfege-keys=Q234567/);
  await expect(row(page, 'โด–ที', 'โด')).toHaveText('โดQ');
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(answerButtons(page).first()).toHaveText('โดQ');
  await page.reload();
  await expect(answerButtons(page).first()).toHaveText('โดQ');
});

test('a key another Answer uses → the two swap, with a note', async ({ page }) => {
  await page.goto('#/');
  await openKeymap(page);
  await row(page, 'C–B', 'C').click();
  await page.keyboard.press('KeyD');
  await expect(page).toHaveURL(/letter-keys=DCEFGAB/);
  await expect(row(page, 'C–B', 'C')).toHaveText('CD');
  await expect(row(page, 'C–B', 'D')).toHaveText('DC');
  await expect(dialog(page).getByRole('status')).toHaveText('สลับกับ D');
});

test('a key from the other set swaps across sets', async ({ page }) => {
  await page.goto('#/');
  await openKeymap(page);
  await row(page, 'C–B', 'C').click();
  await page.keyboard.press('Digit1');
  await expect(page).toHaveURL(/letter-keys=1DEFGAB/);
  await expect(page).toHaveURL(/solfege-keys=C234567/);
  await expect(dialog(page).getByRole('status')).toHaveText('สลับกับ โด');
});

test('Enter cannot be bound; the row keeps waiting', async ({ page }) => {
  await page.goto('#/');
  await openKeymap(page);
  await row(page, 'C–B', 'C').click();
  await page.keyboard.press('Enter');
  await expect(dialog(page).getByRole('status')).toHaveText('ใช้ปุ่มนี้ไม่ได้');
  await expect(row(page, 'C–B', 'C')).toContainText('กดปุ่มที่ต้องการ…');
  await page.keyboard.press('KeyQ');
  await expect(page).toHaveURL(/letter-keys=QDEFGAB/);
});

test('Shift alone is not a key to bind; Shift+Q binds Q', async ({ page }) => {
  await page.goto('#/');
  await openKeymap(page);
  await row(page, 'C–B', 'C').click();
  await page.keyboard.press('Shift');
  await expect(dialog(page).getByRole('status')).toHaveText('');
  await expect(row(page, 'C–B', 'C')).toContainText('กดปุ่มที่ต้องการ…');
  await page.keyboard.press('Shift+KeyQ');
  await expect(page).toHaveURL(/letter-keys=QDEFGAB/);
});

test('คืนค่าเริ่มต้น → both key sets back to the defaults', async ({ page }) => {
  await page.goto('#/?letter-keys=ASDFGHJ&solfege-keys=7654321');
  await openKeymap(page);
  await dialog(page).getByRole('button', { name: 'คืนค่าเริ่มต้น' }).click();
  // The router quotes values JSON could read as a number (D34).
  await expect(page).toHaveURL(/letter-keys=CDEFGAB/);
  await expect(page).toHaveURL(/solfege-keys=%221234567%22/);
});

test('count: binding a key mid-Round starts a new Round', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  await expect(page.getByTestId('prompt')).toBeVisible();
  await page.keyboard.press('KeyG');
  await expect(page.getByTestId('answered')).toHaveText(/1\/10/);
  await page.keyboard.press('KeyC');
  await expect(page.getByTestId('answered')).toHaveText(/2\/10/);
  await openKeymap(page);
  await row(page, 'C–B', 'G').click();
  await page.keyboard.press('KeyQ');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('answered')).toHaveText(/0\/10/);
  await expect(page.getByText(START_HINT)).toBeVisible();
});

test('time running: open and close with no change → a new Round, clock not started', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('#/?mode=time&len=15');
  await expect(page.getByTestId('prompt')).toBeVisible();
  await page.keyboard.press('KeyG');
  await expect(page.getByText(START_HINT)).toBeHidden();
  await page.clock.runFor(3_000);
  await expect(page.getByRole('timer')).toHaveText('12');
  await openKeymap(page);
  await page.clock.runFor(20_000);
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(page.getByText(START_HINT)).toBeVisible();
  await expect(page.getByRole('timer')).toHaveText('15');
});

test('while the Dialog is open, answer keys and Tab do nothing to the Round', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  await openKeymap(page);
  // Outside the Dialog these answer, and Tab restarts the Round.
  for (const key of ['KeyG', 'Digit5', 'Tab']) await page.keyboard.press(key);
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText(START_HINT)).toBeVisible();
  await expect(page.getByTestId('answered')).toHaveText(/0\/10/);
});

test('zen: Esc stops waiting, Esc again closes, the Round does not end', async ({ page }) => {
  await page.goto('#/?mode=zen');
  await openKeymap(page);
  await row(page, 'C–B', 'C').click();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeVisible();
  await expect(row(page, 'C–B', 'C')).toHaveText('CC');
  // Outside the Dialog, Esc ends a zen Round; the Esc that closes the Dialog must not.
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(resultsHeading(page)).toBeHidden();
  await expect(page.getByText(START_HINT)).toBeVisible();
  // Focus is back on the game area, so G answers right away.
  await page.keyboard.press('KeyG');
  await expect(page.getByText(START_HINT)).toBeHidden();
  await expect(page.getByTestId('answered')).toHaveText(/1/);
});

test('opening the Dialog from Results → a new Round', async ({ page }) => {
  await page.goto('#/?mode=zen');
  await expect(page.getByTestId('prompt')).toBeVisible();
  await answer(page, true);
  await page.keyboard.press('Escape');
  await expect(resultsHeading(page)).toBeVisible();
  await openKeymap(page);
  await page.keyboard.press('Escape');
  await expect(resultsHeading(page)).toBeHidden();
  await expect(page.getByText(START_HINT)).toBeVisible();
});

test('after closing, G answers right away', async ({ page }) => {
  await page.goto('#/?mode=count&len=10');
  await openKeymap(page);
  await dialog(page).getByRole('button', { name: 'ปิด' }).click();
  await expect(dialog(page)).toBeHidden();
  await expect(page.getByRole('region', { name: 'พื้นที่เกม' })).toBeFocused();
  await page.keyboard.press('KeyG');
  await expect(page.getByTestId('answered')).toHaveText(/1\/10/);
});

test('keyboard only: Shift+Tab to the button, Enter, Tab to a row, Enter, a key', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'WebKit on a phone does not Tab to buttons');
  await page.goto('#/');
  await expect(page.getByRole('region', { name: 'พื้นที่เกม' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(openButton(page)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(row(page, 'C–B', 'C')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(row(page, 'C–B', 'D')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(row(page, 'C–B', 'D')).toContainText('กดปุ่มที่ต้องการ…');
  await page.keyboard.press('KeyX');
  await expect(page).toHaveURL(/letter-keys=CXEFGAB/);
});

test('a tapped row stops waiting on a second tap, or when the Dialog closes', async ({
  page,
  isMobile,
}) => {
  await page.goto('#/');
  await openKeymap(page);
  await expect(dialog(page)).toContainText('ต้องใช้คีย์บอร์ดจริง แตะปุ่มคำตอบได้เสมอ');
  const c = row(page, 'C–B', 'C');
  await press(c, isMobile);
  await expect(c).toContainText('กดปุ่มที่ต้องการ…');
  await press(c, isMobile);
  await expect(c).toHaveText('CC');
  // Wait on C again, then another row takes over the wait.
  await press(c, isMobile);
  const d = row(page, 'C–B', 'D');
  await press(d, isMobile);
  await expect(d).toContainText('กดปุ่มที่ต้องการ…');
  await expect(c).toHaveText('CC');
  await press(dialog(page).getByRole('button', { name: 'ปิด' }), isMobile);
  await openKeymap(page);
  await expect(row(page, 'C–B', 'C')).toHaveText('CC');
});

test('1024 px: the Keymap button sits on the Mode bar line, next to sound', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'desktop width only');
  // From `lg` (1024 px) the whole Mode bar fits one line (D30).
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('#/');
  await expect(openButton(page)).toBeVisible();
  const keymap = await openButton(page).boundingBox();
  const sound = await page.getByRole('button', { name: 'เสียง' }).boundingBox();
  const mode = await page.getByRole('radio', { name: 'time' }).boundingBox();
  if (!keymap || !sound || !mode) throw new Error('Mode bar not laid out');
  expect(Math.abs(keymap.y - sound.y)).toBeLessThan(4);
  expect(Math.abs(keymap.y + keymap.height / 2 - (mode.y + mode.height / 2))).toBeLessThan(4);
  expect(keymap.x).toBeGreaterThan(sound.x);
});

test('375 px: the Mode bar wraps with no sideways scroll, the Keymap button beside sound', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto('#/');
  await expect(openButton(page)).toBeVisible();
  const keymap = await openButton(page).boundingBox();
  const sound = await page.getByRole('button', { name: 'เสียง' }).boundingBox();
  if (!keymap || !sound) throw new Error('Mode bar not laid out');
  expect(Math.abs(keymap.y - sound.y)).toBeLessThan(4);
  expect(keymap.x + keymap.width).toBeLessThanOrEqual(375);
  await expectNoSidewaysScroll(page, 375);
});

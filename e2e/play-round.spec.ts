import { expect, type Locator, type Page, test } from '@playwright/test';
import { NOTES } from '../src/features/note-name-quiz/engine/notes';
import type { Note } from '../src/features/note-name-quiz/engine/types';
import { keySetOf } from '../src/features/note-name-quiz/hooks/keys';
import type { KeymapSearch } from '../src/features/note-name-quiz/search';

// spec.md › Seams › 2: one Round played through the real UI. Keys go through
// `page.keyboard`, never synthetic events, so focus rules apply as for a Player.

const START_HINT = 'กดปุ่มคำตอบเพื่อเริ่ม';
const ALL_NOTES = Object.keys(NOTES).map(Number) as Note[];

/** spec.md › Data keys, as the URL writes them (D34). */
const DEFAULT_KEYS: KeymapSearch = { 'letter-keys': 'CDEFGAB', 'solfege-keys': '1234567' };

/** The Prompt on screen, the note that answers it, one that misses it, and their keys. */
async function readPrompt(page: Page, keys: KeymapSearch = DEFAULT_KEYS) {
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
  const keys = { ...DEFAULT_KEYS, 'letter-keys': 'ASDFGHJ' };
  await page.goto(`#/?mode=count&len=10&letter-keys=${keys['letter-keys']}`);
  // Each button reads its note, then the key that answers it.
  await expect(answerButtons(page)).toHaveText(['CA', 'DS', 'ED', 'FF', 'GG', 'AH', 'BJ']);
  const p = await readPrompt(page, keys);
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
  await page.goto('#/?mode=count&len=10&dir=mixed&letter-keys=ASDFGHJ');
  const p = await readPrompt(page, { ...DEFAULT_KEYS, 'letter-keys': 'ASDFGHJ' });
  // A letter Prompt wants a solfège key, so a letter key (KeyA answers C) is the other set.
  await page.keyboard.press(p.askedLetter ? 'KeyA' : 'Digit1');
  await expect(answerButtons(page).first().locator('kbd')).toHaveCSS('animation-name', 'hint');
  await expect(page.getByTestId('answered')).toHaveText(/0\/10/);
  await expect(page.getByTestId('miss-count')).toHaveText('ผิด 0');
});

test('with a Keymap, tapping the buttons plays a whole Round', async ({ page, isMobile }) => {
  await page.goto('#/?mode=count&len=10&letter-keys=ASDFGHJ');
  for (let i = 0; i < 10; i++) {
    const p = await readPrompt(page, { ...DEFAULT_KEYS, 'letter-keys': 'ASDFGHJ' });
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
  await press(c, isMobile);
  // Another row takes over the wait.
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
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(375);
});

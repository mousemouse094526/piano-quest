import { expect, type Page, test } from '@playwright/test';
import { answer, resultsHeading, START_HINT, stubShare, watchErrors } from './quiz';

// share-results spec › Seams › 3: the "แชร์ผล" button on Results. `navigator.share` and
// the clipboard are stubs on both projects, so the test reads what left the page without
// browser permissions (WebKit has none to grant). Which way a press goes, and every way it
// fails, is proven by `src/features/note-name-quiz/hooks/shareOrCopy.test.ts`.

/** count 10 with misses at answers 4 and 8, ending on Results. */
async function playCount10(page: Page) {
  await page.goto('#/?mode=count&len=10&dir=solfege-to-letter&script=th');
  for (let i = 0; i < 10; i++) await answer(page, i !== 3 && i !== 7);
  await expect(resultsHeading(page)).toBeVisible();
}

const shareButton = (page: Page) => page.getByRole('button', { name: 'แชร์ผล' });
// Not found by its text as in copy-link.spec.ts: this one is checked empty too. The copy-link
// status has no explicit `aria-live`, so this matches only the Results one.
const shareStatus = (page: Page) => page.locator('[role="status"][aria-live="polite"]');

/** Records each text the share status shows from now on: '' when it empties. */
async function watchText(page: Page) {
  await shareStatus(page).evaluate((el) => {
    const log: string[] = [];
    (window as unknown as { statusLog: string[] }).statusLog = log;
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.addedNodes.length > 0) log.push(el.textContent ?? '');
        else if (r.removedNodes.length > 0 || r.type === 'characterData') log.push('');
      }
    }).observe(el, { childList: true, characterData: true, subtree: true });
  });
  return () => page.evaluate(() => (window as unknown as { statusLog: string[] }).statusLog);
}

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop copies; the phone shares');

  test('click แชร์ผล → copied, the notice goes after 2 s, no request', async ({ page }) => {
    const spy = await stubShare(page);
    // A fake clock: the notice's 2 s checked exactly, without real waiting.
    await page.clock.install();
    await playCount10(page);
    // ADR-0001: sharing sends nothing anywhere; the text leaves only through the Player.
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    // D7: the live region is there before any press, so the first outcome is read out.
    await expect(shareStatus(page)).toBeAttached();
    // ADR-0009: game buttons never take focus, so Tab keeps restarting the Round.
    await expect(shareButton(page)).toHaveAttribute('tabindex', '-1');

    await shareButton(page).click();
    await expect(shareStatus(page)).toHaveText('คัดลอกผลแล้ว');
    const { copied, shared } = await spy();
    expect(shared).toEqual([]);
    expect(copied).toHaveLength(1);
    expect(copied[0]).toMatch(/^Piano Quest — ผลรอบนี้\n/);
    expect(copied[0]).toContain('\nผิด 2\n');
    // ADR-0009: the click leaves focus on the game area.
    await expect(page.getByLabel('พื้นที่เกม')).toBeFocused();
    await page.clock.runFor(1900);
    await expect(shareStatus(page)).toHaveText('คัดลอกผลแล้ว');
    await page.clock.runFor(200);
    await expect(shareStatus(page)).toHaveText('');
    expect(requests).toEqual([]);
  });

  test('the link in the copied text opens the same settings', async ({ page, context }) => {
    const spy = await stubShare(page);
    await playCount10(page);
    await shareButton(page).click();
    await expect(shareStatus(page)).toHaveText('คัดลอกผลแล้ว');
    const link = (await spy()).copied[0]?.match(/เล่นค่าเดียวกัน: (\S+)$/)?.[1];
    if (!link) throw new Error('no link in the Share text');

    const parent = await context.newPage();
    await parent.goto(link);
    for (const name of ['count', '10', 'โด→C', 'ไทย']) {
      await expect(parent.getByRole('radio', { name, exact: true })).toBeChecked();
    }
  });

  test('S on Results copies like a click; Tab then starts a new Round', async ({ page }) => {
    const spy = await stubShare(page);
    await playCount10(page);
    await page.keyboard.press('s');
    await expect(shareStatus(page)).toHaveText('คัดลอกผลแล้ว');
    expect((await spy()).copied[0]).toMatch(/^Piano Quest — ผลรอบนี้\n/);
    await page.keyboard.press('Tab');
    await expect(page.getByText(START_HINT)).toBeVisible();
  });

  test('a clipboard that refuses → the Share text in a read-only box until a new Round', async ({
    page,
  }) => {
    await stubShare(page, { copyWorks: false });
    // A fake clock: past the copied notice's 2 s without real waiting.
    await page.clock.install();
    const errors = watchErrors(page);
    await playCount10(page);
    await shareButton(page).click();
    const box = page.getByLabel('คัดลอกข้อความนี้ไปส่งเองได้');
    await expect(box).toHaveJSProperty('readOnly', true);
    await expect(box).toHaveValue(/^Piano Quest — ผลรอบนี้\n[\s\S]*\nผิด 2\n/);
    // Not on a timer like the copied notice: it stays until the Round changes.
    await page.clock.runFor(2500);
    await expect(box).toBeVisible();
    // A second try keeps the box while it runs and after it fails again.
    const changes = await watchText(page);
    await page.keyboard.press('s');
    await expect(shareStatus(page)).toHaveText('แชร์ไม่ได้');
    // D7: the region empties before the same outcome comes back, so a screen reader reads it again.
    expect(await changes()).toEqual(['', 'แชร์ไม่ได้']);
    await expect(box).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByText(START_HINT)).toBeVisible();
    await expect(box).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'the phone shares; desktop copies');

  test('tap แชร์ผล → the share sheet once with the Share text, nothing copied', async ({ page }) => {
    const spy = await stubShare(page);
    await playCount10(page);
    await expect(shareButton(page).locator('kbd')).toBeHidden();
    await shareButton(page).tap();
    await expect.poll(async () => (await spy()).shared.length).toBe(1);
    const { shared, copied } = await spy();
    expect(shared[0]?.text).toContain('ผิด 2');
    expect(shared[0]?.url).toBeUndefined();
    expect(copied).toEqual([]);
    // D3: a share that went out says nothing.
    await expect(shareStatus(page)).toHaveText('');
  });

  test('while the share sheet is open the button cannot be pressed again', async ({ page }) => {
    const spy = await stubShare(page, { shareHangs: true });
    await playCount10(page);
    await shareButton(page).tap();
    await expect(shareButton(page)).toBeDisabled();
    await expect.poll(async () => (await spy()).shared.length).toBe(1);
  });
});

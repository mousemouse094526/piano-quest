import { expect, type Page, test } from '@playwright/test';
import { answer } from './quiz';

// F12, D44: the copy-link button in the Mode bar hands a teacher the URL with every
// setting (D16). The clipboard is a stub, so the test reads what was copied on both
// projects (WebKit has no clipboard permission to grant).

async function stubClipboard(page: Page, works = true) {
  await page.addInitScript((works) => {
    const w = window as unknown as { copied: string | null };
    w.copied = null;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          if (!works) throw new DOMException('denied', 'NotAllowedError');
          w.copied = text;
        },
      },
    });
  }, works);
  return () => page.evaluate(() => (window as unknown as { copied: string | null }).copied);
}

test('count 10 ไทย โด→C → copy the link, open it, the same settings', async ({ page, context }) => {
  const copied = await stubClipboard(page);
  await page.goto('');
  // The teacher's steps from the trial, defaults (โด→C, ไทย) clicked as well.
  await page.getByRole('radio', { name: 'count' }).click();
  await page.getByRole('radio', { name: '10', exact: true }).click();
  await page.getByRole('radio', { name: 'โด→C' }).click();
  await page.getByRole('radio', { name: 'ไทย' }).click();
  // One answer first, to show that copying leaves the Round alone.
  await answer(page, true);
  await page.getByRole('button', { name: 'คัดลอกลิงก์' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'คัดลอกแล้ว' })).toBeVisible();
  await expect(page.getByTestId('answered')).toHaveText(/1\/10/);

  const url = await copied();
  if (!url) throw new Error('nothing copied');
  const student = await context.newPage();
  await student.goto(url);
  for (const name of ['count', '10', 'โด→C', 'ไทย']) {
    await expect(student.getByRole('radio', { name, exact: true })).toBeChecked();
  }
});

test('a clipboard that refuses → says the copy failed, no error', async ({ page }) => {
  await stubClipboard(page, false);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('#/?mode=count&len=10');
  await page.getByRole('button', { name: 'คัดลอกลิงก์' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'คัดลอกไม่ได้' })).toBeVisible();
  expect(errors).toEqual([]);
});

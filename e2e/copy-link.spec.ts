import { expect, test } from '@playwright/test';
import { answer, stubShare, watchErrors } from './quiz';

// F12, D44: the copy-link button in the Mode bar hands a teacher the URL with every
// setting (D16). The clipboard is a stub (`stubShare`), so both projects read what was copied.

test('count 10 ไทย โด→C → copy the link, open it, the same settings', async ({ page, context }) => {
  const spy = await stubShare(page);
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

  const url = (await spy()).copied.at(-1);
  if (!url) throw new Error('nothing copied');
  const student = await context.newPage();
  await student.goto(url);
  for (const name of ['count', '10', 'โด→C', 'ไทย']) {
    await expect(student.getByRole('radio', { name, exact: true })).toBeChecked();
  }
});

test('a clipboard that refuses → says the copy failed, no error', async ({ page }) => {
  await stubShare(page, { copyWorks: false });
  const errors = watchErrors(page);
  await page.goto('#/?mode=count&len=10');
  await page.getByRole('button', { name: 'คัดลอกลิงก์' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'คัดลอกไม่ได้' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('no clipboard at all (not a secure page) → says the copy failed, no error', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', { value: undefined }),
  );
  const errors = watchErrors(page);
  await page.goto('#/?mode=count&len=10');
  await page.getByRole('button', { name: 'คัดลอกลิงก์' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'คัดลอกไม่ได้' })).toBeVisible();
  expect(errors).toEqual([]);
});

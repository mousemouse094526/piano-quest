import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';

// ADR-0001: the app stores nothing on the Player's device. Biome bans the
// storage globals; this also catches `document.cookie`, which lint cannot.
const BANNED = /\b(localStorage|sessionStorage|indexedDB|document\.cookie)\b/;
const SELF = 'no-player-data.test.ts';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) && entry.name !== SELF ? [path] : [];
  });
}

test('no source file under src/ touches browser storage or cookies', () => {
  const offenders = sourceFiles(import.meta.dirname).filter((file) =>
    BANNED.test(readFileSync(file, 'utf8')),
  );
  expect(offenders).toEqual([]);
});

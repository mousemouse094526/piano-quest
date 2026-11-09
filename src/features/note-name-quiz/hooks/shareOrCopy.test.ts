import { describe, expect, test, vi } from 'vitest';
import { type ShareDeps, shareOrCopy } from './shareOrCopy';

const TEXT = 'Piano Quest — ผลรอบนี้';

/** A share sheet that rejects the way a browser does, with a named `DOMException`. */
const rejectWith = (name: string) => vi.fn(() => Promise.reject(new DOMException('x', name)));
const resolves = () => vi.fn(() => Promise.resolve());

function deps(overrides: Partial<ShareDeps>): ShareDeps {
  return { share: resolves(), writeText: resolves(), isCoarse: true, ...overrides };
}

describe('touch screen with a share sheet', () => {
  test('share works → shared, text only, nothing copied', async () => {
    const d = deps({});
    expect(await shareOrCopy(TEXT, d)).toBe('shared');
    expect(d.share).toHaveBeenCalledWith({ text: TEXT });
    expect(d.writeText).not.toHaveBeenCalled();
  });

  test.each(['AbortError', 'InvalidStateError'])('share rejects %s → dismissed', async (name) => {
    expect(await shareOrCopy(TEXT, deps({ share: rejectWith(name) }))).toBe('dismissed');
  });

  test.each(['NotAllowedError', 'DataError'])(
    'share rejects %s → failed, no copy after it',
    async (name) => {
      const d = deps({ share: rejectWith(name) });
      expect(await shareOrCopy(TEXT, d)).toBe('failed');
      expect(d.writeText).not.toHaveBeenCalled();
    },
  );

  test('share throws a plain TypeError → failed', async () => {
    const share = vi.fn(() => Promise.reject(new TypeError('bad data')));
    expect(await shareOrCopy(TEXT, deps({ share }))).toBe('failed');
  });
});

describe('copy', () => {
  test('not a touch screen, share there → copies, never shares', async () => {
    const d = deps({ isCoarse: false });
    expect(await shareOrCopy(TEXT, d)).toBe('copied');
    expect(d.writeText).toHaveBeenCalledWith(TEXT);
    expect(d.share).not.toHaveBeenCalled();
  });

  test('touch screen with no share sheet → copies', async () => {
    expect(await shareOrCopy(TEXT, deps({ share: undefined }))).toBe('copied');
  });

  test('copy rejects → failed', async () => {
    const d = deps({ isCoarse: false, writeText: rejectWith('NotAllowedError') });
    expect(await shareOrCopy(TEXT, d)).toBe('failed');
  });

  test('neither share nor copy → failed', async () => {
    const d = { share: undefined, writeText: undefined, isCoarse: true };
    expect(await shareOrCopy(TEXT, d)).toBe('failed');
  });
});

/** How a share or copy ended: the screen shows nothing, "copied", or the text to copy by hand. */
export type ShareOutcome = 'shared' | 'dismissed' | 'copied' | 'failed';

/** The browser parts `shareOrCopy` uses, passed in so every path runs without a browser. */
export type ShareDeps = {
  share?: (data: ShareData) => Promise<void>;
  writeText?: (text: string) => Promise<void>;
  /** A touch screen (`pointer: coarse`): only there does the share sheet beat copying. */
  isCoarse: boolean;
};

/** share-results D3: how long a "copied" notice stays, for the copy-link and the share button alike. */
export const COPIED_SHOWN_MS = 2000;

/** The Player closed the sheet, or pressed again while it was open: not a failure. */
const DISMISSALS = new Set(['AbortError', 'InvalidStateError']);

/**
 * share-results spec › Share or copy (D3, D7): a touch screen with a share sheet shares, any
 * other screen copies. A failed share never falls back to copying: the share has used the
 * press, so Safari would refuse the copy too (`docs/library-notes/web-share.md`).
 * Call it inside the press: both browser calls need user activation.
 */
export async function shareOrCopy(text: string, deps: ShareDeps): Promise<ShareOutcome> {
  if (deps.isCoarse && deps.share) {
    try {
      // Text only: the link is in the text, and some apps drop `text` when `url` is set.
      await deps.share({ text });
      return 'shared';
    } catch (e) {
      return e instanceof DOMException && DISMISSALS.has(e.name) ? 'dismissed' : 'failed';
    }
  }
  return copyText(text, deps.writeText);
}

/** Copies `text`; no clipboard (http, some in-app browsers) or a refused write fails. */
export async function copyText(
  text: string,
  writeText: ShareDeps['writeText'],
): Promise<'copied' | 'failed'> {
  if (!writeText) return 'failed';
  try {
    await writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/** The real browser parts; `share` and `clipboard` are missing outside a secure context. */
export function browserShareDeps(): ShareDeps {
  return {
    share: navigator.share ? (data) => navigator.share(data) : undefined,
    writeText: navigator.clipboard ? (text) => navigator.clipboard.writeText(text) : undefined,
    isCoarse: window.matchMedia('(pointer: coarse)').matches,
  };
}

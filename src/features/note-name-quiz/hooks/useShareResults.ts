import { useEffect, useRef, useState } from 'react';
import type { RoundState } from '../engine/types';
import { browserShareDeps, COPIED_SHOWN_MS, type ShareOutcome, shareOrCopy } from './shareOrCopy';

/** What the Results screen shows of the shares made for its Round. */
export type ShareView = {
  /** True while the share sheet is open: the button can't be pressed again (D7). */
  busy: boolean;
  /** The last press's outcome; `null` before any press, while one runs, and once "copied" has gone. */
  outcome: ShareOutcome | null;
  /** The Share text of a share or copy that failed, in a box until a new Round (D7); else `null`. */
  boxText: string | null;
};

type LastShare = { round: RoundState; outcome: ShareOutcome | null; boxText: string | null };

/**
 * share-results D3, D7: shares or copies a finished Round's Share text and keeps how it went.
 * What it shows belongs to the Round it was made for, so a new Round starts with nothing shown.
 */
export function useShareResults() {
  // A new object on every press, so a second copy restarts the timer even with the same outcome.
  const [shown, setShown] = useState<LastShare | null>(null);
  const [busy, setBusy] = useState(false);
  // Set inside the press, before React renders, so a fast second `S` can't open a second sheet.
  const pending = useRef(false);

  useEffect(() => {
    if (shown?.outcome !== 'copied') return;
    const id = window.setTimeout(() => setShown({ ...shown, outcome: null }), COPIED_SHOWN_MS);
    return () => window.clearTimeout(id);
  }, [shown]);

  /** Call inside the press: share and copy both need user activation. */
  async function share(round: RoundState, text: string) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    // The box of an earlier failure stays through this press (D7); a new Round drops it.
    const boxText = shown?.round === round ? shown.boxText : null;
    // D7: empty the status first, so a screen reader announces the new outcome even when it repeats.
    setShown({ round, outcome: null, boxText });
    const outcome = await shareOrCopy(text, browserShareDeps());
    pending.current = false;
    setBusy(false);
    setShown({ round, outcome, boxText: outcome === 'failed' ? text : boxText });
  }

  /**
   * `busy` is for whatever Round is on screen: a sheet still open blocks the next press anyway.
   * What is shown is matched by object: the engine returns the same finished `RoundState` until
   * the next `start` (round.ts `reduce`), so a new Round never matches an old outcome.
   */
  function viewFor(round: RoundState): ShareView {
    const mine = shown?.round === round ? shown : null;
    return { busy, outcome: mine?.outcome ?? null, boxText: mine?.boxText ?? null };
  }

  return { share, viewFor };
}

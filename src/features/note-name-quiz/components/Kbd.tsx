import type { ReactNode } from 'react';

/** A key name as the Player presses it, e.g. `Tab`. */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">{children}</kbd>;
}

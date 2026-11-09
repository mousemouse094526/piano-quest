import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** A key name as the Player presses it, e.g. `Tab`. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={cn('rounded border px-1.5 py-0.5 font-mono text-xs', className)}>
      {children}
    </kbd>
  );
}

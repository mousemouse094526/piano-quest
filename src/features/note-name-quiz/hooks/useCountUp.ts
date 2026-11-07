import { useEffect, useState } from 'react';

const DURATION_MS = 600;

/**
 * D31: a Results number counts up from 0 to `target` once, easing out. With reduced
 * motion (or no target) it shows `target` straight away.
 */
export function useCountUp(target: number | null): number | null {
  const [shown, setShown] = useState(() =>
    target === null || prefersReducedMotion() ? target : 0,
  );

  useEffect(() => {
    if (target === null || prefersReducedMotion()) {
      setShown(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const step = (t: number) => {
      const progress = Math.min(1, (t - start) / DURATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      setShown(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

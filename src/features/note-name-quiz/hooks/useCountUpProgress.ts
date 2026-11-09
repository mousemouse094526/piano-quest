import { useEffect, useState } from 'react';

const DURATION_MS = 600;

/**
 * D31, D44: how far the Results numbers have counted up, from 0 to 1 once, easing out.
 * The engine's `countedUp` turns it into every number on the screen at once, so the
 * numbers seen together agree. With reduced motion it is 1 straight away.
 */
export function useCountUpProgress(): number {
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const start = performance.now();
    const step = (t: number) => {
      const linear = Math.min(1, (t - start) / DURATION_MS);
      setProgress(1 - (1 - linear) ** 3);
      if (linear < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return progress;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

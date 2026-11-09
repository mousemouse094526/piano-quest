/** How Results numbers read, on screen and in the Share text alike (D15, D25). */

/** A value Results cannot measure, such as a speed from fewer than 2 answers (D25). */
export const NO_VALUE = '—';

export const asWhole = (n: number) => String(Math.round(n));
export const asPercent = (n: number) => `${Math.round(n)}%`;
export const asSeconds = (n: number) => n.toFixed(2);

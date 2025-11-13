/**
 * General utilities: ID creation, date helpers, math smoothing (EMA), fuzzy matching.
 */

export const makeId = () => crypto.randomUUID();

export const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Compute an Exponential Moving Average.
 * alpha in (0,1]. For n observations typical alpha ~ 2/(n+1).
 */
export function ema(previous: number | undefined, current: number, alpha = 0.5): number {
  if (previous === undefined) return current;
  return alpha * current + (1 - alpha) * previous;
}

/**
 * Fuzzy match (very lightweight) by normalized token overlap.
 */
export function fuzzyMatch(input: string, candidates: string[]): string | undefined {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/);
  const inTokens = new Set(norm(input));
  let best: { c?: string; score: number } = { score: 0 };
  for (const c of candidates) {
    let score = 0;
    for (const t of norm(c)) {
      if (inTokens.has(t)) score += 1;
    }
    score = score / Math.max(1, norm(c).length);
    if (score > best.score) best = { c, score };
  }
  return best.score >= 0.5 ? best.c : undefined;
}

/**
 * Clamp number into range.
 */
export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
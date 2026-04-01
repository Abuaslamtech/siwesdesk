import { Score } from '../types';

/** Compute total (out of 100) from score components. */
export function computeTotal(score: Partial<Score>): number {
  const o = score.orientation ?? 0;
  const s = score.supervisorScore ?? 0;
  const i = score.industryScore ?? 0;
  return o + s + i;
}

/** Compute SIWES final grade (out of 50). */
export function computeFinal(score: Partial<Score>): number {
  return computeTotal(score) / 2;
}

/** Whether a score record is fully complete (not a draft, all values set). */
export function isScoreComplete(score: Score | undefined): boolean {
  if (!score) return false;
  if (score.isDraft) return false;
  return (
    score.orientation !== null &&
    score.supervisorScore !== null &&
    score.industryScore !== null
  );
}

/** Round to one decimal place. */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Percentage helper. */
export function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

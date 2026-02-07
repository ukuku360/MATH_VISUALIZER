export const clamp01 = (value: number): number => {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

export const pointMassCdf = (t: number, s: number): number => (t < s ? 0 : 1);

export const bernoulliMixCdf = (t: number, p: number): number => {
  const q = clamp01(p);
  if (t < 0) return 0;
  if (t < 1) return 1 - q;
  return 1;
};

export const uniformCdf = (t: number, a: number, b: number): number => {
  if (b <= a) return t < a ? 0 : 1;
  if (t < a) return 0;
  if (t >= b) return 1;
  return (t - a) / (b - a);
};

export const exponentialCdf = (t: number, lambda: number): number => {
  if (t < 0) return 0;
  return 1 - Math.exp(-Math.max(lambda, 1e-6) * t);
};

// ATM example: P = p * delta_0 + (1 - p) * Exp(lambda)
export const atmWaitingCdf = (t: number, p: number, lambda: number): number => {
  const atom = clamp01(p);
  if (t < 0) return 0;
  return atom + (1 - atom) * exponentialCdf(t, lambda);
};

export const jumpAt = (cdf: (x: number) => number, t: number, eps = 1e-4): number => {
  const left = cdf(t - eps);
  const right = cdf(t);
  return Math.max(0, right - left);
};

export const makeLinearGrid = (min: number, max: number, count: number): number[] => {
  if (count <= 1) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
};

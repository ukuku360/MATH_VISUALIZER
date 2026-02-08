export const cantorApprox = (x: number, depth = 14): number => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  let value = 0;
  let scale = 1;
  let current = x;

  for (let i = 0; i < depth; i++) {
    current *= 3;
    scale /= 2;

    if (current < 1) {
      continue;
    }

    if (current > 2) {
      value += scale;
      current -= 2;
      continue;
    }

    value += scale;
    break;
  }

  return value;
};

export const cantorCdf = (x: number): number => {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return cantorApprox(x);
};

export interface CantorInterval {
  start: number;
  end: number;
}

export const generateCantorIntervals = (iteration: number): CantorInterval[] => {
  let intervals: CantorInterval[] = [{ start: 0, end: 1 }];

  for (let i = 0; i < iteration; i++) {
    const next: CantorInterval[] = [];
    for (const { start, end } of intervals) {
      const third = (end - start) / 3;
      next.push({ start, end: start + third });
      next.push({ start: end - third, end });
    }
    intervals = next;
  }

  return intervals;
};

export const generateRemovedIntervals = (iteration: number): CantorInterval[] => {
  const removed: CantorInterval[] = [];
  let intervals: CantorInterval[] = [{ start: 0, end: 1 }];

  for (let i = 0; i < iteration; i++) {
    const next: CantorInterval[] = [];
    for (const { start, end } of intervals) {
      const third = (end - start) / 3;
      removed.push({ start: start + third, end: end - third });
      next.push({ start, end: start + third });
      next.push({ start: end - third, end });
    }
    intervals = next;
  }

  return removed;
};

export const cantorSetRemainingLength = (iteration: number): number => {
  return Math.pow(2 / 3, iteration);
};

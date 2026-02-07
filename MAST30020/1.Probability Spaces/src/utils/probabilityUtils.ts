import type { Set, ProbabilityAssignment, MeasureValidation } from '../types';

export const validateMeasure = (assignments: ProbabilityAssignment[]): MeasureValidation => {
  const total = assignments.reduce((sum, a) => sum + a.probability, 0);
  const allNonNegative = assignments.every((a) => a.probability >= 0);
  const sumToOne = Math.abs(total - 1) < 1e-9;
  return {
    isValid: allNonNegative && sumToOne,
    sumToOne,
    allNonNegative,
    total,
  };
};

export const computeEventProbability = (event: Set, assignments: ProbabilityAssignment[]): number => {
  return assignments
    .filter((a) => event.includes(a.outcome))
    .reduce((sum, a) => sum + a.probability, 0);
};

export const uniformDistribution = (omega: Set): ProbabilityAssignment[] => {
  const p = 1 / omega.length;
  return omega.map((outcome) => ({ outcome, probability: p }));
};

export const pointMass = (omega: Set, atom: number): ProbabilityAssignment[] => {
  return omega.map((outcome) => ({
    outcome,
    probability: outcome === atom ? 1 : 0,
  }));
};

export const inclusionExclusion2 = (pA: number, pB: number, pAB: number): number => {
  return pA + pB - pAB;
};

export const partialSums = (probabilities: number[]): number[] => {
  const sums: number[] = [];
  let running = 0;
  for (const p of probabilities) {
    running += p;
    sums.push(running);
  }
  return sums;
};

export const seriesConverges = (probabilities: number[], maxTerms = 1000): boolean => {
  let sum = 0;
  for (let i = 0; i < Math.min(probabilities.length, maxTerms); i++) {
    sum += probabilities[i];
  }
  // If we have many terms and the tail is still adding significant values, it diverges
  if (probabilities.length >= maxTerms && probabilities[maxTerms - 1] > 1e-10) {
    return false;
  }
  return sum < Infinity;
};

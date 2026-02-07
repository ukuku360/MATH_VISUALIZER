import type { Set } from '../types';

/**
 * Sorts elements to ensure consistent set representation.
 */
export const normalizeSet = (s: Set): Set => {
  return [...s].sort((a, b) => a - b);
};

/**
 * Checks if two sets are equal.
 */
export const setEquals = (a: Set, b: Set): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = normalizeSet(a);
  const sortedB = normalizeSet(b);
  return sortedA.every((val, index) => val === sortedB[index]);
};

/**
 * Checks if A is a subset of B.
 */
export const isSubset = (subset: Set, superset: Set): boolean => {
  return subset.every((elem) => superset.includes(elem));
};

/**
 * Returns the union of two sets.
 */
export const union = (a: Set, b: Set): Set => {
  const combined = new Set([...a, ...b]);
  return normalizeSet(Array.from(combined));
};

/**
 * Returns the intersection of two sets.
 */
export const intersection = (a: Set, b: Set): Set => {
  const result = a.filter((elem) => b.includes(elem));
  return normalizeSet(result);
};

/**
 * Returns the complement of A with respect to Omega.
 */
export const complement = (a: Set, omega: Set): Set => {
  const result = omega.filter((elem) => !a.includes(elem));
  return normalizeSet(result);
};

/**
 * Formats a set as a string, e.g., "{1, 2}" or "∅".
 */
export const formatSet = (s: Set): string => {
  if (s.length === 0) return '∅';
  return `{${normalizeSet(s).join(', ')}}`;
};

/**
 * Checks if a collection of sets contains a specific set.
 */
export const containsSet = (collection: Set[], target: Set): boolean => {
  return collection.some((s) => setEquals(s, target));
};

/**
 * Returns the set difference A \ B.
 */
export const setDifference = (a: Set, b: Set): Set => {
  const result = a.filter((elem) => !b.includes(elem));
  return normalizeSet(result);
};

/**
 * Returns the symmetric difference A △ B = (A \ B) ∪ (B \ A).
 */
export const symmetricDifference = (a: Set, b: Set): Set => {
  return union(setDifference(a, b), setDifference(b, a));
};

/**
 * Indicator function: 1_A(ω) = 1 if ω ∈ A, 0 otherwise.
 */
export const indicatorFunction = (set: Set, element: number): 0 | 1 => {
  return set.includes(element) ? 1 : 0;
};

import type { Set, SigmaAlgebra, ValidationResult } from '../types';
import { complement, union, containsSet, normalizeSet, setEquals } from './setUtils';

export const validateSigmaAlgebra = (collection: SigmaAlgebra, omega: Set): ValidationResult => {
  const normalizedCollection = collection.map(normalizeSet);
  const result: ValidationResult = {
    isValid: true,
    missingEmpty: false,
    missingWhole: false,
    missingComplements: [],
    missingUnions: [],
  };

  // 1. Check if empty set is present
  const emptySet: Set = [];
  if (!containsSet(normalizedCollection, emptySet)) {
    result.missingEmpty = true;
    result.isValid = false;
  }

  // 2. Check if Omega is present (implied by 1 + 2 but good for explicit feedback)
  if (!containsSet(normalizedCollection, omega)) {
    result.missingWhole = true;
    result.isValid = false;
  }

  // 3. Check for complements
  for (const s of normalizedCollection) {
    const comp = complement(s, omega);
    if (!containsSet(normalizedCollection, comp)) {
      // Avoid duplicate reporting (if A is missing B, B is missing A)
      const alreadyReported = result.missingComplements.some(
        (entry) => setEquals(entry.set, comp) && setEquals(entry.complement, s)
      );
      if (!alreadyReported) {
        result.missingComplements.push({ set: s, complement: comp });
      }
      result.isValid = false;
    }
  }

  // 4. Check for unions
  for (let i = 0; i < normalizedCollection.length; i++) {
    for (let j = i + 1; j < normalizedCollection.length; j++) {
      const setA = normalizedCollection[i];
      const setB = normalizedCollection[j];
      const unionSet = union(setA, setB);

      if (!containsSet(normalizedCollection, unionSet)) {
        const alreadyReported = result.missingUnions.some(
          (entry) => setEquals(entry.union, unionSet)
        );
        if (!alreadyReported) {
          result.missingUnions.push({ setA, setB, union: unionSet });
        }
        result.isValid = false;
      }
    }
  }

  return result;
};

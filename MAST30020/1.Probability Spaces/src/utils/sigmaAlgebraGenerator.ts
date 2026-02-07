import type { Set, SigmaAlgebra, GenerationStep } from '../types';
import { complement, union, containsSet, normalizeSet } from './setUtils';

export const generateSigmaAlgebra = (generators: SigmaAlgebra, omega: Set): SigmaAlgebra => {
  let currentCollection: SigmaAlgebra = [...generators.map(normalizeSet)];

  // Ensure empty set and omega are present
  if (!containsSet(currentCollection, [])) currentCollection.push([]);
  if (!containsSet(currentCollection, omega)) currentCollection.push(omega);

  let changed = true;
  while (changed) {
    changed = false;
    // const initialLength = currentCollection.length;
    const newSets: Set[] = [];

    // Add complements
    for (const s of currentCollection) {
      const comp = complement(s, omega);
      if (!containsSet(currentCollection, comp) && !containsSet(newSets, comp)) {
        newSets.push(comp);
      }
    }

    // Add unions
    // We only need to check unions involving at least one new set from previous iteration + existing,
    // but for simplicity and small N, we can just check all pairs or optimize slightly.
    // Optimization: check all pairs.
    // To avoid O(N^3) blowing up too fast, we add new sets and then re-evaluate.
    // For small N (omega size 4 -> max 16 sets), this is fine.
    
    // Add collected new sets first to current
    for (const s of newSets) {
       if (!containsSet(currentCollection, s)) {
          currentCollection.push(s);
          changed = true;
       }
    }
    
    // Now check unions of the expanded collection
    const unionsToAdd: Set[] = [];
    for (let i = 0; i < currentCollection.length; i++) {
      for (let j = i + 1; j < currentCollection.length; j++) {
        const u = union(currentCollection[i], currentCollection[j]);
        if (!containsSet(currentCollection, u) && !containsSet(unionsToAdd, u)) {
          unionsToAdd.push(u);
        }
      }
    }

    for (const s of unionsToAdd) {
        if (!containsSet(currentCollection, s)) {
            currentCollection.push(s);
            changed = true;
        }
    }
  }

  return currentCollection.sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      // Lexicographical sort for consistent display
      for(let k=0; k<a.length; k++) {
          if (a[k] !== b[k]) return a[k] - b[k];
      }
      return 0;
  });
};

export const generateSigmaAlgebraStepwise = (generators: SigmaAlgebra, omega: Set): GenerationStep[] => {
  const steps: GenerationStep[] = [];
  let currentCollection: SigmaAlgebra = [...generators.map(normalizeSet)];

  steps.push({
    stepNumber: 0,
    description: 'Start with generators',
    addedSets: [...currentCollection],
    currentCollection: [...currentCollection],
  });

  // Step: ensure ∅ and Ω
  const foundational: Set[] = [];
  if (!containsSet(currentCollection, [])) {
    currentCollection.push([]);
    foundational.push([]);
  }
  if (!containsSet(currentCollection, omega)) {
    currentCollection.push(omega);
    foundational.push(omega);
  }
  if (foundational.length > 0) {
    steps.push({
      stepNumber: steps.length,
      description: 'Add ∅ and Ω',
      addedSets: foundational,
      currentCollection: [...currentCollection],
    });
  }

  let changed = true;
  while (changed) {
    changed = false;

    // Complements
    const compSets: Set[] = [];
    for (const s of currentCollection) {
      const comp = complement(s, omega);
      if (!containsSet(currentCollection, comp) && !containsSet(compSets, comp)) {
        compSets.push(comp);
      }
    }
    if (compSets.length > 0) {
      for (const s of compSets) currentCollection.push(s);
      changed = true;
      steps.push({
        stepNumber: steps.length,
        description: 'Add complements',
        addedSets: compSets,
        currentCollection: [...currentCollection],
      });
    }

    // Unions
    const unionSets: Set[] = [];
    for (let i = 0; i < currentCollection.length; i++) {
      for (let j = i + 1; j < currentCollection.length; j++) {
        const u = union(currentCollection[i], currentCollection[j]);
        if (!containsSet(currentCollection, u) && !containsSet(unionSets, u)) {
          unionSets.push(u);
        }
      }
    }
    if (unionSets.length > 0) {
      for (const s of unionSets) currentCollection.push(s);
      changed = true;
      steps.push({
        stepNumber: steps.length,
        description: 'Add unions',
        addedSets: unionSets,
        currentCollection: [...currentCollection],
      });
    }
  }

  steps.push({
    stepNumber: steps.length,
    description: 'Closure complete — valid σ-algebra',
    addedSets: [],
    currentCollection: [...currentCollection],
  });

  return steps;
};

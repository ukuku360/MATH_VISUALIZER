export type Element = number;
export type Set = Element[];
export type SigmaAlgebra = Set[];

export interface ValidationResult {
  isValid: boolean;
  missingEmpty: boolean;
  missingWhole: boolean;
  missingComplements: { set: Set; complement: Set }[];
  missingUnions: { setA: Set; setB: Set; union: Set }[];
}

// Module navigation
export type ModuleId =
  | 'sample-spaces'
  | 'events-operations'
  | 'sigma-algebras'
  | 'probability-measure'
  | 'borel-cantelli';

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  subtitle: string;
  katexSymbol: string;
}

// Exercise system
export type ExerciseStatus = 'unattempted' | 'correct' | 'incorrect';

// Probability measure types
export interface ProbabilityAssignment {
  outcome: Element;
  probability: number;
}

export interface MeasureValidation {
  isValid: boolean;
  sumToOne: boolean;
  allNonNegative: boolean;
  total: number;
}

// Stepwise sigma-algebra generation
export interface GenerationStep {
  stepNumber: number;
  description: string;
  addedSets: Set[];
  currentCollection: SigmaAlgebra;
}

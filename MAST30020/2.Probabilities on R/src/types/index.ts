export type ModuleId =
  | 'cdf-foundations'
  | 'cdf-properties'
  | 'atoms-jumps'
  | 'cdf-construction'
  | 'distribution-classes';

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  subtitle: string;
  katexSymbol: string;
}

export type ExerciseStatus = 'unattempted' | 'correct' | 'incorrect';

export interface FunctionPoint {
  x: number;
  y: number;
}

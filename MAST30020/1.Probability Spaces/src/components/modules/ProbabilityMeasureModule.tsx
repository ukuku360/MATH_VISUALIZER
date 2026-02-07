import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import { VennDiagram } from '../shared/VennDiagram';
import { SampleSpace } from '../SampleSpace';
import {
  validateMeasure,
  computeEventProbability,
  uniformDistribution,
  pointMass,
  inclusionExclusion2,
} from '../../utils/probabilityUtils';
import { union, intersection, complement, formatSet } from '../../utils/setUtils';
import clsx from 'clsx';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import type { ProbabilityAssignment, ExerciseStatus, Set } from '../../types';

const OMEGA = [1, 2, 3, 4, 5, 6];

export const ProbabilityMeasureModule: React.FC = () => {
  const [assignments, setAssignments] = useState<ProbabilityAssignment[]>(uniformDistribution(OMEGA));
  const [selectedEvent, setSelectedEvent] = useState<Set>([]);
  const [ieA] = useState<Set>([1, 2, 3]);
  const [ieB] = useState<Set>([3, 4, 5]);

  const [ex1Answer, setEx1Answer] = useState('');
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState<string | null>(null);
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');

  const [contN, setContN] = useState(1);

  const validation = useMemo(() => validateMeasure(assignments), [assignments]);

  const handleSliderChange = (outcome: number, value: number) => {
    setAssignments((prev) =>
      prev.map((a) => (a.outcome === outcome ? { ...a, probability: value } : a))
    );
  };

  const eventProb = useMemo(
    () => computeEventProbability(selectedEvent, assignments),
    [selectedEvent, assignments]
  );
  const complementProb = useMemo(
    () => computeEventProbability(complement(selectedEvent, OMEGA), assignments),
    [selectedEvent, assignments]
  );

  const pA = computeEventProbability(ieA, assignments);
  const pB = computeEventProbability(ieB, assignments);
  const pAB = computeEventProbability(intersection(ieA, ieB), assignments);
  const pAuB = inclusionExclusion2(pA, pB, pAB);

  const increasingSeqs = Array.from({ length: 6 }, (_, i) => OMEGA.slice(0, i + 1));
  const currentIncSet = increasingSeqs[Math.min(contN - 1, 5)];
  const contProbs = increasingSeqs.map((s) => computeEventProbability(s, assignments));

  const booleEvents: Set[] = [[1, 2], [2, 3], [3, 4], [4, 5]];
  const booleUnion = booleEvents.reduce((acc, e) => union(acc, e), [] as Set);
  const booleLHS = computeEventProbability(booleUnion, assignments);
  const booleRHS = booleEvents.reduce((sum, e) => sum + computeEventProbability(e, assignments), 0);

  return (
    <ModuleWrapper
      title="Probability Measure"
      katexTitle="P"
      subtitle="Axioms, elementary properties, inclusion-exclusion, and continuity"
    >
      <div className="space-y-8">
        {/* Axioms */}
        <section className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
          <h4 className="font-bold mb-2">Probability Axioms</h4>
          <p className="mb-2">
            A probability on <InlineMath math="(\Omega, \mathcal{F})" /> is a function{' '}
            <InlineMath math="P: \mathcal{F} \to \mathbb{R}" /> satisfying:
          </p>
          <ul className="space-y-1 list-disc list-inside opacity-90">
            <li>(P.1) <InlineMath math="P(A) \geq 0" /> for all <InlineMath math="A \in \mathcal{F}" /></li>
            <li>(P.2) <InlineMath math="P(\Omega) = 1" /></li>
            <li>(P.3) For pairwise disjoint <InlineMath math="A_1, A_2, \ldots" />:{' '}
              <InlineMath math="P\left(\bigcup_{j=1}^{\infty} A_j\right) = \sum_{j=1}^{\infty} P(A_j)" /></li>
          </ul>
          <p className="mt-2 opacity-80">
            The triple <InlineMath math="(\Omega, \mathcal{F}, P)" /> is called a <strong>probability space</strong>.
          </p>
        </section>

        {/* Section 1: Build probability space */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Probability Space Builder</h3>
          <p className="text-sm text-gray-500 mb-4">
            Assign probabilities to each outcome in <InlineMath math="\Omega = \{1,2,3,4,5,6\}" />.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setAssignments(uniformDistribution(OMEGA))}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
            >
              Uniform
            </button>
            {OMEGA.map((k) => (
              <button
                key={k}
                onClick={() => setAssignments(pointMass(OMEGA, k))}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Point Mass at {k}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a.outcome} className="flex items-center gap-4">
                <span className="w-20 text-sm font-mono text-gray-600">
                  <InlineMath math={`P(\\{${a.outcome}\\})`} />
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(a.probability * 100)}
                  onChange={(e) => handleSliderChange(a.outcome, Number(e.target.value) / 100)}
                  className="flex-1 accent-indigo-600"
                />
                <span className="w-16 text-right text-sm font-mono text-gray-700">
                  {a.probability.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Sum bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">Sum of probabilities</span>
              <span className={clsx('font-mono font-bold', validation.sumToOne ? 'text-green-600' : 'text-red-500')}>
                {validation.total.toFixed(4)}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${Math.min(validation.total * 100, 100)}%` }}
                className={clsx(
                  'h-full rounded-full transition-colors',
                  validation.sumToOne ? 'bg-green-500' : validation.total > 1 ? 'bg-red-500' : 'bg-amber-400'
                )}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className={clsx('p-2 rounded-lg text-center font-medium', validation.allNonNegative ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
              (P.1) All ≥ 0 {validation.allNonNegative ? '✓' : '✗'}
            </div>
            <div className={clsx('p-2 rounded-lg text-center font-medium', validation.sumToOne ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
              (P.2) Sum = 1 {validation.sumToOne ? '✓' : '✗'}
            </div>
            <div className={clsx('p-2 rounded-lg text-center font-medium', validation.isValid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
              Valid P? {validation.isValid ? '✓' : '✗'}
            </div>
          </div>
        </section>

        {/* Section 2: Event Probability Calculator */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Event Probability Calculator</h3>
          <p className="text-sm text-gray-500 mb-4">
            Click outcomes to define event A, then see <InlineMath math="P(A)" /> computed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SampleSpace
                omega={OMEGA}
                highlightedSet={selectedEvent}
                onElementClick={(el) => {
                  setSelectedEvent((prev) =>
                    prev.includes(el) ? prev.filter((e) => e !== el) : [...prev, el].sort((a, b) => a - b)
                  );
                }}
                className="bg-gray-50 border-none shadow-none"
              />
            </div>
            <div className="flex flex-col justify-center space-y-3">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                <p className="text-xs text-indigo-500 font-semibold mb-1">Event</p>
                <InlineMath math={`A = ${formatSet(selectedEvent)}`} />
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-xs text-green-600 font-semibold mb-1">Probability</p>
                <InlineMath math={`P(A) = ${eventProb.toFixed(4)}`} />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 font-semibold mb-1">Complement</p>
                <InlineMath math={`P(A^c) = 1 - P(A) = ${complementProb.toFixed(4)}`} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Inclusion-Exclusion */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Inclusion-Exclusion Principle</h3>
          <BlockMath math="P(A \cup B) = P(A) + P(B) - P(A \cap B)" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">
                A = {formatSet(ieA)}, B = {formatSet(ieB)}
              </p>
              <VennDiagram highlighted={['onlyA', 'intersection', 'onlyB']} labelA="A" labelB="B" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <InlineMath math={`P(A) = ${pA.toFixed(4)}`} />
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <InlineMath math={`P(B) = ${pB.toFixed(4)}`} />
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <InlineMath math={`P(A \\cap B) = ${pAB.toFixed(4)}`} />
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 font-bold">
                <InlineMath math={`P(A \\cup B) = ${pA.toFixed(2)} + ${pB.toFixed(2)} - ${pAB.toFixed(2)} = ${pAuB.toFixed(4)}`} />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Subadditivity: <InlineMath math={`P(A \\cup B) = ${pAuB.toFixed(4)} \\leq ${(pA + pB).toFixed(4)} = P(A) + P(B)`} />
                {pAuB <= pA + pB + 1e-9 ? ' ✓' : ' ✗'}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Boole's Inequality */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Boole's Inequality</h3>
          <BlockMath math="P\left(\bigcup_{j=1}^{n} A_j\right) \leq \sum_{j=1}^{n} P(A_j)" />

          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">
              Events: {booleEvents.map((e) => formatSet(e)).join(', ')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-sm">
                <p className="text-xs text-indigo-500 font-semibold mb-1">LHS (union)</p>
                <InlineMath math={`P\\left(\\bigcup A_j\\right) = ${booleLHS.toFixed(4)}`} />
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm">
                <p className="text-xs text-amber-600 font-semibold mb-1">RHS (sum)</p>
                <InlineMath math={`\\sum P(A_j) = ${booleRHS.toFixed(4)}`} />
              </div>
            </div>
            <p className={clsx('text-sm font-bold', booleLHS <= booleRHS + 1e-9 ? 'text-green-600' : 'text-red-500')}>
              {booleLHS.toFixed(4)} ≤ {booleRHS.toFixed(4)} {booleLHS <= booleRHS + 1e-9 ? '✓ Verified!' : '✗ Error'}
            </p>
          </div>
        </section>

        {/* Section 5: Continuity of Probability */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Continuity of Probability</h3>
          <p className="text-sm text-gray-500 mb-2">
            If <InlineMath math="A_n \uparrow A" />, then <InlineMath math="P(A_n) \uparrow P(A)" />.
          </p>
          <BlockMath math="A_n = \{1, 2, \ldots, n\} \uparrow \Omega" />

          <div className="mt-4">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm text-gray-600">n =</label>
              <input
                type="range"
                min={1}
                max={6}
                value={contN}
                onChange={(e) => setContN(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="font-mono text-sm w-8">{contN}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-500">
                <InlineMath math={`A_{${contN}} = ${formatSet(currentIncSet)}`} />
              </span>
              <span className="text-sm text-indigo-600 font-mono">
                P(A<sub>{contN}</sub>) = {contProbs[contN - 1].toFixed(4)}
              </span>
            </div>

            {/* Simple bar chart */}
            <div className="flex items-end gap-2 h-32">
              {contProbs.map((p, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <motion.div
                    animate={{ height: `${p * 100}%` }}
                    className={clsx(
                      'w-full rounded-t-md transition-colors',
                      i < contN ? 'bg-indigo-500' : 'bg-gray-200'
                    )}
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-[10px] text-gray-500 mt-1">{i + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-1">
              <InlineMath math="P(A_n)" /> converges to{' '}
              <InlineMath math={`P(\\Omega) = ${contProbs[5].toFixed(4)}`} />
            </p>
          </div>
        </section>

        {/* Exercises */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title="E4.1: Compute P(A)"
            description={<>Under uniform distribution on <InlineMath math="\{1,...,6\}" />, compute <InlineMath math="P(\text{even numbers})" />.</>}
            status={ex1Status}
            feedback={ex1Status === 'correct' ? 'Correct! P({2,4,6}) = 3/6 = 0.5.' : ex1Status === 'incorrect' ? 'Under uniform, P(A) = |A|/|Ω|. There are 3 even numbers out of 6.' : undefined}
            hint="P(A) = |A|/|Ω| for uniform distribution."
            onReset={() => { setEx1Answer(''); setEx1Status('unattempted'); }}
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={ex1Answer}
                onChange={(e) => setEx1Answer(e.target.value)}
                placeholder="e.g. 0.5 or 1/2"
                className="border border-gray-300 rounded-lg px-3 py-2 w-40 text-sm"
              />
              <button
                onClick={() => {
                  const cleaned = ex1Answer.trim();
                  let val = NaN;
                  if (cleaned.includes('/')) {
                    const parts = cleaned.split('/');
                    val = parseFloat(parts[0]) / parseFloat(parts[1]);
                  } else {
                    val = parseFloat(cleaned);
                  }
                  setEx1Status(Math.abs(val - 0.5) < 0.01 ? 'correct' : 'incorrect');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Check
              </button>
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E4.2: Inclusion-Exclusion"
            description={<>If <InlineMath math="P(A) = 0.6, P(B) = 0.5, P(A \cap B) = 0.3" />, what is <InlineMath math="P(A \cup B)" />?</>}
            status={ex2Status}
            feedback={ex2Status === 'correct' ? 'Correct! P(A ∪ B) = 0.6 + 0.5 - 0.3 = 0.8.' : ex2Status === 'incorrect' ? 'Use: P(A ∪ B) = P(A) + P(B) - P(A ∩ B).' : undefined}
            hint="P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.6 + 0.5 - 0.3 = ?"
            onReset={() => { setEx2Answer(null); setEx2Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {['0.5', '0.8', '1.1', '0.3'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setEx2Answer(opt); setEx2Status(opt === '0.8' ? 'correct' : 'incorrect'); }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm font-mono transition-colors',
                    ex2Answer === opt
                      ? opt === '0.8' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </ExerciseCard>
        </section>
      </div>
    </ModuleWrapper>
  );
};

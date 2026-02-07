import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import { VennDiagram, type VennRegion } from '../shared/VennDiagram';
import { SampleSpace } from '../SampleSpace';
import {
  union,
  intersection,
  complement,
  setDifference,
  symmetricDifference,
  indicatorFunction,
  formatSet,
  normalizeSet,
  setEquals,
} from '../../utils/setUtils';
import clsx from 'clsx';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import type { ExerciseStatus, Set } from '../../types';

const OMEGA = [1, 2, 3, 4];

type SetOperation = 'complement' | 'intersection' | 'union' | 'difference' | 'symmetric';

const OP_INFO: Record<SetOperation, { label: string; latex: string; description: string }> = {
  complement: { label: 'Complement', latex: 'A^c', description: 'All elements NOT in A' },
  intersection: { label: 'Intersection', latex: 'A \\cap B', description: 'Elements in BOTH A and B' },
  union: { label: 'Union', latex: 'A \\cup B', description: 'Elements in A OR B (or both)' },
  difference: { label: 'Set Difference', latex: 'A \\setminus B', description: 'Elements in A but NOT in B' },
  symmetric: { label: 'Symmetric Diff', latex: 'A \\triangle B', description: 'Elements in exactly one of A or B' },
};

export const EventsOperationsModule: React.FC = () => {
  const [setA, setSetA] = useState<Set>([1, 2]);
  const [setB, setSetB] = useState<Set>([2, 3]);
  const [operation, setOperation] = useState<SetOperation>('intersection');
  const [activeDefiner, setActiveDefiner] = useState<'A' | 'B'>('A');

  const [vennHighlight, setVennHighlight] = useState<VennRegion[]>([]);

  const [ex1Answer, setEx1Answer] = useState<string | null>(null);
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState<string | null>(null);
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');

  const result = useMemo(() => {
    switch (operation) {
      case 'complement': return complement(setA, OMEGA);
      case 'intersection': return intersection(setA, setB);
      case 'union': return union(setA, setB);
      case 'difference': return setDifference(setA, setB);
      case 'symmetric': return symmetricDifference(setA, setB);
    }
  }, [setA, setB, operation]);

  const deMorganLHS = complement(union(setA, setB), OMEGA);
  const deMorganRHS = intersection(complement(setA, OMEGA), complement(setB, OMEGA));

  const handleElementClick = (element: number) => {
    const setter = activeDefiner === 'A' ? setSetA : setSetB;
    setter((prev) => {
      if (prev.includes(element)) return prev.filter((e) => e !== element);
      return normalizeSet([...prev, element]);
    });
  };

  const handleVennClick = (region: VennRegion) => {
    setVennHighlight((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const vennExpression = useMemo(() => {
    const sorted = [...vennHighlight].sort();
    const key = sorted.join(',');
    const map: Record<string, string> = {
      'onlyA': 'A \\setminus B',
      'onlyB': 'B \\setminus A',
      'intersection': 'A \\cap B',
      'outside': '(A \\cup B)^c',
      'onlyA,onlyB': 'A \\triangle B',
      'intersection,onlyA': 'A',
      'intersection,onlyB': 'B',
      'intersection,onlyA,onlyB': 'A \\cup B',
      'intersection,onlyA,onlyB,outside': '\\Omega',
      'onlyA,outside': 'B^c',
      'onlyB,outside': 'A^c',
      '': '\\emptyset',
    };
    return map[key] || '\\text{custom selection}';
  }, [vennHighlight]);

  return (
    <ModuleWrapper
      title="Events & Set Operations"
      katexTitle="A \subset \Omega"
      subtitle="Events as subsets, set operations, indicator functions, and De Morgan's laws"
    >
      <div className="space-y-8">
        {/* Section 1: Interactive Set Operations */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Set Operation Explorer</h3>
          <p className="text-sm text-gray-500 mb-4">
            Define events A and B by clicking elements, then choose an operation.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveDefiner('A')}
                  className={clsx(
                    'flex-1 py-2 rounded-lg text-sm font-bold transition-colors',
                    activeDefiner === 'A' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  Define A
                </button>
                <button
                  onClick={() => setActiveDefiner('B')}
                  className={clsx(
                    'flex-1 py-2 rounded-lg text-sm font-bold transition-colors',
                    activeDefiner === 'B' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  Define B
                </button>
              </div>

              <SampleSpace
                omega={OMEGA}
                highlightedSet={activeDefiner === 'A' ? setA : setB}
                onElementClick={handleElementClick}
                className="bg-gray-50 border-none shadow-none"
              />

              <div className="text-sm space-y-1">
                <div><span className="text-blue-600 font-bold">A</span> = <span className="font-mono">{formatSet(setA)}</span></div>
                <div><span className="text-red-500 font-bold">B</span> = <span className="font-mono">{formatSet(setB)}</span></div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Operation</p>
              {(Object.keys(OP_INFO) as SetOperation[]).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    operation === op
                      ? 'bg-white border-indigo-400 shadow-md ring-1 ring-indigo-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{OP_INFO[op].label}</span>
                    <InlineMath math={OP_INFO[op].latex} />
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 text-center w-full">
                <p className="text-xs text-indigo-500 font-semibold uppercase mb-2">Result</p>
                <div className="mb-2">
                  <InlineMath math={`${OP_INFO[operation].latex} = ${result.length === 0 ? '\\emptyset' : `\\{${result.join(', ')}\\}`}`} />
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {OMEGA.map((el) => (
                    <motion.div
                      key={el}
                      animate={{
                        backgroundColor: result.includes(el) ? '#818cf8' : '#f3f4f6',
                        color: result.includes(el) ? '#ffffff' : '#9ca3af',
                      }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                    >
                      {el}
                    </motion.div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{OP_INFO[operation].description}</p>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Venn Diagram */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Interactive Venn Diagram</h3>
          <p className="text-sm text-gray-500 mb-4">Click regions to select them. The app identifies the set expression.</p>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <VennDiagram highlighted={vennHighlight} onRegionClick={handleVennClick} />
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Selection matches</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-w-[120px]">
                <InlineMath math={vennExpression} />
              </div>
              <button onClick={() => setVennHighlight([])} className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline">
                Clear selection
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Indicator Function Table */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Indicator Functions</h3>
          <div className="text-sm text-gray-500 mb-4">
            The indicator function <InlineMath math="1_A(\omega)" /> is 1 if <InlineMath math="\omega \in A" />, 0 otherwise.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-2 text-left text-gray-500"><InlineMath math="\omega" /></th>
                  <th className="p-2 text-blue-600"><InlineMath math="1_A" /></th>
                  <th className="p-2 text-red-500"><InlineMath math="1_B" /></th>
                  <th className="p-2 text-gray-700"><InlineMath math="1_{A^c} = 1 - 1_A" /></th>
                  <th className="p-2 text-purple-600"><InlineMath math="1_{A \cap B} = 1_A \cdot 1_B" /></th>
                  <th className="p-2 text-green-600"><InlineMath math="1_{A \cup B} = \max" /></th>
                  <th className="p-2 text-orange-600"><InlineMath math="1_{A \triangle B} = |1_A - 1_B|" /></th>
                </tr>
              </thead>
              <tbody>
                {OMEGA.map((omega) => {
                  const iA = indicatorFunction(setA, omega);
                  const iB = indicatorFunction(setB, omega);
                  return (
                    <tr key={omega} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 font-bold text-gray-700">{omega}</td>
                      <td className="p-2 text-center font-mono text-blue-600">{iA}</td>
                      <td className="p-2 text-center font-mono text-red-500">{iB}</td>
                      <td className="p-2 text-center font-mono">{1 - iA}</td>
                      <td className="p-2 text-center font-mono text-purple-600">{iA * iB}</td>
                      <td className="p-2 text-center font-mono text-green-600">{Math.max(iA, iB)}</td>
                      <td className="p-2 text-center font-mono text-orange-600">{Math.abs(iA - iB)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-800">
            <strong>Key identities:</strong>{' '}
            <InlineMath math="1_{A^c} = 1 - 1_A" />,{' '}
            <InlineMath math="1_{A \cap B} = 1_A \cdot 1_B" />,{' '}
            <InlineMath math="1_{A \cup B} = \max\{1_A, 1_B\}" />,{' '}
            <InlineMath math="1_{A \triangle B} = |1_A - 1_B|" />
          </div>
        </section>

        {/* Section 4: De Morgan's Laws */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">De Morgan's Laws Verifier</h3>
          <p className="text-sm text-gray-500 mb-4">
            Verify that <InlineMath math="(A \cup B)^c = A^c \cap B^c" /> with your current A and B.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-semibold mb-2">Left-hand side</p>
              <InlineMath math={`(A \\cup B)^c = ${formatSet(deMorganLHS)}`} />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-semibold mb-2">Right-hand side</p>
              <InlineMath math={`A^c \\cap B^c = ${formatSet(deMorganRHS)}`} />
            </div>
          </div>
          <div className="mt-3 text-center">
            {setEquals(deMorganLHS, deMorganRHS) ? (
              <span className="text-green-600 font-bold text-sm">Equal! De Morgan's law verified.</span>
            ) : (
              <span className="text-red-500 font-bold text-sm">Not equal (this should not happen!)</span>
            )}
          </div>
        </section>

        {/* Section 5: Exercises */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title='E2.1: Express the Event'
            description={<>"Neither A nor B occurred." Which set expression is this?</>}
            status={ex1Status}
            feedback={ex1Status === 'correct' ? "Correct! By De Morgan's law, (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ." : ex1Status === 'incorrect' ? "'Neither' means not in A AND not in B." : undefined}
            hint="'Neither A nor B' = 'not (A or B)' = (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ"
            onReset={() => { setEx1Answer(null); setEx1Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'A^c \\cap B^c', correct: true },
                { label: 'A^c \\cup B^c', correct: false },
                { label: 'A \\cap B', correct: false },
                { label: '(A \\cup B)^c', correct: true },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => { setEx1Answer(opt.label); setEx1Status(opt.correct ? 'correct' : 'incorrect'); }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex1Answer === opt.label
                      ? opt.correct ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <InlineMath math={opt.label} />
                </button>
              ))}
            </div>
          </ExerciseCard>

          <ExerciseCard
            title='E2.2: Exactly One Event'
            description={<>Which expression represents "exactly one of <InlineMath math="A, B" /> occurred"?</>}
            status={ex2Status}
            feedback={ex2Status === 'correct' ? 'Correct! The symmetric difference A △ B = (A \\ B) ∪ (B \\ A).' : ex2Status === 'incorrect' ? 'This means: (in A but not B) OR (in B but not A).' : undefined}
            hint="Exactly one = in A XOR B = symmetric difference A △ B"
            onReset={() => { setEx2Answer(null); setEx2Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'A \\cup B', correct: false },
                { label: 'A \\triangle B', correct: true },
                { label: 'A \\cap B', correct: false },
                { label: '(A \\cup B) \\setminus (A \\cap B)', correct: true },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => { setEx2Answer(opt.label); setEx2Status(opt.correct ? 'correct' : 'incorrect'); }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex2Answer === opt.label
                      ? opt.correct ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <InlineMath math={opt.label} />
                </button>
              ))}
            </div>
          </ExerciseCard>
        </section>
      </div>
    </ModuleWrapper>
  );
};

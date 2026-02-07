import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import { union } from '../../utils/setUtils';
import { partialSums } from '../../utils/probabilityUtils';
import clsx from 'clsx';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ExerciseStatus, Set } from '../../types';

const OMEGA = [1, 2, 3, 4, 5, 6];
const EVENT_COUNT = 8;

// Preset probability sequences
const PRESETS: Record<string, { label: string; latex: string; probs: number[]; converges: boolean }> = {
  inv_n2: {
    label: '1/n²',
    latex: 'P(A_n) = 1/n^2',
    probs: Array.from({ length: EVENT_COUNT }, (_, i) => 1 / ((i + 1) ** 2)),
    converges: true,
  },
  inv_n: {
    label: '1/n',
    latex: 'P(A_n) = 1/n',
    probs: Array.from({ length: EVENT_COUNT }, (_, i) => 1 / (i + 1)),
    converges: false,
  },
  inv_2n: {
    label: '1/2ⁿ',
    latex: 'P(A_n) = 1/2^n',
    probs: Array.from({ length: EVENT_COUNT }, (_, i) => 1 / (2 ** (i + 1))),
    converges: true,
  },
  constant: {
    label: '0.3',
    latex: 'P(A_n) = 0.3',
    probs: Array.from({ length: EVENT_COUNT }, () => 0.3),
    converges: false,
  },
};

export const BorelCantelliModule: React.FC = () => {
  // Event sequence matrix: rows = events, cols = elements of Ω
  const [matrix, setMatrix] = useState<boolean[][]>(
    Array.from({ length: EVENT_COUNT }, (_, i) => OMEGA.map((_, j) => (i + j) % 3 === 0))
  );

  // Tail slider
  const [tailN, setTailN] = useState(1);

  // Probability preset
  const [activePreset, setActivePreset] = useState('inv_n2');

  // Proof walkthrough
  const [openProofStep, setOpenProofStep] = useState<number | null>(null);

  // Exercises
  const [ex1Answer, setEx1Answer] = useState<number[]>([]);
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState<string[]>([]);
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');

  const toggleCell = (row: number, col: number) => {
    setMatrix((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = !next[row][col];
      return next;
    });
  };

  // Convert matrix row to Set
  const eventAsSet = (row: number): Set =>
    OMEGA.filter((_, j) => matrix[row][j]);

  // Count how many events contain each ω
  const countPerOmega = useMemo(
    () =>
      OMEGA.map((_, j) => matrix.reduce((count, row) => count + (row[j] ? 1 : 0), 0)),
    [matrix]
  );

  // Tail union B_N = ∪_{k≥N} A_k
  const tailUnion = useMemo(() => {
    let result: Set = [];
    for (let k = tailN - 1; k < EVENT_COUNT; k++) {
      result = union(result, eventAsSet(k));
    }
    return result;
  }, [matrix, tailN]);

  // lim sup = ∩_N B_N (in finite setting, just the elements that appear in tail unions for all N)
  const limSup = useMemo(() => {
    let result = OMEGA;
    for (let n = 1; n <= EVENT_COUNT; n++) {
      let bN: Set = [];
      for (let k = n - 1; k < EVENT_COUNT; k++) {
        bN = union(bN, eventAsSet(k));
      }
      result = result.filter((el) => bN.includes(el));
    }
    return result;
  }, [matrix]);

  // Partial sums for the selected preset
  const preset = PRESETS[activePreset];
  const pSums = partialSums(preset.probs);
  const maxSum = Math.max(...pSums, 1);

  // Proof steps
  const proofSteps = [
    {
      title: 'Setup',
      content: 'We want to show: if ∑P(Aₙ) < ∞, then P(Aₙ i.o.) = 0.',
      latex: 'P(A_n \\text{ i.o.}) = P\\left(\\bigcap_{n \\geq 1} \\bigcup_{k \\geq n} A_k\\right)',
    },
    {
      title: 'Apply continuity from above',
      content: 'Since ∪_{k≥n} Aₖ ↓ as n → ∞, use Thm 1.25(c):',
      latex: 'P(A_n \\text{ i.o.}) = \\lim_{n \\to \\infty} P\\left(\\bigcup_{k \\geq n} A_k\\right)',
    },
    {
      title: "Apply Boole's inequality",
      content: 'For each n:',
      latex: 'P\\left(\\bigcup_{k \\geq n} A_k\\right) \\leq \\sum_{k \\geq n} P(A_k)',
    },
    {
      title: 'Take the limit',
      content: 'Since ∑P(Aₙ) < ∞, the tail sum → 0:',
      latex: '\\lim_{n \\to \\infty} \\sum_{k \\geq n} P(A_k) = 0',
    },
    {
      title: 'Conclude',
      content: 'By squeeze theorem (0 ≤ P(lim sup) ≤ 0):',
      latex: 'P(A_n \\text{ i.o.}) = 0 \\quad \\blacksquare',
    },
  ];

  return (
    <ModuleWrapper
      title="Borel-Cantelli Lemma"
      katexTitle="A_n \text{ i.o.}"
      subtitle='The "infinitely often" concept and the First Borel-Cantelli Lemma'
    >
      <div className="space-y-8">
        {/* lim sup definition */}
        <section className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
          <h4 className="font-bold mb-2">lim sup of Events ("Infinitely Often")</h4>
          <BlockMath math="\{A_n \text{ i.o.}\} := \bigcap_{n=1}^{\infty} \bigcup_{k=n}^{\infty} A_k = \{\omega : \omega \in A_n \text{ for infinitely many } n\}" />
          <p className="mt-2 opacity-80">
            An outcome <InlineMath math="\omega" /> is in <InlineMath math="A_n" /> i.o. if and only if it belongs to infinitely many of the events.
          </p>
        </section>

        {/* Section 1: Event Sequence Matrix */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Event Sequence Matrix</h3>
          <p className="text-sm text-gray-500 mb-4">
            Click cells to toggle whether <InlineMath math="\omega" /> belongs to <InlineMath math="A_n" />.
            The count row shows how many events each <InlineMath math="\omega" /> appears in.
          </p>

          <div className="overflow-x-auto">
            <table className="border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-gray-500 text-xs"></th>
                  {OMEGA.map((el) => (
                    <th key={el} className="p-2 text-center font-bold text-gray-700 w-12">
                      <InlineMath math={`\\omega=${el}`} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-2 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      <InlineMath math={`A_{${i + 1}}`} />
                    </td>
                    {row.map((val, j) => (
                      <td key={j} className="p-1 text-center">
                        <button
                          onClick={() => toggleCell(i, j)}
                          className={clsx(
                            'w-10 h-8 rounded-md text-xs font-bold transition-colors border',
                            val
                              ? 'bg-indigo-500 text-white border-indigo-600'
                              : 'bg-gray-50 text-gray-300 border-gray-200 hover:bg-gray-100'
                          )}
                        >
                          {val ? '1' : '0'}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Count row */}
                <tr className="border-t-2 border-gray-300">
                  <td className="p-2 text-xs font-bold text-gray-700">Count</td>
                  {countPerOmega.map((count, j) => (
                    <td key={j} className="p-2 text-center">
                      <span
                        className={clsx(
                          'inline-block w-8 h-8 rounded-full leading-8 text-xs font-bold',
                          count >= EVENT_COUNT * 0.7
                            ? 'bg-red-100 text-red-700'
                            : count >= EVENT_COUNT * 0.3
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {count}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: lim sup Visualizer */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">lim sup Visualizer</h3>
          <p className="text-sm text-gray-500 mb-4">
            Slide N to see the tail union <InlineMath math="B_N = \bigcup_{k \geq N} A_k" /> shrink.
            The lim sup is <InlineMath math="\bigcap_N B_N" />.
          </p>

          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm text-gray-600 whitespace-nowrap">N =</label>
            <input
              type="range"
              min={1}
              max={EVENT_COUNT}
              value={tailN}
              onChange={(e) => setTailN(Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="font-mono text-sm w-8">{tailN}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-2">
                <InlineMath math={`B_{${tailN}} = \\bigcup_{k \\geq ${tailN}} A_k`} />
              </p>
              <div className="flex gap-2">
                {OMEGA.map((el) => (
                  <motion.div
                    key={el}
                    animate={{
                      backgroundColor: tailUnion.includes(el) ? '#818cf8' : '#f3f4f6',
                      color: tailUnion.includes(el) ? '#ffffff' : '#d1d5db',
                      scale: tailUnion.includes(el) ? 1 : 0.9,
                    }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                  >
                    {el}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              <p className="text-xs text-indigo-500 font-semibold mb-2">
                <InlineMath math="\limsup A_n = \bigcap_N B_N" />
              </p>
              <div className="flex gap-2">
                {OMEGA.map((el) => (
                  <motion.div
                    key={el}
                    animate={{
                      backgroundColor: limSup.includes(el) ? '#4f46e5' : '#f3f4f6',
                      color: limSup.includes(el) ? '#ffffff' : '#d1d5db',
                    }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                  >
                    {el}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-indigo-600 mt-2">
                Elements appearing in "enough" events to survive every tail union.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: First Borel-Cantelli Lemma */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">First Borel-Cantelli Lemma</h3>
          <BlockMath math="\text{If } \sum_{n=1}^{\infty} P(A_n) < \infty, \text{ then } P(A_n \text{ i.o.}) = 0." />

          <div className="flex flex-wrap gap-2 mb-4 mt-4">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setActivePreset(key)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  activePreset === key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                )}
              >
                <InlineMath math={p.latex} />
              </button>
            ))}
          </div>

          {/* Partial sum chart */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-semibold mb-2">
              Partial sums <InlineMath math="S_N = \sum_{n=1}^{N} P(A_n)" />
            </p>
            <div className="relative h-48 bg-gray-50 rounded-xl border border-gray-200 p-4">
              <svg viewBox="0 0 400 160" className="w-full h-full">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
                  <line
                    key={frac}
                    x1={40}
                    y1={10 + (1 - frac) * 140}
                    x2={390}
                    y2={10 + (1 - frac) * 140}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                ))}

                {/* Axis labels */}
                <text x={5} y={15} className="fill-gray-400" fontSize={9}>{maxSum.toFixed(1)}</text>
                <text x={5} y={155} className="fill-gray-400" fontSize={9}>0</text>

                {/* Partial sum points and lines */}
                {pSums.map((s, i) => {
                  const x = 40 + (i / (EVENT_COUNT - 1)) * 350;
                  const y = 10 + (1 - s / maxSum) * 140;
                  const prevX = i > 0 ? 40 + ((i - 1) / (EVENT_COUNT - 1)) * 350 : x;
                  const prevY = i > 0 ? 10 + (1 - pSums[i - 1] / maxSum) * 140 : y;
                  return (
                    <g key={i}>
                      {i > 0 && (
                        <line x1={prevX} y1={prevY} x2={x} y2={y} stroke="#6366f1" strokeWidth={2} />
                      )}
                      <circle cx={x} cy={y} r={4} fill="#6366f1" />
                      <text x={x} y={160} textAnchor="middle" className="fill-gray-500" fontSize={9}>
                        {i + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Verdict */}
          <div
            className={clsx(
              'p-4 rounded-xl border text-sm font-medium',
              preset.converges
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            )}
          >
            {preset.converges ? (
              <>
                <InlineMath math="\sum P(A_n) < \infty" /> — Series converges.{' '}
                <strong>By the First Borel-Cantelli Lemma:</strong>{' '}
                <InlineMath math="P(A_n \text{ i.o.}) = 0" />.
              </>
            ) : (
              <>
                <InlineMath math="\sum P(A_n) = \infty" /> — Series diverges.{' '}
                <strong>The First BC Lemma does NOT apply.</strong> Cannot conclude P(Aₙ i.o.) = 0 without independence.
              </>
            )}
          </div>
        </section>

        {/* Section 4: Proof Walkthrough */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Proof Walkthrough</h3>
          <div className="space-y-2">
            {proofSteps.map((step, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenProofStep(openProofStep === i ? null : i)}
                  className="w-full text-left p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Step {i + 1}: {step.title}
                  </span>
                  {openProofStep === i ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {openProofStep === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-sm text-gray-600 mb-2">{step.content}</p>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <BlockMath math={step.latex} />
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title="E5.1: Identify lim sup elements"
            description={<>In the current event matrix, which elements of <InlineMath math="\Omega" /> are in <InlineMath math="\limsup A_n" />?</>}
            status={ex1Status}
            feedback={
              ex1Status === 'correct'
                ? 'Correct! These are the elements that appear in sufficiently many events to survive every tail union.'
                : ex1Status === 'incorrect'
                ? 'Check which elements appear in the tail union for every possible N.'
                : undefined
            }
            hint="An element is in lim sup if it remains in B_N for ALL N. Check the lim sup visualizer above."
            onReset={() => { setEx1Answer([]); setEx1Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {OMEGA.map((el) => (
                <button
                  key={el}
                  onClick={() => {
                    setEx1Answer((prev) =>
                      prev.includes(el) ? prev.filter((e) => e !== el) : [...prev, el]
                    );
                    setEx1Status('unattempted');
                  }}
                  className={clsx(
                    'w-10 h-10 rounded-lg text-sm font-bold border transition-colors',
                    ex1Answer.includes(el)
                      ? 'bg-indigo-500 text-white border-indigo-600'
                      : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                  )}
                >
                  {el}
                </button>
              ))}
              <button
                onClick={() => {
                  const sortedAnswer = [...ex1Answer].sort((a, b) => a - b);
                  const sortedLimSup = [...limSup].sort((a, b) => a - b);
                  const correct =
                    sortedAnswer.length === sortedLimSup.length &&
                    sortedAnswer.every((v, i) => v === sortedLimSup[i]);
                  setEx1Status(correct ? 'correct' : 'incorrect');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Check
              </button>
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E5.2: Series Convergence"
            description={<>Which of these satisfy the Borel-Cantelli condition <InlineMath math="\sum P(A_n) < \infty" />?</>}
            status={ex2Status}
            feedback={
              ex2Status === 'correct'
                ? 'Correct! 1/n² converges (π²/6) and 1/2ⁿ converges (1). The others diverge.'
                : ex2Status === 'incorrect'
                ? 'Remember: 1/n diverges (harmonic series), constant series diverges, but 1/n² and 1/2ⁿ converge.'
                : undefined
            }
            hint="p-series: Σ1/nᵅ converges iff α > 1. Geometric series: Σrⁿ converges iff |r| < 1."
            onReset={() => { setEx2Answer([]); setEx2Status('unattempted'); }}
          >
            <div className="space-y-2">
              {Object.entries(PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => {
                    setEx2Answer((prev) =>
                      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                    );
                    setEx2Status('unattempted');
                  }}
                  className={clsx(
                    'block w-full text-left px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex2Answer.includes(key)
                      ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <InlineMath math={p.latex} />
                  {ex2Answer.includes(key) && ' ✓'}
                </button>
              ))}
              <button
                onClick={() => {
                  const correct = new Set(['inv_n2', 'inv_2n']);
                  const answer = new Set(ex2Answer);
                  const isCorrect =
                    correct.size === answer.size && [...correct].every((k) => answer.has(k));
                  setEx2Status(isCorrect ? 'correct' : 'incorrect');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors mt-2"
              >
                Check
              </button>
            </div>
          </ExerciseCard>
        </section>
      </div>
    </ModuleWrapper>
  );
};

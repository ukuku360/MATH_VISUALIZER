import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import clsx from 'clsx';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Dices, FlipVertical, Clock, Infinity, ChevronRight } from 'lucide-react';
import type { ExerciseStatus } from '../../types';

interface ExperimentDef {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  omegaLatex: string;
  omegaType: 'finite' | 'countably-infinite' | 'uncountable';
  elements?: string[];
  visual: 'grid' | 'number-line' | 'sequence';
}

const EXPERIMENTS: ExperimentDef[] = [
  {
    id: 'coin',
    name: 'Coin Toss',
    icon: <FlipVertical size={18} />,
    description: 'Toss a fair coin once. Two possible outcomes.',
    omegaLatex: '\\Omega = \\{H, T\\}',
    omegaType: 'finite',
    elements: ['H', 'T'],
    visual: 'grid',
  },
  {
    id: 'die',
    name: 'Dice Roll',
    icon: <Dices size={18} />,
    description: 'Roll a standard six-sided die once.',
    omegaLatex: '\\Omega = \\{1, 2, 3, 4, 5, 6\\}',
    omegaType: 'finite',
    elements: ['1', '2', '3', '4', '5', '6'],
    visual: 'grid',
  },
  {
    id: 'coin3',
    name: '3 Coin Flips',
    icon: <FlipVertical size={18} />,
    description: 'Toss a coin 3 times. Product space Ω₀³.',
    omegaLatex: '\\Omega = \\{H,T\\}^3',
    omegaType: 'finite',
    elements: ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'],
    visual: 'grid',
  },
  {
    id: 'first-heads',
    name: 'First Heads',
    icon: <Infinity size={18} />,
    description: 'Keep tossing until first H. ω = number of tosses needed.',
    omegaLatex: '\\Omega = \\{1, 2, 3, \\ldots\\} = \\mathbb{N}',
    omegaType: 'countably-infinite',
    elements: ['1', '2', '3', '4', '5', '...'],
    visual: 'sequence',
  },
  {
    id: 'waiting-time',
    name: 'Waiting Time',
    icon: <Clock size={18} />,
    description: 'How many minutes late is your date? ω ∈ [0, ∞).',
    omegaLatex: '\\Omega = [0, \\infty) = \\mathbb{R}_+',
    omegaType: 'uncountable',
    visual: 'number-line',
  },
];

// Product Space types
type BaseSpace = { label: string; elements: string[]; latex: string };

const BASE_SPACES: BaseSpace[] = [
  { label: '{H, T}', elements: ['H', 'T'], latex: '\\{H, T\\}' },
  { label: '{1,...,6}', elements: ['1', '2', '3', '4', '5', '6'], latex: '\\{1,\\ldots,6\\}' },
  { label: '{1, 2, 3}', elements: ['1', '2', '3'], latex: '\\{1, 2, 3\\}' },
];

export const SampleSpacesModule: React.FC = () => {
  const [selectedExp, setSelectedExp] = useState<string>('coin');
  const [space1, setSpace1] = useState(0);
  const [space2, setSpace2] = useState(1);
  const [highlightedCell, setHighlightedCell] = useState<string | null>(null);

  // Exercises
  const [ex1Answer, setEx1Answer] = useState('');
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState<string | null>(null);
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');
  const [ex3Answer, setEx3Answer] = useState<string | null>(null);
  const [ex3Status, setEx3Status] = useState<ExerciseStatus>('unattempted');

  const activeExp = EXPERIMENTS.find((e) => e.id === selectedExp)!;

  const product = BASE_SPACES[space1].elements.flatMap((a) =>
    BASE_SPACES[space2].elements.map((b) => `(${a},${b})`)
  );

  return (
    <ModuleWrapper
      title="Sample Spaces"
      katexTitle="\\Omega"
      subtitle="Random experiments, outcomes, and the structure of sample spaces"
    >
      <div className="space-y-8">
        {/* Section 1: Experiment Explorer */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Experiment Explorer</h3>
          <p className="text-sm text-gray-500 mb-4">
            A random experiment has <strong>mass character</strong> (repeatable),{' '}
            <strong>no deterministic regularity</strong> (uncertain outcomes), and{' '}
            <strong>statistical regularity</strong> (relative frequencies stabilize).
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {EXPERIMENTS.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setSelectedExp(exp.id)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  selectedExp === exp.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {exp.icon}
                {exp.name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeExp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-50 p-5 rounded-xl border border-gray-100"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <p className="text-sm text-gray-600 mb-3">{activeExp.description}</p>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
                    <BlockMath math={activeExp.omegaLatex} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Type:</span>
                    <span
                      className={clsx('text-xs px-2 py-1 rounded-full font-medium', {
                        'bg-green-100 text-green-700': activeExp.omegaType === 'finite',
                        'bg-blue-100 text-blue-700': activeExp.omegaType === 'countably-infinite',
                        'bg-purple-100 text-purple-700': activeExp.omegaType === 'uncountable',
                      })}
                    >
                      {activeExp.omegaType === 'finite' && 'Finite'}
                      {activeExp.omegaType === 'countably-infinite' && 'Countably Infinite'}
                      {activeExp.omegaType === 'uncountable' && 'Uncountable'}
                    </span>
                  </div>
                </div>

                <div className="md:w-1/2 flex items-center justify-center">
                  {activeExp.visual === 'grid' && activeExp.elements && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {activeExp.elements.map((el, i) => (
                        <motion.div
                          key={el}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="w-14 h-14 bg-white border-2 border-indigo-200 rounded-lg flex items-center justify-center text-sm font-bold text-indigo-700 shadow-sm"
                        >
                          {el}
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {activeExp.visual === 'sequence' && activeExp.elements && (
                    <div className="flex items-center gap-1">
                      {activeExp.elements.map((el, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className={clsx(
                            'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold',
                            el === '...'
                              ? 'text-gray-400'
                              : 'bg-blue-50 border border-blue-200 text-blue-700'
                          )}
                        >
                          {el}
                        </motion.div>
                      ))}
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  )}
                  {activeExp.visual === 'number-line' && (
                    <div className="w-full">
                      <div className="relative h-16 flex items-center px-4">
                        <div className="absolute w-full h-1 bg-gray-300 rounded-full left-0" />
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className="absolute h-3 bg-purple-400/40 rounded-full"
                          style={{ left: '10%', right: '0%', originX: 0 }}
                        />
                        <div className="absolute left-[10%] w-3 h-3 bg-purple-600 rounded-full -translate-x-1/2 border-2 border-white shadow" />
                        <div className="absolute w-full flex justify-between text-xs text-gray-400 top-12 left-0 px-2">
                          <span>0</span>
                          <span>5</span>
                          <span>10</span>
                          <span>+∞</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Section 2: Product Space Constructor */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Product Space Constructor</h3>
          <div className="text-sm text-gray-500 mb-1">
            For a composite experiment of <InlineMath math="n" /> repetitions:
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 inline-block">
            <BlockMath math="\Omega = \Omega_1 \times \Omega_2 = \{(\omega_1, \omega_2) : \omega_1 \in \Omega_1,\; \omega_2 \in \Omega_2\}" />
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                <InlineMath math="\Omega_1" />
              </label>
              <select
                value={space1}
                onChange={(e) => setSpace1(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {BASE_SPACES.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
            </div>
            <span className="text-lg font-bold text-gray-400 mt-4">×</span>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                <InlineMath math="\Omega_2" />
              </label>
              <select
                value={space2}
                onChange={(e) => setSpace2(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {BASE_SPACES.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <InlineMath math={`|\\Omega| = ${BASE_SPACES[space1].elements.length} \\times ${BASE_SPACES[space2].elements.length} = ${product.length}`} />
            </div>
          </div>

          {/* Product grid */}
          <div className="overflow-x-auto">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-xs text-gray-400">
                    <InlineMath math="\Omega_1 \backslash \Omega_2" />
                  </th>
                  {BASE_SPACES[space2].elements.map((el) => (
                    <th key={el} className="p-2 text-xs font-bold text-red-600">{el}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BASE_SPACES[space1].elements.map((el1) => (
                  <tr key={el1}>
                    <td className="p-2 text-xs font-bold text-blue-600">{el1}</td>
                    {BASE_SPACES[space2].elements.map((el2) => {
                      const cell = `(${el1},${el2})`;
                      return (
                        <td key={cell} className="p-1">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            onMouseEnter={() => setHighlightedCell(cell)}
                            onMouseLeave={() => setHighlightedCell(null)}
                            className={clsx(
                              'w-16 h-10 rounded-md flex items-center justify-center text-xs font-mono cursor-default transition-colors border',
                              highlightedCell === cell
                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                                : 'bg-gray-50 border-gray-200 text-gray-600'
                            )}
                          >
                            {cell}
                          </motion.div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Educational Notes */}
        <section className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
          <h4 className="font-bold mb-3">Key Concepts</h4>
          <ul className="space-y-2 list-disc list-inside opacity-90">
            <li>
              An <strong>outcome</strong> <InlineMath math="\omega \in \Omega" /> is also called an elementary event, sample point, or realization.
            </li>
            <li>
              A set <InlineMath math="A" /> is <strong>countable</strong> if there exists a bijection <InlineMath math="f: A \to \mathbb{N}" />.
              <InlineMath math="\mathbb{Z}" /> is countable, but <InlineMath math="[0,1]" /> is not.
            </li>
            <li>
              <InlineMath math="\{H,T\}^{\mathbb{N}}" /> (infinite coin sequences) is <strong>uncountable</strong> — like <InlineMath math="[0,1]" /> in binary.
            </li>
            <li>
              For composite experiments, we use <strong>product spaces</strong>: <InlineMath math="\Omega = \Omega_0^n" />.
            </li>
          </ul>
        </section>

        {/* Section 4: Exercises */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title="E1.1: Counting Outcomes"
            description={<>Roll two dice. What is <InlineMath math="|\Omega|" />? (Enter the number of possible outcomes)</>}
            status={ex1Status}
            feedback={ex1Status === 'correct' ? 'Correct! Each die has 6 faces, so |Ω| = 6 × 6 = 36.' : ex1Status === 'incorrect' ? 'Not quite. Think of the product space: each die has 6 outcomes.' : undefined}
            hint="The sample space is {1,...,6} × {1,...,6}. Each outcome is a pair (i,j)."
            onReset={() => { setEx1Answer(''); setEx1Status('unattempted'); }}
          >
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={ex1Answer}
                onChange={(e) => setEx1Answer(e.target.value)}
                placeholder="Enter |Ω|"
                className="border border-gray-300 rounded-lg px-3 py-2 w-32 text-sm"
              />
              <button
                onClick={() => setEx1Status(ex1Answer === '36' ? 'correct' : 'incorrect')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Check
              </button>
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E1.2: Countability"
            description={<>Flip a coin until heads appears. Is <InlineMath math="\Omega" /> countable?</>}
            status={ex2Status}
            feedback={ex2Status === 'correct' ? 'Correct! Ω = {1, 2, 3, ...} = ℕ, which is countably infinite.' : ex2Status === 'incorrect' ? 'Think again: each outcome is a natural number (the number of tosses needed).' : undefined}
            hint="ω = k means k-1 tails followed by heads. There are countably many such outcomes."
            onReset={() => { setEx2Answer(null); setEx2Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {['Finite', 'Countably Infinite', 'Uncountable'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setEx2Answer(opt);
                    setEx2Status(opt === 'Countably Infinite' ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                    ex2Answer === opt
                      ? opt === 'Countably Infinite'
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : 'bg-red-100 border-red-400 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E1.3: Classify the Sample Space"
            description={<>Classify <InlineMath math="\Omega = [0, 1]" /> (choosing a point uniformly at random from the unit interval).</>}
            status={ex3Status}
            feedback={ex3Status === 'correct' ? 'Correct! [0,1] is uncountable — it cannot be put in bijection with ℕ (Cantor\'s diagonal argument).' : ex3Status === 'incorrect' ? 'Not quite. [0,1] contains uncountably many points.' : undefined}
            hint="Can you list all real numbers between 0 and 1? Cantor showed you cannot."
            onReset={() => { setEx3Answer(null); setEx3Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {['Finite', 'Countably Infinite', 'Uncountable'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setEx3Answer(opt);
                    setEx3Status(opt === 'Uncountable' ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                    ex3Answer === opt
                      ? opt === 'Uncountable'
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : 'bg-red-100 border-red-400 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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

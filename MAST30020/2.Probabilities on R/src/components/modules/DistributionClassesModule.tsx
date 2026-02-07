import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { InlineMath, BlockMath } from 'react-katex';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import { CdfPlot } from '../shared/CdfPlot';
import { atmWaitingCdf, uniformCdf } from '../../utils/cdfUtils';
import type { ExerciseStatus } from '../../types';

type DistClass = 'discrete' | 'ac' | 'mixed' | 'singular';

interface DistPreset {
  id: DistClass;
  title: string;
  summary: string;
  cdf: (x: number) => number;
  hasAtoms: boolean;
  hasDensity: boolean;
  continuousCdf: boolean;
}

const cantorApprox = (x: number, depth = 14): number => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  let value = 0;
  let scale = 1;
  let current = x;

  for (let i = 0; i < depth; i++) {
    current *= 3;
    scale /= 2;

    if (current < 1) {
      continue;
    }

    if (current > 2) {
      value += scale;
      current -= 2;
      continue;
    }

    value += scale;
    break;
  }

  return value;
};

const PRESETS: DistPreset[] = [
  {
    id: 'discrete',
    title: 'Discrete',
    summary: 'Mass on a countable set C; CDF is a step function.',
    cdf: (x) => {
      if (x < -0.5) return 0;
      if (x < 1) return 0.6;
      return 1;
    },
    hasAtoms: true,
    hasDensity: false,
    continuousCdf: false,
  },
  {
    id: 'ac',
    title: 'Absolutely Continuous',
    summary: 'Has density f and F(t)=integral_{-infty}^t f(s) ds.',
    cdf: (x) => uniformCdf(x, 0, 1),
    hasAtoms: false,
    hasDensity: true,
    continuousCdf: true,
  },
  {
    id: 'mixed',
    title: 'Mixed',
    summary: 'Combination of discrete and AC parts.',
    cdf: (x) => atmWaitingCdf(x, 0.4, 1.4),
    hasAtoms: true,
    hasDensity: true,
    continuousCdf: false,
  },
  {
    id: 'singular',
    title: 'Singular',
    summary: 'Continuous CDF but no density (Cantor-type behavior).',
    cdf: (x) => {
      if (x < 0) return 0;
      if (x > 1) return 1;
      return cantorApprox(x);
    },
    hasAtoms: false,
    hasDensity: false,
    continuousCdf: true,
  },
];

const normalize = (a: number, b: number, c: number): [number, number, number] => {
  const total = a + b + c;
  if (total <= 0) return [1, 0, 0];
  return [a / total, b / total, c / total];
};

export const DistributionClassesModule: React.FC = () => {
  const [activeClass, setActiveClass] = useState<DistClass>('discrete');
  const [probe, setProbe] = useState(0.5);

  const [atmP, setAtmP] = useState(0.35);
  const [atmLambda, setAtmLambda] = useState(1.3);

  const [alphaDRaw, setAlphaDRaw] = useState(40);
  const [alphaARaw, setAlphaARaw] = useState(40);
  const [alphaSRaw, setAlphaSRaw] = useState(20);

  const [ex1Answer, setEx1Answer] = useState<string | null>(null);
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState<string | null>(null);
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');

  const selected = PRESETS.find((preset) => preset.id === activeClass) ?? PRESETS[0];

  const [alphaD, alphaA, alphaS] = useMemo(
    () => normalize(alphaDRaw, alphaARaw, alphaSRaw),
    [alphaDRaw, alphaARaw, alphaSRaw]
  );

  const compositionLabel = useMemo(() => {
    const parts: string[] = [];
    if (alphaD > 0.05) parts.push(`discrete ${alphaD.toFixed(2)}`);
    if (alphaA > 0.05) parts.push(`AC ${alphaA.toFixed(2)}`);
    if (alphaS > 0.05) parts.push(`singular ${alphaS.toFixed(2)}`);
    return parts.join(' + ');
  }, [alphaD, alphaA, alphaS]);

  return (
    <ModuleWrapper
      title="Distribution Classes and Decomposition"
      katexTitle="\\alpha_d,\\alpha_a,\\alpha_s"
      subtitle="Discrete, absolutely continuous, mixed, singular, and Lebesgue decomposition"
    >
      <div className="space-y-8">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Classification Playground</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActiveClass(preset.id)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                  activeClass === preset.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                )}
              >
                {preset.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{selected.summary}</p>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Probe t</label>
                <input
                  type="range"
                  min={-1}
                  max={2}
                  step={0.01}
                  value={probe}
                  onChange={(e) => setProbe(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <div className="text-sm font-mono text-gray-700">
                  F({probe.toFixed(2)}) = {selected.cdf(probe).toFixed(4)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className={clsx('p-2 rounded-lg text-center border', selected.hasAtoms ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-500')}>
                  atoms: {selected.hasAtoms ? 'yes' : 'no'}
                </div>
                <div className={clsx('p-2 rounded-lg text-center border', selected.hasDensity ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500')}>
                  density: {selected.hasDensity ? 'yes' : 'no'}
                </div>
                <div className={clsx('p-2 rounded-lg text-center border', selected.continuousCdf ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500')}>
                  CDF continuous: {selected.continuousCdf ? 'yes' : 'no'}
                </div>
              </div>
            </div>

            <CdfPlot evaluate={selected.cdf} min={-1} max={2} markerX={probe} />
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">ATM Waiting-Time Mixed Model</h3>
          <p className="text-sm text-gray-500">
            Lecture example: <InlineMath math="P=p\\delta_0+(1-p)E(\\lambda)" />.
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">p (probability of zero wait)</label>
                <input type="range" min={0} max={1} step={0.01} value={atmP} onChange={(e) => setAtmP(Number(e.target.value))} className="w-full accent-indigo-600" />
                <div className="text-sm text-gray-700">p = {atmP.toFixed(2)}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">lambda (exponential rate)</label>
                <input type="range" min={0.3} max={3} step={0.01} value={atmLambda} onChange={(e) => setAtmLambda(Number(e.target.value))} className="w-full accent-indigo-600" />
                <div className="text-sm text-gray-700">lambda = {atmLambda.toFixed(2)}</div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm text-indigo-800 space-y-1">
                <div><InlineMath math={`P(\\{0\\})=p=${atmP.toFixed(3)}`} /></div>
                <div><InlineMath math={`F(t)=p+(1-p)(1-e^{-\\lambda t}),\\quad t\\ge 0`} /></div>
              </div>
            </div>

            <CdfPlot evaluate={(x) => atmWaitingCdf(x, atmP, atmLambda)} min={-1} max={4} markerX={0} />
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Lebesgue Decomposition Mixer</h3>
          <BlockMath math="P=\\alpha_dP_d+\\alpha_aP_a+\\alpha_sP_s,\\quad \\alpha_d+\\alpha_a+\\alpha_s=1" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">raw alpha_d</label>
              <input type="range" min={0} max={100} value={alphaDRaw} onChange={(e) => setAlphaDRaw(Number(e.target.value))} className="w-full accent-amber-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">raw alpha_a</label>
              <input type="range" min={0} max={100} value={alphaARaw} onChange={(e) => setAlphaARaw(Number(e.target.value))} className="w-full accent-emerald-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">raw alpha_s</label>
              <input type="range" min={0} max={100} value={alphaSRaw} onChange={(e) => setAlphaSRaw(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-800">alpha_d = {alphaD.toFixed(3)}</div>
            <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800">alpha_a = {alphaA.toFixed(3)}</div>
            <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">alpha_s = {alphaS.toFixed(3)}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700">
            Active composition: {compositionLabel || 'all weights near zero'}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title="E2.9: Singular clue"
            description="Which class has continuous CDF but is not absolutely continuous?"
            status={ex1Status}
            feedback={
              ex1Status === 'correct'
                ? 'Correct. Singular distributions are continuous but have no density.'
                : ex1Status === 'incorrect'
                ? 'Look for the class tied to Cantor-like behavior.'
                : undefined
            }
            hint="The lecture calls this class 'singular'."
            onReset={() => {
              setEx1Answer(null);
              setEx1Status('unattempted');
            }}
          >
            <div className="flex flex-wrap gap-2">
              {['Discrete', 'Absolutely Continuous', 'Singular', 'Mixed'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setEx1Answer(opt);
                    setEx1Status(opt === 'Singular' ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex1Answer === opt
                      ? opt === 'Singular'
                        ? 'bg-green-100 border-green-400'
                        : 'bg-red-100 border-red-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E2.10: Discrete CDF form"
            description={<>For discrete laws, which representation matches the lecture?</>}
            status={ex2Status}
            feedback={
              ex2Status === 'correct'
                ? 'Correct. A discrete CDF is a weighted sum of indicator steps.'
                : ex2Status === 'incorrect'
                ? 'Look for sum_i p_i * 1(t_i <= t).'
                : undefined
            }
            hint="See Proposition 1.39(c)."
            onReset={() => {
              setEx2Answer(null);
              setEx2Status('unattempted');
            }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: '\\sum_i p_i\\mathbf{1}(t_i\\le t)', correct: true },
                { label: '\\sum_i p_it_i', correct: false },
                { label: '\\int_{-\\infty}^t f(s)ds', correct: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setEx2Answer(opt.label);
                    setEx2Status(opt.correct ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex2Answer === opt.label
                      ? opt.correct
                        ? 'bg-green-100 border-green-400'
                        : 'bg-red-100 border-red-400'
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

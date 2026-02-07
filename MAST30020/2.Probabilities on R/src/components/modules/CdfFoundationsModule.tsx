import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { InlineMath, BlockMath } from 'react-katex';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import { CdfPlot } from '../shared/CdfPlot';
import { bernoulliMixCdf, pointMassCdf, uniformCdf } from '../../utils/cdfUtils';
import type { ExerciseStatus } from '../../types';

type DemoDistribution = 'point-mass' | 'bernoulli' | 'uniform';

const parseNumber = (raw: string): number => {
  const text = raw.trim();
  if (text.includes('/')) {
    const [a, b] = text.split('/');
    return Number(a) / Number(b);
  }
  return Number(text);
};

export const CdfFoundationsModule: React.FC = () => {
  const [distribution, setDistribution] = useState<DemoDistribution>('point-mass');
  const [t, setT] = useState(0.5);
  const [s, setS] = useState(0.2);
  const [p, setP] = useState(0.35);

  const [ex1Answer, setEx1Answer] = useState<string | null>(null);
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState('');
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');

  const cdf = useMemo(() => {
    if (distribution === 'point-mass') {
      return (x: number) => pointMassCdf(x, s);
    }
    if (distribution === 'bernoulli') {
      return (x: number) => bernoulliMixCdf(x, p);
    }
    return (x: number) => uniformCdf(x, 0, 1);
  }, [distribution, s, p]);

  const fOfT = cdf(t);

  return (
    <ModuleWrapper
      title="CDF Foundations"
      katexTitle="F_P(t)"
      subtitle="Working on (R, B(R)), notation choices, and why one function can encode a full probability"
    >
      <div className="space-y-8">
        <section className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
          <h4 className="font-bold mb-3">Lecture Decomposition</h4>
          <ol className="list-decimal list-inside space-y-1 opacity-90">
            <li>Always work on <InlineMath math="(\\mathbb{R},\\mathcal{B}(\\mathbb{R}))" />.</li>
            <li>Define <InlineMath math="F_P(t)=P(( -\\infty,t])" />.</li>
            <li>Use <InlineMath math="P" /> for probabilities on <InlineMath math="\\mathbb{R}" /> and reserve <InlineMath math="\\mathbb{P}" /> for underlying spaces.</li>
            <li>Even though <InlineMath math="\\mathcal{B}(\\mathbb{R})" /> is huge, CDF data is enough.</li>
          </ol>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">CDF Explorer</h3>
            <p className="text-sm text-gray-500">
              Pick a distribution and inspect <InlineMath math="F(t)=P(( -\\infty,t])" /> at a moving threshold.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'point-mass', label: 'Point Mass' },
              { id: 'bernoulli', label: 'Bernoulli Mix' },
              { id: 'uniform', label: 'Uniform U[0,1]' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setDistribution(item.id as DemoDistribution)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  distribution === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              {distribution === 'point-mass' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Atom location s</label>
                  <input
                    type="range"
                    min={-1.5}
                    max={1.5}
                    step={0.05}
                    value={s}
                    onChange={(e) => setS(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="text-sm text-gray-600"><InlineMath math={`P=\\delta_{${s.toFixed(2)}}`} /></div>
                </div>
              )}

              {distribution === 'bernoulli' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">p in (1-p)delta_0 + pdelta_1</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={p}
                    onChange={(e) => setP(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="text-sm text-gray-600">p = {p.toFixed(2)}</div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">threshold t</label>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.01}
                  value={t}
                  onChange={(e) => setT(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <div className="text-sm text-gray-700 font-mono">t = {t.toFixed(2)}</div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="text-xs uppercase text-indigo-500 font-semibold mb-1">Computed value</div>
                <InlineMath math={`F(t)=P(( -\\infty,t])=${fOfT.toFixed(4)}`} />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
                {distribution === 'point-mass' && (
                  <BlockMath math={`F(t)=\\mathbf{1}(${s.toFixed(2)}\\le t)`} />
                )}
                {distribution === 'bernoulli' && (
                  <BlockMath math={`F(t)=(1-${p.toFixed(2)})\\mathbf{1}(0\\le t)+${p.toFixed(2)}\\mathbf{1}(1\\le t)`} />
                )}
                {distribution === 'uniform' && (
                  <BlockMath math="F(t)=0\ \text{if }t<0,\ \ F(t)=t\ \text{if }0\le t<1,\ \ F(t)=1\ \text{if }t\ge 1" />
                )}
              </div>
            </div>

            <CdfPlot evaluate={cdf} min={-2} max={2} markerX={t} />
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Why CDFs Are Economical</h3>
          <p className="text-sm text-gray-600 mb-3">
            Instead of assigning values to every Borel set directly, it is enough to know all left-ray probabilities.
          </p>
          <BlockMath math="\\sigma\\{(-\\infty,t]: t\\in\\mathbb{R}\\}=\\mathcal{B}(\\mathbb{R})" />
          <p className="text-sm text-gray-600 mt-2">
            So once two probabilities agree on every <InlineMath math="(-\\infty,t]" />, they agree on all Borel sets.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title="E2.1: Key generator"
            description={<>Which class generates <InlineMath math="\\mathcal{B}(\\mathbb{R})" /> in this lecture?</>}
            status={ex1Status}
            feedback={
              ex1Status === 'correct'
                ? 'Correct. Left-rays are enough to recover the full Borel sigma-field.'
                : ex1Status === 'incorrect'
                ? 'Not this one. The lecture uses the class of sets (-infty, t].'
                : undefined
            }
            hint="Remember the proposition right after the CDF definition."
            onReset={() => {
              setEx1Answer(null);
              setEx1Status('unattempted');
            }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: '\\{(-\\infty,t]: t\\in\\mathbb{R}\\}', correct: true },
                { label: '\\{\\{t\\}: t\\in\\mathbb{R}\\}', correct: false },
                { label: '\\{(a,b): a<b\\}', correct: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setEx1Answer(opt.label);
                    setEx1Status(opt.correct ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex1Answer === opt.label
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

          <ExerciseCard
            title="E2.2: Evaluate a Bernoulli CDF"
            description={<>For <InlineMath math="P=(1-p)\\delta_0+p\\delta_1" /> with <InlineMath math="p=0.3" />, compute <InlineMath math="F(0.5)" />.</>}
            status={ex2Status}
            feedback={
              ex2Status === 'correct'
                ? 'Correct. Since 0 <= 0.5 < 1, F(0.5)=1-p=0.7.'
                : ex2Status === 'incorrect'
                ? 'Use the middle branch: F(t)=1-p for 0 <= t < 1.'
                : undefined
            }
            hint="At t=0.5, the atom at 0 is included and the atom at 1 is not."
            onReset={() => {
              setEx2Answer('');
              setEx2Status('unattempted');
            }}
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={ex2Answer}
                onChange={(e) => setEx2Answer(e.target.value)}
                placeholder="0.7 or 7/10"
                className="border border-gray-300 rounded-lg px-3 py-2 w-40 text-sm"
              />
              <button
                onClick={() => {
                  const value = parseNumber(ex2Answer);
                  setEx2Status(Math.abs(value - 0.7) < 1e-3 ? 'correct' : 'incorrect');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
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

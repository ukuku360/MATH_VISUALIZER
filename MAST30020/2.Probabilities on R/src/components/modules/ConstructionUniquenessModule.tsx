import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { InlineMath, BlockMath } from 'react-katex';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import { CdfPlot } from '../shared/CdfPlot';
import { uniformCdf } from '../../utils/cdfUtils';
import type { ExerciseStatus } from '../../types';

const clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const ConstructionUniquenessModule: React.FC = () => {
  const [uLeft, setULeft] = useState(-0.5);
  const [uRight, setURight] = useState(1.5);

  const [intLeft, setIntLeft] = useState(0);
  const [intRight, setIntRight] = useState(1);

  const [ex1Answer, setEx1Answer] = useState<string | null>(null);
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState<string | null>(null);
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');

  const normalizedLeft = Math.min(uLeft, uRight - 0.2);
  const normalizedRight = Math.max(uRight, normalizedLeft + 0.2);

  const intervalA = Math.min(intLeft, intRight);
  const intervalB = Math.max(intLeft, intRight);

  const cdf = useMemo(
    () => (x: number) => uniformCdf(x, normalizedLeft, normalizedRight),
    [normalizedLeft, normalizedRight]
  );

  const intervalProb = useMemo(() => {
    return cdf(intervalB) - cdf(intervalA);
  }, [cdf, intervalA, intervalB]);

  const lengthRatio = useMemo(() => {
    const overlapLeft = clamp(intervalA, normalizedLeft, normalizedRight);
    const overlapRight = clamp(intervalB, normalizedLeft, normalizedRight);
    const overlap = Math.max(0, overlapRight - overlapLeft);
    return overlap / (normalizedRight - normalizedLeft);
  }, [intervalA, intervalB, normalizedLeft, normalizedRight]);

  return (
    <ModuleWrapper
      title="Constructing P from F"
      katexTitle="\\text{Thm 1.36}"
      subtitle="Any valid CDF defines a unique probability on B(R)"
    >
      <div className="space-y-8">
        <section className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800 space-y-2">
          <h4 className="font-bold">Theorem 1.36 (informal workflow)</h4>
          <ol className="list-decimal list-inside space-y-1 opacity-90">
            <li>Start with <InlineMath math="P((a,b]) := F(b)-F(a)" /> for all <InlineMath math="a<b" />.</li>
            <li>Extend to finite disjoint unions of half-open intervals (an algebra).</li>
            <li>Use countable additivity + Caratheodory extension theorem.</li>
            <li>Obtain a unique probability on <InlineMath math="\\mathcal{B}(\\mathbb{R})" /> with CDF <InlineMath math="F" />.</li>
          </ol>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <h3 className="text-lg font-bold text-gray-800">Interval Probability Calculator</h3>
          <p className="text-sm text-gray-500">
            Choose a uniform law <InlineMath math="U[a,b]" /> and compute <InlineMath math="P((\\ell,r])" /> via CDF differences.
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Uniform left endpoint a</label>
                <input
                  type="range"
                  min={-2}
                  max={1.5}
                  step={0.01}
                  value={uLeft}
                  onChange={(e) => setULeft(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Uniform right endpoint b</label>
                <input
                  type="range"
                  min={-1.5}
                  max={2.5}
                  step={0.01}
                  value={uRight}
                  onChange={(e) => setURight(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-1">
                <div><InlineMath math={`a=${normalizedLeft.toFixed(2)},\\ b=${normalizedRight.toFixed(2)}`} /></div>
                <BlockMath math="F(t)=0\\ \\text{if }t<a,\\quad F(t)=\\frac{t-a}{b-a}\\ \\text{if }a\\le t<b,\\quad F(t)=1\\ \\text{if }t\\ge b" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Interval left endpoint l</label>
                <input
                  type="range"
                  min={-2}
                  max={2.5}
                  step={0.01}
                  value={intLeft}
                  onChange={(e) => setIntLeft(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Interval right endpoint r</label>
                <input
                  type="range"
                  min={-2}
                  max={2.5}
                  step={0.01}
                  value={intRight}
                  onChange={(e) => setIntRight(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-sm text-emerald-800">
                <BlockMath math={`P((\\ell,r])=F(r)-F(\\ell)=${intervalProb.toFixed(4)}`} />
                <div className="text-xs">
                  For uniform laws this equals normalized overlap length: {lengthRatio.toFixed(4)}.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <CdfPlot evaluate={cdf} min={-2} max={2.5} markerX={intervalB} />

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm">
                <div className="font-semibold text-indigo-700 mb-1">Current interval</div>
                <InlineMath math={`(\\ell,r]=(${intervalA.toFixed(2)},${intervalB.toFixed(2)}]`} />
                <div className="mt-2 text-indigo-700">
                  <InlineMath math={`F(r)=${cdf(intervalB).toFixed(4)},\\quad F(\\ell)=${cdf(intervalA).toFixed(4)}`} />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
                This mirrors the proof idea from the lecture: define probabilities first on half-open intervals, then extend.
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Uniform Example from the Lecture</h3>
          <BlockMath math="F(t)=\\begin{cases}0,&t<0\\\\ t,&0\\le t<1\\\\ 1,&t\\ge1\\end{cases}" />
          <p className="text-sm text-gray-600">
            This is the CDF of <InlineMath math="U[0,1]" />, and by Theorem 1.36 it defines a unique probability on <InlineMath math="\\mathbb{R}" />.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title="E2.7: Core formula"
            description={<>From a CDF <InlineMath math="F" />, what is <InlineMath math="P((a,b])" />?</>}
            status={ex1Status}
            feedback={
              ex1Status === 'correct'
                ? 'Correct. This is the construction seed in Theorem 1.36.'
                : ex1Status === 'incorrect'
                ? 'Use CDF differences at the interval endpoints.'
                : undefined
            }
            hint="Think F(b) minus F(a)."
            onReset={() => {
              setEx1Answer(null);
              setEx1Status('unattempted');
            }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'F(b)-F(a)', correct: true },
                { label: 'F(a)-F(b)', correct: false },
                { label: 'F(b)+F(a)', correct: false },
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
            title="E2.8: CDF of U[a,b]"
            description="Choose the correct middle branch for the CDF of U[a,b]."
            status={ex2Status}
            feedback={
              ex2Status === 'correct'
                ? 'Correct. The CDF grows linearly from 0 at a to 1 at b.'
                : ex2Status === 'incorrect'
                ? 'For uniform laws, slope is 1/(b-a) on [a,b).'
                : undefined
            }
            hint="Map [a,b] to [0,1] linearly."
            onReset={() => {
              setEx2Answer(null);
              setEx2Status('unattempted');
            }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: '\\frac{t-a}{b-a}', correct: true },
                { label: '\\frac{t-b}{a-b}', correct: false },
                { label: '\\frac{1}{b-a}', correct: false },
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

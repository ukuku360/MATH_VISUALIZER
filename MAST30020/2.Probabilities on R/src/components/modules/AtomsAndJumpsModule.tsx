import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { InlineMath, BlockMath } from 'react-katex';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import { CdfPlot } from '../shared/CdfPlot';
import { bernoulliMixCdf, jumpAt, pointMassCdf } from '../../utils/cdfUtils';
import type { ExerciseStatus } from '../../types';

interface Atom {
  x: number;
  p: number;
}

const normalizeWeights = (weights: number[]): number[] => {
  const total = weights.reduce((acc, value) => acc + value, 0);
  if (total <= 0) return weights.map(() => 0);
  return weights.map((value) => value / total);
};

const atomicCdf = (atoms: Atom[]) => (t: number): number => {
  return atoms
    .filter((atom) => atom.x <= t)
    .reduce((acc, atom) => acc + atom.p, 0);
};

export const AtomsAndJumpsModule: React.FC = () => {
  const [s, setS] = useState(0.4);
  const [t1, setT1] = useState(0.4);

  const [p, setP] = useState(0.45);
  const [t2, setT2] = useState(0.2);

  const [w0, setW0] = useState(40);
  const [w1, setW1] = useState(35);
  const [w2, setW2] = useState(25);
  const [selectedAtom, setSelectedAtom] = useState(1);

  const [ex1Answer, setEx1Answer] = useState<string | null>(null);
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState<string | null>(null);
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');

  const bernoulliAtZero = useMemo(() => bernoulliMixCdf(0, p), [p]);

  const customAtoms = useMemo<Atom[]>(() => {
    const probs = normalizeWeights([w0, w1, w2]);
    return [
      { x: -1, p: probs[0] },
      { x: 0, p: probs[1] },
      { x: 2, p: probs[2] },
    ];
  }, [w0, w1, w2]);

  const customCdf = useMemo(() => atomicCdf(customAtoms), [customAtoms]);
  const jumpValue = useMemo(() => jumpAt(customCdf, selectedAtom), [customCdf, selectedAtom]);
  const pointMassAtSelected = useMemo(() => {
    const atom = customAtoms.find((item) => item.x === selectedAtom);
    return atom?.p ?? 0;
  }, [customAtoms, selectedAtom]);

  return (
    <ModuleWrapper
      title="Point Masses and Jumps"
      katexTitle="P(\\{t\\})"
      subtitle="Examples from the lecture and the identity P({t}) = F(t) - F(t-)"
    >
      <div className="space-y-8">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <h3 className="text-lg font-bold text-gray-800">Canonical Examples</h3>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Point mass <InlineMath math="\\delta_s" /></h4>
              <input
                type="range"
                min={-1.5}
                max={1.5}
                step={0.01}
                value={s}
                onChange={(e) => setS(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="text-sm text-gray-600">s = {s.toFixed(2)}</div>

              <input
                type="range"
                min={-2}
                max={2}
                step={0.01}
                value={t1}
                onChange={(e) => setT1(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <div className="text-sm text-gray-600">t = {t1.toFixed(2)}</div>

              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <InlineMath math={`F(t)=\\mathbf{1}(${s.toFixed(2)}\\le t)=${pointMassCdf(t1, s).toFixed(0)}`} />
              </div>

              <CdfPlot evaluate={(x) => pointMassCdf(x, s)} min={-2} max={2} markerX={t1} />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Bernoulli mixture <InlineMath math="(1-p)\\delta_0 + p\\delta_1" /></h4>
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

              <input
                type="range"
                min={-1}
                max={2}
                step={0.01}
                value={t2}
                onChange={(e) => setT2(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <div className="text-sm text-gray-600">t = {t2.toFixed(2)}</div>

              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 space-y-1">
                <InlineMath math={`F(0)=1-p=${(1 - p).toFixed(2)}`} />
                <div className="text-xs text-indigo-600">Value at 0 for this CDF is {(bernoulliAtZero).toFixed(2)} because [0,0] includes the atom at 0.</div>
                <InlineMath math={`F(t)=${bernoulliMixCdf(t2, p).toFixed(3)}`} />
              </div>

              <CdfPlot evaluate={(x) => bernoulliMixCdf(x, p)} min={-1} max={2} markerX={t2} />
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Jump = Point Mass Inspector</h3>
          <p className="text-sm text-gray-500">
            Use a custom atomic law and verify the lecture formula
            <InlineMath math="P(\\{t\\})=F(t)-F(t-)" />.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Weight at -1</label>
                <input type="range" min={0} max={100} value={w0} onChange={(e) => setW0(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Weight at 0</label>
                <input type="range" min={0} max={100} value={w1} onChange={(e) => setW1(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Weight at 2</label>
                <input type="range" min={0} max={100} value={w2} onChange={(e) => setW2(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm font-mono text-gray-700 space-y-1">
                {customAtoms.map((atom) => (
                  <div key={atom.x}>P({`{${atom.x}}`}) = {atom.p.toFixed(3)}</div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {[-1, 0, 2].map((atom) => (
                  <button
                    key={atom}
                    onClick={() => setSelectedAtom(atom)}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-sm border',
                      selectedAtom === atom
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    t = {atom}
                  </button>
                ))}
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-sm text-emerald-800">
                <BlockMath math={`F(${selectedAtom})-F(${selectedAtom}-)=${jumpValue.toFixed(4)}`} />
                <BlockMath math={`P(\\{${selectedAtom}\\})=${pointMassAtSelected.toFixed(4)}`} />
                <div className="font-semibold">
                  Difference = {Math.abs(jumpValue - pointMassAtSelected).toExponential(2)}
                </div>
              </div>
            </div>

            <CdfPlot evaluate={customCdf} min={-2} max={3} markerX={selectedAtom} />
          </div>
        </section>

        <section className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
          <h4 className="font-bold mb-2">Interpretation</h4>
          <p>
            Continuous parts contribute no jump at a single point, while each atom creates a vertical jump in the CDF of exactly that atom's mass.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title="E2.5: Jump at zero"
            description={<>For <InlineMath math="P=(1-p)\\delta_0+p\\delta_1" />, what is <InlineMath math="P(\\{0\\})" />?</>}
            status={ex1Status}
            feedback={
              ex1Status === 'correct'
                ? 'Correct. The atom at 0 has weight 1-p.'
                : ex1Status === 'incorrect'
                ? 'Look at the mixture coefficients: mass at 0 is attached to delta_0.'
                : undefined
            }
            hint="Use P({t}) = jump size at t."
            onReset={() => {
              setEx1Answer(null);
              setEx1Status('unattempted');
            }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'p', correct: false },
                { label: '1-p', correct: true },
                { label: '0', correct: false },
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
            title="E2.6: Continuous CDF and atoms"
            description={<>If <InlineMath math="F" /> is continuous at <InlineMath math="t" />, what is <InlineMath math="P(\\{t\\})" />?</>}
            status={ex2Status}
            feedback={
              ex2Status === 'correct'
                ? 'Correct. No jump means no point mass at t.'
                : ex2Status === 'incorrect'
                ? 'Apply P({t})=F(t)-F(t-). Continuity gives zero difference.'
                : undefined
            }
            hint="Plug continuity into the jump formula."
            onReset={() => {
              setEx2Answer(null);
              setEx2Status('unattempted');
            }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: '0', correct: true },
                { label: '1', correct: false },
                { label: 'Depends on t only', correct: false },
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
                  {opt.label}
                </button>
              ))}
            </div>
          </ExerciseCard>
        </section>
      </div>
    </ModuleWrapper>
  );
};

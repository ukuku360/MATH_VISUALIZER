import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { InlineMath, BlockMath } from 'react-katex';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import { CdfPlot } from '../shared/CdfPlot';
import type { ExerciseStatus } from '../../types';

interface Candidate {
  id: string;
  label: string;
  note: string;
  evaluate: (x: number) => number;
}

const CANDIDATES: Candidate[] = [
  {
    id: 'valid-step',
    label: 'Valid step CDF',
    note: 'Point mass at 0',
    evaluate: (x) => (x < 0 ? 0 : 1),
  },
  {
    id: 'valid-uniform',
    label: 'Valid continuous CDF',
    note: 'Uniform on [0,1]',
    evaluate: (x) => {
      if (x < 0) return 0;
      if (x >= 1) return 1;
      return x;
    },
  },
  {
    id: 'bad-monotone',
    label: 'Invalid (not monotone)',
    note: 'Oscillates down on an interval',
    evaluate: (x) => {
      if (x < -1) return 0;
      if (x < 0) return 0.4 * (x + 1);
      if (x < 1) return 0.4 - 0.25 * x;
      if (x < 2) return 0.15 + 0.4 * (x - 1);
      return 1;
    },
  },
  {
    id: 'bad-right',
    label: 'Invalid (not right-continuous)',
    note: 'Has a removable drop at t=0',
    evaluate: (x) => {
      if (x < 0) return 0;
      if (Math.abs(x) < 1e-12) return 0.3;
      return 1;
    },
  },
  {
    id: 'bad-tail',
    label: 'Invalid (wrong +infty limit)',
    note: 'Never reaches 1',
    evaluate: (x) => 0.8 / (1 + Math.exp(-x)),
  },
];

const checkMonotone = (f: (x: number) => number): boolean => {
  const min = -4;
  const max = 4;
  const n = 240;
  let prev = f(min);
  for (let i = 1; i <= n; i++) {
    const x = min + ((max - min) * i) / n;
    const y = f(x);
    if (y + 1e-3 < prev) return false;
    prev = y;
  }
  return true;
};

const checkRightContinuity = (f: (x: number) => number, t: number): boolean => {
  const h = 1e-4;
  return Math.abs(f(t + h) - f(t)) < 2e-2;
};

const checkTailLimits = (f: (x: number) => number): boolean => {
  const left = f(-100);
  const right = f(100);
  return Math.abs(left) < 1e-2 && Math.abs(right - 1) < 1e-2;
};

export const CdfPropertiesModule: React.FC = () => {
  const [candidateId, setCandidateId] = useState('valid-step');
  const [probeT, setProbeT] = useState(0);

  const [ex1Answer, setEx1Answer] = useState<string | null>(null);
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState<string | null>(null);
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');

  const candidate = CANDIDATES.find((item) => item.id === candidateId) ?? CANDIDATES[0];

  const diagnostics = useMemo(() => {
    const f = candidate.evaluate;
    const left = f(probeT - 1e-4);
    const mid = f(probeT);
    const right = f(probeT + 1e-4);
    return {
      monotone: checkMonotone(f),
      rightContinuousAtProbe: checkRightContinuity(f, probeT),
      tails: checkTailLimits(f),
      left,
      mid,
      right,
    };
  }, [candidate, probeT]);

  const isValidCdf = diagnostics.monotone && diagnostics.rightContinuousAtProbe && diagnostics.tails;

  return (
    <ModuleWrapper
      title="Characteristic Properties of CDFs"
      katexTitle="F"
      subtitle="Theorem 1.33: monotonicity, right-continuity, and limits at +/- infinity"
    >
      <div className="space-y-8">
        <section className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
          <h4 className="font-bold mb-2">Theorem 1.33 Checklist</h4>
          <ul className="list-disc list-inside space-y-1 opacity-90">
            <li><InlineMath math="s<t\\Rightarrow F(s)\\le F(t)" /> (non-decreasing)</li>
            <li><InlineMath math="F(t)=F(t+)" /> (right-continuous)</li>
            <li><InlineMath math="\\lim_{t\\to-\\infty}F(t)=0,\ \lim_{t\\to+\\infty}F(t)=1" /></li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Property Lab</h3>
            <p className="text-sm text-gray-500">Select a candidate and verify each property numerically.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-1 space-y-3">
              {CANDIDATES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCandidateId(item.id)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg border transition-colors',
                    candidateId === item.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.note}</div>
                </button>
              ))}

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-500 uppercase">Probe point t</label>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.01}
                  value={probeT}
                  onChange={(e) => setProbeT(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="text-sm text-gray-700 font-mono">t = {probeT.toFixed(2)}</div>
              </div>
            </div>

            <div className="xl:col-span-2 space-y-4">
              <CdfPlot evaluate={candidate.evaluate} min={-3} max={3} markerX={probeT} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className={clsx('p-3 rounded-lg border', diagnostics.monotone ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')}>
                  <div className="font-semibold">(a) Monotone</div>
                  <div>{diagnostics.monotone ? 'Pass' : 'Fail'}</div>
                </div>
                <div className={clsx('p-3 rounded-lg border', diagnostics.rightContinuousAtProbe ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')}>
                  <div className="font-semibold">(b) Right continuity</div>
                  <div>at t = {probeT.toFixed(2)}: {diagnostics.rightContinuousAtProbe ? 'Pass' : 'Fail'}</div>
                </div>
                <div className={clsx('p-3 rounded-lg border', diagnostics.tails ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')}>
                  <div className="font-semibold">(c) Tail limits</div>
                  <div>{diagnostics.tails ? 'Pass' : 'Fail'}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                <div className="font-semibold text-gray-700 mb-1">One-sided values near t</div>
                <BlockMath math={`F(t-)= ${diagnostics.left.toFixed(3)},\quad F(t)= ${diagnostics.mid.toFixed(3)},\quad F(t+)= ${diagnostics.right.toFixed(3)}`} />
                <div className={clsx('font-semibold', isValidCdf ? 'text-green-700' : 'text-amber-700')}>
                  {isValidCdf ? 'Current candidate satisfies all checks at this probe.' : 'At least one requirement fails.'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title="E2.3: Detect failure"
            description="Which property fails first for the candidate 'Invalid (wrong +infty limit)'?"
            status={ex1Status}
            feedback={
              ex1Status === 'correct'
                ? 'Correct. Its right tail does not approach 1.'
                : ex1Status === 'incorrect'
                ? 'That candidate is monotone and right-continuous, but misses the +infty limit.'
                : undefined
            }
            hint="Check property (c)."
            onReset={() => {
              setEx1Answer(null);
              setEx1Status('unattempted');
            }}
          >
            <div className="flex flex-wrap gap-2">
              {['Monotonicity', 'Right continuity', 'Tail limits'].map((choice) => (
                <button
                  key={choice}
                  onClick={() => {
                    setEx1Answer(choice);
                    setEx1Status(choice === 'Tail limits' ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex1Answer === choice
                      ? choice === 'Tail limits'
                        ? 'bg-green-100 border-green-400'
                        : 'bg-red-100 border-red-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {choice}
                </button>
              ))}
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E2.4: Right continuity statement"
            description={<>Pick the correct formula for right continuity of a CDF.</>}
            status={ex2Status}
            feedback={
              ex2Status === 'correct'
                ? 'Correct. CDFs satisfy F(t)=lim_{s downarrow t}F(s).'
                : ex2Status === 'incorrect'
                ? 'CDFs are right-continuous, not necessarily left-continuous.'
                : undefined
            }
            hint="Look at theorem item (b)."
            onReset={() => {
              setEx2Answer(null);
              setEx2Status('unattempted');
            }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'F(t)=F(t+)', correct: true },
                { label: 'F(t)=F(t-)', correct: false },
                { label: 'F(t-) = F(t+)', correct: false },
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

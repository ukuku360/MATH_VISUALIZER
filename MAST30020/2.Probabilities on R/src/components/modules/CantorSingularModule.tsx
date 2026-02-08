import { useState } from 'react';
import clsx from 'clsx';
import { InlineMath, BlockMath } from 'react-katex';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { ExerciseCard } from '../shared/ExerciseCard';
import { CantorSetBuilder } from '../cantor/CantorSetBuilder';
import { DevilsStaircasePlot } from '../cantor/DevilsStaircasePlot';
import { DistributionAnalogyCards } from '../cantor/DistributionAnalogyCards';
import { ProofVisualization } from '../cantor/ProofVisualization';
import { cantorCdf } from '../../utils/cantorUtils';
import type { ExerciseStatus } from '../../types';

export const CantorSingularModule: React.FC = () => {
  const [probe, setProbe] = useState(0.5);
  const [showTernary, setShowTernary] = useState(false);

  const [ex1Answer, setEx1Answer] = useState<string | null>(null);
  const [ex1Status, setEx1Status] = useState<ExerciseStatus>('unattempted');
  const [ex2Answer, setEx2Answer] = useState<string | null>(null);
  const [ex2Status, setEx2Status] = useState<ExerciseStatus>('unattempted');
  const [ex3Answer, setEx3Answer] = useState<string | null>(null);
  const [ex3Status, setEx3Status] = useState<ExerciseStatus>('unattempted');
  const [ex4Answer, setEx4Answer] = useState<string | null>(null);
  const [ex4Status, setEx4Status] = useState<ExerciseStatus>('unattempted');
  const [ex5Answer, setEx5Answer] = useState<string | null>(null);
  const [ex5Status, setEx5Status] = useState<ExerciseStatus>('unattempted');

  return (
    <ModuleWrapper
      title="Cantor Set & Singular Distributions"
      katexTitle="F'=0\\text{ a.e.}"
      subtitle="Devil's Staircase, singular continuous distributions, and Lebesgue decomposition"
    >
      <div className="space-y-8">
        {/* Section 1: Georg Cantor */}
        <section className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800 space-y-3">
          <h4 className="font-bold text-base">Georg Cantor (1845 - 1918)</h4>
          <p>
            Georg Cantor는 <strong>집합론(Set Theory)</strong>을 만든 수학자야.
            무한에도 크기가 다르다는 걸 증명했어 &mdash; 자연수(<InlineMath math="\\mathbb{N}" />)는 셀 수 있지만
            실수(<InlineMath math="\\mathbb{R}" />)는 셀 수 없다는 걸 대각선 논법으로 보였지.
          </p>
          <BlockMath math="|\\mathbb{R}| > |\\mathbb{N}|" />
          <p>
            확률론에서 Cantor가 등장하는 이유: <strong>"연속인데 밀도가 없는 분포"</strong>가
            실제로 존재한다는 걸 보여주는 <em>반례 머신</em>이거든.
            아래에서 칸토어 집합과 칸토어 함수를 차근차근 배워보자.
          </p>
        </section>

        {/* Section 2: Cantor Set Construction */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Cantor Set Construction</h3>
            <p className="text-sm text-gray-500">
              <InlineMath math="[0,1]" />에서 가운데 1/3을 반복적으로 제거해서 만드는 집합
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 space-y-2">
            <p><strong>알고리즘:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-xs opacity-90">
              <li>Start: <InlineMath math="[0,1]" /></li>
              <li>Step 1: 가운데 1/3 제거 → <InlineMath math="[0,\\tfrac{1}{3}]\\cup[\\tfrac{2}{3},1]" /></li>
              <li>Step 2: 남은 각 구간의 가운데 1/3 제거</li>
              <li>Step n: 무한히 반복. 끝까지 살아남는 점 = <strong>Cantor set</strong> <InlineMath math="C" /></li>
            </ol>
          </div>

          <CantorSetBuilder />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm text-indigo-800">
              <div className="font-bold mb-1">Key Insight 1</div>
              <p>
                제거한 총 길이: <InlineMath math="\\sum_{n=0}^{\\infty}\\frac{2^n}{3^{n+1}} = 1" />.
                즉 <InlineMath math="[0,1]" />의 길이를 <strong>전부 제거</strong>했으므로
                Cantor set의 <strong>르벡 측도(길이) = 0</strong>.
              </p>
              <BlockMath math="\\lambda(C) = 0" />
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-amber-800">
              <div className="font-bold mb-1">Key Insight 2</div>
              <p>
                그런데 <InlineMath math="C" />에 속하는 점은 <strong>uncountably 많아</strong>.
                3진수 전개에서 숫자 1을 안 쓰는 실수들의 집합이라서,
                <InlineMath math="|C| = |\\mathbb{R}|" /> (같은 크기의 무한).
              </p>
              <p className="mt-1 text-xs">길이는 0인데 점은 셀 수 없이 많은 이상한 집합!</p>
            </div>
          </div>
        </section>

        {/* Section 3: Devil's Staircase */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Cantor Function (Devil's Staircase)
            </h3>
            <p className="text-sm text-gray-500">
              Cantor 분포의 CDF. "사다리(ladder)" 또는 "악마의 계단"이라고 불림
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Probe t</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={probe}
                  onChange={(e) => setProbe(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <div className="text-sm font-mono text-gray-700">
                  F({probe.toFixed(3)}) = {cantorCdf(probe).toFixed(4)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-center">
                  Continuous
                </div>
                <div className="p-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-center">
                  Monotone increasing
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-center">
                  F'(x) = 0 a.e.
                </div>
                <div className="p-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-center">
                  F(0)=0, F(1)=1
                </div>
              </div>

              <button
                onClick={() => setShowTernary(!showTernary)}
                className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors underline"
              >
                {showTernary ? 'Hide' : 'Show'} construction idea (3진수 → 2진수)
              </button>

              {showTernary && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 space-y-2">
                  <p className="font-semibold">3진수 → 2진수 변환</p>
                  <p>
                    <InlineMath math="x \\in [0,1]" />을 3진수로 쓴다:
                    <InlineMath math="x = 0.a_1a_2a_3\\ldots" /> (base 3).
                  </p>
                  <p>
                    Cantor set의 점은 <InlineMath math="a_k \\in \\{0, 2\\}" />만 사용.
                    각 <InlineMath math="2" />를 <InlineMath math="1" />로 바꾸고 2진수로 해석하면
                    <InlineMath math="F(x)" />.
                  </p>
                  <BlockMath math="0.020200\\ldots_{(3)} \\to 0.010100\\ldots_{(2)}" />
                  <p className="text-xs text-gray-500">
                    결과적으로 삭제된 구간(가운데 1/3)에서는 F가 상수(평평)이고,
                    Cantor set 위에서만 조금씩 올라감.
                  </p>
                </div>
              )}
            </div>

            <DevilsStaircasePlot probeX={probe} />
          </div>
        </section>

        {/* Section 4: Why no density? */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">
            Why No Density? (AC가 아닌 이유)
          </h3>
          <p className="text-sm text-gray-500">
            CDF가 연속인데도 pdf가 없다? 단계별로 왜 그런지 증명해보자.
          </p>
          <ProofVisualization />
        </section>

        {/* Section 5: Distribution Analogy */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">
            세 가지 분포 비유 (자갈 / 잼 / 거미줄)
          </h3>
          <p className="text-sm text-gray-500">
            확률이 어떻게 "퍼져있는지"에 따라 분포의 성격이 완전히 달라.
          </p>

          <DistributionAnalogyCards />

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="text-sm font-bold text-indigo-700 mb-2">Lebesgue Decomposition Theorem</h4>
            <BlockMath math="P = \\alpha_d P_d + \\alpha_a P_a + \\alpha_s P_s, \\quad \\alpha_d + \\alpha_a + \\alpha_s = 1" />
            <p className="text-sm text-indigo-800 mt-2">
              <strong>모든</strong> 확률분포는 이 세 가지 순수 타입의 혼합으로 <strong>유일하게</strong> 분해된다.
              어떤 이상한 분포가 나와도 "너 사실 셋 섞은 거잖아"로 정리 가능!
            </p>
          </div>
        </section>

        {/* Section 6: Exam Summary */}
        <section className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 space-y-3">
          <h4 className="font-bold text-emerald-800">시험용 요약</h4>
          <ul className="list-disc list-inside text-sm text-emerald-800 space-y-2">
            <li>
              <strong>Singular</strong>: CDF는 연속(점질량 0)인데, pdf가 없는 분포
            </li>
            <li>
              <strong>연속 CDF</strong> <InlineMath math="\\Rightarrow" /> 점확률 0 (점프 없으니까)
            </li>
            <li>
              <strong>연속 CDF</strong> <InlineMath math="\\not\\Rightarrow" /> pdf 존재 (Cantor가 반례)
            </li>
            <li>
              모든 분포 = <strong>discrete + AC + singular</strong>의 유일한 혼합
            </li>
            <li>
              Cantor function: <InlineMath math="F'=0" /> a.e. but <InlineMath math="F(1)-F(0)=1" />
            </li>
          </ul>
          <BlockMath math="\\underbrace{\\int_0^1 F'(x)\\,dx = 0}_{\\text{if AC}} \\neq \\underbrace{F(1)-F(0) = 1}_{\\text{actual}} \\implies \\text{not AC}" />
        </section>

        {/* Section 7: Exercises */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Exercises</h3>

          <ExerciseCard
            title="E3.1: Cantor set measure"
            description={<>Cantor set <InlineMath math="C" />의 Lebesgue measure <InlineMath math="\\lambda(C)" />는?</>}
            status={ex1Status}
            feedback={
              ex1Status === 'correct'
                ? 'Correct! 제거한 총 길이가 1이므로 남은 집합의 길이는 0.'
                : ex1Status === 'incorrect'
                ? '힌트: 제거한 구간 길이의 합 = 1/3 + 2/9 + 4/27 + ... = 1'
                : undefined
            }
            hint="매 단계 남는 길이 = (2/3)^n → 0"
            onReset={() => { setEx1Answer(null); setEx1Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: '0', correct: true },
                { label: '1/3', correct: false },
                { label: '1/2', correct: false },
                { label: '1', correct: false },
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
                      ? opt.correct ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <InlineMath math={`\\lambda(C) = ${opt.label}`} />
                </button>
              ))}
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E3.2: Distribution classification"
            description="Cantor distribution은 어떤 타입?"
            status={ex2Status}
            feedback={
              ex2Status === 'correct'
                ? 'Correct! CDF는 연속(no atoms)이지만 density가 없으므로 singular continuous.'
                : ex2Status === 'incorrect'
                ? 'CDF가 연속인데 AC가 아닌 분포 = ?'
                : undefined
            }
            hint="Continuous CDF + no density = ?"
            onReset={() => { setEx2Answer(null); setEx2Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {['Discrete', 'AC', 'Mixed', 'Singular Continuous'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setEx2Answer(opt);
                    setEx2Status(opt === 'Singular Continuous' ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex2Answer === opt
                      ? opt === 'Singular Continuous' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E3.3: The density paradox"
            description={<>왜 Cantor distribution은 density <InlineMath math="f" />가 없나?</>}
            status={ex3Status}
            feedback={
              ex3Status === 'correct'
                ? "Correct! F'=0 a.e.이면 integral이 0이 되어 전체 확률 1과 모순."
                : ex3Status === 'incorrect'
                ? "핵심: AC라면 f = F' a.e.인데, F' = 0 a.e.이면 뭐가 문제?"
                : undefined
            }
            hint="AC라면 F(1)-F(0) = integral of F' 이어야 하는데..."
            onReset={() => { setEx3Answer(null); setEx3Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: "F'=0 a.e. → ∫F'=0≠1", correct: true },
                { label: 'F is not continuous', correct: false },
                { label: 'F has atoms', correct: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setEx3Answer(opt.label);
                    setEx3Status(opt.correct ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex3Answer === opt.label
                      ? opt.correct ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E3.4: Lebesgue decomposition"
            description={<>Lebesgue decomposition <InlineMath math="P=\\alpha_dP_d+\\alpha_aP_a+\\alpha_sP_s" />는 유일한가?</>}
            status={ex4Status}
            feedback={
              ex4Status === 'correct'
                ? 'Correct! Lebesgue decomposition은 유일하다. 비율 alpha들이 유일하게 결정됨.'
                : ex4Status === 'incorrect'
                ? '슬라이드의 정리를 다시 확인해봐.'
                : undefined
            }
            hint="The theorem states the decomposition is unique."
            onReset={() => { setEx4Answer(null); setEx4Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Yes, unique', correct: true },
                { label: 'No, multiple possible', correct: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setEx4Answer(opt.label);
                    setEx4Status(opt.correct ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex4Answer === opt.label
                      ? opt.correct ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </ExerciseCard>

          <ExerciseCard
            title="E3.5: Remaining length"
            description={<><InlineMath math="n" />단계 후 남아있는 총 길이가 <InlineMath math="(2/3)^n" />인 이유는?</>}
            status={ex5Status}
            feedback={
              ex5Status === 'correct'
                ? 'Correct! 매 단계마다 남은 구간 각각의 가운데 1/3을 제거하니까 남는 비율이 2/3씩 곱해짐.'
                : ex5Status === 'incorrect'
                ? '매 단계에서 남은 길이의 몇 %가 제거되나 생각해봐.'
                : undefined
            }
            hint="각 단계에서 남은 길이의 1/3을 제거 → 2/3만 남음"
            onReset={() => { setEx5Answer(null); setEx5Status('unattempted'); }}
          >
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Each step keeps 2/3 of remaining', correct: true },
                { label: 'Each step removes half', correct: false },
                { label: 'Each step removes 1/3 of [0,1]', correct: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    setEx5Answer(opt.label);
                    setEx5Status(opt.correct ? 'correct' : 'incorrect');
                  }}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm transition-colors',
                    ex5Answer === opt.label
                      ? opt.correct ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
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

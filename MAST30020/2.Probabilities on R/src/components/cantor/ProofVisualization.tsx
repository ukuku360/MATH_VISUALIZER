import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { BlockMath, InlineMath } from 'react-katex';
import { cantorApprox, generateRemovedIntervals } from '../../utils/cantorUtils';

const STEPS = [
  {
    title: 'Step 1: F는 연속 (no jumps)',
    subtitle: 'CDF에 점프가 없으면 점질량(atom)이 없다',
  },
  {
    title: "Step 2: F'(x) = 0 거의 모든 곳",
    subtitle: '평평한 구간이 전체 길이의 100%를 차지',
  },
  {
    title: 'Step 3: 모순!',
    subtitle: 'AC라면 불가능한 상황이 발생',
  },
];

const SVG_W = 400;
const SVG_H = 160;
const PAD = 28;

const Step1Visual: React.FC = () => {
  const innerW = SVG_W - 2 * PAD;
  const innerH = SVG_H - 2 * PAD;
  const pts = Array.from({ length: 200 }, (_, i) => {
    const x = i / 199;
    const y = cantorApprox(x);
    return { px: PAD + x * innerW, py: PAD + (1 - y) * innerH };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(' ');

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto bg-white rounded-lg border border-gray-200">
        <line x1={PAD} y1={PAD + innerH} x2={PAD + innerW} y2={PAD + innerH} stroke="#d1d5db" strokeWidth={1} />
        <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + innerH} stroke="#d1d5db" strokeWidth={1} />
        <path d={path} fill="none" stroke="#4f46e5" strokeWidth={2.5} />
        <text x={SVG_W / 2} y={SVG_H - 4} textAnchor="middle" className="fill-gray-400" fontSize={10}>
          no jumps anywhere
        </text>
      </svg>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
        <InlineMath math="F" /> is continuous everywhere. By the jump formula{' '}
        <InlineMath math="P(\\{t\\}) = F(t) - F(t^-)" />, every point has probability 0.
      </div>
      <BlockMath math="F\\text{ continuous} \\Longrightarrow P(\\{t\\}) = 0\\text{ for all }t" />
    </div>
  );
};

const Step2Visual: React.FC = () => {
  const innerW = SVG_W - 2 * PAD;
  const innerH = SVG_H - 2 * PAD;
  const removed = generateRemovedIntervals(6);
  const pts = Array.from({ length: 200 }, (_, i) => {
    const x = i / 199;
    const y = cantorApprox(x);
    return { px: PAD + x * innerW, py: PAD + (1 - y) * innerH };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(' ');

  const flatMeasure = 1 - Math.pow(2 / 3, 6);

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto bg-white rounded-lg border border-gray-200">
        {removed.map((r, i) => (
          <motion.rect
            key={i}
            x={PAD + r.start * innerW}
            y={PAD}
            width={(r.end - r.start) * innerW}
            height={innerH}
            fill="#fbbf24"
            opacity={0.3}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: i * 0.01 }}
          />
        ))}
        <line x1={PAD} y1={PAD + innerH} x2={PAD + innerW} y2={PAD + innerH} stroke="#d1d5db" strokeWidth={1} />
        <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + innerH} stroke="#d1d5db" strokeWidth={1} />
        <path d={path} fill="none" stroke="#4f46e5" strokeWidth={2.5} />
      </svg>
      <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm text-amber-800">
        Yellow = flat regions where <InlineMath math="F'(x) = 0" />.
        These cover <strong>{(flatMeasure * 100).toFixed(1)}%</strong> of [0,1] (at depth 6).
        As depth <InlineMath math="\\to \\infty" />, this approaches <strong>100%</strong>.
      </div>
      <BlockMath math="F'(x) = 0 \\quad\\text{for almost every } x \\in [0,1]" />
    </div>
  );
};

const Step3Visual: React.FC = () => (
  <div className="space-y-3">
    <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-sm text-red-800 space-y-3">
      <p className="font-semibold">If F were absolutely continuous (AC):</p>
      <BlockMath math="F(1) - F(0) = \\int_0^1 F'(x)\\,dx" />
      <p>
        But <InlineMath math="F'(x) = 0" /> a.e., so:
      </p>
      <BlockMath math="\\int_0^1 F'(x)\\,dx = \\int_0^1 0\\,dx = 0" />
      <p>
        However <InlineMath math="F(1) - F(0) = 1 - 0 = 1 \\neq 0" />.
      </p>
    </div>
    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm text-indigo-800">
      <p className="font-bold mb-2">Conclusion</p>
      <BlockMath math="\\int_0^1 F' = 0 \\neq 1 = F(1) - F(0)" />
      <p>
        This contradiction proves the Cantor distribution is <strong>NOT</strong> absolutely continuous.
        It has no density function <InlineMath math="f" />. It is a <strong>singular continuous</strong> distribution.
      </p>
    </div>
  </div>
);

const VISUALS = [Step1Visual, Step2Visual, Step3Visual];

export const ProofVisualization: React.FC = () => {
  const [step, setStep] = useState(0);

  const Visual = VISUALS[step];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={clsx(
                'w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors',
                step === i
                  ? 'bg-indigo-600 text-white'
                  : step > i
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            disabled={step === STEPS.length - 1}
            className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-gray-800 text-sm">{STEPS[step].title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{STEPS[step].subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <Visual />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

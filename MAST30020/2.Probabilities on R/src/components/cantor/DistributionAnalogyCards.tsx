import { InlineMath } from 'react-katex';

const CARD_W = 160;
const CARD_H = 80;

const jitter01 = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
};

const DiscreteSvg: React.FC = () => (
  <svg viewBox={`0 0 ${CARD_W} ${CARD_H}`} className="w-full h-auto">
    <line x1={10} y1={CARD_H - 12} x2={CARD_W - 10} y2={CARD_H - 12} stroke="#d1d5db" strokeWidth={1.5} />
    {[30, 70, 120].map((cx, i) => (
      <circle key={i} cx={cx} cy={CARD_H - 12} r={[12, 8, 10][i]} fill="#f59e0b" opacity={0.7} />
    ))}
    {[30, 70, 120].map((cx, i) => (
      <line key={`t-${i}`} x1={cx} y1={CARD_H - 12} x2={cx} y2={CARD_H - 12 - [28, 18, 24][i]} stroke="#f59e0b" strokeWidth={2} />
    ))}
  </svg>
);

const AcSvg: React.FC = () => (
  <svg viewBox={`0 0 ${CARD_W} ${CARD_H}`} className="w-full h-auto">
    <defs>
      <linearGradient id="jam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
        <stop offset="30%" stopColor="#10b981" stopOpacity={0.5} />
        <stop offset="50%" stopColor="#10b981" stopOpacity={0.7} />
        <stop offset="70%" stopColor="#10b981" stopOpacity={0.5} />
        <stop offset="100%" stopColor="#10b981" stopOpacity={0.15} />
      </linearGradient>
    </defs>
    <line x1={10} y1={CARD_H - 12} x2={CARD_W - 10} y2={CARD_H - 12} stroke="#d1d5db" strokeWidth={1.5} />
    <path
      d={`M 20 ${CARD_H - 12} Q 50 ${CARD_H - 50} 80 ${CARD_H - 55} Q 110 ${CARD_H - 50} 140 ${CARD_H - 12}`}
      fill="url(#jam-grad)"
      stroke="#10b981"
      strokeWidth={2}
    />
  </svg>
);

const SingularSvg: React.FC = () => {
  const dots: Array<{ x: number; y: number; r: number }> = [];
  const segments = [
    [0, 1/3], [2/3, 1],
    [0, 1/9], [2/9, 1/3], [2/3, 7/9], [8/9, 1],
  ];
  for (let segIdx = 0; segIdx < segments.length; segIdx++) {
    const [a, b] = segments[segIdx];
    const n = 6;
    for (let i = 0; i < n; i++) {
      const t = a + (b - a) * (i + 0.5) / n;
      const seed = segIdx * 100 + i;
      const yNoise = jitter01(seed);
      const rNoise = jitter01(seed + 1000);
      dots.push({
        x: 15 + t * (CARD_W - 30),
        y: CARD_H - 14 - yNoise * 30 - 5,
        r: 1.2 + rNoise * 1.2,
      });
    }
  }

  return (
    <svg viewBox={`0 0 ${CARD_W} ${CARD_H}`} className="w-full h-auto">
      <line x1={10} y1={CARD_H - 12} x2={CARD_W - 10} y2={CARD_H - 12} stroke="#d1d5db" strokeWidth={1.5} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#6366f1" opacity={0.4} />
      ))}
      {segments.map(([a, b], i) => {
        const x1 = 15 + a * (CARD_W - 30);
        const x2 = 15 + b * (CARD_W - 30);
        return (
          <line key={`seg-${i}`} x1={x1} y1={CARD_H - 12} x2={x2} y2={CARD_H - 12} stroke="#6366f1" strokeWidth={2} opacity={0.3} />
        );
      })}
    </svg>
  );
};

const CARDS = [
  {
    type: 'Discrete',
    analogy: '자갈 (Pebbles)',
    description: '확률이 몇 개 점에 뭉침',
    formula: 'P=\\sum_i p_i\\delta_{t_i}',
    Svg: DiscreteSvg,
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
  },
  {
    type: 'AC',
    analogy: '잼 (Jam)',
    description: '면적으로 확률 계산 가능',
    formula: 'F(t)=\\int_{-\\infty}^t f(s)\\,ds',
    Svg: AcSvg,
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
  },
  {
    type: 'Singular',
    analogy: '먼지 낀 거미줄 (Dusty Cobweb)',
    description: '퍼져있지만 면적으로 못 잡힘',
    formula: "F'=0\\text{ a.e., no density}",
    Svg: SingularSvg,
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
  },
];

export const DistributionAnalogyCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CARDS.map((card) => (
        <div key={card.type} className={`rounded-xl border ${card.border} ${card.bg} p-4 space-y-3`}>
          <div className={`font-bold text-sm ${card.text}`}>{card.type}</div>
          <card.Svg />
          <div className={`text-xs font-medium ${card.text}`}>{card.analogy}</div>
          <div className="text-xs text-gray-600">{card.description}</div>
          <div className="text-xs">
            <InlineMath math={card.formula} />
          </div>
        </div>
      ))}
    </div>
  );
};

import { useMemo } from 'react';
import clsx from 'clsx';
import { cantorApprox, generateRemovedIntervals } from '../../utils/cantorUtils';

interface DevilsStaircasePlotProps {
  probeX?: number;
  showFlatRegions?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const DevilsStaircasePlot: React.FC<DevilsStaircasePlotProps> = ({
  probeX,
  showFlatRegions = true,
  width = 520,
  height = 280,
  className,
}) => {
  const padding = 32;
  const innerW = width - 2 * padding;
  const innerH = height - 2 * padding;

  const flatRegions = useMemo(() => {
    if (!showFlatRegions) return [];
    return generateRemovedIntervals(8);
  }, [showFlatRegions]);

  const points = useMemo(() => {
    const pts: Array<{ x: number; y: number; px: number; py: number }> = [];
    const n = 300;
    for (let i = 0; i <= n; i++) {
      const x = i / n;
      const y = cantorApprox(x);
      const px = padding + x * innerW;
      const py = padding + (1 - y) * innerH;
      pts.push({ x, y, px, py });
    }
    return pts;
  }, [innerW, innerH, padding]);

  const marker = useMemo(() => {
    if (probeX === undefined) return null;
    const cx = Math.max(0, Math.min(1, probeX));
    const y = cantorApprox(cx);
    const px = padding + cx * innerW;
    const py = padding + (1 - y) * innerH;
    return { x: cx, y, px, py };
  }, [probeX, innerW, innerH, padding]);

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px.toFixed(2)} ${p.py.toFixed(2)}`)
    .join(' ');

  return (
    <div className={clsx('bg-gray-50 rounded-xl border border-gray-200 p-3', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Cantor function (Devil's Staircase)">
        {showFlatRegions && flatRegions.map((region, idx) => {
          const x1 = padding + region.start * innerW;
          const w = (region.end - region.start) * innerW;
          return (
            <rect
              key={idx}
              x={x1}
              y={padding}
              width={w}
              height={innerH}
              className="fill-amber-100"
              opacity={0.5}
            />
          );
        })}

        <line x1={padding} y1={padding + innerH} x2={padding + innerW} y2={padding + innerH} stroke="#9ca3af" strokeWidth={1.5} />
        <line x1={padding} y1={padding} x2={padding} y2={padding + innerH} stroke="#9ca3af" strokeWidth={1.5} />

        <text x={padding - 10} y={padding + innerH + 4} textAnchor="end" className="fill-gray-400" fontSize={10}>0</text>
        <text x={padding - 10} y={padding + 4} textAnchor="end" className="fill-gray-400" fontSize={10}>1</text>
        <text x={padding} y={padding + innerH + 16} textAnchor="middle" className="fill-gray-400" fontSize={10}>0</text>
        <text x={padding + innerW} y={padding + innerH + 16} textAnchor="middle" className="fill-gray-400" fontSize={10}>1</text>

        {[0.25, 0.5, 0.75].map((tick) => (
          <line
            key={tick}
            x1={padding}
            y1={padding + (1 - tick) * innerH}
            x2={padding + innerW}
            y2={padding + (1 - tick) * innerH}
            stroke="#e5e7eb"
            strokeWidth={0.5}
            strokeDasharray="4 4"
          />
        ))}

        <path d={path} fill="none" stroke="#4f46e5" strokeWidth={2.5} />

        {marker && (
          <>
            <line
              x1={marker.px}
              y1={padding + innerH}
              x2={marker.px}
              y2={marker.py}
              stroke="#14b8a6"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <line
              x1={padding}
              y1={marker.py}
              x2={marker.px}
              y2={marker.py}
              stroke="#14b8a6"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <circle cx={marker.px} cy={marker.py} r={4} fill="#14b8a6" />
          </>
        )}
      </svg>

      {showFlatRegions && (
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 px-1">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
            Flat regions (F'=0)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-indigo-500 inline-block" />
            F(x)
          </span>
        </div>
      )}
    </div>
  );
};

import { useMemo } from 'react';
import clsx from 'clsx';
import { makeLinearGrid } from '../../utils/cdfUtils';

interface CdfPlotProps {
  evaluate: (x: number) => number;
  min: number;
  max: number;
  markerX?: number;
  width?: number;
  height?: number;
  className?: string;
  colorClass?: string;
}

export const CdfPlot: React.FC<CdfPlotProps> = ({
  evaluate,
  min,
  max,
  markerX,
  width = 520,
  height = 220,
  className,
  colorClass = '#4f46e5',
}) => {
  const padding = 28;
  const innerW = width - 2 * padding;
  const innerH = height - 2 * padding;

  const points = useMemo(() => {
    return makeLinearGrid(min, max, 150).map((x) => {
      const y = Math.max(0, Math.min(1, evaluate(x)));
      const px = padding + ((x - min) / (max - min)) * innerW;
      const py = padding + (1 - y) * innerH;
      return { x, y, px, py };
    });
  }, [evaluate, min, max, padding, innerW, innerH]);

  const marker = useMemo(() => {
    if (markerX === undefined) return null;
    const y = Math.max(0, Math.min(1, evaluate(markerX)));
    const px = padding + ((markerX - min) / (max - min)) * innerW;
    const py = padding + (1 - y) * innerH;
    return { y, px, py };
  }, [evaluate, markerX, min, max, padding, innerW, innerH]);

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px.toFixed(2)} ${p.py.toFixed(2)}`)
    .join(' ');

  return (
    <div className={clsx('bg-gray-50 rounded-xl border border-gray-200 p-3', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="CDF plot">
        <line x1={padding} y1={padding + innerH} x2={padding + innerW} y2={padding + innerH} stroke="#9ca3af" strokeWidth={1.5} />
        <line x1={padding} y1={padding} x2={padding} y2={padding + innerH} stroke="#9ca3af" strokeWidth={1.5} />

        <text x={padding - 10} y={padding + innerH + 4} textAnchor="end" className="fill-gray-400" fontSize={10}>0</text>
        <text x={padding - 10} y={padding + 4} textAnchor="end" className="fill-gray-400" fontSize={10}>1</text>

        <text x={padding} y={padding + innerH + 16} textAnchor="middle" className="fill-gray-400" fontSize={10}>{min.toFixed(1)}</text>
        <text x={padding + innerW} y={padding + innerH + 16} textAnchor="middle" className="fill-gray-400" fontSize={10}>{max.toFixed(1)}</text>

        <path d={path} fill="none" stroke={colorClass} strokeWidth={2.5} />

        {marker && (
          <>
            <line x1={marker.px} y1={padding + innerH} x2={marker.px} y2={marker.py} stroke="#14b8a6" strokeDasharray="4 4" strokeWidth={1.5} />
            <circle cx={marker.px} cy={marker.py} r={4} fill="#14b8a6" />
          </>
        )}
      </svg>
    </div>
  );
};

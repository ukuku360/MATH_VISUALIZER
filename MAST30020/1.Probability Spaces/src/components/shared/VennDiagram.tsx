import clsx from 'clsx';

// Regions for a 2-circle Venn diagram:
// 'onlyA' = A \ B, 'onlyB' = B \ A, 'intersection' = A ∩ B, 'outside' = (A ∪ B)ᶜ
export type VennRegion = 'onlyA' | 'onlyB' | 'intersection' | 'outside';

interface VennDiagramProps {
  highlighted: VennRegion[];
  onRegionClick?: (region: VennRegion) => void;
  labelA?: string;
  labelB?: string;
  width?: number;
  height?: number;
}

export const VennDiagram: React.FC<VennDiagramProps> = ({
  highlighted,
  onRegionClick,
  labelA = 'A',
  labelB = 'B',
  width = 320,
  height = 220,
}) => {
  const cx1 = width * 0.38;
  const cx2 = width * 0.62;
  const cy = height * 0.5;
  const r = width * 0.22;

  const isHighlighted = (region: VennRegion) => highlighted.includes(region);
  const clickable = !!onRegionClick;

  // We use clipPath approach for clean region rendering
  const clipIdA = 'clipA';
  const clipIdB = 'clipB';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="mx-auto">
      <defs>
        <clipPath id={clipIdA}>
          <circle cx={cx1} cy={cy} r={r} />
        </clipPath>
        <clipPath id={clipIdB}>
          <circle cx={cx2} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Outside region (universal set background) */}
      <rect
        x={0} y={0} width={width} height={height}
        rx={12}
        className={clsx(
          'transition-colors',
          isHighlighted('outside') ? 'fill-indigo-100' : 'fill-gray-50',
          clickable && 'cursor-pointer hover:fill-indigo-50'
        )}
        onClick={() => onRegionClick?.('outside')}
      />

      {/* Only A (A \ B): circle A clipped away from B */}
      {/* We draw circle A, then overdraw intersection with different color */}
      <circle
        cx={cx1} cy={cy} r={r}
        className={clsx(
          'transition-colors stroke-blue-400 stroke-2',
          isHighlighted('onlyA') || isHighlighted('intersection') ? '' : 'fill-white',
          isHighlighted('onlyA') ? 'fill-blue-200' : '',
        )}
      />
      <circle
        cx={cx2} cy={cy} r={r}
        className={clsx(
          'transition-colors stroke-red-400 stroke-2',
          isHighlighted('onlyB') || isHighlighted('intersection') ? '' : 'fill-white',
          isHighlighted('onlyB') ? 'fill-red-200' : '',
        )}
      />

      {/* Intersection region: drawn as circle B clipped to circle A */}
      <circle
        cx={cx2} cy={cy} r={r}
        clipPath={`url(#${clipIdA})`}
        className={clsx(
          'transition-colors',
          isHighlighted('intersection') ? 'fill-purple-300' : 'fill-white',
        )}
      />

      {/* Clickable overlay regions */}
      {clickable && (
        <>
          {/* Only A region click target */}
          <circle
            cx={cx1} cy={cy} r={r}
            className="fill-transparent cursor-pointer"
            onClick={(e) => {
              // Determine if click is in intersection
              const svgRect = (e.target as SVGCircleElement).ownerSVGElement?.getBoundingClientRect();
              if (!svgRect) return;
              const px = ((e.clientX - svgRect.left) / svgRect.width) * width;
              const distB = Math.sqrt((px - cx2) ** 2 + ((e.clientY - svgRect.top) / svgRect.height * height - cy) ** 2);
              if (distB < r) {
                onRegionClick('intersection');
              } else {
                onRegionClick('onlyA');
              }
            }}
          />
          {/* Only B region click target */}
          <circle
            cx={cx2} cy={cy} r={r}
            className="fill-transparent cursor-pointer"
            onClick={(e) => {
              const svgRect = (e.target as SVGCircleElement).ownerSVGElement?.getBoundingClientRect();
              if (!svgRect) return;
              const px = ((e.clientX - svgRect.left) / svgRect.width) * width;
              const distA = Math.sqrt((px - cx1) ** 2 + ((e.clientY - svgRect.top) / svgRect.height * height - cy) ** 2);
              if (distA < r) {
                onRegionClick('intersection');
              } else {
                onRegionClick('onlyB');
              }
            }}
          />
        </>
      )}

      {/* Labels */}
      <text x={cx1 - r * 0.4} y={cy + 4} className="fill-blue-700 font-bold text-sm" textAnchor="middle">
        {labelA}
      </text>
      <text x={cx2 + r * 0.4} y={cy + 4} className="fill-red-700 font-bold text-sm" textAnchor="middle">
        {labelB}
      </text>

      {/* Universe label */}
      <text x={width - 8} y={16} className="fill-gray-400 text-xs" textAnchor="end">
        Ω
      </text>

      {/* Re-draw circle outlines on top */}
      <circle cx={cx1} cy={cy} r={r} className="fill-none stroke-blue-400 stroke-2" />
      <circle cx={cx2} cy={cy} r={r} className="fill-none stroke-red-400 stroke-2" />
    </svg>
  );
};

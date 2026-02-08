import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { InlineMath } from 'react-katex';
import { generateCantorIntervals, generateRemovedIntervals, cantorSetRemainingLength } from '../../utils/cantorUtils';

const MAX_ITERATION = 7;
const SVG_WIDTH = 560;
const SVG_HEIGHT = 320;
const PAD_X = 20;
const PAD_Y = 24;
const ROW_HEIGHT = 28;
const ROW_GAP = 8;
const BAR_INNER = SVG_WIDTH - 2 * PAD_X;

export const CantorSetBuilder: React.FC = () => {
  const [iteration, setIteration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (iteration >= MAX_ITERATION) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setIteration((i) => i + 1), 900);
    return () => clearTimeout(timer);
  }, [isPlaying, iteration]);

  const rows = useMemo(() => {
    const result: Array<{
      iteration: number;
      intervals: Array<{ start: number; end: number }>;
      removed: Array<{ start: number; end: number }>;
    }> = [];
    for (let n = 0; n <= iteration; n++) {
      result.push({
        iteration: n,
        intervals: generateCantorIntervals(n),
        removed: n > 0 ? generateRemovedIntervals(n).filter(
          (r) => !generateRemovedIntervals(n - 1).some(
            (prev) => Math.abs(prev.start - r.start) < 1e-12
          )
        ) : [],
      });
    }
    return result;
  }, [iteration]);

  const remainLen = cantorSetRemainingLength(iteration);

  const fractionLabel = useMemo(() => {
    if (iteration === 0) return '1';
    const num = Math.pow(2, iteration);
    const den = Math.pow(3, iteration);
    return `\\frac{${num}}{${den}}`;
  }, [iteration]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => {
            if (isPlaying) {
              setIsPlaying(false);
            } else {
              if (iteration >= MAX_ITERATION) setIteration(0);
              setIsPlaying(true);
            }
          }}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isPlaying
              ? 'bg-amber-100 text-amber-700 border border-amber-300'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          )}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={() => { setIteration(0); setIsPlaying(false); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">Step</label>
          <input
            type="range"
            min={0}
            max={MAX_ITERATION}
            value={iteration}
            onChange={(e) => { setIteration(Number(e.target.value)); setIsPlaying(false); }}
            className="w-32 accent-indigo-600"
          />
          <span className="text-sm font-mono text-gray-700 w-6 text-center">{iteration}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto" role="img" aria-label="Cantor set construction">
          <AnimatePresence>
            {rows.map((row) => {
              const y = PAD_Y + row.iteration * (ROW_HEIGHT + ROW_GAP);
              return (
                <motion.g
                  key={row.iteration}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <text x={PAD_X - 4} y={y + ROW_HEIGHT / 2 + 4} textAnchor="end" className="fill-gray-400" fontSize={9}>
                    n={row.iteration}
                  </text>

                  {row.intervals.map((seg, idx) => {
                    const x1 = PAD_X + seg.start * BAR_INNER;
                    const w = (seg.end - seg.start) * BAR_INNER;
                    return (
                      <motion.rect
                        key={`s-${row.iteration}-${idx}`}
                        x={x1}
                        y={y}
                        width={Math.max(w, 0.5)}
                        height={ROW_HEIGHT}
                        rx={3}
                        className="fill-indigo-500"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.02 }}
                        style={{ originX: `${x1}px`, originY: `${y}px` }}
                      />
                    );
                  })}

                  {row.iteration > 0 && generateRemovedIntervals(row.iteration)
                    .filter((r) => {
                      const prevRemoved = generateRemovedIntervals(row.iteration - 1);
                      return !prevRemoved.some((prev) => Math.abs(prev.start - r.start) < 1e-12);
                    })
                    .map((seg, idx) => {
                      const x1 = PAD_X + seg.start * BAR_INNER;
                      const w = (seg.end - seg.start) * BAR_INNER;
                      return (
                        <motion.rect
                          key={`r-${row.iteration}-${idx}`}
                          x={x1}
                          y={y}
                          width={Math.max(w, 0.5)}
                          height={ROW_HEIGHT}
                          rx={3}
                          className="fill-red-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      );
                    })}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-sm text-indigo-800">
          <div className="text-xs font-semibold uppercase text-indigo-500 mb-1">Remaining Length</div>
          <InlineMath math={`\\left(\\frac{2}{3}\\right)^{${iteration}} = ${fractionLabel} \\approx ${remainLen.toFixed(6)}`} />
        </div>
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm text-amber-800">
          <div className="text-xs font-semibold uppercase text-amber-500 mb-1">Remaining Intervals</div>
          <InlineMath math={`2^{${iteration}} = ${Math.pow(2, iteration)}`} /> intervals
        </div>
      </div>
    </div>
  );
};

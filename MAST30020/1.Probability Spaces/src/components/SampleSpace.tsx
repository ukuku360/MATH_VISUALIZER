import { motion } from 'framer-motion';
import type { Element, Set } from '../types';
import clsx from 'clsx';

interface SampleSpaceProps {
  omega: Set;
  highlightedSet?: Set;
  onElementClick?: (element: Element) => void;
  className?: string;
}

export const SampleSpace: React.FC<SampleSpaceProps> = ({
  omega,
  highlightedSet = [],
  onElementClick,
  className,
}) => {
  return (
    <div className={clsx("p-6 bg-white rounded-xl shadow-sm border border-gray-200", className)}>
      <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Sample Space (Ω)</h3>
      <div className="grid grid-cols-2 gap-4 max-w-[200px] mx-auto">
        {omega.map((element) => {
          const isSelected = highlightedSet.includes(element);
          return (
            <motion.div
              key={element}
              onClick={() => onElementClick?.(element)}
              whileHover={onElementClick ? { scale: 1.05 } : {}}
              whileTap={onElementClick ? { scale: 0.95 } : {}}
              className={clsx(
                "h-16 w-16 flex items-center justify-center rounded-lg text-xl font-bold transition-colors cursor-pointer select-none",
                isSelected
                  ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
            >
              {element}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

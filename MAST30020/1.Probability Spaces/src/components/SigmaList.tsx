import type { SigmaAlgebra } from '../types';
import { formatSet } from '../utils/setUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface SigmaListProps {
  collection: SigmaAlgebra;
  onRemoveSet: (setToRemove: number[]) => void;
}

export const SigmaList: React.FC<SigmaListProps> = ({ collection, onRemoveSet }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto">
      <h3 className="text-lg font-bold text-gray-800 mb-4 sticky top-0 bg-white z-10">Current Collection (F)</h3>
      <ul className="space-y-2">
        <AnimatePresence>
          {collection.map((set) => (
            <motion.li
              key={formatSet(set)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span className="font-mono text-gray-700">{formatSet(set)}</span>
              <button
                onClick={() => onRemoveSet(set)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                title="Remove set"
              >
                <Trash2 size={16} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {collection.length === 0 && (
        <div className="text-gray-400 text-center mt-10 italic">
          Collection is empty. Start adding sets!
        </div>
      )}
    </div>
  );
};

import { useState } from 'react';
import type { Element, Set } from '../types';
import { SampleSpace } from './SampleSpace';
import { normalizeSet, formatSet } from '../utils/setUtils';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubsetCreatorProps {
  omega: Set;
  onAddSet: (newSet: Set) => void;
}

export const SubsetCreator: React.FC<SubsetCreatorProps> = ({ omega, onAddSet }) => {
  const [currentSelection, setCurrentSelection] = useState<Set>([]);

  const toggleElement = (element: Element) => {
    setCurrentSelection((prev) => {
      if (prev.includes(element)) {
        return prev.filter((e) => e !== element);
      } else {
        return normalizeSet([...prev, element]);
      }
    });
  };

  const handleAdd = () => {
    onAddSet(currentSelection);
    setCurrentSelection([]);
  };

  const handleReset = () => {
    setCurrentSelection([]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Create Subset</h3>
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
          Selected: {formatSet(currentSelection)}
        </span>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <SampleSpace
          omega={omega}
          highlightedSet={currentSelection}
          onElementClick={toggleElement}
          className="bg-gray-50 border-none shadow-none"
        />
      </div>

      <div className="mt-6 flex space-x-3">
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            disabled={currentSelection.length === 0}
            className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            <Trash2 size={18} />
            Reset
        </motion.button>
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="flex-[2] py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 flex items-center justify-center gap-2 transition-colors"
        >
            <Plus size={18} />
            Add to Collection
        </motion.button>
      </div>
    </div>
  );
};

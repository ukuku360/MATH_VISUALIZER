import { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import type { ExerciseStatus } from '../../types';

interface ExerciseCardProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  status: ExerciseStatus;
  feedback?: string;
  hint?: string;
  onReset?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  description,
  children,
  status,
  feedback,
  hint,
  onReset,
}) => {
  const [showHint, setShowHint] = useState(false);

  const borderColor = {
    unattempted: 'border-l-gray-300',
    correct: 'border-l-green-500',
    incorrect: 'border-l-red-500',
  }[status];

  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 overflow-hidden', borderColor)}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
          <div className="flex items-center gap-2">
            {status === 'correct' && <CheckCircle size={18} className="text-green-600" />}
            {status === 'incorrect' && <XCircle size={18} className="text-red-500" />}
          </div>
        </div>

        {description && <div className="text-sm text-gray-600 mb-4">{description}</div>}

        <div className="mb-3">{children}</div>

        {feedback && status !== 'unattempted' && (
          <div
            className={clsx(
              'text-sm p-3 rounded-lg mt-3',
              status === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}
          >
            {feedback}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          {hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
            >
              <Lightbulb size={14} />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}
          {onReset && status !== 'unattempted' && (
            <button
              onClick={() => {
                onReset();
                setShowHint(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 ml-auto transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>

        {showHint && hint && (
          <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-100">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
};

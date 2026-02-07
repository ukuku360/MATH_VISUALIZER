import type { ValidationResult } from '../types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatSet } from '../utils/setUtils';

interface ValidationStatusProps {
  result: ValidationResult;
}

export const ValidationStatus: React.FC<ValidationStatusProps> = ({ result }) => {
  if (result.isValid) {
    return (
      <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-start gap-3">
        <CheckCircle className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-green-800">Valid Sigma Algebra!</h4>
          <p className="text-green-700 text-sm mt-1">
            This collection satisfies all three properties:
            <ul className="list-disc list-inside mt-1 ml-2 opacity-80">
              <li>Contains the empty set (∅)</li>
              <li>Assuming Ω is present (if finite)</li>
              <li>Closed under complement</li>
              <li>Closed under countable unions</li>
            </ul>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 p-4 rounded-xl border border-red-200 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <XCircle className="text-red-600" />
        <h4 className="font-bold text-red-800">Invalid Collection</h4>
      </div>

      {result.missingEmpty && (
        <div className="flex items-start gap-2 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Missing empty set <strong>∅</strong></span>
        </div>
      )}

      {result.missingWhole && (
        <div className="flex items-start gap-2 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Missing sample space <strong>Ω</strong></span>
        </div>
      )}

      {result.missingComplements.length > 0 && (
         <div className="space-y-1">
            <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Missing Complements:</p>
            <ul className="list-disc list-inside text-sm text-red-700">
              {result.missingComplements.slice(0, 3).map((item, idx) => (
                <li key={idx}>
                  For {formatSet(item.set)}, missing <strong>{formatSet(item.complement)}</strong>
                </li>
              ))}
              {result.missingComplements.length > 3 && <li>...and {result.missingComplements.length - 3} more</li>}
            </ul>
         </div>
      )}

      {result.missingUnions.length > 0 && (
         <div className="space-y-1">
            <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Missing Unions:</p>
            <ul className="list-disc list-inside text-sm text-red-700">
               {result.missingUnions.slice(0, 3).map((item, idx) => (
                <li key={idx}>
                   {formatSet(item.setA)} ∪ {formatSet(item.setB)} = <strong>{formatSet(item.union)}</strong>
                </li>
              ))}
              {result.missingUnions.length > 3 && <li>...and {result.missingUnions.length - 3} more</li>}
            </ul>
         </div>
      )}
    </div>
  );
};

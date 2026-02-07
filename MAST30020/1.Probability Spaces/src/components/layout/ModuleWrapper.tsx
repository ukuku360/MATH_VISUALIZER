import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface ModuleWrapperProps {
  title: string;
  katexTitle?: string;
  subtitle: string;
  children: React.ReactNode;
}

export const ModuleWrapper: React.FC<ModuleWrapperProps> = ({ title, katexTitle, subtitle, children }) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          {title}
          {katexTitle && (
            <span className="text-indigo-500 text-xl">
              <InlineMath math={katexTitle} />
            </span>
          )}
        </h2>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
};

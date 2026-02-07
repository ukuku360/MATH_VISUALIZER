import clsx from 'clsx';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import type { ModuleId, ModuleConfig } from '../../types';

const MODULES: ModuleConfig[] = [
  {
    id: 'cdf-foundations',
    title: 'CDF Foundations',
    subtitle: '(R, B(R)), notation, and why CDFs are enough',
    katexSymbol: 'F_P(t)=P((-\\infty,t])',
  },
  {
    id: 'cdf-properties',
    title: 'CDF Properties',
    subtitle: 'Monotone, right-continuous, and tail limits',
    katexSymbol: 'F(t-) \\le F(t)=F(t+) ',
  },
  {
    id: 'atoms-jumps',
    title: 'Atoms and Jumps',
    subtitle: 'Point masses, Bernoulli mixtures, and P({t})',
    katexSymbol: 'P(\\{t\\})=F(t)-F(t-)',
  },
  {
    id: 'cdf-construction',
    title: 'Constructing P from F',
    subtitle: 'Theorem 1.36 and interval probabilities',
    katexSymbol: 'P((a,b])=F(b)-F(a)',
  },
  {
    id: 'distribution-classes',
    title: 'Distribution Classes',
    subtitle: 'Discrete, AC, mixed, singular, decomposition',
    katexSymbol: 'P=\\alpha_dP_d+\\alpha_aP_a+\\alpha_sP_s',
  },
];

interface SidebarProps {
  activeModule: ModuleId;
  onModuleSelect: (id: ModuleId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleSelect }) => {
  return (
    <>
      <nav className="hidden md:flex flex-col w-64 shrink-0 space-y-1.5">
        {MODULES.map((mod, idx) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onModuleSelect(mod.id)}
              className={clsx(
                'text-left p-3 rounded-xl border transition-all w-full group',
                isActive
                  ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100 border-l-4 border-l-indigo-500'
                  : 'bg-white/50 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm'
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className={clsx('font-semibold text-sm truncate', isActive ? 'text-indigo-700' : 'text-gray-700')}>
                    {mod.title}
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{mod.subtitle}</div>
                </div>
              </div>
              <div className={clsx('mt-2 ml-10 text-xs', isActive ? 'text-indigo-500' : 'text-gray-400 opacity-70')}>
                <InlineMath math={mod.katexSymbol} />
              </div>
            </button>
          );
        })}
      </nav>

      <nav className="md:hidden overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max px-1">
          {MODULES.map((mod, idx) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onModuleSelect(mod.id)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap',
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                )}
              >
                <span
                  className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                    isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {idx + 1}
                </span>
                {mod.title}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

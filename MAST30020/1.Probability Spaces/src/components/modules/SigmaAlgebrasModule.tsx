import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleWrapper } from '../layout/ModuleWrapper';
import { SubsetCreator } from '../SubsetCreator';
import { SigmaList } from '../SigmaList';
import { ValidationStatus } from '../ValidationStatus';
import { BorelIntegration } from '../BorelIntegration';
import { validateSigmaAlgebra } from '../../utils/sigmaAlgebraValidation';
import { generateSigmaAlgebra, generateSigmaAlgebraStepwise } from '../../utils/sigmaAlgebraGenerator';
import { setEquals, containsSet, normalizeSet, formatSet } from '../../utils/setUtils';
import { Wand2, RotateCcw, Sigma, Activity, Layers } from 'lucide-react';
import clsx from 'clsx';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import type { Set, SigmaAlgebra, GenerationStep } from '../../types';

const OMEGA = [1, 2, 3, 4];

type SubTab = 'builder' | 'borel' | 'generator';

export const SigmaAlgebrasModule: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('builder');

  // Finite case state (builder)
  const [collection, setCollection] = useState<SigmaAlgebra>([]);

  const handleAddSet = (newSet: Set) => {
    const normalized = normalizeSet(newSet);
    if (!containsSet(collection, normalized)) {
      setCollection([...collection, normalized]);
    }
  };

  const handleRemoveSet = (setToRemove: Set) => {
    setCollection(collection.filter((s) => !setEquals(s, setToRemove)));
  };

  const handleReset = () => setCollection([]);

  const handleAutoComplete = () => {
    const closedCollection = generateSigmaAlgebra(collection, OMEGA);
    setCollection(closedCollection);
  };

  const validationResult = useMemo(() => {
    return validateSigmaAlgebra(collection, OMEGA);
  }, [collection]);

  // Generator state
  const [generators, setGenerators] = useState<SigmaAlgebra>([]);
  const [genSteps, setGenSteps] = useState<GenerationStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const handleAddGenerator = (newSet: Set) => {
    const normalized = normalizeSet(newSet);
    if (!containsSet(generators, normalized)) {
      setGenerators([...generators, normalized]);
      setGenSteps([]);
      setCurrentStepIdx(0);
    }
  };

  const handleStartGeneration = () => {
    const steps = generateSigmaAlgebraStepwise(generators, OMEGA);
    setGenSteps(steps);
    setCurrentStepIdx(0);
  };

  const handleNextStep = () => {
    if (currentStepIdx < genSteps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handleResetGenerator = () => {
    setGenerators([]);
    setGenSteps([]);
    setCurrentStepIdx(0);
  };

  return (
    <ModuleWrapper
      title="σ-Algebras"
      katexTitle="\\mathcal{F}"
      subtitle="Definition, properties, generated σ-algebras, and Borel sets"
    >
      {/* Sub-tab navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSubTab('builder')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            subTab === 'builder' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Sigma size={16} />
          Finite Case Builder
        </button>
        <button
          onClick={() => setSubTab('borel')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            subTab === 'borel' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Activity size={16} />
          Borel Sets
        </button>
        <button
          onClick={() => setSubTab('generator')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            subTab === 'generator' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Layers size={16} />
          σ(G) Generator
        </button>
      </div>

      {subTab === 'builder' && (
        <div className="space-y-6">
          {/* Definition */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
            <h4 className="font-bold mb-2">Definition</h4>
            <p className="mb-2">
              A family <InlineMath math="\mathcal{F}" /> of subsets of <InlineMath math="\Omega" /> is a <strong>σ-algebra</strong> if:
            </p>
            <ul className="space-y-1 list-disc list-inside opacity-90">
              <li>(A.1) <InlineMath math="\Omega \in \mathcal{F}" /></li>
              <li>(A.2) <InlineMath math="A \in \mathcal{F} \Rightarrow A^c \in \mathcal{F}" /></li>
              <li>(A.3) <InlineMath math="A_1, A_2, \ldots \in \mathcal{F} \Rightarrow \bigcup_{n=1}^{\infty} A_n \in \mathcal{F}" /></li>
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <SubsetCreator omega={OMEGA} onAddSet={handleAddSet} />
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleAutoComplete}
                    className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Wand2 size={18} />
                    Auto-Complete (Generate σ(F))
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw size={18} />
                    Reset Collection
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 h-[600px]">
              <SigmaList collection={collection} onRemoveSet={handleRemoveSet} />
            </div>
            <div className="lg:col-span-1">
              <ValidationStatus result={validationResult} />
              <div className="mt-6 bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
                <h4 className="font-bold mb-2">Tips</h4>
                <ul className="space-y-2 list-disc list-inside opacity-90">
                  <li><InlineMath math="\emptyset" /> and <InlineMath math="\Omega" /> must always be included.</li>
                  <li>If a set is included, its <strong>complement</strong> must be included.</li>
                  <li>Unions of included sets must be included.</li>
                  <li>Try adding <code>{'{1}'}</code> and checking what's missing!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'borel' && <BorelIntegration />}

      {subTab === 'generator' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
            <h4 className="font-bold mb-2">Generated σ-algebra</h4>
            <p>
              For any family <InlineMath math="\mathcal{G}" /> of subsets of <InlineMath math="\Omega" />, the generated
              σ-algebra <InlineMath math="\sigma(\mathcal{G})" /> is the <strong>smallest</strong> σ-algebra containing{' '}
              <InlineMath math="\mathcal{G}" />.
            </p>
            <BlockMath math="\sigma(\mathcal{G}) = \bigcap \{ \mathcal{H} : \mathcal{H} \text{ is a } \sigma\text{-algebra on } \Omega,\; \mathcal{G} \subset \mathcal{H} \}" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SubsetCreator omega={OMEGA} onAddSet={handleAddGenerator} />

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2 text-sm">Generators <InlineMath math="\mathcal{G}" /></h4>
                {generators.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">Add sets to generate from...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {generators.map((s) => (
                      <span key={formatSet(s)} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-mono">
                        {formatSet(s)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStartGeneration}
                  disabled={generators.length === 0}
                  className="flex-1 py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Steps
                </button>
                <button
                  onClick={handleResetGenerator}
                  className="py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 text-sm">Step-by-Step Closure</h4>

              {genSteps.length === 0 ? (
                <p className="text-gray-400 text-sm italic text-center mt-8">
                  Add generators and click "Generate Steps" to see the closure process.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Step controls */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-500">
                      Step {currentStepIdx + 1} / {genSteps.length}
                    </span>
                    <button
                      onClick={handleNextStep}
                      disabled={currentStepIdx >= genSteps.length - 1}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next Step →
                    </button>
                    <button
                      onClick={() => setCurrentStepIdx(genSteps.length - 1)}
                      className="px-3 py-1 border border-gray-300 text-gray-600 rounded-md text-sm hover:bg-gray-50 transition-colors"
                    >
                      Skip to End
                    </button>
                  </div>

                  {/* Current step info */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStepIdx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 mb-3">
                        <p className="text-sm font-bold text-indigo-700">{genSteps[currentStepIdx].description}</p>
                        {genSteps[currentStepIdx].addedSets.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-xs text-indigo-500">Added:</span>
                            {genSteps[currentStepIdx].addedSets.map((s) => (
                              <motion.span
                                key={formatSet(s)}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded text-xs font-mono"
                              >
                                {formatSet(s)}
                              </motion.span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Current collection */}
                      <p className="text-xs text-gray-500 font-semibold mb-2">
                        Current collection ({genSteps[currentStepIdx].currentCollection.length} sets):
                      </p>
                      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                        {genSteps[currentStepIdx].currentCollection.map((s) => (
                          <span
                            key={formatSet(s)}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono"
                          >
                            {formatSet(s)}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ModuleWrapper>
  );
};

import { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { SampleSpacesModule } from './modules/SampleSpacesModule';
import { EventsOperationsModule } from './modules/EventsOperationsModule';
import { SigmaAlgebrasModule } from './modules/SigmaAlgebrasModule';
import { ProbabilityMeasureModule } from './modules/ProbabilityMeasureModule';
import { BorelCantelliModule } from './modules/BorelCantelliModule';
import type { ModuleId } from '../types';

export const Dashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleId>('sample-spaces');

  const renderModule = () => {
    switch (activeModule) {
      case 'sample-spaces':
        return <SampleSpacesModule />;
      case 'events-operations':
        return <EventsOperationsModule />;
      case 'sigma-algebras':
        return <SigmaAlgebrasModule />;
      case 'probability-measure':
        return <ProbabilityMeasureModule />;
      case 'borel-cantelli':
        return <BorelCantelliModule />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Probability Spaces</h1>
        <p className="text-gray-500 text-sm">Interactive Learning Dashboard</p>
      </header>
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar activeModule={activeModule} onModuleSelect={setActiveModule} />
        <main className="flex-1 min-w-0">{renderModule()}</main>
      </div>
    </div>
  );
};

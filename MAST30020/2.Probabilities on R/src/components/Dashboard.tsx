import { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { CdfFoundationsModule } from './modules/CdfFoundationsModule';
import { CdfPropertiesModule } from './modules/CdfPropertiesModule';
import { AtomsAndJumpsModule } from './modules/AtomsAndJumpsModule';
import { ConstructionUniquenessModule } from './modules/ConstructionUniquenessModule';
import { DistributionClassesModule } from './modules/DistributionClassesModule';
import type { ModuleId } from '../types';

export const Dashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleId>('cdf-foundations');

  const renderModule = () => {
    switch (activeModule) {
      case 'cdf-foundations':
        return <CdfFoundationsModule />;
      case 'cdf-properties':
        return <CdfPropertiesModule />;
      case 'atoms-jumps':
        return <AtomsAndJumpsModule />;
      case 'cdf-construction':
        return <ConstructionUniquenessModule />;
      case 'distribution-classes':
        return <DistributionClassesModule />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Probabilities on R</h1>
        <p className="text-gray-500 text-sm">Interactive Learning Dashboard</p>
      </header>
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar activeModule={activeModule} onModuleSelect={setActiveModule} />
        <main className="flex-1 min-w-0">{renderModule()}</main>
      </div>
    </div>
  );
};

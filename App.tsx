import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import { Bike } from 'lucide-react';

const App: React.FC = () => {
  // Initialize state from URL parameter
  const [clientName, setClientName] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('client');
  });

  if (!clientName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="mb-6 p-4 bg-white rounded-full shadow-md">
          <Bike size={48} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Требуется персональная ссылка</h1>
        <p className="text-gray-500 max-w-md mb-8">
          Для доступа к личному кабинету, пожалуйста, перейдите по ссылке, которую вам отправил администратор.
        </p>

        {/* Demo Button for easy preview */}
        <button 
          onClick={() => setClientName('Nazar')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
        >
          Демонстрация (Nazar)
        </button>

        <p className="text-xs text-gray-400 mt-8">
          Пример: site.com/?client=ВашеИмя
        </p>
      </div>
    );
  }

  return <Dashboard clientName={clientName} />;
};

export default App;
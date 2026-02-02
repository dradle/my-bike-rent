import React, { useEffect, useState } from 'react';
import { CustomerData } from '../types';
import { fetchCustomerData } from '../services/googleSheetService';
import { formatDate } from '../utils/dateUtils';
import { RefreshCw } from 'lucide-react';

interface DashboardProps {
  clientName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ clientName }) => {
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCustomerData(clientName);
      setData(result);
    } catch (err) {
      setError('Не удалось найти данные. Проверьте правильность ссылки или свяжитесь с администратором.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
        <RefreshCw className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
          <div className="text-red-500 text-5xl mb-4">:(</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ошибка доступа</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  // Determine Block 2 Color
  // Prompt: if C1 (debtFlag) < 0 then red (debt), else green (ok)
  const isDebt = data.debtFlag < 0;
  const statusBgColor = isDebt ? 'bg-red-100 border-red-200' : 'bg-green-100 border-green-200';
  const statusTextColor = isDebt ? 'text-red-900' : 'text-green-900';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">BikeRent</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Аренда велосипедов в Кракове</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* Block 1: Profile */}
        <div className="bg-gray-200 rounded-2xl p-6 flex items-center shadow-sm">
          <div className="flex-shrink-0 mr-5 text-6xl">
            🚲
          </div>
          <div className="flex-grow min-w-0">
            <h2 className="text-xl font-bold text-gray-800 truncate mb-1">{data.sheetName}</h2>
            <p className="text-gray-700 font-medium truncate">{data.bikeName}</p>
            <p className="text-gray-500 text-sm mt-1">{data.tariff} zl/неделю</p>
          </div>
        </div>

        {/* Block 2: Status */}
        <div className={`rounded-2xl p-6 shadow-sm border ${statusBgColor} ${statusTextColor}`}>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
              <span className="font-medium opacity-70 text-sm">Последний платеж</span>
              <span className="font-bold text-lg">
                {data.lastPayment ? (
                  <>
                    {data.lastPayment.amount}zl <span className="text-sm font-normal opacity-70">- {data.lastPayment.date}</span>
                  </>
                ) : (
                  'Нет данных'
                )}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="font-medium opacity-70 text-sm">Следующий платеж</span>
              <span className="font-bold text-lg">
                {data.nextPaymentDate ? formatDate(data.nextPaymentDate) : '-'}
              </span>
            </div>

            {/* Conditional Debt Display */}
            {isDebt && (
              <div className="mt-4 pt-3 border-t border-red-200">
                <p className="text-red-600 font-bold text-xl text-center">
                  Задолженность: {Math.abs(data.debtFlag)} zl
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Block 3: Message (Conditional) */}
        {data.adminMessage && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-yellow-800 font-bold text-sm uppercase tracking-wide mb-2">
              Сообщение от BikeRent
            </h3>
            <p className="text-yellow-900 leading-relaxed font-medium">
              {data.adminMessage}
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
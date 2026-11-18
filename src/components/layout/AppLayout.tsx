import { useState, type FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckSquareOutlined, WalletOutlined } from '@ant-design/icons';
import { TodoView } from '@/features/todos/TodoView';
import { FinanceView } from '@/features/finance/FinanceView';

export const AppLayout: FC = () => {
  const [activeTab, setActiveTab] = useState<'todos' | 'finance'>('todos');
  const queryClient = useQueryClient();

  const handleTabSwitch = (tab: 'todos' | 'finance') => {
    setActiveTab(tab);
    if (tab === 'todos') {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.refetchQueries({ queryKey: ['todos'] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
      queryClient.invalidateQueries({ queryKey: ['financeTransactions'] });
      queryClient.refetchQueries({ queryKey: ['financeSummary'] });
      queryClient.refetchQueries({ queryKey: ['financeTransactions'] });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 min-h-16 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              P
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 m-0 leading-tight">Personal OS</h1>
              <span className="hidden sm:block text-[11px] text-gray-400">
                Daily Productivity & 6 Jars Financial System
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex max-w-full items-center bg-slate-100 p-1 rounded-xl overflow-x-auto">
            <button
              onClick={() => handleTabSwitch('todos')}
              className={`flex shrink-0 items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'todos'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CheckSquareOutlined />
              <span>Tasks & Todos</span>
            </button>

            <button
              onClick={() => handleTabSwitch('finance')}
              className={`flex shrink-0 items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'finance'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <WalletOutlined />
              <span>6 Jars Finance</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-16">{activeTab === 'todos' ? <TodoView /> : <FinanceView />}</main>
    </div>
  );
};

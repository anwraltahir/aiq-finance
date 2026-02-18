import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExpenseForm } from './components/ExpenseForm';
import { SummaryStats } from './components/SummaryStats';
import { TransactionList } from './components/TransactionList';
import { ExpenseRecord, IncomeRecord } from './types';
import { IncomeForm } from './components/IncomeForm';
import { IncomeStats } from './components/IncomeStats';
import { IncomeList } from './components/IncomeList';
import { ReportModal } from './components/ReportModal';
import { Wallet, Banknote, Printer } from 'lucide-react';

type TabView = 'expenses' | 'income';

// Fallback ID generator for environments where crypto.randomUUID is not available
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

function App() {
  const [activeTab, setActiveTab] = useState<TabView>('expenses');
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Initialize state directly from localStorage
  const [transactions, setTransactions] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aiq_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load transactions", e);
      return [];
    }
  });

  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('aiq_income');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load income", e);
      return [];
    }
  });

  // Simple persistence: save whenever state changes.
  useEffect(() => {
    localStorage.setItem('aiq_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('aiq_income', JSON.stringify(incomeRecords));
  }, [incomeRecords]);

  // --- Expenses Handlers ---
  const handleAddTransaction = (data: Omit<ExpenseRecord, 'id' | 'date'>) => {
    const newRecord: ExpenseRecord = {
      ...data,
      id: generateId(),
      date: new Date().toISOString()
    };
    setTransactions(prev => [newRecord, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // --- Income Handlers ---
  const handleAddIncome = (data: Omit<IncomeRecord, 'id' | 'date'>) => {
    const newRecord: IncomeRecord = {
      ...data,
      id: generateId(),
      date: new Date().toISOString()
    };
    setIncomeRecords(prev => [newRecord, ...prev]);
  };

  const handleDeleteIncome = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف سجل الدخل هذا؟')) {
      setIncomeRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right pb-12 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم المالية</h2>
            <p className="text-gray-500">نظام AIQ للمحاسبة المالية الشاملة</p>
          </div>

          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsReportOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50 hover:text-aiq-blue transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              التقارير وتصدير PDF
            </button>

            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                  activeTab === 'expenses'
                    ? 'bg-aiq-purple text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                المصروفات
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                  activeTab === 'income'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                الدخل
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Report Button (Visible only on small screens) */}
        <button
            onClick={() => setIsReportOpen(true)}
            className="md:hidden w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm shadow-sm"
          >
            <Printer className="w-4 h-4 text-aiq-blue" />
            استخراج التقارير (PDF)
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-4">
             <div className="sticky top-24">
               {activeTab === 'expenses' ? (
                 <>
                   <ExpenseForm onAdd={handleAddTransaction} />
                   <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm">
                     <p className="font-bold mb-1">تلميح مصروفات:</p>
                     <p>تأكد من اختيار التصنيف الصحيح (تأسيس، تشغيل، تسويق) للحصول على تقارير دقيقة.</p>
                   </div>
                 </>
               ) : (
                 <>
                   <IncomeForm onAdd={handleAddIncome} />
                   <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm">
                     <p className="font-bold mb-1">تلميح إيرادات:</p>
                     <p>يمكنك تسجيل العقود الخارجية أو الاشتراكات الدورية (شهرية/سنوية) ومتابعة نمو الدخل.</p>
                   </div>
                 </>
               )}
             </div>
          </div>

          {/* Right Column: Stats & List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {activeTab === 'expenses' ? (
              <>
                <SummaryStats transactions={transactions} />
                <TransactionList 
                  transactions={transactions} 
                  onDelete={handleDeleteTransaction} 
                />
              </>
            ) : (
              <>
                <IncomeStats records={incomeRecords} />
                <IncomeList 
                  records={incomeRecords} 
                  onDelete={handleDeleteIncome} 
                />
              </>
            )}
          </div>
          
        </div>
      </main>

      {/* Report Modal */}
      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        expenses={transactions}
        income={incomeRecords}
      />
    </div>
  );
}

export default App;
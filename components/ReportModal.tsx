import React, { useState, useMemo } from 'react';
import { X, FileText, Calendar, Filter, Download } from 'lucide-react';
import { ExpenseRecord, IncomeRecord } from '../types';
import { AIQ_LOGO_WIDE } from '../constants';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: ExpenseRecord[];
  income: IncomeRecord[];
}

type ReportType = 'all' | 'income' | 'expense';

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, expenses, income }) => {
  // Default to start of current year
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(0, 1); // January 1st
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<ReportType>('all');

  if (!isOpen) return null;

  // Filter Data
  const reportData = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const filteredIncome = income.filter(i => {
      const d = new Date(i.date);
      return d >= start && d <= end;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalExp = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInc = filteredIncome.reduce((sum, i) => sum + i.amount, 0);

    return {
      expenses: filteredExpenses,
      income: filteredIncome,
      totalExp,
      totalInc,
      net: totalInc - totalExp
    };
  }, [startDate, endDate, expenses, income]);

  const handlePrintPDF = () => {
    // 1. Create content strings
    const expenseRows = reportData.expenses.map(e => `
      <tr>
        <td>${new Date(e.date).toLocaleDateString('ar-EG')}</td>
        <td>${e.mainCategory} - ${e.subCategory}</td>
        <td>${e.note || '-'}</td>
        <td class="amount negative">-${e.amount.toLocaleString()} QAR</td>
      </tr>
    `).join('');

    const incomeRows = reportData.income.map(i => `
      <tr>
        <td>${new Date(i.date).toLocaleDateString('ar-EG')}</td>
        <td>${i.type} - ${i.detail}</td>
        <td>${i.note || '-'}</td>
        <td class="amount positive">+${i.amount.toLocaleString()} QAR</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div class="report-container">
        <div class="header">
          <div class="title">
            <h1>تقرير مالي شامل</h1>
            <p>الفترة من: ${new Date(startDate).toLocaleDateString('ar-EG')} إلى: ${new Date(endDate).toLocaleDateString('ar-EG')}</p>
          </div>
          <img src="${AIQ_LOGO_WIDE}" class="logo" alt="AIQ Logo" />
        </div>

        <div class="summary-cards">
          ${(reportType === 'all' || reportType === 'income') ? `
          <div class="card income">
            <h3>إجمالي الدخل</h3>
            <p style="color: #059669">${reportData.totalInc.toLocaleString()} QAR</p>
          </div>
          ` : ''}
          
          ${(reportType === 'all' || reportType === 'expense') ? `
          <div class="card expense">
            <h3>إجمالي المصروفات</h3>
            <p style="color: #e11d48">${reportData.totalExp.toLocaleString()} QAR</p>
          </div>
          ` : ''}

          ${reportType === 'all' ? `
          <div class="card net">
            <h3>صافي الربح/الخسارة</h3>
            <p style="color: ${reportData.net >= 0 ? '#059669' : '#e11d48'}">
              ${reportData.net.toLocaleString()} QAR
            </p>
          </div>
          ` : ''}
        </div>

        ${(reportType === 'all' || reportType === 'income') && reportData.income.length > 0 ? `
          <div class="section-title">🟢 تفاصيل الدخل</div>
          <table>
            <thead><tr><th>التاريخ</th><th>البند</th><th>ملاحظات</th><th>المبلغ</th></tr></thead>
            <tbody>${incomeRows}</tbody>
          </table>
        ` : ''}

        ${(reportType === 'all' || reportType === 'expense') && reportData.expenses.length > 0 ? `
          <div class="section-title">🔴 تفاصيل المصروفات</div>
          <table>
            <thead><tr><th>التاريخ</th><th>البند</th><th>ملاحظات</th><th>المبلغ</th></tr></thead>
            <tbody>${expenseRows}</tbody>
          </table>
        ` : ''}

        <div class="footer">
          تم إصدار هذا التقرير من منصة AIQ للإدارة المالية بتاريخ ${new Date().toLocaleDateString('ar-EG')}
        </div>
      </div>
    `;

    // 2. Create Print Container
    const printContainer = document.createElement('div');
    printContainer.id = 'aiq-print-root';
    printContainer.innerHTML = htmlContent;
    document.body.appendChild(printContainer);

    // 3. Add Print Styles
    const style = document.createElement('style');
    style.id = 'aiq-print-style';
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
      
      @media screen {
        #aiq-print-root { display: none; }
      }
      
      @media print {
        body > *:not(#aiq-print-root) { display: none !important; }
        #aiq-print-root { display: block !important; position: absolute; top: 0; left: 0; width: 100%; direction: rtl; }
        
        @page { margin: 10mm; size: auto; }

        /* Report Styles inside Print */
        .report-container { font-family: 'Cairo', sans-serif; color: #1f2937; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
        .logo { height: 50px; object-fit: contain; }
        .title { text-align: right; }
        .title h1 { margin: 0; color: #9d00ff; font-size: 24px; }
        .title p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }
        
        .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
        .card { padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .card.income { background-color: #ecfdf5; border-color: #a7f3d0; }
        .card.expense { background-color: #fff1f2; border-color: #fecdd3; }
        .card.net { background-color: #f8fafc; border-color: #e2e8f0; }
        .card h3 { margin: 0 0 10px; font-size: 14px; color: #4b5563; }
        .card p { margin: 0; font-size: 20px; font-weight: bold; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
        th { background-color: #f9fafb; padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: bold; color: #374151; -webkit-print-color-adjust: exact; }
        td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #111827; margin-top: 30px; }
        .amount { font-weight: bold; direction: ltr; text-align: left; }
        .amount.positive { color: #059669; }
        .amount.negative { color: #e11d48; }
        .footer { margin-top: 50px; text-align: center; color: #9ca3af; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      }
    `;
    document.head.appendChild(style);

    // 4. Print
    window.print();

    // 5. Cleanup
    const cleanup = () => {
      if (document.body.contains(printContainer)) document.body.removeChild(printContainer);
      if (document.head.contains(style)) document.head.removeChild(style);
    };

    // Attempt to cleanup after print dialog closes or after a timeout
    window.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(cleanup, 2000); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transition-all transform scale-100 opacity-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-aiq-dark to-slate-800 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="w-6 h-6 text-aiq-blue" />
            </div>
            <div>
              <h3 className="text-xl font-bold">تصدير التقارير</h3>
              <p className="text-xs text-gray-300">حدد الفترة ونوع التقرير المطلوب</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-aiq-purple" />
              من تاريخ
            </label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-aiq-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-aiq-purple" />
              إلى تاريخ
            </label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-aiq-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Filter className="w-4 h-4 text-aiq-purple" />
              نوع التقرير
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-aiq-blue outline-none"
            >
              <option value="all">تقرير شامل (دخل ومصروفات)</option>
              <option value="income">تقرير الدخل فقط</option>
              <option value="expense">تقرير المصروفات فقط</option>
            </select>
          </div>

        </div>

        {/* Live Preview Summary */}
        <div className="p-6">
          <h4 className="text-sm font-bold text-gray-500 mb-4">معاينة الملخص للفترة المحددة:</h4>
          <div className="grid grid-cols-3 gap-4 mb-6">
             <div className={`p-4 rounded-xl border text-center ${reportType === 'expense' ? 'opacity-50' : 'bg-emerald-50 border-emerald-100'}`}>
                <span className="text-xs text-gray-500 block mb-1">الدخل</span>
                <span className="font-bold text-emerald-700">{reportData.totalInc.toLocaleString()}</span>
             </div>
             <div className={`p-4 rounded-xl border text-center ${reportType === 'income' ? 'opacity-50' : 'bg-rose-50 border-rose-100'}`}>
                <span className="text-xs text-gray-500 block mb-1">المصروفات</span>
                <span className="font-bold text-rose-700">{reportData.totalExp.toLocaleString()}</span>
             </div>
             <div className={`p-4 rounded-xl border text-center ${reportType !== 'all' ? 'opacity-50' : 'bg-gray-100 border-gray-200'}`}>
                <span className="text-xs text-gray-500 block mb-1">الصافي</span>
                <span className={`font-bold ${reportData.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {reportData.net.toLocaleString()}
                </span>
             </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePrintPDF}
            className="w-full bg-gradient-to-r from-aiq-blue to-aiq-purple text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:opacity-90 transition-all flex justify-center items-center gap-3 group"
          >
            <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base">تحميل ملف PDF</span>
              <span className="text-xs opacity-90 font-normal">جاهز للطباعة والمشاركة</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
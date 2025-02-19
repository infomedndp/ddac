import React from 'react';
import { IncomeStatement } from './IncomeStatement';
import { PayrollRegister } from './PayrollRegister';
import { BalanceSheet } from './BalanceSheet';
import { AccountsReceivable } from './AccountsReceivable';
import { FileText, DollarSign, LayoutList, CreditCard } from 'lucide-react';

export function Reports() {
  const [activeReport, setActiveReport] = React.useState<'balance' | 'income' | 'payroll' | 'receivable'>('balance');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="mt-1 text-sm text-gray-500">View and export financial reports</p>
      </header>

      <div className="flex space-x-4">
        <button
          onClick={() => setActiveReport('balance')}
          className={`inline-flex items-center px-4 py-2 rounded-md ${
            activeReport === 'balance'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <LayoutList className="w-4 h-4 mr-2" />
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveReport('income')}
          className={`inline-flex items-center px-4 py-2 rounded-md ${
            activeReport === 'income'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Income Statement
        </button>
        <button
          onClick={() => setActiveReport('payroll')}
          className={`inline-flex items-center px-4 py-2 rounded-md ${
            activeReport === 'payroll'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Payroll Register
        </button>
        <button
          onClick={() => setActiveReport('receivable')}
          className={`inline-flex items-center px-4 py-2 rounded-md ${
            activeReport === 'receivable'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Accounts Receivable
        </button>
      </div>

      {activeReport === 'balance' && <BalanceSheet />}
      {activeReport === 'income' && <IncomeStatement />}
      {activeReport === 'payroll' && <PayrollRegister />}
      {activeReport === 'receivable' && <AccountsReceivable />}
    </div>
  );
}

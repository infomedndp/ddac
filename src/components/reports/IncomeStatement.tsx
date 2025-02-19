import React from 'react';
import { DollarSign } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { DateRangeSelector } from './DateRangeSelector';
import { PrintableIncomeStatement } from './PrintableIncomeStatement';
import { TransactionDetailsModal } from './TransactionDetailsModal';
import { useFinancialCalculations } from '../../hooks/useFinancialCalculations';
import { formatCurrency } from '../../utils/numberFormat';

export function IncomeStatement() {
  const { companyData, selectedCompany } = useCompany();
  const [showPrintable, setShowPrintable] = React.useState(false);
  const [selectedTransactions, setSelectedTransactions] = React.useState<{
    transactions: any[];
    accountName: string;
    accountNumber: string;
    isCurrentMonth: boolean;
    total: number;
  } | null>(null);
  
  const [dateRange, setDateRange] = React.useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const transactions = companyData?.transactions || [];
  const accounts = companyData?.accounts || [];

  const { categorizedTotals, totals } = useFinancialCalculations(
    transactions,
    accounts,
    dateRange
  );

  const getAccountName = (accountNumber: string): string => {
    const account = accounts.find(a => a.accountNumber === accountNumber);
    return account ? account.accountName : accountNumber;
  };

  const handleShowTransactions = (accountNumber: string, isCurrentMonth: boolean) => {
    const accountTransactions = transactions.filter(tx => {
      if (tx.category !== accountNumber) return false;
      
      const txDate = new Date(tx.date);
      if (isCurrentMonth) {
        return txDate.getMonth() === new Date(dateRange.endDate).getMonth() &&
               txDate.getFullYear() === new Date(dateRange.endDate).getFullYear();
      } else {
        return txDate >= new Date(dateRange.startDate) && txDate <= new Date(dateRange.endDate);
      }
    });

    const total = accountTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    setSelectedTransactions({
      transactions: accountTransactions,
      accountName: getAccountName(accountNumber),
      accountNumber,
      isCurrentMonth,
      total
    });
  };

  // Format start and end dates for display
  const formattedStartDate = new Date(`${dateRange.startDate}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedEndDate = new Date(`${dateRange.endDate}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <DateRangeSelector
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
          onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
        />
        <button
          onClick={() => setShowPrintable(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Print Statement
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Income Statement</h2>
          <p className="mt-1 text-sm text-gray-500">
            For the period {formattedStartDate} to {formattedEndDate}
          </p>
        </div>

        <div className="px-6 py-4">
          <table className="min-w-full">
            <thead>
              <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="text-left py-2">Account</th>
                <th className="text-right py-2">Current Month</th>
                <th className="text-right py-2">%</th>
                <th className="text-right py-2">Year to Date</th>
                <th className="text-right py-2">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Revenue */}
              <tr>
                <td colSpan={5} className="py-3 text-sm font-medium text-gray-900">Revenues</td>
              </tr>
              {Object.entries(categorizedTotals.Revenue).map(([accountNumber, amounts]) => (
                <tr key={accountNumber}>
                  <td className="py-2 text-sm text-gray-900">{getAccountName(accountNumber)}</td>
                  <td className="text-right text-sm text-gray-900">
                    <button 
                      onClick={() => handleShowTransactions(accountNumber, true)}
                      className="hover:text-indigo-600"
                    >
                      {formatCurrency(amounts.currentMonth)}
                    </button>
                  </td>
                  <td className="text-right text-sm text-gray-900">
                    {((amounts.currentMonth / (totals.revenue.currentMonth || 1)) * 100).toFixed(2)}%
                  </td>
                  <td className="text-right text-sm text-gray-900">
                    <button 
                      onClick={() => handleShowTransactions(accountNumber, false)}
                      className="hover:text-indigo-600"
                    >
                      {formatCurrency(amounts.yearToDate)}
                    </button>
                  </td>
                  <td className="text-right text-sm text-gray-900">
                    {((amounts.yearToDate / (totals.revenue.yearToDate || 1)) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}

              {/* Cost of Sales */}
              <tr>
                <td colSpan={5} className="py-3 text-sm font-medium text-gray-900">Cost of Sales</td>
              </tr>
              {Object.entries(categorizedTotals['Cost of Sales']).map(([accountNumber, amounts]) => (
                <tr key={accountNumber}>
                  <td className="py-2 text-sm text-gray-900">{getAccountName(accountNumber)}</td>
                  <td className="text-right text-sm text-gray-900">
                    <button 
                      onClick={() => handleShowTransactions(accountNumber, true)}
                      className="hover:text-indigo-600"
                    >
                      {formatCurrency(amounts.currentMonth)}
                    </button>
                  </td>
                  <td className="text-right text-sm text-gray-900">
                    {((amounts.currentMonth / (totals.revenue.currentMonth || 1)) * 100).toFixed(2)}%
                  </td>
                  <td className="text-right text-sm text-gray-900">
                    <button 
                      onClick={() => handleShowTransactions(accountNumber, false)}
                      className="hover:text-indigo-600"
                    >
                      {formatCurrency(amounts.yearToDate)}
                    </button>
                  </td>
                  <td className="text-right text-sm text-gray-900">
                    {((amounts.yearToDate / (totals.revenue.yearToDate || 1)) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}

              {/* Gross Profit */}
              <tr className="font-medium">
                <td className="py-2 text-sm text-gray-900">Gross Profit</td>
                <td className="text-right text-sm text-gray-900">{formatCurrency(totals.grossProfit.currentMonth)}</td>
                <td className="text-right text-sm text-gray-900">
                  {((totals.grossProfit.currentMonth / (totals.revenue.currentMonth || 1)) * 100).toFixed(2)}%
                </td>
                <td className="text-right text-sm text-gray-900">{formatCurrency(totals.grossProfit.yearToDate)}</td>
                <td className="text-right text-sm text-gray-900">
                  {((totals.grossProfit.yearToDate / (totals.revenue.yearToDate || 1)) * 100).toFixed(2)}%
                </td>
              </tr>

              {/* Expenses */}
              <tr>
                <td colSpan={5} className="py-3 text-sm font-medium text-gray-900">Expenses</td>
              </tr>
              {Object.entries(categorizedTotals.Expenses).map(([accountNumber, amounts]) => (
                <tr key={accountNumber}>
                  <td className="py-2 text-sm text-gray-900">{getAccountName(accountNumber)}</td>
                  <td className="text-right text-sm text-gray-900">
                    <button 
                      onClick={() => handleShowTransactions(accountNumber, true)}
                      className="hover:text-indigo-600"
                    >
                      {formatCurrency(Math.abs(amounts.currentMonth))}
                    </button>
                  </td>
                  <td className="text-right text-sm text-gray-900">
                    {((Math.abs(amounts.currentMonth) / (totals.revenue.currentMonth || 1)) * 100).toFixed(2)}%
                  </td>
                  <td className="text-right text-sm text-gray-900">
                    <button 
                      onClick={() => handleShowTransactions(accountNumber, false)}
                      className="hover:text-indigo-600"
                    >
                      {formatCurrency(Math.abs(amounts.yearToDate))}
                    </button>
                  </td>
                  <td className="text-right text-sm text-gray-900">
                    {((Math.abs(amounts.yearToDate) / (totals.revenue.yearToDate || 1)) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}

              {/* Total Expenses */}
              <tr className="font-medium">
                <td className="py-2 text-sm text-gray-900">Total Expenses</td>
                <td className="text-right text-sm text-gray-900">{formatCurrency(totals.expenses.currentMonth)}</td>
                <td className="text-right text-sm text-gray-900">
                  {((totals.expenses.currentMonth / (totals.revenue.currentMonth || 1)) * 100).toFixed(2)}%
                </td>
                <td className="text-right text-sm text-gray-900">{formatCurrency(totals.expenses.yearToDate)}</td>
                <td className="text-right text-sm text-gray-900">
                  {((totals.expenses.yearToDate / (totals.revenue.yearToDate || 1)) * 100).toFixed(2)}%
                </td>
              </tr>

              {/* Net Income */}
              <tr className="font-medium border-t-2">
                <td className="py-2 text-sm text-gray-900">Net Income</td>
                <td className="text-right text-sm text-gray-900">{formatCurrency(totals.netIncome.currentMonth)}</td>
                <td className="text-right text-sm text-gray-900">
                  {((totals.netIncome.currentMonth / (totals.revenue.currentMonth || 1)) * 100).toFixed(2)}%
                </td>
                <td className="text-right text-sm text-gray-900">{formatCurrency(totals.netIncome.yearToDate)}</td>
                <td className="text-right text-sm text-gray-900">
                  {((totals.netIncome.yearToDate / (totals.revenue.yearToDate || 1)) * 100).toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showPrintable && (
        <PrintableIncomeStatement
          companyName={selectedCompany?.name || ''}
          dateRange={dateRange}
          categorizedTotals={categorizedTotals}
          totals={totals}
          getAccountName={getAccountName}
          onClose={() => setShowPrintable(false)}
        />
      )}

      {selectedTransactions && (
        <TransactionDetailsModal
          isOpen={true}
          onClose={() => setSelectedTransactions(null)}
          transactions={selectedTransactions.transactions}
          accountName={selectedTransactions.accountName}
          accountNumber={selectedTransactions.accountNumber}
          isCurrentMonth={selectedTransactions.isCurrentMonth}
          total={selectedTransactions.total}
        />
      )}
    </div>
  );
}

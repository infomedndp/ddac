import React from 'react';
import { X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { StatementHeader } from './PrintableIncomeStatement/StatementHeader';
import { StatementTable } from './PrintableIncomeStatement/StatementTable';
import { formatCurrency } from '../../utils/numberFormat';

interface PrintableIncomeStatementProps {
  companyName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  categorizedTotals: Record<string, Record<string, { currentMonth: number; yearToDate: number }>>;
  totals: {
    revenue: { currentMonth: number; yearToDate: number };
    costOfSales: { currentMonth: number; yearToDate: number };
    expenses: { currentMonth: number; yearToDate: number };
    grossProfit: { currentMonth: number; yearToDate: number };
    netIncome: { currentMonth: number; yearToDate: number };
  };
  getAccountName: (accountNumber: string) => string;
  onClose: () => void;
}

export function PrintableIncomeStatement({
  companyName,
  dateRange,
  categorizedTotals,
  totals,
  getAccountName,
  onClose
}: PrintableIncomeStatementProps) {
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: onClose,
    removeAfterPrint: true
  });

  React.useEffect(() => {
    handlePrint();
  }, [handlePrint]);

  const PrintContent = React.forwardRef<HTMLDivElement>((_, ref) => (
    <div ref={ref} className="bg-white p-8">
      <StatementHeader companyName={companyName} dateRange={dateRange} />
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 w-1/2">Account</th>
            <th className="text-right py-2">Current Month</th>
            <th className="text-right py-2">%</th>
            <th className="text-right py-2">Year to Date</th>
            <th className="text-right py-2">%</th>
          </tr>
        </thead>
        <tbody>
          {/* Revenue Section */}
          <tr>
            <td colSpan={5} className="pt-4 pb-2 font-bold text-lg border-b border-gray-300">Revenue</td>
          </tr>
          {Object.entries(categorizedTotals.Revenue || {}).map(([accountNumber, amounts]) => (
            <tr key={accountNumber} className="hover:bg-gray-50">
              <td className="py-2">{getAccountName(accountNumber)}</td>
              <td className="text-right py-2">{formatCurrency(amounts.currentMonth)}</td>
              <td className="text-right py-2">
                {((amounts.currentMonth / totals.revenue.currentMonth) * 100).toFixed(2)}%
              </td>
              <td className="text-right py-2">{formatCurrency(amounts.yearToDate)}</td>
              <td className="text-right py-2">
                {((amounts.yearToDate / totals.revenue.yearToDate) * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
          <tr className="border-t border-gray-300 font-bold">
            <td className="py-2">Total Revenue</td>
            <td className="text-right py-2">{formatCurrency(totals.revenue.currentMonth)}</td>
            <td className="text-right py-2">100.00%</td>
            <td className="text-right py-2">{formatCurrency(totals.revenue.yearToDate)}</td>
            <td className="text-right py-2">100.00%</td>
          </tr>

          {/* Cost of Sales Section */}
          <tr>
            <td colSpan={5} className="pt-4 font-bold">Cost of Sales</td>
          </tr>
          {Object.entries(categorizedTotals['Cost of Sales'] || {}).map(([accountNumber, amounts]) => (
            <tr key={accountNumber} className="hover:bg-gray-50">
              <td className="py-2">{getAccountName(accountNumber)}</td>
              <td className="text-right py-2">{formatCurrency(amounts.currentMonth)}</td>
              <td className="text-right py-2">
                {((amounts.currentMonth / totals.revenue.currentMonth) * 100).toFixed(2)}%
              </td>
              <td className="text-right py-2">{formatCurrency(amounts.yearToDate)}</td>
              <td className="text-right py-2">
                {((amounts.yearToDate / totals.revenue.yearToDate) * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
          <tr className="border-t border-gray-300 font-bold">
            <td className="py-2">Total Cost of Sales</td>
            <td className="text-right py-2">{formatCurrency(totals.costOfSales.currentMonth)}</td>
            <td className="text-right py-2">
              {((totals.costOfSales.currentMonth / totals.revenue.currentMonth) * 100).toFixed(2)}%
            </td>
            <td className="text-right py-2">{formatCurrency(totals.costOfSales.yearToDate)}</td>
            <td className="text-right py-2">
              {((totals.costOfSales.yearToDate / totals.revenue.yearToDate) * 100).toFixed(2)}%
            </td>
          </tr>

          {/* Gross Profit */}
          <tr className="border-t border-gray-300">
            <td className="font-bold">Gross Profit</td>
            <td className="text-right font-bold">{formatCurrency(totals.grossProfit.currentMonth)}</td>
            <td className="text-right font-bold">
              {((totals.grossProfit.currentMonth / totals.revenue.currentMonth) * 100).toFixed(2)}%
            </td>
            <td className="text-right font-bold">{formatCurrency(totals.grossProfit.yearToDate)}</td>
            <td className="text-right font-bold">
              {((totals.grossProfit.yearToDate / totals.revenue.yearToDate) * 100).toFixed(2)}%
            </td>
          </tr>

          {/* Expenses Section */}
          <tr>
            <td colSpan={5} className="pt-4 pb-2 font-bold text-lg border-b border-gray-300">Operating Expenses</td>
          </tr>
          {Object.entries(categorizedTotals.Expenses || {}).map(([accountNumber, amounts]) => (
            <tr key={accountNumber} className="hover:bg-gray-50">
              <td className="py-2">{getAccountName(accountNumber)}</td>
              <td className="text-right py-2">{formatCurrency(Math.abs(amounts.currentMonth))}</td>
              <td className="text-right py-2">
                {((Math.abs(amounts.currentMonth) / totals.revenue.currentMonth) * 100).toFixed(2)}%
              </td>
              <td className="text-right py-2">{formatCurrency(Math.abs(amounts.yearToDate))}</td>
              <td className="text-right py-2">
                {((Math.abs(amounts.yearToDate) / totals.revenue.yearToDate) * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
          <tr className="border-t border-gray-300 font-bold">
            <td className="py-2">Total Operating Expenses</td>
            <td className="text-right py-2">{formatCurrency(Math.abs(totals.expenses.currentMonth))}</td>
            <td className="text-right py-2">
              {((Math.abs(totals.expenses.currentMonth) / totals.revenue.currentMonth) * 100).toFixed(2)}%
            </td>
            <td className="text-right py-2">{formatCurrency(Math.abs(totals.expenses.yearToDate))}</td>
            <td className="text-right py-2">
              {((Math.abs(totals.expenses.yearToDate) / totals.revenue.yearToDate) * 100).toFixed(2)}%
            </td>
          </tr>

          {/* Net Income */}
          <tr className="border-t-2 border-gray-300">
            <td className="font-bold">Net Income</td>
            <td className="text-right font-bold">{formatCurrency(totals.netIncome.currentMonth)}</td>
            <td className="text-right font-bold">
              {((totals.netIncome.currentMonth / totals.revenue.currentMonth) * 100).toFixed(2)}%
            </td>
            <td className="text-right font-bold">{formatCurrency(totals.netIncome.yearToDate)}</td>
            <td className="text-right font-bold">
              {((totals.netIncome.yearToDate / totals.revenue.yearToDate) * 100).toFixed(2)}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Print Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={{ display: 'none' }}>
          <PrintContent ref={printRef} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

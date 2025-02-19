import React from 'react';
import { calculatePercentage } from '../utils';

interface ExpensesSectionProps {
  categorizedTotals: Record<string, Record<string, { currentMonth: number; yearToDate: number }>>;
  totals: {
    revenue: { currentMonth: number; yearToDate: number };
    expenses: { currentMonth: number; yearToDate: number };
  };
  getAccountName: (accountNumber: string) => string;
}

export function ExpensesSection({ categorizedTotals, totals, getAccountName }: ExpensesSectionProps) {
  const expenseAccounts = Object.entries(categorizedTotals.Expenses || {}).sort((a, b) => {
    const nameA = getAccountName(a[0]);
    const nameB = getAccountName(b[0]);
    return nameA.localeCompare(nameB);
  });

  return (
    <>
      <tr>
        <td colSpan={5} className="pt-4 pb-2 font-bold text-lg border-b border-gray-300">Operating Expenses</td>
      </tr>
      {expenseAccounts.length > 0 ? (
        <>
          {expenseAccounts.map(([accountNumber, amounts]) => (
            <tr key={accountNumber} className="hover:bg-gray-50">
              <td className="py-2">{getAccountName(accountNumber)}</td>
              <td className="text-right py-2">
                ${Math.abs(amounts.currentMonth).toFixed(2)}
              </td>
              <td className="text-right py-2">
                {calculatePercentage(Math.abs(amounts.currentMonth), totals.revenue.currentMonth)}%
              </td>
              <td className="text-right py-2">
                ${Math.abs(amounts.yearToDate).toFixed(2)}
              </td>
              <td className="text-right py-2">
                {calculatePercentage(Math.abs(amounts.yearToDate), totals.revenue.yearToDate)}%
              </td>
            </tr>
          ))}
          <tr className="border-t border-gray-300 font-bold">
            <td className="py-2">Total Operating Expenses</td>
            <td className="text-right py-2">
              ${Math.abs(totals.expenses.currentMonth).toFixed(2)}
            </td>
            <td className="text-right py-2">
              {calculatePercentage(Math.abs(totals.expenses.currentMonth), totals.revenue.currentMonth)}%
            </td>
            <td className="text-right py-2">
              ${Math.abs(totals.expenses.yearToDate).toFixed(2)}
            </td>
            <td className="text-right py-2">
              {calculatePercentage(Math.abs(totals.expenses.yearToDate), totals.revenue.yearToDate)}%
            </td>
          </tr>
        </>
      ) : (
        <tr>
          <td colSpan={5} className="text-center text-gray-500 py-4">
            No expenses recorded for this period
          </td>
        </tr>
      )}
    </>
  );
}

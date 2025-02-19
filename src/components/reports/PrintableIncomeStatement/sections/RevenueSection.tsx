import React from 'react';
import { calculatePercentage } from '../utils';

interface RevenueSectionProps {
  categorizedTotals: Record<string, Record<string, { currentMonth: number; yearToDate: number }>>;
  totals: {
    revenue: { currentMonth: number; yearToDate: number };
  };
  getAccountName: (accountNumber: string) => string;
}

export function RevenueSection({ categorizedTotals, totals, getAccountName }: RevenueSectionProps) {
  const revenueAccounts = Object.entries(categorizedTotals.Revenue || {}).sort((a, b) => {
    const nameA = getAccountName(a[0]);
    const nameB = getAccountName(b[0]);
    return nameA.localeCompare(nameB);
  });

  return (
    <>
      <tr>
        <td colSpan={5} className="pt-4 pb-2 font-bold text-lg border-b border-gray-300">Revenue</td>
      </tr>
      {revenueAccounts.length > 0 ? (
        <>
          {revenueAccounts.map(([accountNumber, amounts]) => (
            <tr key={accountNumber} className="hover:bg-gray-50">
              <td className="py-2">{getAccountName(accountNumber)}</td>
              <td className="text-right py-2">${amounts.currentMonth.toFixed(2)}</td>
              <td className="text-right py-2">
                {calculatePercentage(amounts.currentMonth, totals.revenue.currentMonth)}%
              </td>
              <td className="text-right py-2">${amounts.yearToDate.toFixed(2)}</td>
              <td className="text-right py-2">
                {calculatePercentage(amounts.yearToDate, totals.revenue.yearToDate)}%
              </td>
            </tr>
          ))}
          <tr className="border-t border-gray-300 font-bold">
            <td className="py-2">Total Revenue</td>
            <td className="text-right py-2">${totals.revenue.currentMonth.toFixed(2)}</td>
            <td className="text-right py-2">
              {totals.revenue.currentMonth === 0 ? '0.00' : '100.00'}%
            </td>
            <td className="text-right py-2">${totals.revenue.yearToDate.toFixed(2)}</td>
            <td className="text-right py-2">
              {totals.revenue.yearToDate === 0 ? '0.00' : '100.00'}%
            </td>
          </tr>
        </>
      ) : (
        <tr>
          <td colSpan={5} className="text-center text-gray-500 py-4">
            No revenue recorded for this period
          </td>
        </tr>
      )}
    </>
  );
}

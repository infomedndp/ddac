import React from 'react';
import { calculatePercentage } from '../utils';

interface NetIncomeSectionProps {
  totals: {
    revenue: { currentMonth: number; yearToDate: number };
    netIncome: { currentMonth: number; yearToDate: number };
  };
}

export function NetIncomeSection({ totals }: NetIncomeSectionProps) {
  return (
    <tr className="border-t-2 border-gray-300">
      <td className="font-bold">Net Income</td>
      <td className="text-right font-bold">${totals.netIncome.currentMonth.toFixed(2)}</td>
      <td className="text-right font-bold">
        {calculatePercentage(totals.netIncome.currentMonth, totals.revenue.currentMonth)}%
      </td>
      <td className="text-right font-bold">${totals.netIncome.yearToDate.toFixed(2)}</td>
      <td className="text-right font-bold">
        {calculatePercentage(totals.netIncome.yearToDate, totals.revenue.yearToDate)}%
      </td>
    </tr>
  );
}

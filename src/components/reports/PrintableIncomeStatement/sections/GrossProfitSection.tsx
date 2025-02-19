import React from 'react';
import { calculatePercentage } from '../utils';

interface GrossProfitSectionProps {
  totals: {
    revenue: { currentMonth: number; yearToDate: number };
    grossProfit: { currentMonth: number; yearToDate: number };
  };
}

export function GrossProfitSection({ totals }: GrossProfitSectionProps) {
  return (
    <tr className="border-t border-gray-300">
      <td className="font-bold">Gross Profit</td>
      <td className="text-right font-bold">${totals.grossProfit.currentMonth.toFixed(2)}</td>
      <td className="text-right font-bold">
        {calculatePercentage(totals.grossProfit.currentMonth, totals.revenue.currentMonth)}%
      </td>
      <td className="text-right font-bold">${totals.grossProfit.yearToDate.toFixed(2)}</td>
      <td className="text-right font-bold">
        {calculatePercentage(totals.grossProfit.yearToDate, totals.revenue.yearToDate)}%
      </td>
    </tr>
  );
}

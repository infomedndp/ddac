import React from 'react';
import { calculatePercentage } from '../utils';

interface CostOfSalesSectionProps {
  totals: {
    revenue: { currentMonth: number; yearToDate: number };
    costOfSales: { currentMonth: number; yearToDate: number };
  };
}

export function CostOfSalesSection({ totals }: CostOfSalesSectionProps) {
  return (
    <>
      <tr>
        <td colSpan={5} className="pt-4 font-bold">Cost of Sales</td>
      </tr>
      <tr>
        <td>Total Cost of Sales</td>
        <td className="text-right">${totals.costOfSales.currentMonth.toFixed(2)}</td>
        <td className="text-right">
          {calculatePercentage(totals.costOfSales.currentMonth, totals.revenue.currentMonth)}%
        </td>
        <td className="text-right">${totals.costOfSales.yearToDate.toFixed(2)}</td>
        <td className="text-right">
          {calculatePercentage(totals.costOfSales.yearToDate, totals.revenue.yearToDate)}%
        </td>
      </tr>
    </>
  );
}

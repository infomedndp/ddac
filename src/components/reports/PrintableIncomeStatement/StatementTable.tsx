import React from 'react';
import { TableHeader } from './TableHeader';
import { RevenueSection } from './sections/RevenueSection';
import { CostOfSalesSection } from './sections/CostOfSalesSection';
import { GrossProfitSection } from './sections/GrossProfitSection';
import { ExpensesSection } from './sections/ExpensesSection';
import { NetIncomeSection } from './sections/NetIncomeSection';

interface StatementTableProps {
  categorizedTotals: Record<string, Record<string, { currentMonth: number; yearToDate: number }>>;
  totals: {
    revenue: { currentMonth: number; yearToDate: number };
    costOfSales: { currentMonth: number; yearToDate: number };
    expenses: { currentMonth: number; yearToDate: number };
    grossProfit: { currentMonth: number; yearToDate: number };
    netIncome: { currentMonth: number; yearToDate: number };
  };
  getAccountName: (accountNumber: string) => string;
}

export function StatementTable({ categorizedTotals, totals, getAccountName }: StatementTableProps) {
  return (
    <table className="w-full text-sm">
      <TableHeader />
      <tbody>
        <RevenueSection 
          categorizedTotals={categorizedTotals} 
          totals={totals} 
          getAccountName={getAccountName} 
        />
        <CostOfSalesSection totals={totals} />
        <GrossProfitSection totals={totals} />
        <ExpensesSection 
          categorizedTotals={categorizedTotals} 
          totals={totals} 
          getAccountName={getAccountName} 
        />
        <NetIncomeSection totals={totals} />
      </tbody>
    </table>
  );
}

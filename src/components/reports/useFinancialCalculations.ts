import { useMemo } from 'react';
import { Transaction } from '../../types/transactions';
import { ChartOfAccount } from '../../types/chartOfAccounts';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface AccountTotals {
  currentMonth: number;
  yearToDate: number;
}

export interface CategoryTotals {
  Revenue: Record<string, AccountTotals>;
  'Cost of Sales': Record<string, AccountTotals>;
  Expenses: Record<string, AccountTotals>;
}

export interface FinancialTotals {
  revenue: AccountTotals;
  costOfSales: AccountTotals;
  expenses: AccountTotals;
  grossProfit: AccountTotals;
  netIncome: AccountTotals;
}

export function useFinancialCalculations(
  transactions: Transaction[],
  accounts: ChartOfAccount[],
  dateRange: DateRange
) {
  const categorizedTotals = useMemo(() => {
    const totals: CategoryTotals = {
      Revenue: {},
      'Cost of Sales': {},
      Expenses: {}
    };

    transactions.forEach(tx => {
      if (!tx.category || tx.category === 'Uncategorized') return;
      
      const account = accounts.find(a => a.accountNumber === tx.category);
      if (!account) return;

      const accountType = account.accountType;
      if (!totals[accountType as keyof CategoryTotals]) return;

      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === new Date(dateRange.endDate).getMonth() &&
                           txDate.getFullYear() === new Date(dateRange.endDate).getFullYear();
      const isInRange = txDate >= new Date(dateRange.startDate) && txDate <= new Date(dateRange.endDate);

      if (!totals[accountType as keyof CategoryTotals][tx.category]) {
        totals[accountType as keyof CategoryTotals][tx.category] = {
          currentMonth: 0,
          yearToDate: 0
        };
      }

      const amount = accountType === 'Expenses' ? Math.abs(tx.amount) : tx.amount;

      if (isCurrentMonth) {
        totals[accountType as keyof CategoryTotals][tx.category].currentMonth += amount;
      }
      if (isInRange) {
        totals[accountType as keyof CategoryTotals][tx.category].yearToDate += amount;
      }
    });

    return totals;
  }, [transactions, accounts, dateRange]);

  const totals = useMemo(() => {
    const revenue = {
      currentMonth: Object.values(categorizedTotals.Revenue).reduce((sum, account) => sum + account.currentMonth, 0),
      yearToDate: Object.values(categorizedTotals.Revenue).reduce((sum, account) => sum + account.yearToDate, 0)
    };

    const costOfSales = {
      currentMonth: Object.values(categorizedTotals['Cost of Sales']).reduce((sum, account) => sum + account.currentMonth, 0),
      yearToDate: Object.values(categorizedTotals['Cost of Sales']).reduce((sum, account) => sum + account.yearToDate, 0)
    };

    const expenses = {
      currentMonth: Object.values(categorizedTotals.Expenses).reduce((sum, account) => sum + account.currentMonth, 0),
      yearToDate: Object.values(categorizedTotals.Expenses).reduce((sum, account) => sum + account.yearToDate, 0)
    };

    const grossProfit = {
      currentMonth: revenue.currentMonth - costOfSales.currentMonth,
      yearToDate: revenue.yearToDate - costOfSales.yearToDate
    };

    const netIncome = {
      currentMonth: grossProfit.currentMonth - expenses.currentMonth,
      yearToDate: grossProfit.yearToDate - expenses.yearToDate
    };

    return { revenue, costOfSales, expenses, grossProfit, netIncome };
  }, [categorizedTotals]);

  return { categorizedTotals, totals };
}

export function calculatePercentage(amount: number, total: number): string {
  if (total === 0) return '0.00';
  if (amount === 0) return '0.00';
  return ((amount / Math.abs(total)) * 100).toFixed(2);
}

export function getAccountName(accounts: ChartOfAccount[], accountNumber: string): string {
  const account = accounts.find(a => a.accountNumber === accountNumber);
  return account ? account.accountName : accountNumber;
}

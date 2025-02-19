import { useMemo } from 'react';
import { Transaction } from '../types/transactions';
import { ChartOfAccount } from '../types/chartOfAccounts';

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

function mapAccountTypeToCategory(accountType: string): keyof CategoryTotals | null {
  switch (accountType) {
    case 'Revenue':
    case 'Income':
      return 'Revenue';
    case 'Cost of Sales':
      return 'Cost of Sales';
    case 'Expense':
      return 'Expenses';
    default:
      return null;
  }
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

    // Convert date strings to Date objects once
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get current month and year from end date
    const currentMonth = endDate.getMonth();
    const currentYear = endDate.getFullYear();

    transactions.forEach(tx => {
      if (!tx.category || tx.category === 'Uncategorized' || tx.category === '00000') {
        return;
      }
      
      const account = accounts.find(a => a.accountNumber === tx.category);
      if (!account) return;

      const categoryType = mapAccountTypeToCategory(account.accountType);
      if (!categoryType) return;

      // Convert transaction date to Date object and normalize time
      const txDate = new Date(tx.date);
      txDate.setHours(0, 0, 0, 0);

      // Check if transaction is in current month/year
      const isCurrentMonth = txDate.getMonth() === currentMonth && 
                           txDate.getFullYear() === currentYear;

      // Check if transaction is within date range
      const isInRange = txDate >= startDate && txDate <= endDate;

      if (!totals[categoryType][tx.category]) {
        totals[categoryType][tx.category] = {
          currentMonth: 0,
          yearToDate: 0
        };
      }

      // Handle amounts based on category type and transaction amount
      let amount = tx.amount;
      if (categoryType === 'Revenue') {
        // For Revenue, positive amounts add to revenue, negative amounts reduce revenue
        amount = tx.amount;
      } else if (categoryType === 'Cost of Sales' || categoryType === 'Expenses') {
        // For Expenses and Cost of Sales, negative amounts add to expenses, positive amounts reduce expenses
        amount = -tx.amount;
      }

      if (isCurrentMonth) {
        totals[categoryType][tx.category].currentMonth += amount;
      }
      if (isInRange) {
        totals[categoryType][tx.category].yearToDate += amount;
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
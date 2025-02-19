import { useMemo } from 'react';
import { Transaction } from '../types/transactions';
import { ChartOfAccount } from '../types/chartOfAccounts';

interface BalanceSheetItem {
  id: string;
  name: string;
  balance: number;
  depreciation?: number;
  amortization?: number;
  isLessAccumulated?: boolean;
}

interface BalanceSheetData {
  assets: {
    current: BalanceSheetItem[];
    fixed: BalanceSheetItem[];
    other: BalanceSheetItem[];
  };
  liabilities: {
    current: BalanceSheetItem[];
    longTerm: BalanceSheetItem[];
  };
  capital: BalanceSheetItem[];
}

export function useBalanceSheetCalculations(
  transactions: Transaction[] | undefined,
  accounts: ChartOfAccount[] | undefined,
  asOfDate: string
): BalanceSheetData {
  return useMemo(() => {
    const endDate = new Date(asOfDate);
    endDate.setHours(23, 59, 59, 999);

    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    const safeAccounts = Array.isArray(accounts) ? accounts : [];

    const relevantTransactions = safeTransactions.filter(tx => {
      try {
        const txDate = new Date(tx.date);
        return !isNaN(txDate.getTime()) && txDate <= endDate;
      } catch (error) {
        return false;
      }
    });

    // Calculate raw balances from transactions
    const accountBalances = new Map<string, number>();
    relevantTransactions.forEach(tx => {
      if (!tx.category || tx.category === 'Uncategorized') return;
      
      const account = safeAccounts.find(a => a.accountNumber === tx.category);
      if (!account) return;

      const currentBalance = accountBalances.get(tx.category) || 0;
      accountBalances.set(tx.category, currentBalance + tx.amount);
    });

    // Helper function to get balance with Less Accumulated handling
    const getBalance = (accountNumber: string): number => {
      const account = safeAccounts.find(a => a.accountNumber === accountNumber);
      if (!account) return 0;

      const rawBalance = accountBalances.get(accountNumber) || 0;
      
      // For Less Accumulated accounts, always return negative absolute value
      if (account.isLessAccumulated) {
        return -Math.abs(rawBalance);
      }
      
      return rawBalance;
    };

    const result: BalanceSheetData = {
      assets: {
        current: [],
        fixed: [],
        other: []
      },
      liabilities: {
        current: [],
        longTerm: []
      },
      capital: []
    };

    safeAccounts.forEach(account => {
      const balance = getBalance(account.accountNumber);
      
      // Skip accounts with zero balance unless they're Less Accumulated
      if (balance === 0 && !account.isLessAccumulated) return;

      const item: BalanceSheetItem = {
        id: account.id,
        name: account.accountName,
        balance,
        isLessAccumulated: account.isLessAccumulated
      };

      switch (account.accountType) {
        case 'Cash':
        case 'Accounts Receivable':
        case 'Inventory':
        case 'Other Current Assets':
          result.assets.current.push(item);
          break;

        case 'Fixed Assets':
          result.assets.fixed.push(item);
          break;

        case 'Accumulated Depreciation':
          const relatedAsset = result.assets.fixed.find(a => a.name.includes('Fixed Assets'));
          if (relatedAsset) {
            relatedAsset.depreciation = Math.abs(balance);
          }
          break;

        case 'Other Assets':
          result.assets.other.push(item);
          break;

        case 'Accumulated Amortization':
          const relatedOtherAsset = result.assets.other.find(a => !a.amortization);
          if (relatedOtherAsset) {
            relatedOtherAsset.amortization = Math.abs(balance);
          }
          break;

        case 'Accounts Payable':
        case 'Other Current Liabilities':
          result.liabilities.current.push(item);
          break;

        case 'Long Term Liabilities':
          result.liabilities.longTerm.push(item);
          break;

        case 'Equity-doesnt close':
        case 'Equity-gets closed':
        case 'Equity-Retained Earnings':
          result.capital.push(item);
          break;
      }
    });

    return result;
  }, [transactions, accounts, asOfDate]);
}

import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Activity, Calendar, ArrowLeftRight, ChevronDown } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { Transaction } from '../types/transactions';

export function Dashboard() {
  const { companyData, selectedCompany } = useCompany();
  const [transactionCount, setTransactionCount] = React.useState(5);
  
  const [dateRange, setDateRange] = React.useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [showComparison, setShowComparison] = React.useState(false);
  const [comparisonRange, setComparisonRange] = React.useState({
    start: '',
    end: ''
  });

  // Filter out reconciliation transactions for the dashboard
  const transactions = React.useMemo(() => {
    return (Array.isArray(companyData?.transactions) ? companyData.transactions : [])
      .filter(tx => tx.source !== 'reconciliation');
  }, [companyData?.transactions]);

  const stats = React.useMemo(() => {
    const currentTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= new Date(dateRange.start) && txDate <= new Date(dateRange.end);
    });

    const currentStats = currentTransactions.reduce((acc, tx) => {
      const amount = parseFloat(tx.amount.toString());
      if (amount >= 0) {
        acc.revenue += amount;
      } else {
        acc.expenses += Math.abs(amount);
      }
      return acc;
    }, { revenue: 0, expenses: 0, profit: 0 });
    currentStats.profit = currentStats.revenue - currentStats.expenses;

    let changes = { revenue: 0, expenses: 0, profit: 0 };

    if (showComparison && comparisonRange.start && comparisonRange.end) {
      const comparisonTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= new Date(comparisonRange.start) && txDate <= new Date(comparisonRange.end);
      });

      const comparisonStats = comparisonTransactions.reduce((acc, tx) => {
        const amount = parseFloat(tx.amount.toString());
        if (amount >= 0) {
          acc.revenue += amount;
        } else {
          acc.expenses += Math.abs(amount);
        }
        return acc;
      }, { revenue: 0, expenses: 0, profit: 0 });
      comparisonStats.profit = comparisonStats.revenue - comparisonStats.expenses;

      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / Math.abs(previous)) * 100;
      };

      changes = {
        revenue: calculateChange(currentStats.revenue, comparisonStats.revenue),
        expenses: calculateChange(currentStats.expenses, comparisonStats.expenses),
        profit: calculateChange(currentStats.profit, comparisonStats.profit)
      };
    }

    return { current: currentStats, changes };
  }, [transactions, dateRange, showComparison, comparisonRange]);

  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= new Date(dateRange.start) && txDate <= new Date(dateRange.end);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, transactionCount);
  }, [transactions, dateRange, transactionCount]);

  const categoryBreakdown = React.useMemo(() => {
    const accounts = Array.isArray(companyData?.accounts) ? companyData.accounts : [];
    const accountMap = new Map(accounts.map(acc => [acc.accountNumber, acc.accountName]));

    return transactions
      .filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= new Date(dateRange.start) && 
               txDate <= new Date(dateRange.end) && 
               tx.amount < 0 && 
               tx.category && 
               tx.category !== 'Uncategorized' &&
               tx.category !== '00000';
      })
      .reduce((acc, tx) => {
        const categoryName = accountMap.get(tx.category) || tx.category;
        acc[categoryName] = (acc[categoryName] || 0) + Math.abs(tx.amount);
        return acc;
      }, {} as Record<string, number>);
  }, [transactions, dateRange, companyData?.accounts]);

  const transactionOptions = [
    { value: 5, label: 'Last 5' },
    { value: 10, label: 'Last 10' },
    { value: 25, label: 'Last 25' },
    { value: 50, label: 'Last 50' },
    { value: 100, label: 'Last 100' }
  ];

  if (!selectedCompany) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">No Company Selected</h2>
        <p className="mt-2 text-gray-500">Please select a company to view its dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCompany.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md ${
                showComparison 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Compare
            </button>
          </div>
        </div>
        {showComparison && (
          <div className="mt-4 flex items-center gap-4 justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Compare with:</span>
              <input
                type="date"
                value={comparisonRange.start}
                onChange={(e) => setComparisonRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={comparisonRange.end}
                onChange={(e) => setComparisonRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue"
          value={`$${stats.current.revenue.toFixed(2)}`}
          change={showComparison ? `${stats.changes.revenue.toFixed(1)}%` : null}
          trend={stats.changes.revenue >= 0 ? 'up' : 'down'}
          icon={<DollarSign className="w-6 h-6" />}
        />
        <StatCard
          title="Expenses"
          value={`$${stats.current.expenses.toFixed(2)}`}
          change={showComparison ? `${stats.changes.expenses.toFixed(1)}%` : null}
          trend={stats.changes.expenses <= 0 ? 'up' : 'down'}
          icon={<TrendingDown className="w-6 h-6" />}
        />
        <StatCard
          title="Net Profit"
          value={`$${stats.current.profit.toFixed(2)}`}
          change={showComparison ? `${stats.changes.profit.toFixed(1)}%` : null}
          trend={stats.changes.profit >= 0 ? 'up' : 'down'}
          icon={<Activity className="w-6 h-6" />}
        />
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="relative inline-block text-left">
              <select
                value={transactionCount}
                onChange={(e) => setTransactionCount(Number(e.target.value))}
                className="appearance-none bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer pr-8"
              >
                {transactionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-500">Average Transaction</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            ${(recentTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / recentTransactions.length || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
          <div className="overflow-y-auto max-h-[400px] pr-4 -mr-4">
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(new Date(tx.date).getTime() + 86400000).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${
                    tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Categories</h3>
          <div className="space-y-4">
            {Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{category}</span>
                  <span className="text-sm text-gray-500">${amount.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string | null;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
          <div className="text-indigo-600">{icon}</div>
        </div>
        {change && (
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

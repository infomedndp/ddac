import React from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';
import { MonthSelector } from './MonthSelector';
import { ReconciliationList } from './ReconciliationList';
import { CreditEntryModal } from './CreditEntryModal';
import { ReconcileActions } from './ReconcileActions';
import { useCompany } from '../../context/CompanyContext';
import { Transaction } from '../../types/transactions';

export function ReconcilePage() {
  const { companyData, updateCompanyData } = useCompany();
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [viewFilter, setViewFilter] = React.useState<'all' | 'reconciled' | 'unreconciled'>('all');
  const [showExcluded, setShowExcluded] = React.useState(false);
  const [selectedBankAccountId, setSelectedBankAccountId] = React.useState<string>('');

  const transactions = Array.isArray(companyData?.transactions) ? companyData.transactions : [];
  const accounts = Array.isArray(companyData?.accounts) ? companyData.accounts : [];
  const bankAccounts = Array.isArray(companyData?.bankAccounts) ? companyData.bankAccounts : [];

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(tx => {
      // Bank account filter
      if (selectedBankAccountId && tx.bankAccountId !== selectedBankAccountId) {
        return false;
      }

      // Exclude transactions marked as excluded unless explicitly showing them
      if (tx.excluded && !showExcluded) return false;

      // Month filter
      const txDate = new Date(tx.date);
      const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      if (txMonth !== selectedMonth) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!tx.description.toLowerCase().includes(searchLower)) return false;
      }

      // Reconciliation status filter
      switch (viewFilter) {
        case 'reconciled':
          if (!tx.isReconciled) return false;
          break;
        case 'unreconciled':
          if (tx.isReconciled) return false;
          break;
      }

      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, selectedMonth, searchTerm, viewFilter, showExcluded, selectedBankAccountId]);

  const selectedTransactions = React.useMemo(() => {
    return filteredTransactions.filter(tx => selectedIds.has(tx.id));
  }, [filteredTransactions, selectedIds]);

  const totalSelectedAmount = React.useMemo(() => {
    return selectedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [selectedTransactions]);

  const hasReconciledItems = selectedTransactions.some(tx => tx.isReconciled);

  const handleBulkReconcile = async (category: string, type: 'debit' | 'credit', description: string) => {
    let updatedAccounts = [...accounts];
    let updatedTransactions = [...transactions];

    selectedTransactions.forEach(tx => {
      const offsetAmount = type === 'debit' ? Math.abs(tx.amount) : -Math.abs(tx.amount);
      
      // Create offset transaction
      const offsetTransaction: Transaction = {
        id: `offset-${Date.now()}-${tx.id}`,
        date: tx.date,
        description: description || `Offset to: ${tx.description}`,
        amount: offsetAmount,
        category,
        bankAccountId: tx.bankAccountId,
        source: 'reconciliation',
        relatedTransactionId: tx.id,
        isReconciled: true
      };

      // Update account balance
      updatedAccounts = updatedAccounts.map(acc =>
        acc.accountNumber === category
          ? { ...acc, balance: (acc.balance || 0) + offsetAmount }
          : acc
      );

      // Update original transaction
      const txIndex = updatedTransactions.findIndex(t => t.id === tx.id);
      if (txIndex !== -1) {
        updatedTransactions[txIndex] = {
          ...tx,
          isReconciled: true,
          offsetCategory: category,
          offsetAmount: offsetAmount,
          offsetDescription: description || `Offset to: ${tx.description}`,
          offsetTransactionId: offsetTransaction.id
        };
      }

      // Add offset transaction
      updatedTransactions.push(offsetTransaction);
    });

    await updateCompanyData({
      transactions: updatedTransactions,
      accounts: updatedAccounts
    });

    setSelectedIds(new Set());
  };

  const handleUndoReconciliation = async () => {
    let updatedAccounts = [...accounts];
    let updatedTransactions = [...transactions];

    selectedTransactions.forEach(tx => {
      if (tx.offsetCategory && tx.offsetAmount && tx.offsetTransactionId) {
        // Remove offset transaction
        updatedTransactions = updatedTransactions.filter(t => t.id !== tx.offsetTransactionId);

        // Reverse the offset amount in the account balance
        updatedAccounts = updatedAccounts.map(acc =>
          acc.accountNumber === tx.offsetCategory
            ? { ...acc, balance: (acc.balance || 0) - tx.offsetAmount }
            : acc
        );

        // Remove reconciliation data from original transaction
        const txIndex = updatedTransactions.findIndex(t => t.id === tx.id);
        if (txIndex !== -1) {
          const { offsetCategory, offsetAmount, offsetDescription, offsetTransactionId, isReconciled, ...rest } = updatedTransactions[txIndex];
          updatedTransactions[txIndex] = rest;
        }
      }
    });

    await updateCompanyData({
      transactions: updatedTransactions,
      accounts: updatedAccounts
    });

    setSelectedIds(new Set());
  };

  const handleAddOrUpdateOffset = async (updatedTransaction: Transaction) => {
    let updatedAccounts = [...accounts];
    let updatedTransactions = [...transactions];

    // Remove previous offset amount if it exists
    if (selectedTransaction?.offsetCategory && selectedTransaction?.offsetAmount) {
      updatedAccounts = updatedAccounts.map(acc =>
        acc.accountNumber === selectedTransaction.offsetCategory
          ? { ...acc, balance: (acc.balance || 0) - selectedTransaction.offsetAmount }
          : acc
      );
      
      // Remove previous offset transaction if it exists
      if (selectedTransaction.offsetTransactionId) {
        updatedTransactions = updatedTransactions.filter(t => t.id !== selectedTransaction.offsetTransactionId);
      }
    }

    // Create new offset transaction
    const offsetTransaction: Transaction = {
      id: `offset-${Date.now()}-${updatedTransaction.id}`,
      date: updatedTransaction.date,
      description: updatedTransaction.offsetDescription || '',
      amount: updatedTransaction.offsetAmount || 0,
      category: updatedTransaction.offsetCategory || '',
      bankAccountId: updatedTransaction.bankAccountId,
      source: 'reconciliation',
      relatedTransactionId: updatedTransaction.id,
      isReconciled: true
    };

    // Add new offset amount to account balance
    if (offsetTransaction.category && offsetTransaction.amount) {
      updatedAccounts = updatedAccounts.map(acc =>
        acc.accountNumber === offsetTransaction.category
          ? { ...acc, balance: (acc.balance || 0) + offsetTransaction.amount }
          : acc
      );
    }

    // Update original transaction and add offset transaction
    updatedTransactions = updatedTransactions.map(tx => 
      tx.id === updatedTransaction.id ? {
        ...updatedTransaction,
        offsetTransactionId: offsetTransaction.id,
        isReconciled: true
      } : tx
    );
    updatedTransactions.push(offsetTransaction);

    await updateCompanyData({
      transactions: updatedTransactions,
      accounts: updatedAccounts
    });

    setSelectedTransaction(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Account Reconciliation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Reconcile transactions with corresponding credit entries
        </p>
      </header>

      <MonthSelector
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthSelect={setSelectedMonth}
        monthsWithData={new Set(transactions.map(tx => {
          const date = new Date(tx.date);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }))}
      />

      {/* Bank Account Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bankAccounts.map(account => (
          <button
            key={account.id}
            onClick={() => setSelectedBankAccountId(account.id === selectedBankAccountId ? '' : account.id)}
            className={`p-4 rounded-lg border ${
              account.id === selectedBankAccountId
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-lg font-medium text-gray-900">{account.name}</span>
              <span className="text-sm text-gray-500">
                Account ending in {account.accountNumber}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewFilter === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setViewFilter('reconciled')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewFilter === 'reconciled'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Reconciled
          </button>
          <button
            onClick={() => setViewFilter('unreconciled')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewFilter === 'unreconciled'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Unreconciled
          </button>
        </div>
        <button
          onClick={() => setShowExcluded(!showExcluded)}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            showExcluded
              ? 'bg-yellow-100 text-yellow-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {showExcluded ? (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Showing Excluded
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Show Excluded
            </>
          )}
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <ReconciliationList
        transactions={filteredTransactions}
        accounts={accounts}
        onTransactionClick={setSelectedTransaction}
        onDeleteTransactions={() => {}}
        selectedIds={selectedIds}
        onToggleSelection={(id) => {
          const newSelection = new Set(selectedIds);
          if (newSelection.has(id)) {
            newSelection.delete(id);
          } else {
            newSelection.add(id);
          }
          setSelectedIds(newSelection);
        }}
        onSelectAll={(ids) => {
          if (selectedIds.size === ids.length) {
            setSelectedIds(new Set());
          } else {
            setSelectedIds(new Set(ids));
          }
        }}
      />

      {selectedIds.size > 0 && (
        <ReconcileActions
          selectedIds={selectedIds}
          onReconcile={handleBulkReconcile}
          onUndo={handleUndoReconciliation}
          accounts={accounts}
          totalAmount={totalSelectedAmount}
          hasReconciledItems={hasReconciledItems}
        />
      )}

      {selectedTransaction && (
        <CreditEntryModal
          isOpen={true}
          onClose={() => setSelectedTransaction(null)}
          onAdd={handleAddOrUpdateOffset}
          accounts={accounts}
          originalTransaction={selectedTransaction}
        />
      )}
    </div>
  );
}

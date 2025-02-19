import React from 'react';
import { Upload, Bot, Plus, ScanSearch } from 'lucide-react';
import { TransactionList } from './TransactionList';
import { TransactionUpload } from './TransactionUpload';
import { MonthSelector } from './MonthSelector';
import { BulkActions } from './BulkActions';
import { AddTransactionModal } from './AddTransactionModal';
import { DuplicateChecker } from './DuplicateChecker';
import { useCompany } from '../../context/CompanyContext';
import { Transaction } from '../../types/transactions';
import { BankAccount } from '../../types/company';

export function TransactionManager() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const { companyData, updateCompanyData } = useCompany();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [showDuplicateChecker, setShowDuplicateChecker] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState(new Set<string>());
  const [selectedMonth, setSelectedMonth] = React.useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [viewFilter, setViewFilter] = React.useState<'all' | 'categorized' | 'uncategorized' | 'excluded'>('all');
  const [selectedBankAccountId, setSelectedBankAccountId] = React.useState<string>('');

  const transactions = companyData?.transactions || [];
  const accounts = companyData?.accounts || [];
  const categoryRules = companyData?.categoryRules || [];
  const bankAccounts = companyData?.bankAccounts || [];

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(tx => {
      // Month filter
      const txDate = new Date(tx.date);
      const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      if (txMonth !== selectedMonth) return false;

      // Bank account filter
      if (selectedBankAccountId && tx.bankAccountId !== selectedBankAccountId) {
        return false;
      }

      // View filter
      switch (viewFilter) {
        case 'categorized':
          if (!tx.category || tx.category === '00000' || tx.category === 'Uncategorized' || tx.excluded) return false;
          break;
        case 'uncategorized':
          if ((tx.category && tx.category !== '00000' && tx.category !== 'Uncategorized') || tx.excluded) return false;
          break;
        case 'excluded':
          if (!tx.excluded) return false;
          break;
        case 'all':
          if (tx.excluded) return false;
          break;
      }

      return true;
    });
  }, [transactions, selectedMonth, viewFilter, selectedBankAccountId]);

  const handleFileUpload = (newTransactions: Transaction[]) => {
    let updatedAccounts = [...accounts];

    // Process each new transaction
    newTransactions.forEach(transaction => {
      if (transaction.category && transaction.category !== 'Uncategorized') {
        const account = accounts.find(a => a.accountNumber === transaction.category);
        if (account) {
          const accountNum = parseInt(account.accountNumber);
          let adjustedAmount = transaction.amount;
          if (accountNum >= 4000) {
            adjustedAmount = -adjustedAmount;
          }
          updatedAccounts = updatedAccounts.map(acc =>
            acc.accountNumber === transaction.category
              ? { ...acc, balance: (acc.balance || 0) + adjustedAmount }
              : acc
          );
        }
      }
    });

    // Update bank account balance
    if (newTransactions.length > 0) {
      const totalAmount = newTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      updatedAccounts = updatedAccounts.map(acc =>
        acc.id === newTransactions[0].bankAccountId
          ? { ...acc, balance: (acc.balance || 0) + totalAmount }
          : acc
      );
    }

    updateCompanyData({ 
      transactions: [...transactions, ...newTransactions],
      accounts: updatedAccounts
    });
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    let updatedAccounts = [...accounts];

    if (newTransaction.category && newTransaction.category !== 'Uncategorized') {
      const account = accounts.find(a => a.accountNumber === newTransaction.category);
      if (account) {
        const accountNum = parseInt(account.accountNumber);
        let adjustedAmount = newTransaction.amount;
        if (accountNum >= 4000) {
          adjustedAmount = -adjustedAmount;
        }
        updatedAccounts = updatedAccounts.map(acc =>
          acc.accountNumber === newTransaction.category
            ? { ...acc, balance: (acc.balance || 0) + adjustedAmount }
            : acc
        );
      }
    }

    // Update bank account balance
    if (newTransaction.bankAccountId) {
      updatedAccounts = updatedAccounts.map(acc =>
        acc.id === newTransaction.bankAccountId
          ? { ...acc, balance: (acc.balance || 0) + newTransaction.amount }
          : acc
      );
    }

    updateCompanyData({
      transactions: [...transactions, { ...newTransaction, source: 'manual' }],
      accounts: updatedAccounts
    });
    setShowAddModal(false);
  };

  const handleSaveEdit = (editedTransaction: Transaction) => {
    const updatedTransactions = transactions.map(tx => 
      tx.id === editedTransaction.id ? {
        ...editedTransaction,
        editHistory: [
          ...(tx.editHistory || []),
          {
            id: `edit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            changes: [{
              field: 'category',
              oldValue: tx.category,
              newValue: editedTransaction.category
            }]
          }
        ]
      } : tx
    );

    updateCompanyData({ transactions: updatedTransactions });
    setShowEditModal(false);
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleUpdateCategory = (txId: string, newCategory: string, amount: number) => {
    const transaction = transactions.find(tx => tx.id === txId);
    if (!transaction) return;

    let updatedAccounts = [...accounts];

    if (transaction.category && transaction.category !== 'Uncategorized') {
      const oldAccount = accounts.find(a => a.accountNumber === transaction.category);
      if (oldAccount) {
        const accountNum = parseInt(oldAccount.accountNumber);
        let adjustedAmount = amount;
        if (accountNum >= 4000) {
          adjustedAmount = -adjustedAmount;
        }
        updatedAccounts = updatedAccounts.map(acc =>
          acc.accountNumber === transaction.category
            ? { ...acc, balance: (acc.balance || 0) - adjustedAmount }
            : acc
        );
      }
    }

    if (newCategory !== 'Uncategorized') {
      const newAccount = accounts.find(a => a.accountNumber === newCategory);
      if (newAccount) {
        const accountNum = parseInt(newAccount.accountNumber);
        let adjustedAmount = amount;
        if (accountNum >= 4000) {
          adjustedAmount = -adjustedAmount;
        }
        updatedAccounts = updatedAccounts.map(acc =>
          acc.accountNumber === newCategory
            ? { ...acc, balance: (acc.balance || 0) + adjustedAmount }
            : acc
        );
      }
    }

    const updatedTransactions = transactions.map(tx => 
      tx.id === txId ? {
        ...tx,
        category: newCategory,
        editHistory: [
          ...(tx.editHistory || []),
          {
            id: `edit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            changes: [{
              field: 'category',
              oldValue: tx.category,
              newValue: newCategory
            }]
          }
        ]
      } : tx
    );

    updateCompanyData({ 
      transactions: updatedTransactions,
      accounts: updatedAccounts
    });
  };

  const handleToggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleSelectAll = (ids: string[]) => {
    if (selectedIds.size === ids.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  };

  const handleBulkUpdateCategory = (category: string) => {
    let updatedAccounts = [...accounts];

    selectedIds.forEach(id => {
      const transaction = transactions.find(tx => tx.id === id);
      if (transaction) {
        if (transaction.category && transaction.category !== 'Uncategorized') {
          const oldAccount = accounts.find(a => a.accountNumber === transaction.category);
          if (oldAccount) {
            const accountNum = parseInt(oldAccount.accountNumber);
            let adjustedAmount = transaction.amount;
            if (accountNum >= 4000) {
              adjustedAmount = -adjustedAmount;
            }
            updatedAccounts = updatedAccounts.map(acc =>
              acc.accountNumber === transaction.category
                ? { ...acc, balance: (acc.balance || 0) - adjustedAmount }
                : acc
            );
          }
        }

        if (category !== 'Uncategorized') {
          const newAccount = accounts.find(a => a.accountNumber === category);
          if (newAccount) {
            const accountNum = parseInt(newAccount.accountNumber);
            let adjustedAmount = transaction.amount;
            if (accountNum >= 4000) {
              adjustedAmount = -adjustedAmount;
            }
            updatedAccounts = updatedAccounts.map(acc =>
              acc.accountNumber === category
                ? { ...acc, balance: (acc.balance || 0) + adjustedAmount }
                : acc
            );
          }
        }
      }
    });

    const updatedTransactions = transactions.map(tx => 
      selectedIds.has(tx.id) ? {
        ...tx,
        category,
        editHistory: [
          ...(tx.editHistory || []),
          {
            id: `edit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            changes: [{
              field: 'category',
              oldValue: tx.category,
              newValue: category
            }]
          }
        ]
      } : tx
    );

    updateCompanyData({ 
      transactions: updatedTransactions,
      accounts: updatedAccounts
    });
    setSelectedIds(new Set());
  };

  const handleBulkExclude = () => {
    if (selectedIds.size === 0) return;

    const updatedTransactions = transactions.map(tx =>
      selectedIds.has(tx.id) ? { ...tx, excluded: true } : tx
    );

    updateCompanyData({ transactions: updatedTransactions });
    setSelectedIds(new Set());
  };

  const handleDeleteTransactions = () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.size} transaction${selectedIds.size === 1 ? '' : 's'}?`
    );

    if (confirmed) {
      let updatedAccounts = [...accounts];

      selectedIds.forEach(id => {
        const transaction = transactions.find(tx => tx.id === id);
        if (transaction && transaction.category && transaction.category !== 'Uncategorized') {
          const account = accounts.find(a => a.accountNumber === transaction.category);
          if (account) {
            const accountNum = parseInt(account.accountNumber);
            let adjustedAmount = transaction.amount;
            if (accountNum >= 4000) {
              adjustedAmount = -adjustedAmount;
            }
            updatedAccounts = updatedAccounts.map(acc =>
              acc.accountNumber === transaction.category
                ? { ...acc, balance: (acc.balance || 0) - adjustedAmount }
                : acc
            );
          }
        }

        // Update bank account balance
        if (transaction?.bankAccountId) {
          updatedAccounts = updatedAccounts.map(acc =>
            acc.id === transaction.bankAccountId
              ? { ...acc, balance: (acc.balance || 0) - transaction.amount }
              : acc
          );
        }
      });

      const updatedTransactions = transactions.filter(tx => !selectedIds.has(tx.id));
      updateCompanyData({ 
        transactions: updatedTransactions,
        accounts: updatedAccounts
      });
      setSelectedIds(new Set());
    }
  };

  const handleExcludeTransaction = (transactionId: string) => {
    const updatedTransactions = transactions.map(tx =>
      tx.id === transactionId ? { ...tx, excluded: !tx.excluded } : tx
    );
    updateCompanyData({ transactions: updatedTransactions });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
          <p className="mt-1 text-sm text-gray-500">Upload and categorize your transactions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </button>
          <TransactionUpload 
            onUpload={handleFileUpload}
            bankAccounts={bankAccounts}
          >
            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Transactions
            </button>
          </TransactionUpload>
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedBankAccountId('')}
          className={`p-4 rounded-lg border ${
            !selectedBankAccountId
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-lg font-medium text-gray-900">All Accounts</span>
            <span className="text-sm text-gray-500">
              View all transactions
            </span>
          </div>
        </button>
        
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
          onClick={() => setViewFilter('categorized')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            viewFilter === 'categorized'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          Categorized
        </button>
        <button
          onClick={() => setViewFilter('uncategorized')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            viewFilter === 'uncategorized'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          Uncategorized
        </button>
        <button
          onClick={() => setViewFilter('excluded')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            viewFilter === 'excluded'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          Excluded
        </button>
      </div>

      <TransactionList
        transactions={filteredTransactions}
        selectedIds={selectedIds}
        onToggleSelection={handleToggleSelection}
        onSelectAll={handleSelectAll}
        onUpdateCategory={handleUpdateCategory}
        accounts={accounts}
        onEditTransaction={handleEditTransaction}
        onCheckDuplicates={() => setShowDuplicateChecker(true)}
        onExcludeTransaction={handleExcludeTransaction}
      />

      {selectedIds.size > 0 && (
        <BulkActions
          selectedIds={selectedIds}
          onCategorize={handleBulkUpdateCategory}
          onDelete={handleDeleteTransactions}
          onExclude={handleBulkExclude}
          categoryRules={categoryRules}
        />
      )}

      {showAddModal && (
        <AddTransactionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTransaction}
          accounts={accounts}
          bankAccounts={bankAccounts}
        />
      )}

      {showEditModal && editingTransaction && (
        <AddTransactionModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
          onAdd={handleSaveEdit}
          accounts={accounts}
          bankAccounts={bankAccounts}
          editingTransaction={editingTransaction}
        />
      )}

      {showDuplicateChecker && (
        <DuplicateChecker
          isOpen={showDuplicateChecker}
          onClose={() => setShowDuplicateChecker(false)}
          transactions={transactions}
        />
      )}
    </div>
  );
}
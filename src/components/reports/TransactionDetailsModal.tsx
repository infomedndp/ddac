import React from 'react';
import { X, Save, AlertCircle, Printer, ArrowUpDown, Square, CheckSquare, Wand2 } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { ChartOfAccount } from '../../types/chartOfAccounts';
import { EditHistoryPopover } from './EditHistoryPopover';
import { useReactToPrint } from 'react-to-print';
import { useCompany } from '../../context/CompanyContext';
import { sendToMakeWebhook } from '../../utils/makeIntegration';
import { RecategorizationConfirmationModal } from './RecategorizationConfirmationModal';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accountName: string;
  accountNumber: string;
  isCurrentMonth: boolean;
  total: number;
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transactions: initialTransactions,
  accountName,
  accountNumber,
  isCurrentMonth,
  total
}: TransactionDetailsModalProps) {
  const { companyData, updateCompanyData, selectedCompany } = useCompany();
  const accounts = companyData?.accounts || [];
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = React.useState<string>('');
  const printRef = React.useRef<HTMLDivElement>(null);
  const [sortConfig, setSortConfig] = React.useState<{
    key: 'date' | 'amount';
    direction: 'asc' | 'desc';
  } | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [newCategories, setNewCategories] = React.useState<Record<string, string>>({});
  const [remainingTransactions, setRemainingTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [unsubscribeRef] = React.useState<{ current?: () => void }>({});

  // Update remaining transactions when initial transactions change
  React.useEffect(() => {
    setRemainingTransactions(initialTransactions);
  }, [initialTransactions]);

  // Cleanup subscription on unmount
  React.useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Transactions_${accountName}_${isCurrentMonth ? 'CurrentMonth' : 'YTD'}`,
    pageStyle: `
      @media print {
        @page { size: portrait; margin: 20mm; }
        body { padding: 20px; }
        .no-print { display: none !important; }
      }
    `
  });

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleAutoCategorizeBulk = async () => {
    if (selectedIds.size === 0 || !selectedCompany?.id) {
      alert('No transactions selected');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const selectedTransactions = remainingTransactions.filter(tx => selectedIds.has(tx.id));
      const currentRules = companyData?.categoryRules || [];

      if (selectedTransactions.length === 0) {
        alert('No transactions selected');
        return;
      }

      if (currentRules.length === 0) {
        alert('No category rules defined. Please add some rules first.');
        return;
      }

      // Store original categories
      const originalCategories = selectedTransactions.reduce((acc, tx) => {
        acc[tx.id] = tx.category || 'Uncategorized';
        return acc;
      }, {} as Record<string, string>);

      // Send to webhook
      await sendToMakeWebhook(
        selectedTransactions, 
        currentRules,
        selectedCompany.id
      );

      // Set up Firestore listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      let timeoutId: NodeJS.Timeout;
      
      return new Promise<void>((resolve, reject) => {
        timeoutId = setTimeout(() => {
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
          }
          reject(new Error('Timeout waiting for category changes'));
        }, 10000);

        unsubscribeRef.current = onSnapshot(doc(db, 'companies', selectedCompany.id), (snapshot) => {
          const data = snapshot.data();
          if (!data?.transactions) return;

          const updatedTransactions = data.transactions;
          const suggestedCategories: Record<string, string> = {};

          selectedTransactions.forEach(originalTx => {
            const updatedTx = updatedTransactions.find(tx => tx.id === originalTx.id);
            if (updatedTx && updatedTx.category !== originalCategories[originalTx.id]) {
              suggestedCategories[originalTx.id] = updatedTx.category;
            }
          });

          if (Object.keys(suggestedCategories).length > 0) {
            clearTimeout(timeoutId);
            setNewCategories(suggestedCategories);
            setShowConfirmation(true);
            if (unsubscribeRef.current) {
              unsubscribeRef.current();
            }
            resolve();
          }
        });
      });

    } catch (error) {
      console.error('Auto-categorization failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to auto-categorize transactions');
    } finally {
      setIsProcessing(false);
    }
  };

  const sortedTransactions = React.useMemo(() => {
    if (!sortConfig) return remainingTransactions;

    return [...remainingTransactions].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      }
      return 0;
    });
  }, [remainingTransactions, sortConfig]);

  const handleSort = (key: 'date' | 'amount') => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        key,
        direction: 'asc'
      };
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

  const handleSelectAll = () => {
    if (selectedIds.size === remainingTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(remainingTransactions.map(tx => tx.id)));
    }
  };

  const handleConfirmCategories = async (confirmedCategories: Record<string, string>) => {
    try {
      let updatedAccounts = [...accounts];
      const currentTransactions = Array.isArray(companyData?.transactions) 
        ? companyData.transactions 
        : [];

      // Update transactions and account balances
      const updatedTransactions = currentTransactions.map(tx => {
        const newCategory = confirmedCategories[tx.id];
        if (!newCategory) return tx;

        // Remove old category balance
        if (tx.category && tx.category !== 'Uncategorized') {
          const oldAccount = accounts.find(a => a.accountNumber === tx.category);
          if (oldAccount) {
            updatedAccounts = updatedAccounts.map(acc =>
              acc.accountNumber === tx.category
                ? { ...acc, balance: (acc.balance || 0) - tx.amount }
                : acc
            );
          }
        }

        // Add new category balance
        if (newCategory !== 'Uncategorized') {
          const newAccount = accounts.find(a => a.accountNumber === newCategory);
          if (newAccount) {
            updatedAccounts = updatedAccounts.map(acc =>
              acc.accountNumber === newCategory
                ? { ...acc, balance: (acc.balance || 0) + tx.amount }
                : acc
            );
          }
        }

        return {
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
        };
      });

      await updateCompanyData({
        transactions: updatedTransactions,
        accounts: updatedAccounts
      });

      setRemainingTransactions(prev => 
        prev.filter(tx => !confirmedCategories[tx.id])
      );
      setSelectedIds(new Set());
      setShowConfirmation(false);

    } catch (error) {
      console.error('Error updating categories:', error);
      alert('Failed to update categories. Please try again.');
    }
  };

  const handleUpdateCategory = async (transactionId: string, newCategory: string) => {
    try {
      const currentTransactions = Array.isArray(companyData?.transactions) 
        ? companyData.transactions 
        : [];
      let updatedAccounts = [...accounts];

      const transaction = currentTransactions.find(tx => tx.id === transactionId);
      if (!transaction) return;

      // Update old account balance if transaction was categorized
      if (transaction.category && transaction.category !== 'Uncategorized') {
        const oldAccount = accounts.find(a => a.accountNumber === transaction.category);
        if (oldAccount) {
          updatedAccounts = updatedAccounts.map(acc =>
            acc.accountNumber === transaction.category
              ? { ...acc, balance: (acc.balance || 0) - transaction.amount }
              : acc
          );
        }
      }

      // Update new account balance if not Uncategorized
      if (newCategory !== 'Uncategorized') {
        const newAccount = accounts.find(a => a.accountNumber === newCategory);
        if (newAccount) {
          updatedAccounts = updatedAccounts.map(acc =>
            acc.accountNumber === newCategory
              ? { ...acc, balance: (acc.balance || 0) + transaction.amount }
              : acc
          );
        }
      }

      // Update transaction
      const updatedTransactions = currentTransactions.map(tx => {
        if (tx.id === transactionId) {
          return {
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
          };
        }
        return tx;
      });

      await updateCompanyData({
        transactions: updatedTransactions,
        accounts: updatedAccounts
      });

      setRemainingTransactions(prev => prev.filter(tx => tx.id !== transactionId));
    } catch (error) {
      console.error('Error updating transaction category:', error);
    }
  };

  const handleBulkUpdateCategory = async () => {
    if (!bulkCategory || selectedIds.size === 0) return;

    try {
      const currentTransactions = Array.isArray(companyData?.transactions) 
        ? companyData.transactions 
        : [];
      let updatedAccounts = [...accounts];

      selectedIds.forEach(id => {
        const transaction = remainingTransactions.find(tx => tx.id === id);
        if (!transaction) return;

        if (transaction.category && transaction.category !== 'Uncategorized') {
          const oldAccount = accounts.find(a => a.accountNumber === transaction.category);
          if (oldAccount) {
            updatedAccounts = updatedAccounts.map(acc =>
              acc.accountNumber === transaction.category
                ? { ...acc, balance: (acc.balance || 0) - transaction.amount }
                : acc
            );
          }
        }

        if (bulkCategory !== 'Uncategorized') {
          const newAccount = accounts.find(a => a.accountNumber === bulkCategory);
          if (newAccount) {
            updatedAccounts = updatedAccounts.map(acc =>
              acc.accountNumber === bulkCategory
                ? { ...acc, balance: (acc.balance || 0) + transaction.amount }
                : acc
            );
          }
        }
      });

      const updatedTransactions = currentTransactions.map(tx => {
        if (selectedIds.has(tx.id)) {
          return {
            ...tx,
            category: bulkCategory,
            editHistory: [
              ...(tx.editHistory || []),
              {
                id: `edit-${Date.now()}`,
                timestamp: new Date().toISOString(),
                changes: [{
                  field: 'category',
                  oldValue: tx.category,
                  newValue: bulkCategory
                }]
              }
            ]
          };
        }
        return tx;
      });

      await updateCompanyData({
        transactions: updatedTransactions,
        accounts: updatedAccounts
      });

      setRemainingTransactions(prev => prev.filter(tx => !selectedIds.has(tx.id)));
      setSelectedIds(new Set());
      setBulkCategory('');
    } catch (error) {
      console.error('Error updating categories:', error);
    }
  };

  if (!isOpen) return null;

  const PrintableContent = React.forwardRef<HTMLDivElement>((_, ref) => (
    <div ref={ref} className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{selectedCompany?.name}</h1>
        <h2 className="text-xl">{accountName} ({accountNumber})</h2>
        <p className="text-sm text-gray-600">
          {isCurrentMonth ? 'Current Month' : 'Year to Date'} Total: ${Math.abs(total).toFixed(2)}
        </p>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTransactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(tx.date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {tx.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${Math.abs(tx.amount).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {accounts.find(a => a.accountNumber === tx.category)?.accountName || 'Uncategorized'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {accountName} ({accountNumber})
                </h2>
                <p className="text-sm text-gray-500">
                  {isCurrentMonth ? 'Current Month' : 'Year to Date'} Total: ${Math.abs(total).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedIds.size} transaction{selectedIds.size === 1 ? '' : 's'} selected
                </span>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="block rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Change category to...</option>
                  <option value="Uncategorized">Uncategorized</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.accountNumber}>
                      {account.accountName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkUpdateCategory}
                  disabled={!bulkCategory}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Category
                </button>
                <button
                  onClick={handleAutoCategorizeBulk}
                  disabled={isProcessing}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  <Wand2 className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                  {isProcessing ? 'Processing...' : 'Auto Categorize'}
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">
                    <button
                      onClick={handleSelectAll}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {selectedIds.size === remainingTransactions.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end">
                      Amount
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    History
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap no-print">
                      <button
                        onClick={() => handleToggleSelection(tx.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedIds.has(tx.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <select
                        value={tx.category || 'Uncategorized'}
                        onChange={(e) => handleUpdateCategory(tx.id, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="Uncategorized">Uncategorized</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.accountNumber}>
                            {account.accountName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.editHistory && tx.editHistory.length > 0 && (
                        <EditHistoryPopover history={tx.editHistory} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'none' }}>
            <PrintableContent ref={printRef} />
          </div>
        </div>
      </div>

      {showConfirmation && (
        <RecategorizationConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmCategories}
          transactions={remainingTransactions}
          accounts={accounts}
          newCategories={newCategories}
        />
      )}
    </div>
  );
}
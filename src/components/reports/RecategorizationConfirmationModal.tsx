import React from 'react';
import { X, Save, AlertCircle, RotateCcw } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { ChartOfAccount } from '../../types/chartOfAccounts';

interface RecategorizationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categories: Record<string, string>) => void;
  transactions: Transaction[];
  accounts: ChartOfAccount[];
  newCategories: Record<string, string>;
}

export function RecategorizationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  transactions,
  accounts,
  newCategories
}: RecategorizationConfirmationModalProps) {
  const [editedCategories, setEditedCategories] = React.useState<Record<string, string>>(newCategories);

  // Reset edited categories when new categories change
  React.useEffect(() => {
    setEditedCategories(newCategories);
  }, [newCategories]);

  if (!isOpen) return null;

  const getAccountName = (accountNumber?: string) => {
    if (!accountNumber) return 'Uncategorized';
    const account = accounts.find(a => a.accountNumber === accountNumber);
    return account ? account.accountName : 'Unknown Account';
  };

  const handleCategoryChange = (transactionId: string, newCategory: string) => {
    setEditedCategories(prev => ({
      ...prev,
      [transactionId]: newCategory
    }));
  };

  const handleRevertCategory = (transactionId: string) => {
    const transaction = transactions.find(tx => tx.id === transactionId);
    if (transaction) {
      setEditedCategories(prev => ({
        ...prev,
        [transactionId]: transaction.category
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Confirm Categorization Changes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please review the following categorization changes. You can manually adjust categories or revert to their original values before confirming.
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.filter(tx => {
                const newCategory = editedCategories[tx.id];
                return newCategory && newCategory !== tx.category;
              }).map((tx) => {
                const newCategory = editedCategories[tx.id];
                return (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getAccountName(tx.category)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={newCategory}
                        onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
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
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleRevertCategory(tx.id)}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        title="Revert to original category"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(editedCategories)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Confirm Changes
          </button>
        </div>
      </div>
    </div>
  );
}

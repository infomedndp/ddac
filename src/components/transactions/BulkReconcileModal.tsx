import React from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { ChartOfAccount } from '../../types/chartOfAccounts';

interface BulkReconcileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReconcile: (category: string, type: 'debit' | 'credit', description: string) => void;
  accounts: ChartOfAccount[];
  selectedTransactions: Transaction[];
  totalAmount: number;
}

export function BulkReconcileModal({
  isOpen,
  onClose,
  onReconcile,
  accounts,
  selectedTransactions,
  totalAmount
}: BulkReconcileModalProps) {
  const [formData, setFormData] = React.useState({
    category: '',
    type: 'credit' as 'debit' | 'credit',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReconcile(formData.category, formData.type, formData.description);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Reconciliation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">Selected Transactions</h3>
          <div className="mt-2 text-sm text-gray-600">
            <p><span className="font-medium">Count:</span> {selectedTransactions.length}</p>
            <p><span className="font-medium">Total Amount:</span> ${Math.abs(totalAmount).toFixed(2)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Account</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select account...</option>
              {accounts.map(account => (
                <option key={account.id} value={account.accountNumber}>
                  {account.accountName} ({account.accountNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'debit' | 'credit' }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter offset description"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Apply to All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

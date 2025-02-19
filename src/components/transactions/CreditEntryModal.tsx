import React from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { ChartOfAccount } from '../../types/chartOfAccounts';
import { v4 as uuidv4 } from 'uuid';

interface CreditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
  accounts: ChartOfAccount[];
  originalTransaction: Transaction;
}

export function CreditEntryModal({
  isOpen,
  onClose,
  onAdd,
  accounts,
  originalTransaction
}: CreditEntryModalProps) {
  const [formData, setFormData] = React.useState({
    description: originalTransaction.offsetDescription || `Offset to: ${originalTransaction.description}`,
    amount: originalTransaction.offsetAmount 
      ? Math.abs(originalTransaction.offsetAmount).toString()
      : Math.abs(originalTransaction.amount).toString(),
    category: originalTransaction.offsetCategory || '',
    type: originalTransaction.offsetAmount 
      ? (originalTransaction.offsetAmount > 0 ? 'debit' : 'credit')
      : (originalTransaction.amount > 0 ? 'credit' : 'debit')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = formData.type === 'debit' 
      ? Math.abs(parseFloat(formData.amount))
      : -Math.abs(parseFloat(formData.amount));

    // Create the actual offsetting transaction record
    const offsetTransaction: Transaction = {
      id: uuidv4(),
      date: originalTransaction.date,
      description: formData.description,
      amount,
      category: formData.category,
      source: 'reconciliation',
      relatedTransactionId: originalTransaction.id
    };

    // Update the original transaction with reconciliation info
    const updatedOriginalTransaction: Transaction = {
      ...originalTransaction,
      offsetDescription: formData.description,
      offsetAmount: amount,
      offsetCategory: formData.category,
      isReconciled: true,
      offsetTransactionId: offsetTransaction.id
    };

    onAdd(updatedOriginalTransaction);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {originalTransaction.isReconciled ? 'Edit Offset Entry' : 'Add Offset Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
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
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
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
              {originalTransaction.isReconciled ? 'Update' : 'Add'} Offset Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

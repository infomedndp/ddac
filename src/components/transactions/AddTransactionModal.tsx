import React from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { ChartOfAccount } from '../../types/chartOfAccounts';
import { BankAccount } from '../../types/company';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
  accounts: ChartOfAccount[];
  bankAccounts: BankAccount[];
  editingTransaction?: Transaction | null;
}

export function AddTransactionModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  accounts,
  bankAccounts,
  editingTransaction 
}: AddTransactionModalProps) {
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split("T")[0],
    description: '',
    amount: '',
    category: '00000', // Default to '00000' for Uncategorized
    bankAccountId: ''
  });

  // Initialize form data when editing transaction changes
  React.useEffect(() => {
    if (editingTransaction) {
      // Convert date to YYYY-MM-DD format for input field and add one day
      const date = new Date(editingTransaction.date);
      date.setDate(date.getDate() + 1); // Add one day to fix offset
      const formattedDate = date.toISOString().split('T')[0];
      
      setFormData({
        date: formattedDate,
        description: editingTransaction.description,
        amount: editingTransaction.amount.toString(),
        category: editingTransaction.category || '00000',
        bankAccountId: editingTransaction.bankAccountId || ''
      });
    }
  }, [editingTransaction]);

  // Sort accounts by number, excluding the Uncategorized account (00000)
  const sortedAccounts = React.useMemo(() => {
    return accounts
      .filter(acc => acc.accountNumber !== '00000')
      .sort((a, b) => {
        const numA = parseInt(a.accountNumber);
        const numB = parseInt(b.accountNumber);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.accountNumber.localeCompare(b.accountNumber);
      });
  }, [accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bankAccountId) {
      alert('Please select a bank account');
      return;
    }
    
    const baseTransaction: Transaction = {
      id: editingTransaction?.id || `manual-${Date.now()}`,
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      bankAccountId: formData.bankAccountId,
      source: editingTransaction?.source || 'manual'
    };

    onAdd(baseTransaction);

    // Only reset form if not editing
    if (!editingTransaction) {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        description: '',
        amount: '',
        category: '00000',
        bankAccountId: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Account *</label>
            <select
              required
              value={formData.bankAccountId}
              onChange={(e) => setFormData(prev => ({ ...prev, bankAccountId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select bank account...</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} (ending in {account.accountNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="00000">Uncategorized</option>
              {sortedAccounts.map(account => (
                <option key={account.id} value={account.accountNumber}>
                  {account.accountName}
                </option>
              ))}
            </select>
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
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

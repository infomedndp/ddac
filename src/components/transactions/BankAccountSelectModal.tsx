import React from 'react';
import { X } from 'lucide-react';
import { BankAccount } from '../../types/company';

interface BankAccountSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (accountId: string) => void;
  bankAccounts: BankAccount[];
}

export function BankAccountSelectModal({ isOpen, onClose, onSelect, bankAccounts }: BankAccountSelectModalProps) {
  const [selectedAccountId, setSelectedAccountId] = React.useState('');

  const handleSubmit = () => {
    if (!selectedAccountId) {
      alert('Please select a bank account');
      return;
    }
    onSelect(selectedAccountId);
    setSelectedAccountId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Select Bank Account</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select an account...</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} (ending in {account.accountNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
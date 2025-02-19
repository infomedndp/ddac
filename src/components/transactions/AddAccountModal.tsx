import React from 'react';
import { X } from 'lucide-react';
import { ChartOfAccount } from '../../types/chartOfAccounts';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (account: ChartOfAccount) => void;
  accountTypes: AccountType[];
  existingAccounts: ChartOfAccount[];
  editingAccount?: ChartOfAccount | null;
}

interface AccountType {
  value: string;
  label: string;
  category: string;
  subtype: string | null;
}

export function AddAccountModal({
  isOpen,
  onClose,
  onAdd,
  accountTypes,
  existingAccounts,
  editingAccount
}: AddAccountModalProps) {
  const [formData, setFormData] = React.useState({
    accountNumber: editingAccount?.accountNumber || '',
    accountName: editingAccount?.accountName || '',
    accountType: editingAccount?.accountType || '',
    description: editingAccount?.description || '',
    isActive: editingAccount?.isActive ?? true,
    isLessAccumulated: editingAccount?.isLessAccumulated ?? false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedType = accountTypes.find(type => type.value === formData.accountType);
    if (!selectedType) return;

    const account: ChartOfAccount = {
      id: editingAccount?.id || `account-${Date.now()}`,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      accountType: formData.accountType,
      description: formData.description,
      balance: editingAccount?.balance || 0,
      isActive: formData.isActive,
      isLessAccumulated: formData.isLessAccumulated,
      version: editingAccount?.version || 'manual',
      category: selectedType.category,
      subtype: selectedType.subtype
    };

    onAdd(account);
  };

  const validateAccountNumber = (number: string) => {
    if (!number) return false;
    if (editingAccount && number === editingAccount.accountNumber) return true;
    return !existingAccounts.some(acc => acc.accountNumber === number);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Number *</label>
            <input
              type="text"
              required
              value={formData.accountNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (validateAccountNumber(value)) {
                  setFormData(prev => ({ ...prev, accountNumber: value }));
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Account Name *</label>
            <input
              type="text"
              required
              value={formData.accountName}
              onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Account Type *</label>
            <select
              required
              value={formData.accountType}
              onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select account type...</option>
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-900">
              Account is active
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isLessAccumulated"
              checked={formData.isLessAccumulated}
              onChange={(e) => setFormData(prev => ({ ...prev, isLessAccumulated: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isLessAccumulated" className="text-sm text-gray-900">
              Less Accumulated Account (negative balance)
            </label>
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
              {editingAccount ? 'Update' : 'Add'} Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

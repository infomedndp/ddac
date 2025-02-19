import React from 'react';
import { Save, X, AlertTriangle, Plus, Trash2, Edit2 } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BankAccount } from '../../types/company';

interface CompanySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanySettings({ isOpen, onClose }: CompanySettingsProps) {
  const { selectedCompany, updateCompanyInfo, selectCompany } = useCompany();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteCompanyName, setDeleteCompanyName] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showAddBankAccount, setShowAddBankAccount] = React.useState(false);
  const [editingBankAccount, setEditingBankAccount] = React.useState<BankAccount | null>(null);
  const [bankAccountForm, setBankAccountForm] = React.useState<Partial<BankAccount>>({
    name: '',
    accountNumber: '',
    routingNumber: '',
    type: 'checking',
    isActive: true
  });

  const [formData, setFormData] = React.useState({
    name: selectedCompany?.name || '',
    address: selectedCompany?.address || '',
    city: selectedCompany?.city || '',
    state: selectedCompany?.state || '',
    zipCode: selectedCompany?.zipCode || '',
    phone: selectedCompany?.phone || '',
    email: selectedCompany?.email || '',
    website: selectedCompany?.website || '',
    taxId: selectedCompany?.taxId || ''
  });

  React.useEffect(() => {
    if (selectedCompany) {
      setFormData({
        name: selectedCompany.name || '',
        address: selectedCompany.address || '',
        city: selectedCompany.city || '',
        state: selectedCompany.state || '',
        zipCode: selectedCompany.zipCode || '',
        phone: selectedCompany.phone || '',
        email: selectedCompany.email || '',
        website: selectedCompany.website || '',
        taxId: selectedCompany.taxId || ''
      });
    }
  }, [selectedCompany]);

  React.useEffect(() => {
    if (editingBankAccount) {
      setBankAccountForm({
        name: editingBankAccount.name,
        accountNumber: editingBankAccount.accountNumber,
        routingNumber: editingBankAccount.routingNumber,
        type: editingBankAccount.type,
        isActive: editingBankAccount.isActive
      });
    } else {
      setBankAccountForm({
        name: '',
        accountNumber: '',
        routingNumber: '',
        type: 'checking',
        isActive: true
      });
    }
  }, [editingBankAccount]);

  const handleSave = () => {
    if (selectedCompany) {
      updateCompanyInfo(formData);
      onClose();
    }
  };

  const handleSaveBankAccount = () => {
    if (!selectedCompany) return;

    const bankAccount: BankAccount = {
      id: editingBankAccount?.id || `bank-${Date.now()}`,
      name: bankAccountForm.name || '',
      accountNumber: bankAccountForm.accountNumber || '',
      routingNumber: bankAccountForm.routingNumber,
      type: bankAccountForm.type as 'checking' | 'savings' | 'credit' | 'other',
      isActive: true,
      createdAt: editingBankAccount?.createdAt || new Date().toISOString()
    };

    const currentAccounts = selectedCompany.bankAccounts || [];
    const updatedAccounts = editingBankAccount
      ? currentAccounts.map(acc => acc.id === editingBankAccount.id ? bankAccount : acc)
      : [...currentAccounts, bankAccount];

    updateCompanyInfo({
      bankAccounts: updatedAccounts
    });

    setBankAccountForm({
      name: '',
      accountNumber: '',
      routingNumber: '',
      type: 'checking',
      isActive: true
    });
    setEditingBankAccount(null);
    setShowAddBankAccount(false);
  };

  const handleDeleteBankAccount = (accountId: string) => {
    if (!selectedCompany || !window.confirm('Are you sure you want to delete this bank account?')) return;

    const updatedAccounts = (selectedCompany.bankAccounts || []).filter(
      account => account.id !== accountId
    );

    updateCompanyInfo({
      bankAccounts: updatedAccounts
    });
  };

  const handleEditBankAccount = (account: BankAccount) => {
    setEditingBankAccount(account);
    setShowAddBankAccount(true);
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany || deleteCompanyName !== selectedCompany.name) {
      return;
    }

    try {
      setIsDeleting(true);
      const companyRef = doc(db, 'companies', selectedCompany.id);
      await deleteDoc(companyRef);
      selectCompany('');
      onClose();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen || !selectedCompany) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-900">Company Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tax ID
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Bank Accounts</h3>
              <button
                onClick={() => {
                  setEditingBankAccount(null);
                  setShowAddBankAccount(true);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Bank Account
              </button>
            </div>

            <div className="space-y-4">
              {(selectedCompany.bankAccounts || []).map((account) => (
                <div key={account.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{account.name}</h4>
                    <p className="text-sm text-gray-500">
                      Account ending in {account.accountNumber} • {account.type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditBankAccount(account)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBankAccount(account.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {(!selectedCompany.bankAccounts || selectedCompany.bankAccounts.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No bank accounts added yet
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Delete Company</h3>
                  <div className="mt-2">
                    <p className="text-sm text-red-700">
                      This action cannot be undone. This will permanently delete the company
                      and all associated data including transactions, accounts, and documents.
                    </p>
                  </div>
                  {!showDeleteConfirm ? (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        Delete this company
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm text-red-700">
                        Please type <span className="font-semibold">{selectedCompany.name}</span> to confirm.
                      </p>
                      <input
                        type="text"
                        value={deleteCompanyName}
                        onChange={(e) => setDeleteCompanyName(e.target.value)}
                        className="block w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Type company name to confirm"
                      />
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteCompanyName('');
                          }}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteCompany}
                          disabled={deleteCompanyName !== selectedCompany.name || isDeleting}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? 'Deleting...' : 'Permanently delete company'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Modal */}
      {showAddBankAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingBankAccount ? 'Edit Bank Account' : 'Add Bank Account'}
              </h3>
              <button
                onClick={() => {
                  setShowAddBankAccount(false);
                  setEditingBankAccount(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveBankAccount();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankAccountForm.name}
                    onChange={(e) => setBankAccountForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Business Checking"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <select
                    required
                    value={bankAccountForm.type}
                    onChange={(e) => setBankAccountForm(prev => ({ ...prev, type: e.target.value as BankAccount['type'] }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Number (last 4 digits)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    pattern="\d{4}"
                    value={bankAccountForm.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setBankAccountForm(prev => ({ ...prev, accountNumber: value }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Last 4 digits only"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Routing Number (optional)
                  </label>
                  <input
                    type="text"
                    value={bankAccountForm.routingNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setBankAccountForm(prev => ({ ...prev, routingNumber: value }));
                    }}
                    maxLength={9}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="9-digit routing number"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBankAccount(false);
                    setEditingBankAccount(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  {editingBankAccount ? 'Update Account' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

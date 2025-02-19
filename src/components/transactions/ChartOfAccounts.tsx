import React from 'react';
import { Upload, Plus, X, Trash2, Edit2, CheckSquare, Square, Search } from 'lucide-react';
import { read, utils } from 'xlsx';
import { ChartOfAccount, AccountType } from '../../types/chartOfAccounts';
import { useCompany } from '../../context/CompanyContext';
import { AddAccountModal } from './AddAccountModal';

const ACCOUNT_TYPES = [
  { value: 'Cash', label: 'Cash', category: 'Asset', subtype: 'Current' },
  { value: 'Accounts Receivable', label: 'Accounts Receivable', category: 'Asset', subtype: 'Current' },
  { value: 'Inventory', label: 'Inventory', category: 'Asset', subtype: 'Current' },
  { value: 'Other Current Assets', label: 'Other Current Assets', category: 'Asset', subtype: 'Current' },
  { value: 'Fixed Assets', label: 'Fixed Assets', category: 'Asset', subtype: 'Fixed' },
  { value: 'Accumulated Depreciation', label: 'Accumulated Depreciation', category: 'Asset', subtype: 'Fixed' },
  { value: 'Other Assets', label: 'Other Assets', category: 'Asset', subtype: 'Other' },
  { value: 'Accounts Payable', label: 'Accounts Payable', category: 'Liability', subtype: 'Current' },
  { value: 'Other Current Liabilities', label: 'Other Current Liabilities', category: 'Liability', subtype: 'Current' },
  { value: 'Long Term Liabilities', label: 'Long Term Liabilities', category: 'Liability', subtype: 'Long Term' },
  { value: 'Equity-doesnt close', label: 'Equity (Non-Closing)', category: 'Equity', subtype: null },
  { value: 'Equity-gets closed', label: 'Equity (Closing)', category: 'Equity', subtype: null },
  { value: 'Equity-Retained Earnings', label: 'Retained Earnings', category: 'Equity', subtype: null },
  { value: 'Income', label: 'Income', category: 'Revenue', subtype: null },
  { value: 'Revenue', label: 'Revenue', category: 'Revenue', subtype: null },
  { value: 'Cost of Sales', label: 'Cost of Sales', category: 'Cost of Sales', subtype: null },
  { value: 'Expense', label: 'Expense', category: 'Expense', subtype: null }
];

interface ChartOfAccountsProps {
  standalone?: boolean;
  accounts?: ChartOfAccount[];
  onAddAccounts?: (accounts: ChartOfAccount[]) => void;
  onDeleteAccount?: (accountId: string) => void;
  onClose?: () => void;
}

export function ChartOfAccounts({ 
  standalone = false,
  accounts: propAccounts,
  onAddAccounts: propAddAccounts,
  onDeleteAccount: propDeleteAccount,
  onClose: propOnClose 
}: ChartOfAccountsProps) {
  const { companyData, updateCompanyData } = useCompany();
  const [showUpload, setShowUpload] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState<string>('');
  const [editingAccount, setEditingAccount] = React.useState<ChartOfAccount | null>(null);
  const [selectedIds, setSelectedIds] = React.useState(new Set<string>());
  const [bulkAccountType, setBulkAccountType] = React.useState('');
  const [showBulkEdit, setShowBulkEdit] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Use either props or context data, ensuring we have an array
  const accounts = React.useMemo(() => {
    const accountsList = Array.isArray(propAccounts) 
      ? propAccounts 
      : (Array.isArray(companyData?.accounts) ? companyData.accounts : []);

    // Sort accounts by account number numerically
    return [...accountsList].sort((a, b) => {
      const numA = parseInt(a.accountNumber);
      const numB = parseInt(b.accountNumber);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.accountNumber.localeCompare(b.accountNumber);
    });
  }, [propAccounts, companyData?.accounts]);

  const filteredAccounts = React.useMemo(() => {
    if (!searchTerm) return accounts;
    
    const term = searchTerm.toLowerCase();
    return accounts.filter(account => 
      account.accountNumber.toLowerCase().includes(term) ||
      account.accountName.toLowerCase().includes(term) ||
      account.accountType.toLowerCase().includes(term)
    );
  }, [accounts, searchTerm]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (data.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = data[0].map((h: any) => String(h).toLowerCase().trim());
      const numberCol = headers.findIndex(h => h.includes('number') || h.includes('code'));
      const nameCol = headers.findIndex(h => h.includes('name') || h.includes('description'));

      if (numberCol === -1 || nameCol === -1) {
        throw new Error('Required columns "Account Number" and "Account Name" not found');
      }

      const versionName = `Import ${new Date().toLocaleString()}`;
      const newAccounts: ChartOfAccount[] = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[numberCol]) continue;

        const accountNumber = String(row[numberCol]).trim();
        const accountName = String(row[nameCol] || '').trim();

        if (accountNumber && accountName) {
          // Skip if account number is 00000 (Uncategorized)
          if (accountNumber === '00000') continue;

          newAccounts.push({
            id: `account-${Date.now()}-${i}`,
            accountNumber,
            accountName,
            accountType: 'Expense',
            description: '',
            balance: 0,
            isActive: true,
            version: versionName,
            category: 'Expense',
            subtype: null
          });
        }
      }

      handleAddAccounts(newAccounts);
      setSelectedVersion(versionName);

    } catch (error) {
      console.error('Error processing file:', error);
      alert(error instanceof Error ? error.message : 'Error processing file');
    }

    event.target.value = '';
  };

  const handleAddAccounts = (newAccounts: ChartOfAccount[]) => {
    if (!Array.isArray(newAccounts)) return;

    const versionName = `Import ${new Date().toLocaleString()}`;
    const versionedAccounts = newAccounts.map(account => ({
      ...account,
      version: versionName,
      isActive: true
    }));

    if (propAddAccounts) {
      propAddAccounts(versionedAccounts);
    } else if (Array.isArray(accounts)) {
      // Preserve the Uncategorized account and add new accounts
      const uncategorizedAccount = accounts.find(acc => acc.accountNumber === '00000');
      const otherAccounts = accounts.filter(acc => acc.accountNumber !== '00000');
      
      const updatedAccounts = [
        ...(uncategorizedAccount ? [uncategorizedAccount] : []),
        ...otherAccounts,
        ...versionedAccounts
      ].sort((a, b) => parseInt(a.accountNumber) - parseInt(b.accountNumber));

      updateCompanyData({ accounts: updatedAccounts });
    }
    setSelectedVersion(versionName);
  };

  const handleAddAccount = (account: ChartOfAccount) => {
    // Don't allow adding account with number 00000
    if (account.accountNumber === '00000') {
      alert('Account number 00000 is reserved for Uncategorized');
      return;
    }

    const updatedAccounts = [...accounts, account].sort((a, b) => 
      parseInt(a.accountNumber) - parseInt(b.accountNumber)
    );
    updateCompanyData({ accounts: updatedAccounts });
    setShowAddModal(false);
  };

  const handleToggleSelection = (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    if (account?.accountNumber === '00000') return; // Prevent selecting Uncategorized account

    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === accounts.length - 1) { // -1 for Uncategorized account
      setSelectedIds(new Set());
    } else {
      // Select all except Uncategorized account
      const selectableIds = accounts
        .filter(acc => acc.accountNumber !== '00000')
        .map(acc => acc.id);
      setSelectedIds(new Set(selectableIds));
    }
  };

  const handleBulkUpdateType = () => {
    if (!bulkAccountType || selectedIds.size === 0) return;

    const updatedAccounts = accounts.map(account => {
      if (selectedIds.has(account.id)) {
        const accountTypeInfo = ACCOUNT_TYPES.find(type => type.value === bulkAccountType);
        return {
          ...account,
          accountType: bulkAccountType,
          category: accountTypeInfo?.category || account.category,
          subtype: accountTypeInfo?.subtype || account.subtype
        };
      }
      return account;
    });

    updateCompanyData({ accounts: updatedAccounts });
    setSelectedIds(new Set());
    setBulkAccountType('');
    setShowBulkEdit(false);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;

    // Filter out Uncategorized account from deletion
    const accountsToDelete = Array.from(selectedIds).filter(id => {
      const account = accounts.find(acc => acc.id === id);
      return account?.accountNumber !== '00000';
    });

    if (accountsToDelete.length !== selectedIds.size) {
      alert('The Uncategorized account (00000) cannot be deleted.');
    }

    if (accountsToDelete.length > 0 && window.confirm(`Are you sure you want to delete ${accountsToDelete.length} accounts?`)) {
      const updatedAccounts = accounts.filter(account => !accountsToDelete.includes(account.id));
      updateCompanyData({ accounts: updatedAccounts });
      setSelectedIds(new Set());
    }
  };

  return (
    <div className={standalone ? '' : 'p-6 bg-white rounded-lg shadow'}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Versions</option>
            {Array.from(new Set(accounts.map(a => a.version))).map(version => (
              <option key={version} value={version}>{version}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="coa-upload"
            />
            <label
              htmlFor="coa-upload"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </label>
          </div>
        </div>
        {!standalone && (
          <button
            onClick={propOnClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedIds.size} account{selectedIds.size === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center space-x-4">
              <select
                value={bulkAccountType}
                onChange={(e) => setBulkAccountType(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Change account type...</option>
                {ACCOUNT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <button
                onClick={handleBulkUpdateType}
                disabled={!bulkAccountType}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
              >
                Update Type
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={handleSelectAll}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {selectedIds.size === accounts.length - 1 ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAccounts.map((account) => (
              <tr 
                key={account.id}
                className={selectedIds.has(account.id) ? 'bg-indigo-50' : ''}
              >
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleSelection(account.id)}
                    className={`text-gray-500 hover:text-gray-700 ${
                      account.accountNumber === '00000' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={account.accountNumber === '00000'}
                  >
                    {selectedIds.has(account.id) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {account.accountNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {account.accountName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {account.accountType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${account.balance.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingAccount(account)}
                      className="text-indigo-600 hover:text-indigo-900"
                      disabled={account.accountNumber === '00000'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (account.accountNumber === '00000') {
                          alert('The Uncategorized account cannot be deleted.');
                          return;
                        }
                        if (window.confirm('Are you sure you want to delete this account?')) {
                          if (propDeleteAccount) {
                            propDeleteAccount(account.id);
                          } else {
                            updateCompanyData({
                              accounts: accounts.filter(a => a.id !== account.id)
                            });
                          }
                        }
                      }}
                      disabled={account.accountNumber === '00000'}
                      className={`text-red-600 hover:text-red-900 ${
                        account.accountNumber === '00000' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddAccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAccount}
          accountTypes={ACCOUNT_TYPES}
          existingAccounts={accounts}
        />
      )}

      {editingAccount && (
        <AddAccountModal
          isOpen={true}
          onClose={() => setEditingAccount(null)}
          onAdd={(updatedAccount) => {
            if (updatedAccount.accountNumber === '00000') {
              alert('Cannot modify the Uncategorized account');
              return;
            }
            const updatedAccounts = accounts.map(acc =>
              acc.id === updatedAccount.id ? updatedAccount : acc
            ).sort((a, b) => parseInt(a.accountNumber) - parseInt(b.accountNumber));
            updateCompanyData({ accounts: updatedAccounts });
            setEditingAccount(null);
          }}
          accountTypes={ACCOUNT_TYPES}
          existingAccounts={accounts}
          editingAccount={editingAccount}
        />
      )}
    </div>
  );
}

import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { ChartOfAccount } from '../../types/chartOfAccounts';
import { v4 as uuidv4 } from 'uuid';

interface AddReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
  accounts: ChartOfAccount[];
  selectedDate: string;
}

interface EntryPair {
  id: string;
  debit: {
    category: string;
    amount: string;
    description?: string;
  };
  credit: {
    category: string;
    amount: string;
    description?: string;
  };
}

export function AddReconciliationModal({
  isOpen,
  onClose,
  onAdd,
  accounts,
  selectedDate
}: AddReconciliationModalProps) {
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = React.useState('');
  const [entryPairs, setEntryPairs] = React.useState<EntryPair[]>([{
    id: uuidv4(),
    debit: { category: '', amount: '', description: '' },
    credit: { category: '', amount: '', description: '' }
  }]);

  // Group accounts by type for better organization
  const groupedAccounts = React.useMemo(() => {
    const groups: Record<string, ChartOfAccount[]> = {};
    accounts.forEach(account => {
      if (!groups[account.accountType]) {
        groups[account.accountType] = [];
      }
      groups[account.accountType].push(account);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [accounts]);

  const handleAddPair = () => {
    setEntryPairs(prev => [...prev, {
      id: uuidv4(),
      debit: { category: '', amount: '', description: '' },
      credit: { category: '', amount: '', description: '' }
    }]);
  };

  const handleRemovePair = (id: string) => {
    setEntryPairs(prev => prev.filter(pair => pair.id !== id));
  };

  const handleEntryChange = (
    pairId: string, 
    side: 'debit' | 'credit', 
    field: 'category' | 'amount' | 'description', 
    value: string
  ) => {
    setEntryPairs(prev => prev.map(pair => {
      if (pair.id === pairId) {
        // If changing amount, update both debit and credit
        if (field === 'amount') {
          return {
            ...pair,
            debit: { ...pair.debit, amount: value },
            credit: { ...pair.credit, amount: value }
          };
        }
        // Otherwise just update the specified side
        return {
          ...pair,
          [side]: { ...pair[side], [field]: value }
        };
      }
      return pair;
    }));
  };

  const validateEntries = () => {
    for (const pair of entryPairs) {
      if (!pair.debit.category || !pair.credit.category) {
        return false;
      }
      const debitAmount = parseFloat(pair.debit.amount);
      const creditAmount = parseFloat(pair.credit.amount);
      if (isNaN(debitAmount) || isNaN(creditAmount) || debitAmount !== creditAmount) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEntries()) {
      alert('Please ensure all entries are complete and amounts match between debits and credits');
      return;
    }

    entryPairs.forEach(pair => {
      const journalEntryId = uuidv4();
      const amount = parseFloat(pair.debit.amount);

      // Create debit transaction
      const debitTransaction: Transaction = {
        id: uuidv4(),
        date,
        description: pair.debit.description || description || 'Journal Entry',
        amount: Math.abs(amount),
        category: pair.debit.category,
        source: 'reconciliation',
        isJournalEntry: true,
        journalEntryId,
        entryType: 'debit',
        isReconciled: true
      };

      // Create credit transaction
      const creditTransaction: Transaction = {
        id: uuidv4(),
        date,
        description: pair.credit.description || description || 'Journal Entry',
        amount: -Math.abs(amount),
        category: pair.credit.category,
        source: 'reconciliation',
        isJournalEntry: true,
        journalEntryId,
        entryType: 'credit',
        isReconciled: true,
        relatedTransactionId: debitTransaction.id
      };

      // Link the transactions
      debitTransaction.relatedTransactionId = creditTransaction.id;
      debitTransaction.offsetTransactionId = creditTransaction.id;
      debitTransaction.offsetCategory = creditTransaction.category;
      debitTransaction.offsetAmount = creditTransaction.amount;
      debitTransaction.offsetDescription = creditTransaction.description;

      creditTransaction.offsetTransactionId = debitTransaction.id;
      creditTransaction.offsetCategory = debitTransaction.category;
      creditTransaction.offsetAmount = debitTransaction.amount;
      creditTransaction.offsetDescription = debitTransaction.description;

      // Add both transactions
      onAdd(debitTransaction);
      onAdd(creditTransaction);
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Journal Entry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Journal entry description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Entry Pairs</h3>
              <button
                type="button"
                onClick={handleAddPair}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Pair
              </button>
            </div>

            {entryPairs.map((pair, index) => (
              <div key={pair.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">Entry Pair {index + 1}</h4>
                  {entryPairs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePair(pair.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Debit Entry */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700">Debit</h5>
                    <select
                      required
                      value={pair.debit.category}
                      onChange={(e) => handleEntryChange(pair.id, 'debit', 'category', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select account...</option>
                      {groupedAccounts.map(([type, accounts]) => (
                        <optgroup key={type} label={type}>
                          {accounts.map(account => (
                            <option key={account.id} value={account.accountNumber}>
                              {account.accountName} ({account.accountNumber})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={pair.debit.description || ''}
                      onChange={(e) => handleEntryChange(pair.id, 'debit', 'description', e.target.value)}
                      placeholder="Description (optional)"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={pair.debit.amount}
                        onChange={(e) => handleEntryChange(pair.id, 'debit', 'amount', e.target.value)}
                        className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Credit Entry */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700">Credit</h5>
                    <select
                      required
                      value={pair.credit.category}
                      onChange={(e) => handleEntryChange(pair.id, 'credit', 'category', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select account...</option>
                      {groupedAccounts.map(([type, accounts]) => (
                        <optgroup key={type} label={type}>
                          {accounts.map(account => (
                            <option key={account.id} value={account.accountNumber}>
                              {account.accountName} ({account.accountNumber})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={pair.credit.description || ''}
                      onChange={(e) => handleEntryChange(pair.id, 'credit', 'description', e.target.value)}
                      placeholder="Description (optional)"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={pair.credit.amount}
                        onChange={(e) => handleEntryChange(pair.id, 'credit', 'amount', e.target.value)}
                        className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

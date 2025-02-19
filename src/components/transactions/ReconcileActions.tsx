import React from 'react';
import { CreditCard, RotateCcw } from 'lucide-react';
import { ChartOfAccount } from '../../types/chartOfAccounts';

interface ReconcileActionsProps {
  selectedIds: Set<string>;
  onReconcile: (category: string, type: 'debit' | 'credit', description: string) => void;
  onUndo?: () => void;
  accounts: ChartOfAccount[];
  totalAmount: number;
  hasReconciledItems: boolean;
}

export function ReconcileActions({ 
  selectedIds, 
  onReconcile,
  onUndo,
  accounts,
  totalAmount,
  hasReconciledItems
}: ReconcileActionsProps) {
  const [showReconcileActions, setShowReconcileActions] = React.useState(true);
  const [category, setCategory] = React.useState('');
  const [type, setType] = React.useState<'debit' | 'credit'>('credit');
  const [error, setError] = React.useState<string | null>(null);

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

  const handleReconcile = () => {
    if (!category) {
      setError('Please select an account');
      return;
    }

    // Generate a standard description
    const description = `Bulk reconciliation - ${type} entry`;
    onReconcile(category, type, description);
    setCategory('');
    setType('credit');
    setError(null);
  };

  const handleUndo = () => {
    if (onUndo && window.confirm('Are you sure you want to undo the reconciliation for the selected transactions?')) {
      onUndo();
    }
  };

  if (!showReconcileActions || selectedIds.size === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-white border-t border-gray-200">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {selectedIds.size} transaction{selectedIds.size === 1 ? '' : 's'} selected
          </span>
          
          {hasReconciledItems ? (
            <button
              onClick={handleUndo}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Undo Reconciliation
            </button>
          ) : (
            <>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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

              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'debit' | 'credit')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>

              <button
                onClick={handleReconcile}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Reconcile
              </button>
            </>
          )}

          {error && (
            <span className="text-sm text-red-600">{error}</span>
          )}
        </div>

        <button
          onClick={() => {
            selectedIds.clear();
            setShowReconcileActions(false);
          }}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

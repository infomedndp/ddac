import React from 'react';
import { CreditCard, CheckSquare, Square } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { ChartOfAccount } from '../../types/chartOfAccounts';

interface ReconciliationListProps {
  transactions: Transaction[];
  accounts: ChartOfAccount[];
  onTransactionClick: (transaction: Transaction) => void;
  onDeleteTransactions: (transactionIds: string[]) => void;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

export function ReconciliationList({ 
  transactions, 
  accounts, 
  onTransactionClick,
  selectedIds,
  onToggleSelection,
  onSelectAll
}: ReconciliationListProps) {
  // Group related transactions together
  const groupedTransactions = React.useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    
    transactions.forEach(tx => {
      if (tx.journalEntryId) {
        // Group journal entries
        const group = groups.get(tx.journalEntryId) || [];
        groups.set(tx.journalEntryId, [...group, tx]);
      } else if (tx.relatedTransactionId) {
        // Group reconciliation entries
        const mainTx = transactions.find(t => t.id === tx.relatedTransactionId);
        if (mainTx) {
          const groupId = mainTx.id;
          const group = groups.get(groupId) || [];
          if (!group.includes(mainTx)) {
            group.push(mainTx);
          }
          group.push(tx);
          groups.set(groupId, group);
        }
      } else if (!transactions.some(t => t.relatedTransactionId === tx.id)) {
        // Standalone transactions
        groups.set(tx.id, [tx]);
      }
    });

    return Array.from(groups.values());
  }, [transactions]);

  const handleSelectAll = () => {
    const availableIds = transactions
      .filter(tx => !tx.relatedTransactionId)
      .map(tx => tx.id);
    onSelectAll(availableIds);
  };

  const getAccountName = (accountNumber?: string) => {
    if (!accountNumber) return 'Uncategorized';
    const account = accounts.find(a => a.accountNumber === accountNumber);
    return account ? account.accountName : 'Unknown Account';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <button
                onClick={handleSelectAll}
                className="text-gray-500 hover:text-gray-700"
              >
                {selectedIds.size === groupedTransactions.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Account
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Debit
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Credit
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groupedTransactions.map((group) => {
            const mainTx = group[0];
            const relatedTx = group[1];
            const isReconciled = group.length > 1;

            return (
              <tr key={mainTx.id} className={`group ${isReconciled ? 'bg-gray-50' : ''}`}>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleSelection(mainTx.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {selectedIds.has(mainTx.id) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(mainTx.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>{mainTx.description}</div>
                  {relatedTx && (
                    <div className="text-xs text-gray-500 mt-1">
                      ↳ {relatedTx.description || `Offset entry`}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>{getAccountName(mainTx.category)}</div>
                  {relatedTx && (
                    <div className="text-xs text-gray-500 mt-1">
                      ↳ {getAccountName(relatedTx.category)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {group.map((tx, index) => (
                    <div key={tx.id} className={index > 0 ? 'text-xs text-gray-500 mt-1' : ''}>
                      {tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : '-'}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {group.map((tx, index) => (
                    <div key={tx.id} className={index > 0 ? 'text-xs text-gray-500 mt-1' : ''}>
                      {tx.amount < 0 ? `$${Math.abs(tx.amount).toFixed(2)}` : '-'}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onTransactionClick(mainTx)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title={isReconciled ? "Edit offset entry" : "Add offset entry"}
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

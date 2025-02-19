import React from 'react';
import { X, AlertCircle, Trash2 } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { useCompany } from '../../context/CompanyContext';

interface DuplicateCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

interface DuplicateGroup {
  transactions: Transaction[];
  amount: number;
  description: string;
  month: string;
}

export function DuplicateChecker({ isOpen, onClose, transactions }: DuplicateCheckerProps) {
  const { companyData, updateCompanyData } = useCompany();
  const [duplicates, setDuplicates] = React.useState<DuplicateGroup[]>([]);

  React.useEffect(() => {
    // Group transactions by month
    const monthGroups = transactions.reduce((groups, tx) => {
      const month = new Date(tx.date).toISOString().slice(0, 7); // YYYY-MM format
      if (!groups[month]) groups[month] = [];
      groups[month].push(tx);
      return groups;
    }, {} as Record<string, Transaction[]>);

    // Find duplicates within each month
    const duplicateGroups: DuplicateGroup[] = [];
    
    Object.entries(monthGroups).forEach(([month, monthTransactions]) => {
      // Create a map of amount+description to track potential duplicates
      const potentialDuplicates = new Map<string, Transaction[]>();
      
      monthTransactions.forEach(tx => {
        const key = `${tx.amount}-${tx.description.toLowerCase().trim()}`;
        const existing = potentialDuplicates.get(key) || [];
        potentialDuplicates.set(key, [...existing, tx]);
      });

      // Add groups with more than one transaction
      potentialDuplicates.forEach((txs, key) => {
        if (txs.length > 1) {
          const [amount, description] = key.split('-');
          duplicateGroups.push({
            transactions: txs,
            amount: parseFloat(amount),
            description,
            month
          });
        }
      });
    });

    setDuplicates(duplicateGroups);
  }, [transactions]);

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      // Get the transaction to be deleted
      const transactionToDelete = transactions.find(tx => tx.id === id);
      
      if (transactionToDelete && transactionToDelete.category && transactionToDelete.category !== 'Uncategorized') {
        // Find the account and update its balance
        const accounts = [...(companyData?.accounts || [])];
        const accountIndex = accounts.findIndex(acc => acc.accountNumber === transactionToDelete.category);
        
        if (accountIndex !== -1) {
          accounts[accountIndex] = {
            ...accounts[accountIndex],
            balance: accounts[accountIndex].balance - transactionToDelete.amount
          };
        }

        // Update both transactions and accounts
        updateCompanyData({
          ...companyData,
          transactions: transactions.filter(tx => tx.id !== id),
          accounts
        });
      } else {
        // Just update transactions if no category or uncategorized
        updateCompanyData({
          ...companyData,
          transactions: transactions.filter(tx => tx.id !== id)
        });
      }

      // Update local state to remove the deleted transaction
      setDuplicates(prevDuplicates => 
        prevDuplicates.map(group => ({
          ...group,
          transactions: group.transactions.filter(tx => tx.id !== id)
        })).filter(group => group.transactions.length > 1)
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Duplicate Transaction Checker</h2>
            <p className="mt-1 text-sm text-gray-500">
              Found {duplicates.length} potential duplicate groups
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {duplicates.length > 0 ? (
            <div className="space-y-6">
              {duplicates.map((group, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-medium">
                      {group.transactions.length} potential duplicates found in {new Date(group.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Amount: ${Math.abs(group.amount).toFixed(2)}</p>
                    <p>Description: {group.description}</p>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{tx.description}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            ${Math.abs(tx.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-center">
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete duplicate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Duplicates Found</h3>
              <p className="mt-2 text-sm text-gray-500">
                All transactions appear to be unique within their respective months.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

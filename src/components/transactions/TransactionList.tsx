import React from 'react';
import { Search, PenTool, Upload, Edit2, ScanSearch, EyeOff, Eye, Printer, Book } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { ChartOfAccount } from '../../types/chartOfAccounts';
import { EditHistoryPopover } from './EditHistoryPopover';
import { useReactToPrint } from 'react-to-print';
import { useCompany } from '../../context/CompanyContext';

interface TransactionListProps {
  transactions: Transaction[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onUpdateCategory: (txId: string, category: string, amount: number) => void;
  accounts: ChartOfAccount[];
  onEditTransaction?: (transaction: Transaction) => void;
  onCheckDuplicates?: () => void;
  onExcludeTransaction?: (txId: string) => void;
}

export function TransactionList({ 
  transactions: allTransactions, 
  selectedIds, 
  onToggleSelection, 
  onSelectAll,
  onUpdateCategory,
  accounts = [],
  onEditTransaction,
  onCheckDuplicates,
  onExcludeTransaction
}: TransactionListProps) {
  const { selectedCompany, updateCompanyData, companyData } = useCompany();
  const [searchTerm, setSearchTerm] = React.useState('');
  const printRef = React.useRef<HTMLDivElement>(null);
  const [showRulesModal, setShowRulesModal] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedText, setSelectedText] = React.useState('');

  // Filter out reconciliation entries and journal entries
  const transactions = allTransactions.filter(tx => 
    tx.source !== 'reconciliation' && !tx.isJournalEntry
  );

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(tx => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        
        // Check if search term is an amount (starts with $)
        if (searchTerm.startsWith('$')) {
          const searchAmount = parseFloat(searchTerm.substring(1));
          if (!isNaN(searchAmount)) {
            return Math.abs(tx.amount) === searchAmount;
          }
        }
        
        // Regular description search
        return tx.description.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [transactions, searchTerm]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Transactions_List',
    pageStyle: `
      @media print {
        body { padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
        th { background-color: #f3f4f6 !important; }
        @-moz-document url-prefix() {
          th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .no-print { display: none !important; }
      }
    `
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectAll(filteredTransactions.map(tx => tx.id));
    } else {
      onSelectAll([]);
    }
  };

  const handleExclude = (txId: string) => {
    if (onExcludeTransaction) {
      onExcludeTransaction(txId);
    }
  };

  // Sort accounts by number and filter out duplicates
  const sortedAccounts = React.useMemo(() => {
    const accountsWithoutUncategorized = accounts.filter(acc => acc.accountNumber !== '00000');
    return accountsWithoutUncategorized.sort((a, b) => {
      const numA = parseInt(a.accountNumber);
      const numB = parseInt(b.accountNumber);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.accountNumber.localeCompare(b.accountNumber);
    });
  }, [accounts]);

  const handleRulesClick = () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) {
      alert('Please select text from a transaction description first');
      return;
    }
    setSelectedText(selection.toString().trim());
    setShowRulesModal(true);
  };

  const handleAddToRules = async () => {
    if (!selectedText || !selectedCategory) return;

    try {
      const currentRules = companyData?.categoryRules || [];
      const existingRule = currentRules.find(rule => rule.category === selectedCategory);

      let updatedRules;
      if (existingRule) {
        // Add pattern to existing rule if it doesn't already exist
        if (!existingRule.patterns.includes(selectedText)) {
          updatedRules = currentRules.map(rule =>
            rule.category === selectedCategory
              ? { ...rule, patterns: [...rule.patterns, selectedText] }
              : rule
          );
        } else {
          alert('This pattern already exists for the selected category');
          return;
        }
      } else {
        // Create new rule
        updatedRules = [...currentRules, {
          id: `rule-${Date.now()}`,
          category: selectedCategory,
          patterns: [selectedText]
        }];
      }

      await updateCompanyData({
        categoryRules: updatedRules
      });

      setShowRulesModal(false);
      setSelectedCategory('');
      setSelectedText('');
      window.getSelection()?.removeAllRanges(); // Clear selection
    } catch (error) {
      console.error('Error updating category rules:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions by description or amount (e.g. $123.45)..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={onCheckDuplicates}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600"
            title="Check for duplicate transactions"
          >
            <ScanSearch className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleRulesClick}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          title="Add selected text to rules"
        >
          <Book className="w-4 h-4" />
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          title="Print transactions"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div ref={printRef}>
          <div className="print-only hidden p-6">
            <h1 className="text-2xl font-bold text-center">{selectedCompany?.name}</h1>
            <p className="text-center text-gray-600 mt-2">Transaction List</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 no-print">
                  <input
                    type="checkbox"
                    checked={filteredTransactions.length > 0 && selectedIds.size === filteredTransactions.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 no-print">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className={selectedIds.has(tx.id) ? 'bg-indigo-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap no-print">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(tx.id)}
                      onChange={() => onToggleSelection(tx.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(new Date(tx.date).getTime() + 86400000).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tx.description}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={tx.category || '00000'}
                      onChange={(e) => onUpdateCategory(tx.id, e.target.value, tx.amount)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="00000">Uncategorized</option>
                      {sortedAccounts.map(account => (
                        <option key={account.id} value={account.accountNumber}>
                          {account.accountName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right no-print">
                    <div className="flex justify-end space-x-2">
                      {tx.editHistory && tx.editHistory.length > 0 && (
                        <EditHistoryPopover editHistory={tx.editHistory} />
                      )}
                      <button
                        onClick={() => onEditTransaction?.(tx)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExclude(tx.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title={tx.excluded ? "Restore transaction" : "Exclude transaction"}
                      >
                        {tx.excluded ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Rule for Selected Text
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Selected Text
                </label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm text-gray-900">
                  {selectedText}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a category...</option>
                  {sortedAccounts.map(account => (
                    <option key={account.id} value={account.accountNumber}>
                      {account.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRulesModal(false);
                    setSelectedCategory('');
                    setSelectedText('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToRules}
                  disabled={!selectedCategory}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  Add Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
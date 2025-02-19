import React from 'react';
import { Trash2, X, Wand2, EyeOff } from 'lucide-react';
import { CategoryRule } from '../../types/transactions';
import { useCompany } from '../../context/CompanyContext';
import { sendToMakeWebhook } from '../../utils/makeIntegration';

interface BulkActionsProps {
  selectedIds: Set<string>;
  onCategorize: (category: string) => void;
  onDelete: () => void;
  onExclude: () => void;
  categoryRules: CategoryRule[];
}

export function BulkActions({ 
  selectedIds, 
  onCategorize, 
  onDelete,
  onExclude,
  categoryRules 
}: BulkActionsProps) {
  const { companyData, selectedCompany } = useCompany();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showBulkActions, setShowBulkActions] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleAutoCategorizeBulk = async () => {
    if (selectedIds.size === 0 || !selectedCompany?.id) {
      setError('No transactions selected');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);

      const transactions = companyData?.transactions || [];
      const selectedTransactions = transactions.filter(tx => selectedIds.has(tx.id));
      
      const currentRules = companyData?.categoryRules || [];

      if (selectedTransactions.length === 0) {
        setError('No transactions selected');
        return;
      }

      if (currentRules.length === 0) {
        setError('No category rules defined. Please add some rules first.');
        return;
      }

      await sendToMakeWebhook(
        selectedTransactions, 
        currentRules,
        selectedCompany.id
      );

      selectedIds.clear();
      setShowBulkActions(false);

    } catch (error) {
      console.error('Auto-categorization failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to auto-categorize transactions');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!showBulkActions || selectedIds.size === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-white border-t border-gray-200">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {selectedIds.size} transaction{selectedIds.size === 1 ? '' : 's'} selected
          </span>
          
          <select
            onChange={(e) => onCategorize(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Categorize as...</option>
            <option value="Uncategorized" className="text-red-600">
              ⟲ Remove Category
            </option>
            <option disabled>──────────</option>
            {companyData?.accounts?.map(account => (
              <option key={account.id} value={account.accountNumber}>
                {account.accountName}
              </option>
            ))}
          </select>

          <button
            onClick={handleAutoCategorizeBulk}
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            <Wand2 className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Processing...' : 'Auto Categorize'}
          </button>

          <button
            onClick={onExclude}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Exclude
          </button>

          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>

          {error && (
            <span className="text-sm text-red-600">{error}</span>
          )}
        </div>

        <button
          onClick={() => {
            selectedIds.clear();
            setShowBulkActions(false);
          }}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

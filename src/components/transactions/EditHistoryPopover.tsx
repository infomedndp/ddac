import React from 'react';
import { History } from 'lucide-react';
import { TransactionEdit } from '../../types/transactions';

interface EditHistoryPopoverProps {
  editHistory: TransactionEdit[];
}

export function EditHistoryPopover({ editHistory }: EditHistoryPopoverProps) {
  const [showModal, setShowModal] = React.useState(false);

  const formatValue = (value: any, field: string) => {
    if (value === undefined || value === null) return 'N/A';

    switch (field) {
      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return 'Invalid Date';
        }
      case 'amount':
        const amount = Number(value);
        return isNaN(amount) ? 'Invalid Amount' : `$${Math.abs(amount).toFixed(2)}`;
      case 'category':
        return value || 'Uncategorized';
      case 'description':
        return value || 'No description';
      default:
        return String(value);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'date':
        return 'Date';
      case 'description':
        return 'Description';
      case 'amount':
        return 'Amount';
      case 'category':
        return 'Category';
      default:
        return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  const renderChanges = (edit: TransactionEdit) => {
    if (!edit || !edit.changes) return null;

    // Get all fields that have changes
    const changedFields = Object.entries(edit.changes).filter(([_, change]) => 
      change && change.from !== change.to
    );

    if (changedFields.length === 0) return null;

    return (
      <div key={edit.id} className="mb-4 last:mb-0 border-b border-gray-200 pb-4">
        <div className="text-xs text-gray-500 mb-2 font-medium">
          {formatTimestamp(edit.timestamp)}
        </div>
        {changedFields.map(([field, change]) => (
          <div key={field} className="text-sm mb-3">
            <div className="font-medium mb-1 text-gray-700">
              {getFieldLabel(field)}:
            </div>
            <div className="pl-4 space-y-1">
              <div className="text-red-600 flex items-center">
                <span className="w-16 text-xs text-gray-500">Old:</span>
                {formatValue(change.from, field)}
              </div>
              <div className="text-green-600 flex items-center">
                <span className="w-16 text-xs text-gray-500">New:</span>
                {formatValue(change.to, field)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="inline-flex items-center relative">
      <button
        className="text-gray-500 hover:text-gray-700"
        onClick={() => setShowModal(true)}
        title="View edit history"
      >
        <History className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit History</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {editHistory && editHistory.length > 0 ? (
                editHistory.map(edit => renderChanges(edit))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No edit history available
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

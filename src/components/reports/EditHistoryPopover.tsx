import React from 'react';
import { History } from 'lucide-react';
import { TransactionEdit } from '../../types/transactions';

interface EditHistoryPopoverProps {
  history: TransactionEdit[];
}

export function EditHistoryPopover({ history }: EditHistoryPopoverProps) {
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
        return typeof value === 'number' ? `$${Math.abs(value).toFixed(2)}` : 'Invalid Amount';
      case 'category':
        return value || 'Uncategorized';
      default:
        return String(value);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="inline-flex items-center relative">
      <button
        onClick={() => setShowModal(true)}
        className="text-gray-500 hover:text-gray-700"
        title="View edit history"
      >
        <History className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
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
              {history.map((edit) => (
                <div key={edit.id} className="mb-4 last:mb-0 border-b border-gray-200 pb-4">
                  <div className="text-xs text-gray-500 mb-2">
                    {formatTimestamp(edit.timestamp)}
                  </div>
                  {Object.entries(edit.changes).map(([field, change]) => (
                    change && (
                      <div key={field} className="text-sm mb-3">
                        <div className="font-medium mb-1 capitalize text-gray-700">
                          {field}:
                        </div>
                        <div className="pl-4 space-y-1">
                          <div className="text-red-600">
                            Old: {formatValue(change.from, field)}
                          </div>
                          <div className="text-green-600">
                            New: {formatValue(change.to, field)}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ))}
              {history.length === 0 && (
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
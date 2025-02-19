import React from 'react';
import { History } from 'lucide-react';
import { InvoiceEdit } from '../../types/invoice';

interface InvoiceEditHistoryProps {
  editHistory: InvoiceEdit[];
}

export function InvoiceEditHistory({ editHistory }: InvoiceEditHistoryProps) {
  const [showModal, setShowModal] = React.useState(false);

  const formatValue = (value: any, field: string) => {
    if (!value) return 'N/A';

    if (field === 'date' || field === 'dueDate') {
      return new Date(value).toLocaleDateString();
    }
    
    if (field === 'items') {
      try {
        const items = Array.isArray(value) ? value : [];
        return items.map(item => {
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
          const rate = typeof item.rate === 'string' ? parseFloat(item.rate) : 
                      typeof item.rate === 'number' ? item.rate : 0;
          return `${item.description || 'No description'} (${quantity} × $${rate.toFixed(2)})`;
        }).join(', ');
      } catch (error) {
        console.error('Error formatting items:', error);
        return 'Invalid items format';
      }
    }

    if (field === 'taxRate') {
      const rate = typeof value === 'string' ? parseFloat(value) : 
                  typeof value === 'number' ? value : 0;
      return `${rate.toFixed(2)}%`;
    }

    return String(value);
  };

  const renderChanges = (edit: InvoiceEdit) => (
    <div key={edit.timestamp} className="mb-4 last:mb-0">
      <div className="text-xs text-gray-500 mb-1">
        {new Date(edit.timestamp).toLocaleString()}
      </div>
      {edit.changes.map((change, index) => (
        <div key={index} className="text-sm mb-2">
          <div className="font-medium capitalize mb-1">{change.field}:</div>
          <div className="pl-4">
            <div className="text-red-600">
              Old: {formatValue(change.oldValue, change.field)}
            </div>
            <div className="text-green-600">
              New: {formatValue(change.newValue, change.field)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit History</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {editHistory.map(edit => renderChanges(edit))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

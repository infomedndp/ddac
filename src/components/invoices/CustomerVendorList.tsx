import React from 'react';
import { Search, UserPlus, Building2, Edit2, Trash2 } from 'lucide-react';
import { Customer, Vendor } from '../../types/customer';
import { CustomerVendorModal } from './CustomerVendorModal';

interface CustomerVendorListProps {
  type: 'customer' | 'vendor';
  items: (Customer | Vendor)[];
  onSelect?: (item: Customer | Vendor) => void;
  onSave: (item: Customer | Vendor) => void;
  onDelete?: (id: string) => void;
  onClose?: () => void;
}

export function CustomerVendorList({ type, items, onSelect, onSave, onDelete, onClose }: CustomerVendorListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Customer | Vendor | null>(null);

  const filteredItems = React.useMemo(() => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(term) ||
      item.email?.toLowerCase().includes(term) ||
      item.phone?.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const handleDelete = (id: string) => {
    if (onDelete && window.confirm('Are you sure you want to delete this item?')) {
      onDelete(id);
    }
  };

  const handleSave = (item: Customer | Vendor) => {
    onSave(item);
    setShowAddModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-medium text-gray-900">
            {type === 'customer' ? 'Customers' : 'Vendors'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Add {type === 'customer' ? 'Customer' : 'Vendor'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${type === 'customer' ? 'customers' : 'vendors'}...`}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {filteredItems.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className="py-4 flex items-center justify-between hover:bg-gray-50 px-4 rounded-lg"
            >
              <div 
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => onSelect && onSelect(item)}
              >
                <Building2 className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  {item.email && (
                    <p className="text-sm text-gray-500">{item.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.phone && (
                  <p className="text-sm text-gray-500 mr-4">{item.phone}</p>
                )}
                <button
                  onClick={() => setEditingItem(item)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            No {type === 'customer' ? 'customers' : 'vendors'} found
          </p>
        </div>
      )}

      {(showAddModal || editingItem) && (
        <CustomerVendorModal
          type={type}
          item={editingItem}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

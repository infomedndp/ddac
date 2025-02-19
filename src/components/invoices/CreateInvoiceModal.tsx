import React from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { v4 as uuidv4 } from 'uuid';

interface CreateInvoiceModalProps {
  type: 'in' | 'out';
  onClose: () => void;
  onSave: (invoice: any) => void;
}

export function CreateInvoiceModal({ type, onClose, onSave }: CreateInvoiceModalProps) {
  const { companyData } = useCompany();
  const customers = Array.isArray(companyData?.customers) ? companyData.customers : [];
  const vendors = Array.isArray(companyData?.vendors) ? companyData.vendors : [];

  const [formData, setFormData] = React.useState({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '',
    vendorId: '',
    items: [{ id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }],
    notes: '',
    taxEnabled: false,
    taxRate: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    customerVendorInfo: {} as any,
    selectedCustomerVendorId: ''
  });

  const handleCustomerVendorSelect = (item: any) => {
    setFormData(prev => ({
      ...prev,
      [type === 'out' ? 'customerId' : 'vendorId']: item.id,
      customerVendorInfo: item
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => 
        sum + (item.quantity * parseFloat(item.rate || 0)), 0
      );
      const taxAmount = prev.taxEnabled ? (subtotal * (prev.taxRate / 100)) : 0;
      const total = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        tax: taxAmount,
        total
      };
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { 
        ...newItems[index], 
        [field]: value,
        amount: field === 'quantity' || field === 'rate' 
          ? (newItems[index].quantity || 0) * (parseFloat(newItems[index].rate) || 0)
          : newItems[index].amount
      };
      
      const subtotal = newItems.reduce((sum, item) => 
        sum + (item.quantity * parseFloat(item.rate || 0)), 0
      );
      const taxAmount = prev.taxEnabled ? (subtotal * (prev.taxRate / 100)) : 0;
      const total = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        tax: taxAmount,
        total
      };
    });
  };

  const handleTaxChange = (enabled: boolean) => {
    setFormData(prev => {
      const subtotal = prev.items.reduce((sum, item) => 
        sum + (item.quantity * parseFloat(item.rate || 0)), 0
      );
      const taxAmount = enabled ? (subtotal * (prev.taxRate / 100)) : 0;
      const total = subtotal + taxAmount;

      return {
        ...prev,
        taxEnabled: enabled,
        tax: taxAmount,
        total
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create {type === 'out' ? 'Customer Invoice' : 'Vendor Bill'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {type === 'out' ? 'Customer' : 'Vendor'}
              </label>
              <select
                value={type === 'out' ? formData.customerId : formData.vendorId}
                onChange={(e) => {
                  const selected = type === 'out' 
                    ? customers.find(c => c.id === e.target.value)
                    : vendors.find(v => v.id === e.target.value);
                  if (selected) {
                    handleCustomerVendorSelect(selected);
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select {type === 'out' ? 'Customer' : 'Vendor'}</option>
                {(type === 'out' ? customers : vendors).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    placeholder="Qty"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                    placeholder="Rate"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1 text-right">
                  ${(item.quantity * parseFloat(item.rate || '0')).toFixed(2)}
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${formData.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.taxEnabled}
                    onChange={(e) => handleTaxChange(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">Enable Tax</span>
                </label>
                {formData.taxEnabled && (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.taxRate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      taxRate: parseFloat(e.target.value),
                      tax: prev.subtotal * (parseFloat(e.target.value) / 100),
                      total: prev.subtotal * (1 + parseFloat(e.target.value) / 100)
                    }))}
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                )}
              </div>

              {formData.taxEnabled && (
                <div className="flex justify-between">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>${formData.tax.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-4">
                <span>Total:</span>
                <span>${formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
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
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

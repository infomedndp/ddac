import React from 'react';
import { Plus } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoiceList } from './InvoiceList';
import { CustomerVendorList } from './CustomerVendorList';
import { Customer, Vendor } from '../../types/customer';
import { v4 as uuidv4 } from 'uuid';

interface InvoiceManagerProps {
  type: 'in' | 'out';
}

export function InvoiceManager({ type }: InvoiceManagerProps) {
  const { companyData, updateCompanyData } = useCompany();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showCustomerVendorList, setShowCustomerVendorList] = React.useState(false);

  // Initialize arrays with default empty arrays if undefined
  const customers = Array.isArray(companyData?.customers) ? companyData.customers : [];
  const vendors = Array.isArray(companyData?.vendors) ? companyData.vendors : [];
  const invoices = Array.isArray(companyData?.invoices) ? companyData.invoices.filter(inv => inv.type === type) : [];

  const handleSaveCustomerVendor = (item: Customer | Vendor) => {
    const isEditing = type === 'out' 
      ? customers.some(existing => existing.id === item.id)
      : vendors.some(existing => existing.id === item.id);
    
    if (type === 'out') {
      // For outgoing invoices, we're dealing with customers
      const updatedCustomers = isEditing
        ? customers.map(c => c.id === item.id ? item : c)
        : [...customers, { ...item, id: item.id || uuidv4() }];
      
      updateCompanyData({
        ...companyData,
        customers: updatedCustomers
      });
    } else {
      // For incoming invoices, we're dealing with vendors
      const updatedVendors = isEditing
        ? vendors.map(v => v.id === item.id ? item : v)
        : [...vendors, { ...item, id: item.id || uuidv4() }];
      
      updateCompanyData({
        ...companyData,
        vendors: updatedVendors
      });
    }
  };

  const handleDeleteCustomerVendor = (id: string) => {
    if (type === 'out') {
      updateCompanyData({
        ...companyData,
        customers: customers.filter(c => c.id !== id)
      });
    } else {
      updateCompanyData({
        ...companyData,
        vendors: vendors.filter(v => v.id !== id)
      });
    }
  };

  const handleCreateInvoice = (invoice: any) => {
    const newInvoice = {
      ...invoice,
      id: uuidv4(),
      type,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    updateCompanyData({
      ...companyData,
      invoices: [...(companyData?.invoices || []), newInvoice]
    });

    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {type === 'out' ? 'Customer Invoices' : 'Vendor Bills'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {type === 'out' ? 'Manage outgoing invoices' : 'Manage incoming bills'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCustomerVendorList(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {type === 'out' ? 'Manage Customers' : 'Manage Vendors'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {type === 'out' ? 'Create Invoice' : 'Enter Bill'}
          </button>
        </div>
      </header>

      <InvoiceList 
        type={type}
        invoices={invoices}
        customers={customers}
        vendors={vendors}
      />

      {showCreateModal && (
        <CreateInvoiceModal
          type={type}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateInvoice}
          customers={customers}
          vendors={vendors}
        />
      )}

      {showCustomerVendorList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <CustomerVendorList
              type={type === 'out' ? 'customer' : 'vendor'}
              items={type === 'out' ? customers : vendors}
              onSave={handleSaveCustomerVendor}
              onDelete={handleDeleteCustomerVendor}
              onClose={() => setShowCustomerVendorList(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

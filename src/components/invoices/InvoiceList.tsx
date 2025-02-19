import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { ViewInvoiceModal } from './ViewInvoiceModal';
import { EditInvoiceModal } from './EditInvoiceModal';
import { Invoice } from '../../types/invoice';

interface InvoiceListProps {
  type: 'in' | 'out';
  onClose: () => void;
}

export function InvoiceList({ type, onClose }: InvoiceListProps) {
  const { companyData, updateCompanyData } = useCompany();
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [showViewModal, setShowViewModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  // Filter invoices by type
  const invoices = React.useMemo(() => {
    return (companyData?.invoices || []).filter(invoice => invoice.type === type);
  }, [companyData?.invoices, type]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowEditModal(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      const allInvoices = companyData?.invoices || [];
      updateCompanyData({
        invoices: allInvoices.filter(inv => inv.id !== invoiceId)
      });
    }
  };

  const handleSaveEdit = (updatedInvoice: Invoice) => {
    const allInvoices = companyData?.invoices || [];
    updateCompanyData({
      invoices: allInvoices.map(inv => 
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      )
    });
  };

  const getPartyName = (invoice: Invoice) => {
    const customers = companyData?.customers || [];
    const vendors = companyData?.vendors || [];
    
    if (type === 'out') {
      const customer = customers.find(c => c.id === invoice.customerId);
      return customer?.name || 'Unknown Customer';
    } else {
      const vendor = vendors.find(v => v.id === invoice.vendorId);
      return vendor?.name || 'Unknown Vendor';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {type === 'out' ? 'Invoice' : 'Bill'} Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {type === 'out' ? 'Customer' : 'Vendor'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getPartyName(invoice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(invoice.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${invoice.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewInvoice(invoice)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditInvoice(invoice)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                No {type === 'out' ? 'invoices' : 'bills'} found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showViewModal && selectedInvoice && (
        <ViewInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowViewModal(false);
            setSelectedInvoice(null);
          }}
          type={type}
        />
      )}

      {showEditModal && selectedInvoice && (
        <EditInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowEditModal(false);
            setSelectedInvoice(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

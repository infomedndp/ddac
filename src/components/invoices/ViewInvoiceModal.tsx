import React from 'react';
import { X, Printer } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useReactToPrint } from 'react-to-print';

interface ViewInvoiceModalProps {
  invoice: any;
  onClose: () => void;
  type: 'in' | 'out';
}

export function ViewInvoiceModal({ invoice, onClose, type }: ViewInvoiceModalProps) {
  const { selectedCompany } = useCompany();
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice_${invoice.invoiceNumber}`,
  });

  const PrintableInvoice = React.forwardRef<HTMLDivElement>((_, ref) => (
    <div ref={ref} className="p-8 bg-white">
      {/* Company Info */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{selectedCompany?.name}</h1>
        {selectedCompany?.address && (
          <p className="text-gray-600">
            {selectedCompany.address}<br />
            {selectedCompany.city}, {selectedCompany.state} {selectedCompany.zipCode}
          </p>
        )}
        {selectedCompany?.phone && <p className="text-gray-600">Phone: {selectedCompany.phone}</p>}
        {selectedCompany?.email && <p className="text-gray-600">Email: {selectedCompany.email}</p>}
      </div>

      {/* Invoice Details */}
      <div className="mb-8 flex justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {type === 'out' ? 'Bill To:' : 'From:'}
          </h2>
          <p className="text-gray-800 font-medium">
            {type === 'out' ? invoice.customerInfo?.name : invoice.vendorInfo?.name}
          </p>
          {((type === 'out' ? invoice.customerInfo : invoice.vendorInfo)?.address) && (
            <p className="text-gray-600">
              {(type === 'out' ? invoice.customerInfo : invoice.vendorInfo)?.address}<br />
              {(type === 'out' ? invoice.customerInfo : invoice.vendorInfo)?.city}, {' '}
              {(type === 'out' ? invoice.customerInfo : invoice.vendorInfo)?.state} {' '}
              {(type === 'out' ? invoice.customerInfo : invoice.vendorInfo)?.zipCode}
            </p>
          )}
          {(type === 'out' ? invoice.customerInfo?.email : invoice.vendorInfo?.email) && (
            <p className="text-gray-600">
              Email: {(type === 'out' ? invoice.customerInfo : invoice.vendorInfo)?.email}
            </p>
          )}
          {(type === 'out' ? invoice.customerInfo?.phone : invoice.vendorInfo?.phone) && (
            <p className="text-gray-600">
              Phone: {(type === 'out' ? invoice.customerInfo : invoice.vendorInfo)?.phone}
            </p>
          )}
        </div>
        <div className="text-right">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Invoice</h3>
          <p className="text-gray-600">Invoice #: {invoice.invoiceNumber}</p>
          <p className="text-gray-600">Date: {new Date(invoice.date).toLocaleDateString()}</p>
          <p className="text-gray-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Quantity</th>
            <th className="text-right py-2">Rate</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item: any, index: number) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="py-2">{item.description}</td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">${Number(item.rate).toFixed(2)}</td>
              <td className="text-right py-2">${(item.quantity * item.rate).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.taxEnabled && invoice.taxRate > 0 && (
            <div className="flex justify-between mb-2">
              <span className="font-medium">Tax ({invoice.taxRate}%):</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-gray-900 pt-2">
            <span className="font-bold">Total:</span>
            <span className="font-bold">${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-8 text-gray-600">
          <h4 className="font-bold mb-2">Notes:</h4>
          <p>{invoice.notes}</p>
        </div>
      )}
    </div>
  ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Invoice #{invoice.invoiceNumber}</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div style={{ display: 'none' }}>
            <PrintableInvoice ref={printRef} />
          </div>
          <PrintableInvoice />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Download, Printer } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { DateRangeSelector } from './DateRangeSelector';
import { ViewInvoiceModal } from '../invoices/ViewInvoiceModal';
import { Invoice } from '../../types/invoice';
import { reportDates } from '../../utils/dates';

export function AccountsReceivable() {
  const { companyData } = useCompany();
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [dateRange, setDateRange] = React.useState({
    startDate: reportDates.startOfYear(reportDates.today()),
    endDate: reportDates.today()
  });

  // Ensure we have arrays to work with
  const invoices = Array.isArray(companyData?.invoices) ? companyData.invoices : [];
  const customers = Array.isArray(companyData?.customers) ? companyData.customers : [];

  const filteredInvoices = React.useMemo(() => {
    return invoices.filter(inv => 
      inv.type === 'out' && 
      inv.status !== 'paid' &&
      reportDates.isWithinRange(inv.dueDate, dateRange.startDate, dateRange.endDate)
    );
  }, [invoices, dateRange]);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const calculateAging = (dueDate: string) => {
    const today = reportDates.parseFromStorage(reportDates.today());
    const due = reportDates.parseFromStorage(dueDate);
    const diffTime = Math.abs(today.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (today < due) return 'Not Due';
    if (diffDays <= 30) return '0-30 Days';
    if (diffDays <= 60) return '31-60 Days';
    if (diffDays <= 90) return '61-90 Days';
    return 'Over 90 Days';
  };

  const agingTotals = React.useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => {
      const aging = calculateAging(inv.dueDate);
      acc[aging] = (acc[aging] || 0) + inv.total;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredInvoices]);

  const handleExportCSV = () => {
    const headers = ['Customer', 'Invoice Number', 'Date', 'Due Date', 'Amount', 'Aging'];
    const rows = filteredInvoices.map(inv => [
      getCustomerName(inv.customerId || ''),
      inv.invoiceNumber,
      reportDates.formatForDisplay(inv.date),
      reportDates.formatForDisplay(inv.dueDate),
      inv.total.toFixed(2),
      calculateAging(inv.dueDate)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'accounts_receivable.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <DateRangeSelector
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
        onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Aging Summary</h2>
        </div>
        <div className="grid grid-cols-5 gap-4 p-6">
          {['Not Due', '0-30 Days', '31-60 Days', '61-90 Days', 'Over 90 Days'].map(period => (
            <div key={period} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">{period}</h3>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                ${(agingTotals[period] || 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aging</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr 
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCustomerName(invoice.customerId || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reportDates.formatForDisplay(invoice.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reportDates.formatForDisplay(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${invoice.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      calculateAging(invoice.dueDate) === 'Not Due'
                        ? 'bg-green-100 text-green-800'
                        : calculateAging(invoice.dueDate) === '0-30 Days'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {calculateAging(invoice.dueDate)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No outstanding invoices found for the selected period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <ViewInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          type="out"
        />
      )}
    </div>
  );
}

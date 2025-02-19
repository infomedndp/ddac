import React from 'react';
import { X, Calendar, ArrowUpDown, Printer, Edit, Trash } from 'lucide-react';
import { Employee, Contractor, PayrollRun } from '../../types/payroll';
import { useReactToPrint } from 'react-to-print';
import { PrintablePaymentSummary } from './PrintablePaymentSummary';

interface PaymentHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'employees' | 'contractors';
  payrollRuns: PayrollRun[];
  employees: Employee[];
  contractors: Contractor[];
  onEdit: (payrollRun: PayrollRun) => void;
  onDelete: (payrollRunId: string) => void;
}

export function PaymentHistory({
  isOpen,
  onClose,
  mode,
  payrollRuns,
  employees,
  contractors,
  onEdit,
  onDelete
}: PaymentHistoryProps) {
  const [dateRange, setDateRange] = React.useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [sortByName, setSortByName] = React.useState(false);
  const [selectedPayroll, setSelectedPayroll] = React.useState<PayrollRun | null>(null);
  const printRef = React.useRef<HTMLDivElement>(null);

  const filteredRuns = React.useMemo(() => {
    return payrollRuns
      .filter(run => {
        const payDate = new Date(run.payDate);
        const isInDateRange = payDate >= new Date(dateRange.startDate) && 
                            payDate <= new Date(dateRange.endDate);
        const isCorrectType = mode === 'employees' ? run.employeeId : run.contractorId;
        return isInDateRange && isCorrectType;
      })
      .sort((a, b) => {
        if (sortByName) {
          const personA = mode === 'employees'
            ? employees.find(e => e.id === a.employeeId)
            : contractors.find(c => c.id === a.contractorId);
          const personB = mode === 'employees'
            ? employees.find(e => e.id === b.employeeId)
            : contractors.find(c => c.id === b.contractorId);
          const nameA = personA?.fullName || '';
          const nameB = personB?.fullName || '';
          if (nameA !== nameB) return nameA.localeCompare(nameB);
        }
        return new Date(b.payDate).getTime() - new Date(a.payDate).getTime();
      });
  }, [payrollRuns, dateRange, mode, employees, contractors, sortByName]);

  const totals = React.useMemo(() => {
    return filteredRuns.reduce((acc, run) => ({
      grossPay: acc.grossPay + run.grossPay,
      netPay: acc.netPay + run.netPay,
      taxes: {
        socialSecurity: acc.taxes.socialSecurity + (run.taxes?.socialSecurity || 0),
        medicare: acc.taxes.medicare + (run.taxes?.medicare || 0),
        federalWithholding: acc.taxes.federalWithholding + (run.taxes?.federalWithholding || 0),
        stateWithholding: acc.taxes.stateWithholding + (run.taxes?.stateWithholding || 0)
      }
    }), {
      grossPay: 0,
      netPay: 0,
      taxes: {
        socialSecurity: 0,
        medicare: 0,
        federalWithholding: 0,
        stateWithholding: 0
      }
    });
  }, [filteredRuns]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Payment_History_${mode}_${dateRange.startDate}_${dateRange.endDate}`,
    pageStyle: `
      @media print {
        @page { size: landscape; margin: 20mm; }
        body { padding: 20px; }
        .no-print { display: none !important; }
      }
    `
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Payment History - {mode === 'employees' ? 'Employees' : 'Contractors'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => setSortByName(!sortByName)}
                className={`inline-flex items-center px-4 py-2 border rounded-md ${
                  sortByName 
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort by {sortByName ? 'Date' : 'Name'}
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print History
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div ref={printRef}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pay Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {mode === 'employees' ? 'Employee' : 'Contractor'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  {mode === 'employees' && (
                    <>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxes
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deductions
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRuns.map((run) => {
                  const person = mode === 'employees'
                    ? employees.find(e => e.id === run.employeeId)
                    : contractors.find(c => c.id === run.contractorId);
                  const totalTaxes = mode === 'employees'
                    ? (run.taxes?.socialSecurity || 0) +
                      (run.taxes?.medicare || 0) +
                      (run.taxes?.federalWithholding || 0) +
                      (run.taxes?.stateWithholding || 0)
                    : 0;

                  return (
                    <tr
                      key={run.id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(run.payDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person?.fullName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ${run.grossPay.toFixed(2)}
                      </td>
                      {mode === 'employees' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            ${totalTaxes.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            ${(run.grossPay - run.netPay - totalTaxes).toFixed(2)}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        ${run.netPay.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        <button
                          onClick={() => onEdit(run)}
                          className="text-indigo-600 hover:text-indigo-900 mx-2"
                        >
                          <Edit className="w-4 h-4 inline-block" />
                        </button>
                        <button
                          onClick={() => onDelete(run.id)}
                          className="text-red-600 hover:text-red-900 mx-2"
                        >
                          <Trash className="w-4 h-4 inline-block" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Totals
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                    ${totals.grossPay.toFixed(2)}
                  </td>
                  {mode === 'employees' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                        ${(
                          totals.taxes.socialSecurity +
                          totals.taxes.medicare +
                          totals.taxes.federalWithholding +
                          totals.taxes.stateWithholding
                        ).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                        ${(
                          totals.grossPay -
                          totals.netPay -
                          (
                            totals.taxes.socialSecurity +
                            totals.taxes.medicare +
                            totals.taxes.federalWithholding +
                            totals.taxes.stateWithholding
                          )
                        ).toFixed(2)}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                    ${totals.netPay.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {selectedPayroll && (
        <PrintablePaymentSummary
          payrollRun={selectedPayroll}
          employee={mode === 'employees' ? employees.find(e => e.id === selectedPayroll.employeeId) : undefined}
          contractor={mode === 'contractors' ? contractors.find(c => c.id === selectedPayroll.contractorId) : undefined}
          onClose={() => setSelectedPayroll(null)}
        />
      )}
    </div>
  ); 
}

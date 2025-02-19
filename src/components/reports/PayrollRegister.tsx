import React from 'react';
import { DollarSign, Calendar, ArrowUpDown, Printer } from 'lucide-react';
import { Employee, Contractor, PayrollRun } from '../../types/payroll';
import { useReactToPrint } from 'react-to-print';
import { PrintablePaymentSummary } from '../payroll/PrintablePaymentSummary';
import { useCompany } from '../../context/CompanyContext';
import { reportDates } from '../../utils/dates';

export function PayrollRegister() {
  const { companyData, selectedCompany } = useCompany();
  
  // Updated date range initialization to match the Income Statement logic
  const [dateRange, setDateRange] = React.useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [sortByName, setSortByName] = React.useState(false);
  const [selectedPayroll, setSelectedPayroll] = React.useState<PayrollRun | null>(null);
  const printRef = React.useRef<HTMLDivElement>(null);

  const employees = companyData?.payroll?.employees || [];
  const contractors = companyData?.payroll?.contractors || [];
  const payrollRuns = companyData?.payroll?.payrollRuns || [];

  const filteredRuns = React.useMemo(() => {
    return payrollRuns
      .filter(run => {
        const payDate = reportDates.parseFromStorage(run.payDate);
        return reportDates.isWithinRange(payDate, dateRange.startDate, dateRange.endDate);
      })
      .sort((a, b) => {
        if (sortByName) {
          const personA = employees.find(e => e.id === a.employeeId);
          const personB = employees.find(e => e.id === b.employeeId);
          const nameA = personA?.fullName || '';
          const nameB = personB?.fullName || '';
          if (nameA !== nameB) return nameA.localeCompare(nameB);
        }
        return reportDates.parseFromStorage(b.payDate).getTime() - reportDates.parseFromStorage(a.payDate).getTime();
      });
  }, [payrollRuns, dateRange, employees, sortByName]);

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
    documentTitle: `Payroll_Register_${dateRange.startDate}_${dateRange.endDate}`,
    pageStyle: `
      @media print {
        @page { size: landscape; margin: 20mm; }
        body { padding: 20px; }
        .no-print { display: none !important; }
      }
    `
  });

  const PrintContent = React.forwardRef<HTMLDivElement>((_, ref) => (
    <div ref={ref} className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{selectedCompany?.name}</h1>
        <h2 className="text-xl">Payroll Register</h2>
        <p className="text-sm text-gray-600">
          For the period {reportDates.formatForDisplay(dateRange.startDate)} to {reportDates.formatForDisplay(dateRange.endDate)}
        </p>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taxes</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRuns.map((run) => {
            const employee = employees.find(e => e.id === run.employeeId);
            const totalTaxes = (run.taxes?.socialSecurity || 0) +
                             (run.taxes?.medicare || 0) +
                             (run.taxes?.federalWithholding || 0) +
                             (run.taxes?.stateWithholding || 0);

            return (
              <tr key={run.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {reportDates.formatForDisplay(run.payDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee?.fullName || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${run.grossPay.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${totalTaxes.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${(run.grossPay - run.netPay - totalTaxes).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  ${run.netPay.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Totals</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
              ${totals.grossPay.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
              ${(totals.taxes.socialSecurity + totals.taxes.medicare + totals.taxes.federalWithholding + totals.taxes.stateWithholding).toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
              ${(totals.grossPay - totals.netPay - (totals.taxes.socialSecurity + totals.taxes.medicare + totals.taxes.federalWithholding + totals.taxes.stateWithholding)).toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
              ${totals.netPay.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  ));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ 
                ...prev, 
                startDate: e.target.value // Store as string directly, like in Income Statement
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ 
                ...prev, 
                endDate: e.target.value // Store as string directly, like in Income Statement
              }))}
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
          Print Register
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payroll Register</h2>
          <p className="mt-1 text-sm text-gray-500">
            For the period {new Date(new Date(dateRange.startDate).setDate(new Date(dateRange.startDate).getDate() + 1)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} to {new Date(new Date(dateRange.endDate).setDate(new Date(dateRange.endDate).getDate() + 1)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taxes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRuns.map((run) => {
                const employee = employees.find(e => e.id === run.employeeId);
                const totalTaxes = (run.taxes?.socialSecurity || 0) +
                                 (run.taxes?.medicare || 0) +
                                 (run.taxes?.federalWithholding || 0) +
                                 (run.taxes?.stateWithholding || 0);

                return (
                  <tr 
                    key={run.id}
                    onClick={() => setSelectedPayroll(run)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reportDates.formatForDisplay(run.payDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee?.fullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${run.grossPay.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${totalTaxes.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${(run.grossPay - run.netPay - totalTaxes).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      ${run.netPay.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Totals</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                  ${totals.grossPay.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                  ${(totals.taxes.socialSecurity + totals.taxes.medicare + totals.taxes.federalWithholding + totals.taxes.stateWithholding).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                  ${(totals.grossPay - totals.netPay - (totals.taxes.socialSecurity + totals.taxes.medicare + totals.taxes.federalWithholding + totals.taxes.stateWithholding)).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                  ${totals.netPay.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Hidden printable content */}
      <div style={{ display: 'none' }}>
        <PrintContent ref={printRef} />
      </div>

      {selectedPayroll && (
        <PrintablePaymentSummary
          payrollRun={selectedPayroll}
          employee={employees.find(e => e.id === selectedPayroll.employeeId)}
          onClose={() => setSelectedPayroll(null)}
        />
      )}
    </div>
  );
}

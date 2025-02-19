import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Printer } from 'lucide-react';
import { Employee, Contractor, PayrollRun } from '../../types/payroll';
import { useCompany } from '../../context/CompanyContext';

interface PrintablePaymentSummaryProps {
  payrollRun: PayrollRun;
  employee?: Employee;
  contractor?: Contractor;
  onClose: () => void;
}

export function PrintablePaymentSummary({
  payrollRun,
  employee,
  contractor,
  onClose
}: PrintablePaymentSummaryProps) {
  const { selectedCompany } = useCompany();
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: onClose
  });

  const PrintContent = React.forwardRef<HTMLDivElement>((_, ref) => (
    <div ref={ref} className="bg-white p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{selectedCompany?.name}</h1>
        <h2 className="text-xl">
          {employee ? 'Payroll Payment Summary' : 'Contractor Payment Summary'}
        </h2>
        <p className="text-sm text-gray-600">
          Payment Date: {new Date(payrollRun.payDate).toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Recipient Information */}
        <div>
          <h3 className="text-lg font-bold mb-2">
            {employee ? 'Employee Information' : 'Contractor Information'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Name:</p>
              <p>{employee?.fullName || contractor?.fullName}</p>
            </div>
            {employee && (
              <>
                <div>
                  <p className="font-medium">Employee ID:</p>
                  <p>{employee.id}</p>
                </div>
                <div>
                  <p className="font-medium">Pay Type:</p>
                  <p>{employee.payType}</p>
                </div>
                <div>
                  <p className="font-medium">Pay Rate:</p>
                  <p>${employee.payRate}/{employee.payType === 'Hourly' ? 'hr' : 'year'}</p>
                </div>
              </>
            )}
            {contractor && contractor.businessName && (
              <div>
                <p className="font-medium">Business Name:</p>
                <p>{contractor.businessName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <h3 className="text-lg font-bold mb-2">Payment Details</h3>
          <div className="border-t border-b border-gray-200 py-4">
            {employee ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Pay Period End:</p>
                    <p>{new Date(payrollRun.payPeriodEndDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Hours Worked:</p>
                    <p>{payrollRun.hoursWorked}</p>
                  </div>
                  {payrollRun.hasOvertime && (
                    <div>
                      <p className="font-medium">Overtime Hours:</p>
                      <p>{payrollRun.overtimeHours}</p>
                    </div>
                  )}
                  {payrollRun.additionalPayType && (
                    <>
                      <div>
                        <p className="font-medium">Additional Pay Type:</p>
                        <p>{payrollRun.additionalPayType}</p>
                      </div>
                      <div>
                        <p className="font-medium">Additional Amount:</p>
                        <p>${payrollRun.additionalPayAmount?.toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Tax Breakdown */}
                <div className="mt-6">
                  <h4 className="font-bold mb-2">Tax Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Social Security:</span>
                      <span>${payrollRun.taxes?.socialSecurity.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medicare:</span>
                      <span>${payrollRun.taxes?.medicare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Federal Withholding:</span>
                      <span>${payrollRun.taxes?.federalWithholding.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Withholding:</span>
                      <span>${payrollRun.taxes?.stateWithholding.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Payment Amount:</p>
                  <p>${payrollRun.grossPay.toFixed(2)}</p>
                </div>
                {payrollRun.description && (
                  <div>
                    <p className="font-medium">Description:</p>
                    <p>{payrollRun.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div>
          <h3 className="text-lg font-bold mb-2">Payment Summary</h3>
          <div className="space-y-2">
            {employee && (
              <>
                <div className="flex justify-between">
                  <span>Gross Pay:</span>
                  <span>${payrollRun.grossPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deductions:</span>
                  <span>${(payrollRun.grossPay - payrollRun.netPay).toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
              <span>Net Pay:</span>
              <span>${payrollRun.netPay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-bold mb-2">Payment Method</h3>
          <p>{payrollRun.paymentMethod}</p>
          {payrollRun.paymentMethod === 'DirectDeposit' && (
            <div className="mt-2">
              <p className="font-medium">Bank Information:</p>
              {employee && (
                <p>
                  {employee.bankName} - {employee.accountType} Account ending in{' '}
                  {employee.accountNumber?.slice(-4)}
                </p>
              )}
              {contractor && (
                <p>
                  {contractor.bankingDetails.bankName} - {contractor.bankingDetails.accountType} Account ending in{' '}
                  {contractor.bankingDetails.accountNumber.slice(-4)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Payment Summary</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Summary
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <PrintContent ref={printRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X } from 'lucide-react';
import { Employee, Contractor, PayrollRun } from '../../types/payroll';
import { useCompany } from '../../context/CompanyContext';
import { EmployeePayrollForm } from './EmployeePayrollForm';
import { ContractorPayrollForm } from './ContractorPayrollForm';
import { PayrollSummary } from './PayrollSummary';
import { PrintablePaymentSummary } from './PrintablePaymentSummary';
import { v4 as uuidv4 } from 'uuid';

interface RunPayrollProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'employees' | 'contractors';
  employees: Employee[];
  contractors: Contractor[];
}

export function RunPayroll({ isOpen, onClose, mode, employees, contractors }: RunPayrollProps) {
  const { companyData, updateCompanyData } = useCompany();
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [selectedContractor, setSelectedContractor] = React.useState<Contractor | null>(null);
  const [payPeriodEndDate, setPayPeriodEndDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );
  const [payDate, setPayDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );
  const [hoursWorked, setHoursWorked] = React.useState(80);
  const [showOvertimeHours, setShowOvertimeHours] = React.useState(false);
  const [overtimeHours, setOvertimeHours] = React.useState(0);
  const [additionalPayType, setAdditionalPayType] = React.useState<'Vacation' | 'Bonus' | null>(null);
  const [additionalPayAmount, setAdditionalPayAmount] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState<'Check' | 'DirectDeposit'>('DirectDeposit');
  const [description, setDescription] = React.useState('');
  const [weeksInPeriod, setWeeksInPeriod] = React.useState(2);
  const [editingTax, setEditingTax] = React.useState<string | null>(null);
  const [showPaymentSummary, setShowPaymentSummary] = React.useState(false);
  const [processedPayroll, setProcessedPayroll] = React.useState<PayrollRun | null>(null);

  // Initialize tax rates from selected employee
  const [taxRates, setTaxRates] = React.useState({
    socialSecurity: 6.2,
    medicare: 1.45,
    federalWithholding: 15,
    stateWithholding: 0
  });

  // Update tax rates when employee is selected
  React.useEffect(() => {
    if (selectedEmployee?.taxRates) {
      setTaxRates({
        socialSecurity: selectedEmployee.taxRates.socialSecurity || 6.2,
        medicare: selectedEmployee.taxRates.medicare || 1.45,
        federalWithholding: selectedEmployee.taxRates.federalWithholding || 15,
        stateWithholding: selectedEmployee.taxRates.stateWithholding || 0
      });
    }
  }, [selectedEmployee]);

  const payDetails = React.useMemo(() => {
    if (mode === 'employees' && selectedEmployee) {
      const baseRate = selectedEmployee.payType === 'Hourly' 
        ? selectedEmployee.payRate 
        : (selectedEmployee.payRate / 2080);
      const regularPay = hoursWorked * baseRate;
      const overtimePay = showOvertimeHours ? (overtimeHours * baseRate * 1.5) : 0;
      const additionalPay = additionalPayAmount || 0;
      const grossPay = regularPay + overtimePay + additionalPay;

      // Use employee's specific tax rates
      const socialSecurity = grossPay * (taxRates.socialSecurity / 100);
      const medicare = grossPay * (taxRates.medicare / 100);
      const federalWithholding = grossPay * (taxRates.federalWithholding / 100);
      const stateWithholding = grossPay * (taxRates.stateWithholding / 100);
      const totalTaxes = socialSecurity + medicare + federalWithholding + stateWithholding;

      const netPay = grossPay - totalTaxes;

      return {
        regularPay,
        overtimePay,
        additionalPay,
        grossPay,
        socialSecurity,
        medicare,
        federalWithholding,
        stateWithholding,
        netPay
      };
    } else if (mode === 'contractors' && selectedContractor) {
      return {
        grossPay: additionalPayAmount,
        netPay: additionalPayAmount
      };
    }
    return null;
  }, [
    mode,
    selectedEmployee,
    selectedContractor,
    hoursWorked,
    overtimeHours,
    showOvertimeHours,
    additionalPayAmount,
    taxRates
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payDetails) return;

    try {
      const payrollRunId = uuidv4();
      const timestamp = new Date().toISOString();

      const payrollRun: PayrollRun = {
        id: payrollRunId,
        employeeId: selectedEmployee?.id || null,
        contractorId: selectedContractor?.id || null,
        payPeriodEndDate: new Date(new Date(payPeriodEndDate).setDate(new Date(payPeriodEndDate).getDate() + 1)).toISOString().split('T')[0], // Add 1-day offset
        payDate: new Date(new Date(payDate).setDate(new Date(payDate).getDate() + 1)).toISOString().split('T')[0], // Add 1-day offset
        numberOfWeeks: mode === 'employees' ? weeksInPeriod : null,
        hoursWorked: mode === 'employees' ? hoursWorked : null,
        additionalPayType: mode === 'employees' ? additionalPayType : null,
        additionalPayAmount: mode === 'employees' ? additionalPayAmount : null,
        hasOvertime: mode === 'employees' ? showOvertimeHours : null,
        overtimeHours: mode === 'employees' && showOvertimeHours ? overtimeHours : null,
        paymentMethod,
        description: description || '',
        grossPay: payDetails.grossPay,
        netPay: payDetails.netPay,
        createdAt: timestamp,
        taxes: mode === 'employees' ? {
          socialSecurity: payDetails.socialSecurity || 0,
          medicare: payDetails.medicare || 0,
          federalWithholding: payDetails.federalWithholding || 0,
          stateWithholding: payDetails.stateWithholding || 0
        } : null
      };

      // Ensure payroll data structure exists
      const currentPayroll = companyData?.payroll || {
        employees: [],
        contractors: [],
        payrollRuns: []
      };

      // Add new payroll run to existing runs
      const updatedPayrollRuns = [...(currentPayroll.payrollRuns || []), payrollRun];

      // Update company data with properly structured payroll data
      await updateCompanyData({
        payroll: {
          ...currentPayroll,
          payrollRuns: updatedPayrollRuns
        }
      });

      setProcessedPayroll(payrollRun);
      setShowPaymentSummary(true);

    } catch (error) {
      console.error('Error saving payroll run:', error);
      alert('Failed to process payroll. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'employees' ? 'Run Payroll' : 'Pay Contractor'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {mode === 'employees' ? (
            <EmployeePayrollForm
              employees={employees}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={setSelectedEmployee}
              payPeriodEndDate={payPeriodEndDate}
              onPayPeriodEndDateChange={setPayPeriodEndDate}
              payDate={payDate}
              onPayDateChange={setPayDate}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              hoursWorked={hoursWorked}
              onHoursWorkedChange={setHoursWorked}
              showOvertimeHours={showOvertimeHours}
              onShowOvertimeHoursChange={setShowOvertimeHours}
              overtimeHours={overtimeHours}
              onOvertimeHoursChange={setOvertimeHours}
              additionalPayType={additionalPayType}
              onAdditionalPayTypeChange={setAdditionalPayType}
              additionalPayAmount={additionalPayAmount}
              onAdditionalPayAmountChange={setAdditionalPayAmount}
              description={description}
              onDescriptionChange={setDescription}
              weeksInPeriod={weeksInPeriod}
              onWeeksInPeriodChange={setWeeksInPeriod}
            />
          ) : (
            <ContractorPayrollForm
              contractors={contractors}
              selectedContractor={selectedContractor}
              onSelectContractor={setSelectedContractor}
              payDate={payDate}
              onPayDateChange={setPayDate}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              amount={additionalPayAmount}
              onAmountChange={setAdditionalPayAmount}
              description={description}
              onDescriptionChange={setDescription}
            />
          )}

          {payDetails && (
            <PayrollSummary
              mode={mode}
              payDetails={payDetails}
              taxRates={mode === 'employees' ? taxRates : undefined}
              editingTax={editingTax}
              onEditTax={setEditingTax}
              onUpdateTaxRate={(tax, value) => setTaxRates(prev => ({ ...prev, [tax]: value }))}
              showOvertimeHours={showOvertimeHours}
              additionalPayType={additionalPayType}
              additionalPayAmount={additionalPayAmount}
            />
          )}

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
              Process Payment
            </button>
          </div>
        </form>

        {showPaymentSummary && processedPayroll && (
          <PrintablePaymentSummary
            payrollRun={processedPayroll}
            employee={selectedEmployee || undefined}
            contractor={selectedContractor || undefined}
            onClose={() => {
              setShowPaymentSummary(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

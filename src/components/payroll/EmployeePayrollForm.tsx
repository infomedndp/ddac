import React from 'react';
import { Employee } from '../../types/payroll';

interface EmployeePayrollFormProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (employee: Employee | null) => void;
  payPeriodEndDate: string;
  onPayPeriodEndDateChange: (date: string) => void;
  payDate: string;
  onPayDateChange: (date: string) => void;
  paymentMethod: 'Check' | 'DirectDeposit';
  onPaymentMethodChange: (method: 'Check' | 'DirectDeposit') => void;
  hoursWorked: number;
  onHoursWorkedChange: (hours: number) => void;
  showOvertimeHours: boolean;
  onShowOvertimeHoursChange: (show: boolean) => void;
  overtimeHours: number;
  onOvertimeHoursChange: (hours: number) => void;
  additionalPayType: 'Vacation' | 'Bonus' | null;
  onAdditionalPayTypeChange: (type: 'Vacation' | 'Bonus' | null) => void;
  additionalPayAmount: number;
  onAdditionalPayAmountChange: (amount: number) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  weeksInPeriod: number;
  onWeeksInPeriodChange: (weeks: number) => void;
}

export function EmployeePayrollForm({
  employees = [],
  selectedEmployee,
  onSelectEmployee,
  payPeriodEndDate,
  onPayPeriodEndDateChange,
  payDate,
  onPayDateChange,
  paymentMethod,
  onPaymentMethodChange,
  hoursWorked,
  onHoursWorkedChange,
  showOvertimeHours,
  onShowOvertimeHoursChange,
  overtimeHours,
  onOvertimeHoursChange,
  additionalPayType,
  onAdditionalPayTypeChange,
  additionalPayAmount,
  onAdditionalPayAmountChange,
  description,
  onDescriptionChange,
  weeksInPeriod,
  onWeeksInPeriodChange
}: EmployeePayrollFormProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Employee
        </label>
        <select
          required
          value={selectedEmployee?.id || ''}
          onChange={(e) => {
            const employee = employees.find(emp => emp.id === e.target.value);
            onSelectEmployee(employee || null);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select...</option>
          {Array.isArray(employees) && employees.filter(emp => emp.isActive).map(employee => (
            <option key={employee.id} value={employee.id}>
              {employee.fullName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value as 'Check' | 'DirectDeposit')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="DirectDeposit">Direct Deposit</option>
          <option value="Check">Check</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pay Period End Date
        </label>
        <input
          type="date"
          required
          value={payPeriodEndDate}
          onChange={(e) => onPayPeriodEndDateChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pay Date
        </label>
        <input
          type="date"
          required
          value={payDate}
          onChange={(e) => onPayDateChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Weeks in Pay Period
        </label>
        <select
          value={weeksInPeriod}
          onChange={(e) => onWeeksInPeriodChange(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value={1}>1 Week</option>
          <option value={2}>2 Weeks</option>
          <option value={3}>3 Weeks</option>
          <option value={4}>4 Weeks</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Hours Worked
        </label>
        <input
          type="number"
          min="0"
          step="0.5"
          required
          value={hoursWorked}
          onChange={(e) => onHoursWorkedChange(parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={showOvertimeHours}
            onChange={(e) => onShowOvertimeHoursChange(e.target.checked)}
            className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Include Overtime
        </label>
        {showOvertimeHours && (
          <input
            type="number"
            min="0"
            step="0.5"
            value={overtimeHours}
            onChange={(e) => onOvertimeHoursChange(parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Additional Pay Type
        </label>
        <select
          value={additionalPayType || ''}
          onChange={(e) => onAdditionalPayTypeChange(e.target.value as 'Vacation' | 'Bonus' | null)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">None</option>
          <option value="Vacation">Vacation</option>
          <option value="Bonus">Bonus</option>
        </select>
      </div>

      {additionalPayType && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Additional Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={additionalPayAmount}
              onChange={(e) => onAdditionalPayAmountChange(parseFloat(e.target.value))}
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
}

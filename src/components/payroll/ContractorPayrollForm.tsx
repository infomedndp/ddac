import React from 'react';
import { Contractor } from '../../types/payroll';

interface ContractorPayrollFormProps {
  contractors: Contractor[];
  selectedContractor: Contractor | null;
  onSelectContractor: (contractor: Contractor | null) => void;
  payDate: string;
  onPayDateChange: (date: string) => void;
  paymentMethod: 'Check' | 'DirectDeposit';
  onPaymentMethodChange: (method: 'Check' | 'DirectDeposit') => void;
  amount: number;
  onAmountChange: (amount: number) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
}

export function ContractorPayrollForm({
  contractors,
  selectedContractor,
  onSelectContractor,
  payDate,
  onPayDateChange,
  paymentMethod,
  onPaymentMethodChange,
  amount,
  onAmountChange,
  description,
  onDescriptionChange
}: ContractorPayrollFormProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onAmountChange(0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onAmountChange(numValue);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Contractor
        </label>
        <select
          required
          value={selectedContractor?.id || ''}
          onChange={(e) => {
            const contractor = contractors.find(c => c.id === e.target.value);
            onSelectContractor(contractor || null);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select...</option>
          {contractors.filter(c => c.isActive).map(contractor => (
            <option key={contractor.id} value={contractor.id}>
              {contractor.businessName ? `${contractor.businessName} (${contractor.fullName})` : contractor.fullName}
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
          Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={amount || ''}
            onChange={handleAmountChange}
            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

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

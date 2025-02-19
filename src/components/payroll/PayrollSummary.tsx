import React from 'react';

interface PayrollSummaryProps {
  mode: 'employees' | 'contractors';
  payDetails: {
    regularPay?: number;
    overtimePay?: number;
    additionalPay?: number;
    grossPay: number;
    socialSecurity?: number;
    medicare?: number;
    federalWithholding?: number;
    stateWithholding?: number;
    netPay: number;
  };
  taxRates?: {
    socialSecurity: number;
    medicare: number;
    federalWithholding: number;
    stateWithholding: number;
  };
  editingTax: string | null;
  onEditTax: (tax: string | null) => void;
  onUpdateTaxRate: (tax: string, value: number) => void;
  showOvertimeHours?: boolean;
  additionalPayType?: string | null;
  additionalPayAmount?: number;
}

export function PayrollSummary({
  mode,
  payDetails,
  taxRates,
  editingTax,
  onEditTax,
  onUpdateTaxRate,
  showOvertimeHours,
  additionalPayType,
  additionalPayAmount
}: PayrollSummaryProps) {
  const renderTaxInput = (taxKey: string, taxLabel: string, taxValue: number, amount: number) => (
    <div className="flex justify-between text-red-600">
      <div className="flex items-center gap-2">
        <span>{taxLabel}</span>
        {editingTax === taxKey ? (
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxValue}
              onChange={(e) => onUpdateTaxRate(taxKey, parseFloat(e.target.value))}
              onBlur={() => onEditTax(null)}
              autoFocus
              className="w-16 px-1 py-0.5 text-sm border border-gray-300 rounded"
            />
            <span className="ml-1 text-sm text-gray-500">%</span>
          </div>
        ) : (
          <button
            onClick={() => onEditTax(taxKey)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            ({taxValue}%)
          </button>
        )}
      </div>
      <span>-${amount.toFixed(2)}</span>
    </div>
  );

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>
      <div className="space-y-2">
        {mode === 'employees' && (
          <>
            <div className="flex justify-between">
              <span>Regular Pay</span>
              <span>${payDetails.regularPay?.toFixed(2)}</span>
            </div>
            {showOvertimeHours && payDetails.overtimePay && payDetails.overtimePay > 0 && (
              <div className="flex justify-between">
                <span>Overtime Pay</span>
                <span>${payDetails.overtimePay.toFixed(2)}</span>
              </div>
            )}
            {additionalPayType && additionalPayAmount && additionalPayAmount > 0 && (
              <div className="flex justify-between">
                <span>Additional Pay ({additionalPayType})</span>
                <span>${payDetails.additionalPay?.toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
          <span>Gross Pay</span>
          <span>${payDetails.grossPay.toFixed(2)}</span>
        </div>

        {mode === 'employees' && taxRates && (
          <>
            {renderTaxInput('socialSecurity', 'Social Security', taxRates.socialSecurity, payDetails.socialSecurity || 0)}
            {renderTaxInput('medicare', 'Medicare', taxRates.medicare, payDetails.medicare || 0)}
            {renderTaxInput('federalWithholding', 'Federal Withholding', taxRates.federalWithholding, payDetails.federalWithholding || 0)}
            {renderTaxInput('stateWithholding', 'State Withholding', taxRates.stateWithholding, payDetails.stateWithholding || 0)}
          </>
        )}

        <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
          <span>Net Pay</span>
          <span>${payDetails.netPay.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

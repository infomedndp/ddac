import React from 'react';
import { AlertCircle, Scale } from 'lucide-react';

interface BalanceIndicatorProps {
  isBalanced: boolean;
  totals: {
    assets: number;
    liabilities: number;
    equity: number;
  };
  difference: number;
}

export function BalanceIndicator({ isBalanced, totals, difference }: BalanceIndicatorProps) {
  return (
    <div className={`p-4 rounded-lg ${
      isBalanced 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-center">
        <Scale className={`w-5 h-5 mr-2 ${
          isBalanced ? 'text-green-500' : 'text-red-500'
        }`} />
        <div>
          <h3 className={`font-medium ${
            isBalanced ? 'text-green-800' : 'text-red-800'
          }`}>
            {isBalanced 
              ? 'Balance Sheet is balanced' 
              : 'Balance Sheet is out of balance'
            }
          </h3>
          <div className="mt-1 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Total Assets:</span>{' '}
                ${totals.assets.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Total Liabilities:</span>{' '}
                ${totals.liabilities.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Total Equity:</span>{' '}
                ${totals.equity.toFixed(2)}
              </div>
            </div>
            {!isBalanced && (
              <div className="mt-2 text-red-700">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Difference: ${Math.abs(difference).toFixed(2)} {difference > 0 ? 'over' : 'under'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

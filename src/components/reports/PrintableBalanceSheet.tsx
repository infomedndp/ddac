import React from 'react';
import { X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { formatCurrency } from '../../utils/numberFormat';

interface PrintableBalanceSheetProps {
  companyName: string;
  asOfDate: string;
  assets: {
    current: Array<{ name: string; balance: number }>;
    fixed: Array<{ name: string; balance: number; depreciation?: number; isLessAccumulated?: boolean }>;
    other: Array<{ name: string; balance: number; amortization?: number; isLessAccumulated?: boolean }>;
  };
  liabilities: {
    current: Array<{ name: string; balance: number }>;
    longTerm: Array<{ name: string; balance: number }>;
  };
  capital: Array<{ name: string; balance: number }>;
  totals: {
    currentAssets: number;
    fixedAssets: number;
    otherAssets: number;
    totalAssets: number;
    currentLiabilities: number;
    longTermLiabilities: number;
    totalLiabilities: number;
    totalCapital: number;
    totalLiabilitiesAndCapital: number;
  };
  onClose: () => void;
}

export function PrintableBalanceSheet({
  companyName,
  asOfDate,
  assets,
  liabilities,
  capital,
  totals,
  onClose
}: PrintableBalanceSheetProps) {
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: onClose,
    removeAfterPrint: true
  });

  React.useEffect(() => {
    handlePrint();
  }, [handlePrint]);

  const PrintContent = React.forwardRef<HTMLDivElement>((_, ref) => (
    <div ref={ref} className="bg-white p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{companyName}</h1>
        <h2 className="text-xl">Balance Sheet</h2>
        <p className="text-sm text-gray-600">
          {asOfDate}
        </p>
      </div>

      {/* Assets Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">ASSETS</h3>

        {/* Current Assets */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">Current Assets</h4>
          {assets.current.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.name}</span>
              <span>{formatCurrency(item.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2 border-t border-gray-300">
            <span>Total Current Assets</span>
            <span>{formatCurrency(totals.currentAssets)}</span>
          </div>
        </div>

        {/* Fixed Assets */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">Property and Equipment</h4>
          {assets.fixed.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex justify-between">
                <span>{item.name}</span>
                <span>{formatCurrency(item.balance)}</span>
              </div>
              {item.depreciation && (
                <div className="flex justify-between pl-8 text-gray-600">
                  <span>Less: Accumulated Depreciation</span>
                  <span>{formatCurrency(item.depreciation, item.isLessAccumulated)}</span>
                </div>
              )}
            </React.Fragment>
          ))}
          <div className="flex justify-between font-bold mt-2 border-t border-gray-300">
            <span>Total Property and Equipment</span>
            <span>{formatCurrency(totals.fixedAssets)}</span>
          </div>
        </div>

        {/* Other Assets */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">Other Assets</h4>
          {assets.other.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex justify-between">
                <span>{item.name}</span>
                <span>{formatCurrency(item.balance)}</span>
              </div>
              {item.amortization && (
                <div className="flex justify-between pl-8 text-gray-600">
                  <span>Less: Accumulated Amortization</span>
                  <span>{formatCurrency(item.amortization, item.isLessAccumulated)}</span>
                </div>
              )}
            </React.Fragment>
          ))}
          <div className="flex justify-between font-bold mt-2 border-t border-gray-300">
            <span>Total Other Assets</span>
            <span>{formatCurrency(totals.otherAssets)}</span>
          </div>
        </div>

        <div className="flex justify-between font-bold mt-4 border-t-2 border-black">
          <span>Total Assets</span>
          <span>{formatCurrency(totals.totalAssets)}</span>
        </div>
      </div>

      {/* Liabilities and Capital Section */}
      <div>
        <h3 className="text-lg font-bold mb-4">LIABILITIES AND CAPITAL</h3>

        {/* Current Liabilities */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">Current Liabilities</h4>
          {liabilities.current.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.name}</span>
              <span>{formatCurrency(item.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2 border-t border-gray-300">
            <span>Total Current Liabilities</span>
            <span>{formatCurrency(totals.currentLiabilities)}</span>
          </div>
        </div>

        {/* Long-term Liabilities */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">Long-Term Liabilities</h4>
          {liabilities.longTerm.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.name}</span>
              <span>{formatCurrency(item.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2 border-t border-gray-300">
            <span>Total Long-Term Liabilities</span>
            <span>{formatCurrency(totals.longTermLiabilities)}</span>
          </div>
        </div>

        {/* Capital */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">Capital</h4>
          {capital.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.name}</span>
              <span>{formatCurrency(item.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2 border-t border-gray-300">
            <span>Total Capital</span>
            <span>{formatCurrency(totals.totalCapital)}</span>
          </div>
        </div>

        <div className="flex justify-between font-bold mt-4 border-t-2 border-black">
          <span>Total Liabilities & Capital</span>
          <span>{formatCurrency(totals.totalLiabilitiesAndCapital)}</span>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Print Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={{ display: 'none' }}>
          <PrintContent ref={printRef} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

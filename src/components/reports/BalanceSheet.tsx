import React from 'react';
import { DollarSign } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { PrintableBalanceSheet } from './PrintableBalanceSheet';
import { useBalanceSheetCalculations } from '../../hooks/useBalanceSheetCalculations';
import { formatCurrency } from '../../utils/numberFormat';

export function BalanceSheet() {
  const { companyData, selectedCompany } = useCompany();
  const [showPrintable, setShowPrintable] = React.useState(false);
  const [asOfDate, setAsOfDate] = React.useState(new Date().toISOString().split("T")[0]);

  const { assets, liabilities, capital } = useBalanceSheetCalculations(
    companyData?.transactions,
    companyData?.accounts,
    asOfDate
  );

  const totalCurrentAssets = assets.current.reduce((sum, item) => sum + item.balance, 0);
  const totalFixedAssets = assets.fixed.reduce((sum, item) => sum + (item.balance - (item.depreciation || 0)), 0);
  const totalOtherAssets = assets.other.reduce((sum, item) => sum + (item.balance - (item.amortization || 0)), 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets + totalOtherAssets;

  const totalCurrentLiabilities = liabilities.current.reduce((sum, item) => sum + item.balance, 0);
  const totalLongTermLiabilities = liabilities.longTerm.reduce((sum, item) => sum + item.balance, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalCapital = capital.reduce((sum, item) => sum + item.balance, 0);
  const totalLiabilitiesAndCapital = totalLiabilities + totalCapital;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAsOfDate(e.target.value);
  };

  // Create a localized date string to prevent the one-day offset
  const formattedAsOfDate = new Date(`${asOfDate}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">As of Date:</label>
          <input
            type="date"
            value={asOfDate}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowPrintable(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Print Balance Sheet
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Balance Sheet</h2>
          <p className="mt-1 text-sm text-gray-500">
            As of {formattedAsOfDate}
          </p>
        </div>

        <div className="p-6">
          {/* Assets Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">ASSETS</h3>

            {/* Current Assets */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Current Assets</h4>
              {assets.current.map((item, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2 border-t border-gray-300 pt-2">
                <span>Total Current Assets</span>
                <span>{formatCurrency(totalCurrentAssets)}</span>
              </div>
            </div>

            {/* Fixed Assets */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Property and Equipment</h4>
              {assets.fixed.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex justify-between py-1">
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.balance)}</span>
                  </div>
                  {item.depreciation && (
                    <div className="flex justify-between py-1 pl-8 text-gray-600">
                      <span>Less: Accumulated Depreciation</span>
                      <span>{formatCurrency(item.depreciation, item.isLessAccumulated)}</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
              <div className="flex justify-between font-bold mt-2 border-t border-gray-300 pt-2">
                <span>Total Property and Equipment</span>
                <span>{formatCurrency(totalFixedAssets)}</span>
              </div>
            </div>

            {/* Other Assets */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Other Assets</h4>
              {assets.other.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex justify-between py-1">
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.balance)}</span>
                  </div>
                  {item.amortization && (
                    <div className="flex justify-between py-1 pl-8 text-gray-600">
                      <span>Less: Accumulated Amortization</span>
                      <span>{formatCurrency(item.amortization, item.isLessAccumulated)}</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
              <div className="flex justify-between font-bold mt-2 border-t border-gray-300 pt-2">
                <span>Total Other Assets</span>
                <span>{formatCurrency(totalOtherAssets)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold mt-4 border-t-2 border-black pt-2">
              <span>Total Assets</span>
              <span>{formatCurrency(totalAssets)}</span>
            </div>
          </div>

          {/* Liabilities and Capital Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">LIABILITIES AND CAPITAL</h3>

            {/* Current Liabilities */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Current Liabilities</h4>
              {liabilities.current.map((item, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2 border-t border-gray-300 pt-2">
                <span>Total Current Liabilities</span>
                <span>{formatCurrency(totalCurrentLiabilities)}</span>
              </div>
            </div>

            {/* Long-term Liabilities */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Long-Term Liabilities</h4>
              {liabilities.longTerm.map((item, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2 border-t border-gray-300 pt-2">
                <span>Total Long-Term Liabilities</span>
                <span>{formatCurrency(totalLongTermLiabilities)}</span>
              </div>
            </div>

            {/* Capital */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Capital</h4>
              {capital.map((item, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2 border-t border-gray-300 pt-2">
                <span>Total Capital</span>
                <span>{formatCurrency(totalCapital)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold mt-4 border-t-2 border-black pt-2">
              <span>Total Liabilities & Capital</span>
              <span>{formatCurrency(totalLiabilitiesAndCapital)}</span>
            </div>
          </div>
        </div>
      </div>

      {showPrintable && (
        <PrintableBalanceSheet
          companyName={selectedCompany?.name || ''}
          asOfDate={formattedAsOfDate}
          assets={assets}
          liabilities={liabilities}
          capital={capital}
          totals={{
            currentAssets: totalCurrentAssets,
            fixedAssets: totalFixedAssets,
            otherAssets: totalOtherAssets,
            totalAssets,
            currentLiabilities: totalCurrentLiabilities,
            longTermLiabilities: totalLongTermLiabilities,
            totalLiabilities,
            totalCapital,
            totalLiabilitiesAndCapital
          }}
          onClose={() => setShowPrintable(false)}
        />
      )}
    </div>
  );
}

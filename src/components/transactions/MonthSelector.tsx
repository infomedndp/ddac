import React from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

interface MonthSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  selectedMonth: string;
  onMonthSelect: (month: string) => void;
  monthsWithData: Set<string>;
}

export function MonthSelector({ 
  selectedYear, 
  onYearChange, 
  selectedMonth, 
  onMonthSelect,
  monthsWithData 
}: MonthSelectorProps) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2019 + 1 }, 
    (_, i) => currentYear - i
  );

  const formatMonthKey = (year: number, monthIndex: number): string => {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onYearChange(selectedYear - 1)}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="px-4 py-2 text-lg font-semibold text-gray-900 border-none focus:ring-0"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <button
          onClick={() => onYearChange(selectedYear + 1)}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        {months.map((month, index) => {
          const monthKey = formatMonthKey(selectedYear, index);
          const isSelected = monthKey === selectedMonth;
          const hasData = monthsWithData.has(monthKey);

          return (
            <button
              key={month}
              onClick={() => onMonthSelect(monthKey)}
              className={`
                relative p-4 text-left border rounded-lg transition-colors
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 hover:border-indigo-300'
                }
              `}
            >
              <span className="text-sm font-medium">{month}</span>
              {hasData ? (
                <Check className="absolute w-4 h-4 text-green-500 bottom-2 right-2" />
              ) : (
                <X className="absolute w-4 h-4 text-gray-400 bottom-2 right-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

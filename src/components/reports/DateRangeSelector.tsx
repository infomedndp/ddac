import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DateRangeSelectorProps) {
  const handleQuickSelect = (range: 'ytd' | 'lastMonth' | 'lastQuarter' | 'lastYear') => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    let start: string;
    let end: string = now.toISOString().split('T')[0];

    switch (range) {
      case 'ytd': {
        start = `${now.getFullYear()}-01-01`;
        break;
      }

      case 'lastMonth': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        start = lastMonth.toISOString().split('T')[0];
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        end = lastDayOfMonth.toISOString().split('T')[0];
        break;
      }

      case 'lastQuarter': {
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);
        
        let previousQuarterStartMonth: number;
        let previousQuarterYear = now.getFullYear();
        
        if (currentQuarter === 0) {
          previousQuarterStartMonth = 9;
          previousQuarterYear--;
        } else {
          previousQuarterStartMonth = (currentQuarter - 1) * 3;
        }
        
        start = new Date(previousQuarterYear, previousQuarterStartMonth, 1).toISOString().split('T')[0];
        end = new Date(previousQuarterYear, previousQuarterStartMonth + 3, 0).toISOString().split('T')[0];
        break;
      }

      case 'lastYear': {
        const lastYear = now.getFullYear() - 1;
        start = `${lastYear}-01-01`;
        end = `${lastYear}-12-31`;
        break;
      }
    }

    onStartDateChange(start);
    onEndDateChange(end);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    onStartDateChange(date); // Pass the date string directly
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    onEndDateChange(date); // Pass the date string directly
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-gray-400" />
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleQuickSelect('ytd')}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          YTD
        </button>
        <button
          onClick={() => handleQuickSelect('lastMonth')}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Last Month
        </button>
        <button
          onClick={() => handleQuickSelect('lastQuarter')}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Last Quarter
        </button>
        <button
          onClick={() => handleQuickSelect('lastYear')}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Last Year
        </button>
      </div>
    </div>
  );
}

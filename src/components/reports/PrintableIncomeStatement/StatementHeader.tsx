import React from 'react';

interface StatementHeaderProps {
  companyName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function StatementHeader({ companyName, dateRange }: StatementHeaderProps) {
  const formatDate = (dateStr: string) => {
    // Create UTC date from the ISO string
    const date = new Date(dateStr);
    // Format the date consistently
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC'
    }).format(date);
  };

  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold">{companyName}</h1>
      <h2 className="text-xl">Income Statement</h2>
      <p className="text-sm text-gray-600">
        For the Period {formatDate(dateRange.startDate)} to{' '}
        {formatDate(dateRange.endDate)}
      </p>
    </div>
  );
}

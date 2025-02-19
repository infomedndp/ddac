import React from 'react';

export function TableHeader() {
  return (
    <thead>
      <tr className="border-b-2 border-gray-300">
        <th className="text-left py-2 w-1/2">Account</th>
        <th className="text-right py-2">Current Month</th>
        <th className="text-right py-2">%</th>
        <th className="text-right py-2">Year to Date</th>
        <th className="text-right py-2">%</th>
      </tr>
    </thead>
  );
}

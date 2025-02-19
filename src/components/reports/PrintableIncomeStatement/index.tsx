// Previous code remains the same until getAccountName prop

interface PrintableIncomeStatementProps {
  companyName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  categorizedTotals: Record<string, Record<string, { currentMonth: number; yearToDate: number }>>;
  totals: {
    revenue: { currentMonth: number; yearToDate: number };
    costOfSales: { currentMonth: number; yearToDate: number };
    expenses: { currentMonth: number; yearToDate: number };
    grossProfit: { currentMonth: number; yearToDate: number };
    netIncome: { currentMonth: number; yearToDate: number };
  };
  getAccountName: (accountNumber: string) => string;
  onClose: () => void;
}

// Rest of the code remains the same

export interface ChartOfAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  category: string;
  subtype: string | null;
  description?: string;
  parentAccount?: string;
  balance: number;
  isActive: boolean;
  version: string;
  depreciation?: number;
  amortization?: number;
  isLessAccumulated?: boolean; // Added this flag
}

export interface AccountType {
  value: string;
  label: string;
  category: string;
  subtype: string | null;
}

export interface AccountVersion {
  id: string;
  name: string;
  createdAt: string;
  isActive: boolean;
}

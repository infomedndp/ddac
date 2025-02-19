export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string; // Last 4 digits only
  routingNumber?: string;
  type: 'checking' | 'savings' | 'credit' | 'other';
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  lastAccessed: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  bankAccounts?: BankAccount[];
}

export interface CompanyData {
  transactions: Transaction[];
  accounts: ChartOfAccount[];
  categoryRules: CategoryRule[];
  customers: Customer[];
  vendors: Vendor[];
  invoices: Invoice[];
  bankAccounts?: BankAccount[];
}

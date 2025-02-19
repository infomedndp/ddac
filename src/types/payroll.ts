export interface TaxRates {
  socialSecurity: number;
  medicare: number;
  federalWithholding: number;
  stateWithholding: number;
}

export interface Employee {
  id: string;
  fullName: string;
  payType: 'Hourly' | 'Salary';
  payRate: number;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ssn?: string;
  startDate?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: 'Checking' | 'Savings';
  isActive: boolean;
  taxRates?: TaxRates;
}

// Rest of the types remain unchanged

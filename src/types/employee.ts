export interface Employee {
  id: string;
  name: string;
  payType: 'Hourly' | 'Salary';
  payRate: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ssn?: string;
  startDate?: string;
  bankName?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
}

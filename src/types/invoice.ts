export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceEdit {
  id: string;
  timestamp: string;
  changes: {
    field: 'date' | 'dueDate' | 'items' | 'notes' | 'taxRate' | 'customerId' | 'vendorId';
    oldValue: any;
    newValue: any;
  }[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  vendorId?: string;
  customerInfo?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate?: number;
  taxEnabled?: boolean;
  total: number;
  amountPaid: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  notes?: string;
  terms?: string;
  type: 'in' | 'out';
  editHistory?: InvoiceEdit[];
}

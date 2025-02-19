export interface Document {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  transactions: Transaction[];
  createdAt: string;
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
} 
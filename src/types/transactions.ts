export interface TransactionEdit {
  id: string;
  timestamp: string;
  changes: {
    date?: { from: string; to: string };
    description?: { from: string; to: string };
    amount?: { from: number; to: number };
    category?: { from: string; to: string };
    bankAccountId?: { from: string; to: string };
  };
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  bankAccountId: string;
  editHistory?: TransactionEdit[];
  source: 'manual' | 'upload' | 'reconciliation';
  excluded?: boolean;
  
  // Reconciliation fields
  isReconciled?: boolean;
  offsetCategory?: string;
  offsetAmount?: number;
  offsetDescription?: string;
  offsetTransactionId?: string;
  
  // Journal entry fields
  isJournalEntry?: boolean;
  journalEntryId?: string;
  entryType?: 'debit' | 'credit';
  relatedTransactionId?: string;
}

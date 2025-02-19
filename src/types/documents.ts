export interface Document {
  id: string;
  name: string;
  status: 'needed' | 'received' | 'not-required';
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  receivedDate?: string;
  category?: string;
  fileType?: string;
}

export interface DocumentManagementData {
  documents: Document[];
}

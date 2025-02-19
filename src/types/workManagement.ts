export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  completedBy?: string;
  companyId: string;
}

import { format, parseISO, isValid, addDays } from 'date-fns';

export const invoiceDates = {
  formatForStorage: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) {
      throw new Error('Invalid date');
    }
    return d.toISOString().split('T')[0];
  },

  formatForDisplay: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) {
      throw new Error('Invalid date');
    }
    return d.toLocaleDateString();
  },

  today: (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  },

  getDefaultDueDate: (date: Date | string, netDays: number = 30): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) {
      throw new Error('Invalid date');
    }
    const dueDate = addDays(d, netDays);
    return dueDate.toISOString().split('T')[0];
  },

  isOverdue: (dueDate: Date | string): boolean => {
    const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    if (!isValid(d)) {
      throw new Error('Invalid date');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  },

  getAgingPeriod: (dueDate: Date | string): '0-30' | '31-60' | '61-90' | '90+' | 'not-due' => {
    const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    if (!isValid(d)) {
      throw new Error('Invalid date');
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (d >= today) return 'not-due';
    
    const diffTime = Math.abs(today.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) return '0-30';
    if (diffDays <= 60) return '31-60';
    if (diffDays <= 90) return '61-90';
    return '90+';
  }
};

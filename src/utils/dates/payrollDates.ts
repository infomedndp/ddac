import { format, parseISO, isValid, addDays, subDays } from 'date-fns';

export const payrollDates = {
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

  addDays: (date: Date | string, days: number): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) {
      throw new Error('Invalid date');
    }
    const newDate = addDays(d, days);
    return newDate.toISOString().split('T')[0];
  },

  subtractDays: (date: Date | string, days: number): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) {
      throw new Error('Invalid date');
    }
    const newDate = subDays(d, days);
    return newDate.toISOString().split('T')[0];
  },

  getPayPeriodEndDate: (startDate: Date | string, periodLength: number): string => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    if (!isValid(start)) {
      throw new Error('Invalid date');
    }
    const end = addDays(start, periodLength * 7 - 1);
    return end.toISOString().split('T')[0];
  }
};

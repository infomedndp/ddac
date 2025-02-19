import { format, parseISO, isValid, addDays, subDays } from 'date-fns';

export const reportDates = {
  formatForStorage: (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return format(d, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date for storage:', error);
      return format(new Date(), 'yyyy-MM-dd');
    }
  },

  formatForDisplay: (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return d.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return new Date().toLocaleDateString();
    }
  },

  today: (): string => {
    return format(new Date(), 'yyyy-MM-dd');
  },

  parseFromStorage: (dateString: string): Date => {
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return parseISO(dateString);
      }
      const date = new Date(dateString);
      if (!isValid(date)) {
        throw new Error('Invalid date string');
      }
      return date;
    } catch (error) {
      console.error('Error parsing date from storage:', error);
      return new Date();
    }
  },

  isWithinRange: (date: string | Date, startDate: string | Date, endDate: string | Date): boolean => {
    try {
      const dateToCheck = typeof date === 'string' ? parseISO(date) : date;
      const rangeStart = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const rangeEnd = typeof endDate === 'string' ? parseISO(endDate) : endDate;

      if (!isValid(dateToCheck) || !isValid(rangeStart) || !isValid(rangeEnd)) {
        throw new Error('Invalid date in range check');
      }

      dateToCheck.setHours(0, 0, 0, 0);
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd.setHours(0, 0, 0, 0);

      return dateToCheck >= rangeStart && dateToCheck <= rangeEnd;
    } catch (error) {
      console.error('Error in isWithinRange:', error);
      return false;
    }
  },

  startOfMonth: (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error getting start of month:', error);
      return format(new Date(), 'yyyy-MM-01');
    }
  },

  endOfMonth: (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return format(lastDay, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error getting end of month:', error);
      return format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd');
    }
  },

  startOfYear: (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return `${d.getFullYear()}-01-01`;
    } catch (error) {
      console.error('Error getting start of year:', error);
      return `${new Date().getFullYear()}-01-01`;
    }
  },

  endOfYear: (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return `${d.getFullYear()}-12-31`;
    } catch (error) {
      console.error('Error getting end of year:', error);
      return `${new Date().getFullYear()}-12-31`;
    }
  },

  addDays: (date: Date | string, days: number): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return format(addDays(d, days), 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error adding days to date:', error);
      return format(new Date(), 'yyyy-MM-dd');
    }
  },

  subtractDays: (date: Date | string, days: number): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return format(subDays(d, days), 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error subtracting days from date:', error);
      return format(new Date(), 'yyyy-MM-dd');
    }
  },

  isSameMonth: (date1: Date | string, date2: Date | string): boolean => {
    try {
      const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
      const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
      
      if (!isValid(d1) || !isValid(d2)) {
        throw new Error('Invalid date in comparison');
      }

      return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    } catch (error) {
      console.error('Error in isSameMonth comparison:', error);
      return false;
    }
  }
};

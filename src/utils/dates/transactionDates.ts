import { format, parseISO, isValid, compareAsc } from 'date-fns';

export const transactionDates = {
  /**
   * Convert local date to UTC for storage
   * @param date Date string or Date object in local timezone
   * @returns YYYY-MM-DD format string in UTC
   */
  formatForStorage: (date: Date | string): string => {
    try {
      // If string, parse it first
      const localDate = typeof date === 'string' ? new Date(date) : date;
      if (!isValid(localDate)) {
        throw new Error('Invalid date');
      }

      // Get the UTC components
      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localDate.getUTCDate()).padStart(2, '0');

      // Return in YYYY-MM-DD format
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for storage:', error);
      return new Date().toISOString().split('T')[0];
    }
  },

  /**
   * Convert UTC date from storage to local timezone for display
   * @param dateString YYYY-MM-DD format string in UTC
   * @returns Local date string in user's preferred format
   */
  formatForDisplay: (dateString: string): string => {
    try {
      // Parse the UTC date string
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Create a Date object in UTC
      const utcDate = new Date(Date.UTC(year, month - 1, day));
      
      if (!isValid(utcDate)) {
        throw new Error('Invalid date');
      }

      // Convert to local date string
      return utcDate.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return new Date().toLocaleDateString();
    }
  },

  /**
   * Get today's date in storage format (UTC)
   * @returns YYYY-MM-DD format string in UTC
   */
  today: (): string => {
    const now = new Date();
    return transactionDates.formatForStorage(now);
  },

  /**
   * Parse a date string from storage format to Date object
   * @param dateString YYYY-MM-DD format string in UTC
   * @returns Date object in local timezone
   */
  parseFromStorage: (dateString: string): Date => {
    try {
      // Parse the UTC components
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Create Date object from UTC components
      const date = new Date(Date.UTC(year, month - 1, day));
      
      if (!isValid(date)) {
        throw new Error('Invalid date components');
      }

      return date;
    } catch (error) {
      console.error('Error parsing date from storage:', error);
      return new Date(); // Return current date as fallback
    }
  },

  /**
   * Check if a date is within a range
   * @param date Date to check
   * @param startDate Range start
   * @param endDate Range end
   * @returns boolean
   */
  isWithinRange: (date: Date | string, startDate: Date | string, endDate: Date | string): boolean => {
    try {
      // Convert all dates to UTC midnight for consistent comparison
      const checkDate = transactionDates.parseFromStorage(
        typeof date === 'string' ? date : transactionDates.formatForStorage(date)
      );
      const start = transactionDates.parseFromStorage(
        typeof startDate === 'string' ? startDate : transactionDates.formatForStorage(startDate)
      );
      const end = transactionDates.parseFromStorage(
        typeof endDate === 'string' ? endDate : transactionDates.formatForStorage(endDate)
      );

      // Set all times to UTC midnight for date-only comparison
      checkDate.setUTCHours(0, 0, 0, 0);
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(0, 0, 0, 0);

      return checkDate >= start && checkDate <= end;
    } catch (error) {
      console.error('Error in isWithinRange:', error);
      return false;
    }
  },

  /**
   * Check if two dates are in the same month
   * @param date1 First date
   * @param date2 Second date
   * @returns boolean
   */
  isSameMonth: (date1: Date | string, date2: Date | string): boolean => {
    try {
      const d1 = transactionDates.parseFromStorage(
        typeof date1 === 'string' ? date1 : transactionDates.formatForStorage(date1)
      );
      const d2 = transactionDates.parseFromStorage(
        typeof date2 === 'string' ? date2 : transactionDates.formatForStorage(date2)
      );
      
      return d1.getUTCFullYear() === d2.getUTCFullYear() && 
             d1.getUTCMonth() === d2.getUTCMonth();
    } catch (error) {
      console.error('Error in isSameMonth:', error);
      return false;
    }
  }
};

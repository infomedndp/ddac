import { parseISO, format, isValid, addDays, subDays } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

// Get user's timezone
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const dateUtils = {
  /**
   * Convert local date to UTC for storage
   * @param date Date string or Date object in local timezone
   * @returns YYYY-MM-DD format string in UTC
   */
  toStorage: (date: Date | string): string => {
    try {
      // If string, parse it first
      const localDate = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(localDate)) {
        throw new Error('Invalid date');
      }

      // Convert to UTC while preserving the local date
      const utcDate = zonedTimeToUtc(localDate, TIME_ZONE);
      return format(utcDate, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error converting to UTC:', error);
      return new Date().toISOString().split('T')[0];
    }
  },

  /**
   * Convert UTC date from storage to local timezone for display
   * @param utcDate YYYY-MM-DD format string in UTC
   * @returns Formatted date string in local timezone
   */
  fromStorage: (utcDate: string): string => {
    try {
      const date = parseISO(utcDate);
      if (!isValid(date)) {
        throw new Error('Invalid UTC date');
      }
      const localDate = utcToZonedTime(date, TIME_ZONE);
      return format(localDate, 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error converting from UTC:', error);
      return new Date().toLocaleDateString();
    }
  },

  /**
   * Format a date for input fields (YYYY-MM-DD)
   * @param date Date string or Date object
   * @returns YYYY-MM-DD format string
   */
  toInputFormat: (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return format(d, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return new Date().toISOString().split('T')[0];
    }
  },

  /**
   * Parse a date string from any format to Date object
   * @param dateString Date string in any format
   * @returns Date object
   */
  parse: (dateString: string): Date => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        throw new Error('Invalid date string');
      }
      return date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  },

  /**
   * Get today's date in storage format (UTC)
   * @returns YYYY-MM-DD format string in UTC
   */
  today: (): string => {
    return dateUtils.toStorage(new Date());
  },

  /**
   * Format a month key (YYYY-MM)
   * @param year Year
   * @param month Month (0-11)
   * @returns YYYY-MM format string
   */
  formatMonthKey: (year: number, month: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
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
      const d = typeof date === 'string' ? parseISO(date) : date;
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

      if (!isValid(d) || !isValid(start) || !isValid(end)) {
        throw new Error('Invalid date in range check');
      }

      // Normalize all dates to start of day for consistent comparison
      d.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return d >= start && d <= end;
    } catch (error) {
      console.error('Error in isWithinRange:', error);
      return false;
    }
  },

  /**
   * Add days to a date
   * @param date Starting date
   * @param days Number of days to add
   * @returns Date string in storage format
   */
  addDays: (date: Date | string, days: number): string => {
    try {
      const d = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return dateUtils.toStorage(addDays(d, days));
    } catch (error) {
      console.error('Error adding days:', error);
      return dateUtils.today();
    }
  },

  /**
   * Subtract days from a date
   * @param date Starting date
   * @param days Number of days to subtract
   * @returns Date string in storage format
   */
  subtractDays: (date: Date | string, days: number): string => {
    try {
      const d = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(d)) {
        throw new Error('Invalid date');
      }
      return dateUtils.toStorage(subDays(d, days));
    } catch (error) {
      console.error('Error subtracting days:', error);
      return dateUtils.today();
    }
  },

  /**
   * Compare two dates for equality (ignoring time)
   * @param date1 First date
   * @param date2 Second date
   * @returns boolean
   */
  isSameDay: (date1: Date | string, date2: Date | string): boolean => {
    try {
      const d1 = dateUtils.toStorage(date1);
      const d2 = dateUtils.toStorage(date2);
      return d1 === d2;
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
  },

  /**
   * Check if a date is in the past
   * @param date Date to check
   * @returns boolean
   */
  isPast: (date: Date | string): boolean => {
    try {
      const compareDate = dateUtils.toStorage(date);
      const today = dateUtils.today();
      return compareDate < today;
    } catch (error) {
      console.error('Error checking if date is past:', error);
      return false;
    }
  }
};

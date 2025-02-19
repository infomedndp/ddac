# Date Utilities

This directory contains separate date utility modules for different features of the application. Each module is designed to handle date-related operations specific to its domain.

## Modules

### transactionDates
Handles dates for financial transactions, including formatting, parsing, and range checks.

### reportDates
Manages dates for financial reports, with functions for fiscal periods and date ranges.

### payrollDates
Handles payroll-specific date operations, including pay periods and calculations.

### invoiceDates
Manages dates for invoices and accounts receivable/payable, including due dates and aging calculations.

## Usage

Import the specific date utility module for your feature:

```typescript
import { transactionDates } from '../utils/dates';
import { reportDates } from '../utils/dates';
import { payrollDates } from '../utils/dates';
import { invoiceDates } from '../utils/dates';
```

Each module provides its own specialized date handling functions to prevent cross-contamination between features.

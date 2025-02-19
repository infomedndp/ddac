import React from 'react';
import { read, utils } from 'xlsx';
import { Upload, X } from 'lucide-react';
import { Transaction } from '../../types/transactions';
import { BankAccount } from '../../types/company';

interface TransactionUploadProps {
  children: React.ReactNode;
  onUpload: (transactions: Transaction[]) => void;
  bankAccounts: BankAccount[];
}

export function TransactionUpload({ children, onUpload, bankAccounts }: TransactionUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [showAccountSelect, setShowAccountSelect] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedAccountId, setSelectedAccountId] = React.useState('');
  const dropZoneRef = React.useRef<HTMLDivElement>(null);

  const parseDate = (value: any): string => {
    if (!value) return new Date().toISOString();

    // If it's an Excel date number
    if (typeof value === 'number') {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toISOString();
    }

    // If it's a string, try parsing it
    const dateStr = String(value).trim();
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }

    // Try parsing MM/DD/YYYY format
    const parts = dateStr.split(/[/-]/);
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1;
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    throw new Error(`Invalid date format: ${value}`);
  };

  const parseAmount = (value: any): number => {
    if (typeof value === 'number') return value;
    
    if (!value) return 0;

    // Remove any currency symbols, commas and spaces
    const cleanValue = String(value)
      .replace(/[$,\s]/g, '')
      .replace(/[^0-9.-]/g, '')
      .trim();

    const amount = parseFloat(cleanValue);
    if (isNaN(amount)) {
      throw new Error(`Invalid amount format: ${value}`);
    }
    return amount;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setShowAccountSelect(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowAccountSelect(true);
    }
  };

  const processFile = async (file: File, accountId: string) => {
    try {
      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        throw new Error('Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file');
      }

      const buffer = await file.arrayBuffer();
      const workbook = read(buffer);
      
      if (!workbook.SheetNames.length) {
        throw new Error('The file appears to be empty');
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false,
        defval: ''
      }) as any[][];

      if (data.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      // Get and validate headers
      const headers = data[0].map((h: any) => String(h).toLowerCase().trim());
      const dateCol = headers.findIndex(h => h.includes('date'));
      const descCol = headers.findIndex(h => h.includes('description'));
      const amountCol = headers.findIndex(h => h.includes('amount'));

      if (dateCol === -1) throw new Error('Required column "Date" not found');
      if (descCol === -1) throw new Error('Required column "Description" not found');
      if (amountCol === -1) throw new Error('Required column "Amount" not found');

      // Process data rows
      const transactions: Transaction[] = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[descCol]) continue;

        try {
          const description = String(row[descCol]).trim();
          if (!description) continue;

          const date = parseDate(row[dateCol]);
          const amount = parseAmount(row[amountCol]);

          transactions.push({
            id: `${Date.now()}-${i}`,
            date,
            description,
            amount,
            category: 'Uncategorized',
            bankAccountId: accountId,
            source: 'upload'
          });
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          throw new Error(`Error in row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
        }
      }

      if (transactions.length === 0) {
        throw new Error('No valid transactions found in file');
      }

      onUpload(transactions);
      setShowAccountSelect(false);
      setSelectedFile(null);
      setSelectedAccountId('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while processing the file';
      console.error('Error processing file:', errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div 
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
    >
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-100 border-2 border-dashed border-indigo-500 rounded-lg z-10">
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto text-indigo-500" />
            <p className="mt-2 text-sm font-medium text-indigo-600">Drop your file here</p>
          </div>
        </div>
      )}
      {children}

      {/* Bank Account Selection Modal */}
      {showAccountSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Bank Account</h3>
              <button
                onClick={() => {
                  setShowAccountSelect(false);
                  setSelectedFile(null);
                  setSelectedAccountId('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bank Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select an account...</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} (ending in {account.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountSelect(false);
                    setSelectedFile(null);
                    setSelectedAccountId('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedAccountId || !selectedFile}
                  onClick={() => selectedFile && processFile(selectedFile, selectedAccountId)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Upload Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

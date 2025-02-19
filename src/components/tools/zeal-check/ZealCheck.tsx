import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileText, Menu, Trash2, X, Upload, Bot } from 'lucide-react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useCompany } from '../../../context/CompanyContext';
import { FileUpload } from './components/FileUpload';
import { DocumentViewer } from './components/DocumentViewer';
import { TransactionList } from './components/TransactionList';
import { Document, Transaction } from './types';
import { BankAccountSelectModal } from '../../transactions/BankAccountSelectModal';

export function ZealCheck() {
  const { companyData, updateCompanyData } = useCompany();
  const [config] = useLocalStorage('accountpro-config', {
    makeWebhookUrl: '',
    docuClipperWebhook: '',
    zealCheckWebhook: ''
  });
  const [documents, setDocuments] = useState<Document[]>(companyData?.tools?.zealCheck?.documents || []);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [documentViewerWidth, setDocumentViewerWidth] = useState(50);
  const [tempWidth, setTempWidth] = useState(50);
  const isDraggingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);

  useEffect(() => {
    if (documents.length > 0) {
      updateCompanyData({
        tools: {
          ...companyData?.tools,
          zealCheck: {
            documents,
          }
        }
      });
    }
  }, [documents]);

  useEffect(() => {
    // Fetch bank accounts from company data
    const accounts = companyData?.bankAccounts || [];
    setBankAccounts(accounts);
  }, [companyData]);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const newDocs: Document[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      status: 'pending',
      transactions: [],
      createdAt: new Date().toISOString()
    }));

    setDocuments(prev => [...prev, ...newDocs]);
    setShowDocumentPanel(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const container = document.getElementById('resizable-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const clampedWidth = Math.min(Math.max(newWidth, 20), 80);
    setTempWidth(clampedWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      setDocumentViewerWidth(tempWidth);
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [tempWidth]);

  const handleUpdateTransaction = useCallback((index: number, updatedTransaction: Transaction | null) => {
    if (!selectedDocument) return;

    let updatedTransactions: Transaction[];
    
    if (index === -1) {
      const newTransaction = {
        ...updatedTransaction!,
        amount: -Math.abs(updatedTransaction!.amount)
      };
      updatedTransactions = [...selectedDocument.transactions, newTransaction];
    } else {
      updatedTransactions = [...selectedDocument.transactions];
      if (updatedTransaction) {
        updatedTransactions[index] = {
          ...updatedTransaction,
          amount: -Math.abs(updatedTransaction.amount)
        };
      } else {
        updatedTransactions.splice(index, 1);
      }
    }

    const updatedDocument = {
      ...selectedDocument,
      transactions: updatedTransactions
    };

    setDocuments(prev => 
      prev.map(doc => doc.id === selectedDocument.id ? updatedDocument : doc)
    );
    setSelectedDocument(updatedDocument);
  }, [selectedDocument]);

  const handleExport = useCallback(() => {
    if (!selectedDocument?.transactions.length) return;

    const exportChoice = window.confirm("Do you want to export as CSV? Click 'OK' for CSV or 'Cancel' to export to Transaction Manager.");
    
    if (exportChoice) {
      // Export as CSV
      const csv = [
        ['Date', 'Description', 'Amount'],
        ...selectedDocument.transactions.map(t => [t.date, t.description, t.amount.toString()])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${selectedDocument.name}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Show bank account selection modal
      setShowBankAccountModal(true);
    }
  }, [selectedDocument]);

  const handleBankAccountSelect = (accountId: string) => {
    const transactionsToExport = selectedDocument.transactions.map(tx => ({
      ...tx,
      bankAccountId: accountId
    }));
    // Call a function to handle adding these transactions to the transaction manager
    addTransactionsToManager(transactionsToExport);
    setShowBankAccountModal(false);
  };

  const addTransactionsToManager = async (transactions) => {
    const existingTransactions = companyData?.transactions || [];
    const transactionsWithIds = transactions.map(tx => ({
      ...tx,
      id: `zeal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: 'zeal-check'
    }));

    updateCompanyData({
      ...companyData,
      transactions: [...existingTransactions, ...transactionsWithIds]
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleProcessDocument = async (doc: Document) => {
    if (!config.zealCheckWebhook) {
      alert('Zeal Check webhook URL is not configured. Please set it in Admin Settings.');
      return;
    }

    setIsProcessing(true);
    
    // Update document status to processing
    const updatedDocs = documents.map(d => 
      d.id === doc.id ? { ...d, status: 'processing' as const } : d
    );
    setDocuments(updatedDocs);

    try {
      const formData = new FormData();
      const response = await fetch(doc.url);
      const blob = await response.blob();
      formData.append('file', blob, doc.name);
      formData.append('documentId', doc.id);

      const webhookResponse = await fetch(config.zealCheckWebhook, {
        method: 'POST',
        body: formData,
      });

      if (!webhookResponse.ok) {
        throw new Error('Processing failed');
      }

      const responseData = await webhookResponse.json();
      const extractedTransactions = Array.isArray(responseData) ? responseData : [];

      // Update document with extracted transactions and completed status
      const formattedTransactions = extractedTransactions.map((tx: any) => ({
        date: tx.Date,
        description: tx.Description,
        amount: -Math.abs(parseFloat(tx.Amount)), // Ensure amount is negative for expenses
        category: 'Uncategorized'
      }));

      const updatedDocument = {
        ...doc,
        status: 'completed' as const,
        transactions: formattedTransactions
      };

      setDocuments(prev => 
        prev.map(d => d.id === doc.id ? updatedDocument : d)
      );
      setSelectedDocument(updatedDocument);

    } catch (error) {
      console.error('Error processing document:', error);
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, status: 'error' as const } : d
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar with Toggle */}
      <div className="bg-white p-4 flex items-center justify-between border-b">
        <button
          onClick={() => setShowDocumentPanel(!showDocumentPanel)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Menu size={20} />
          <span className="text-sm font-medium">Toggle Document Panel</span>
        </button>
      </div>

      <div className="flex-1 flex relative">
        {/* Document List Panel - Toggleable */}
        {showDocumentPanel && (
          <div className="w-64 border-r border-gray-200 bg-white">
            <div className="p-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Upload size={16} />
                Upload Document
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                accept=".pdf"
                multiple
              />
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 border-b hover:bg-gray-50 ${
                    selectedDocument?.id === doc.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                    <FileText size={16} className="text-blue-600 flex-shrink-0" />
                    <span className="font-medium truncate">{doc.name}</span>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    {doc.status === 'pending' && (
                      <button
                        onClick={() => handleProcessDocument(doc)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                        disabled={isProcessing}
                      >
                        <Bot size={14} />
                        Process Document
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this document?')) {
                          setDocuments(prev => prev.filter(d => d.id !== doc.id));
                          if (selectedDocument?.id === doc.id) {
                            setSelectedDocument(null);
                          }
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                  {doc.status === 'processing' && (
                    <div className="mt-2 text-xs text-blue-600">
                      Processing...
                    </div>
                  )}
                  {doc.status === 'error' && (
                    <div className="mt-2 text-xs text-red-600">
                      Processing failed
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex h-[calc(100vh-4rem)]">
          {/* Document Viewer */}
          <div
            className="flex-1 bg-gray-100 overflow-hidden"
            style={{ width: `${documentViewerWidth}%` }}
          >
            {selectedDocument ? (
              <DocumentViewer document={selectedDocument} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a document to view
              </div>
            )}
          </div>

          {/* Resizer */}
          <div
            className="w-1 bg-gray-200 cursor-col-resize hover:bg-blue-500"
            onMouseDown={handleMouseDown}
          />

          {/* Transaction List */}
          <div
            className="flex-1 bg-white overflow-hidden"
            style={{ width: `${100 - documentViewerWidth}%` }}
          >
            <TransactionList
              transactions={selectedDocument?.transactions || []}
              onExport={handleExport}
              onUpdateTransaction={handleUpdateTransaction}
              onAddTransaction={(transaction) => handleUpdateTransaction(-1, transaction)}
            />
          </div>
        </div>
      </div>

      {showBankAccountModal && (
        <BankAccountSelectModal
          isOpen={showBankAccountModal}
          onClose={() => setShowBankAccountModal(false)}
          onSelect={handleBankAccountSelect}
          bankAccounts={bankAccounts}
        />
      )}
    </div>
  );
} 
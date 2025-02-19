import React from 'react';
import { Upload, FileType, AlertCircle, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCompany } from '../context/CompanyContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ConvertedFile } from '../types/convertedFiles';

export function FileConverter() {
  const { selectedCompany } = useCompany();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [converting, setConverting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [documentType, setDocumentType] = React.useState('');
  const [convertedFiles, setConvertedFiles] = React.useState<ConvertedFile[]>([]);
  const [config] = useLocalStorage('accountpro-config', {
    makeWebhookUrl: '',
    docuClipperWebhook: ''
  });

  // Subscribe to converted files collection
  React.useEffect(() => {
    if (!selectedCompany?.id) return;

    const filesRef = collection(db, 'companies', selectedCompany.id, 'convertedFiles');
    const filesQuery = query(filesRef, orderBy('convertedAt', 'desc'));

    const unsubscribe = onSnapshot(filesQuery, 
      (snapshot) => {
        const files: ConvertedFile[] = [];
        snapshot.forEach((doc) => {
          files.push({ id: doc.id, ...doc.data() } as ConvertedFile);
        });
        setConvertedFiles(files);
      },
      (error) => {
        console.error('Error fetching converted files:', error);
        setError('Failed to load conversion history');
      }
    );

    return () => unsubscribe();
  }, [selectedCompany?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !documentType) {
      setError('Please select a file and document type');
      return;
    }

    if (!config.docuClipperWebhook) {
      setError('DocuClipper webhook URL is not configured. Please set it in Admin Settings.');
      return;
    }

    setConverting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', documentType);
    formData.append('companyId', selectedCompany?.id || '');

    try {
      const response = await fetch(config.docuClipperWebhook, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      // Clear form after successful conversion
      setSelectedFile(null);
      setDocumentType('');
      
    } catch (err) {
      setError('Failed to convert file. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setConverting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">File Converter</h1>
        <p className="mt-1 text-sm text-gray-500">
          Convert financial documents to CSV format
        </p>
      </header>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select document type...</option>
                <option value="bank_statement">Bank Statement</option>
                <option value="invoice">Invoice</option>
                <option value="receipt">Receipt</option>
                <option value="tax_return">Tax Return</option>
                <option value="w2">W-2</option>
                <option value="1099">1099</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Upload File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FileType className="w-4 h-4" />
                <span>{selectedFile.name}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleConvert}
              disabled={!selectedFile || !documentType || converting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {converting ? 'Converting...' : 'Convert to CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Converted Files Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Conversion History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {convertedFiles.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No converted files yet
            </div>
          ) : (
            convertedFiles.map((file) => (
              <div key={file.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {file.status === 'completed' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {file.originalName}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="capitalize">{file.documentType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(file.convertedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {file.status === 'completed' && (
                  <a
                    href={file.convertedUrl}
                    download
                    className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

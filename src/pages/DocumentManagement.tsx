import React from 'react';
import { X, Plus, Search } from 'lucide-react';
import { Document } from '../types/documents';
import { useCompany } from '../context/CompanyContext';

interface DocumentManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentManagement({ isOpen, onClose }: DocumentManagementProps) {
  const { companyData, updateCompanyData, selectedCompany } = useCompany();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'needed' | 'received' | 'not-required'>('all');
  const [showAddDocument, setShowAddDocument] = React.useState(false);

  const documents = React.useMemo(() => {
    return Array.isArray(companyData?.workManagement?.documents) 
      ? companyData.workManagement.documents 
      : [];
  }, [companyData?.workManagement?.documents]);

  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!doc.name.toLowerCase().includes(searchLower)) return false;
      }
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      return true;
    });
  }, [documents, searchTerm, statusFilter]);

  const handleAddDocument = async (document: Document) => {
    try {
      const updatedDocuments = [...documents, document];
      await updateCompanyData({
        workManagement: {
          ...companyData?.workManagement,
          documents: updatedDocuments
        }
      });
      setShowAddDocument(false);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleUpdateStatus = async (documentId: string, status: Document['status']) => {
    try {
      const updatedDocuments = documents.map(doc =>
        doc.id === documentId
          ? { ...doc, status, updatedAt: new Date().toISOString() }
          : doc
      );

      await updateCompanyData({
        workManagement: {
          ...companyData?.workManagement,
          documents: updatedDocuments
        }
      });
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Document Management</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage documents for {selectedCompany?.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddDocument(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="needed">Needed</option>
              <option value="received">Received</option>
              <option value="not-required">Not Required</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{doc.name}</h3>
                    {doc.notes && (
                      <p className="mt-1 text-sm text-gray-500">{doc.notes}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      {doc.dueDate && (
                        <span>Due: {new Date(doc.dueDate).toLocaleDateString()}</span>
                      )}
                      {doc.category && (
                        <span>Category: {doc.category}</span>
                      )}
                    </div>
                  </div>
                  <select
                    value={doc.status}
                    onChange={(e) => handleUpdateStatus(doc.id, e.target.value as Document['status'])}
                    className={`ml-4 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                      doc.status === 'received'
                        ? 'text-green-700 bg-green-50'
                        : doc.status === 'needed'
                        ? 'text-red-700 bg-red-50'
                        : 'text-gray-700 bg-gray-50'
                    }`}
                  >
                    <option value="needed">Needed</option>
                    <option value="received">Received</option>
                    <option value="not-required">Not Required</option>
                  </select>
                </div>
              </div>
            ))}
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add a new document to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

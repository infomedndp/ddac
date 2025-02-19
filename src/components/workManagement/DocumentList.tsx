import React from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Document } from '../../types/workManagement';
import { Company } from '../../types/company';

interface DocumentListProps {
  documents: Document[];
  companies: Company[];
  searchTerm: string;
  statusFilter: string;
  onUpdateStatus: (documentId: string, status: Document['status']) => void;
}

export function DocumentList({
  documents,
  companies,
  searchTerm,
  statusFilter,
  onUpdateStatus
}: DocumentListProps) {
  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const company = companies.find(c => c.id === doc.companyId);
        const matchesSearch = 
          doc.name.toLowerCase().includes(searchLower) ||
          doc.notes?.toLowerCase().includes(searchLower) ||
          company?.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && doc.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [documents, companies, searchTerm, statusFilter]);

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'received':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'not-required':
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (filteredDocuments.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
        <p className="mt-2 text-sm text-gray-500">
          {searchTerm || statusFilter !== 'all'
            ? 'Try adjusting your filters'
            : 'Add a new document requirement to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredDocuments.map((doc) => {
        const company = companies.find(c => c.id === doc.companyId);
        
        return (
          <div key={doc.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">{doc.name}</h3>
                </div>
                {company && (
                  <p className="mt-1 text-sm text-gray-500">
                    Required from: {company.name}
                  </p>
                )}
                {doc.notes && (
                  <p className="mt-2 text-sm text-gray-500">{doc.notes}</p>
                )}
                {doc.dueDate && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Due by {new Date(doc.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="ml-4">
                <select
                  value={doc.status}
                  onChange={(e) => onUpdateStatus(doc.id, e.target.value as Document['status'])}
                  className={`text-sm font-medium rounded-md border-0 ${getStatusColor(doc.status)} px-3 py-1`}
                >
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="not-required">Not Required</option>
                </select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

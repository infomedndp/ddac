import React from 'react';
import { X } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

interface CompanyInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyInfo({ isOpen, onClose }: CompanyInfoProps) {
  const { selectedCompany } = useCompany();

  if (!isOpen || !selectedCompany) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{selectedCompany.name}</h3>
            {selectedCompany.taxId && (
              <p className="text-sm text-gray-500">Tax ID: {selectedCompany.taxId}</p>
            )}
          </div>

          {(selectedCompany.address || selectedCompany.city || selectedCompany.state || selectedCompany.zipCode) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Address</h4>
              <p className="mt-1 text-sm text-gray-900">
                {selectedCompany.address}<br />
                {selectedCompany.city}, {selectedCompany.state} {selectedCompany.zipCode}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {selectedCompany.phone && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Phone</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedCompany.phone}</p>
              </div>
            )}

            {selectedCompany.email && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Email</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedCompany.email}</p>
              </div>
            )}

            {selectedCompany.website && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Website</h4>
                <p className="mt-1 text-sm text-gray-900">
                  <a 
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    {selectedCompany.website}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

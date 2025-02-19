import React from 'react';
import { X } from 'lucide-react';
import { Contractor } from '../../types/payroll';

interface ContractorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contractor: Contractor) => void;
  contractor: Contractor | null;
}

export function ContractorForm({ isOpen, onClose, onSave, contractor }: ContractorFormProps) {
  const [contractorType, setContractorType] = React.useState<'business' | 'individual'>(
    contractor?.businessName ? 'business' : 'individual'
  );

  const [formData, setFormData] = React.useState<Omit<Contractor, 'id'>>({
    fullName: contractor?.fullName || '',
    businessName: contractor?.businessName || '',
    email: contractor?.email || '',
    taxId: contractor?.taxId || '',
    ssn: contractor?.ssn || '',
    address: contractor?.address || '',
    city: contractor?.city || '',
    state: contractor?.state || '',
    zipCode: contractor?.zipCode || '',
    isActive: contractor?.isActive ?? true,
    bankingDetails: contractor?.bankingDetails || {
      accountNumber: '',
      routingNumber: '',
      accountType: 'checking',
      bankName: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: contractor?.id || `contractor-${Date.now()}`,
      ...formData
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="relative min-h-[calc(100vh-2rem)] flex items-center justify-center py-8">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold text-gray-900">
              {contractor ? 'Edit Contractor' : 'Add Contractor'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Contractor Type</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={contractorType === 'business'}
                    onChange={() => setContractorType('business')}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Business</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={contractorType === 'individual'}
                    onChange={() => setContractorType('individual')}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Individual</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {contractorType === 'business' ? 'Business Name *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={contractorType === 'business' ? formData.businessName : formData.fullName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [contractorType === 'business' ? 'businessName' : 'fullName']: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {contractorType === 'business' ? 'FEIN #' : 'SSN'}
                </label>
                <input
                  type="text"
                  value={contractorType === 'business' ? formData.taxId : formData.ssn}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [contractorType === 'business' ? 'taxId' : 'ssn']: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Direct Deposit Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankingDetails.bankName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bankingDetails: { ...prev.bankingDetails, bankName: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Type</label>
                  <select
                    value={formData.bankingDetails.accountType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bankingDetails: { ...prev.bankingDetails, accountType: e.target.value as 'checking' | 'savings' }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Routing Number</label>
                  <input
                    type="text"
                    value={formData.bankingDetails.routingNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bankingDetails: { ...prev.bankingDetails, routingNumber: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number</label>
                  <input
                    type="text"
                    value={formData.bankingDetails.accountNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bankingDetails: { ...prev.bankingDetails, accountNumber: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                {contractor ? 'Update' : 'Add'} Contractor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

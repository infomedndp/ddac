import React from 'react';
import { Plus, Building2, Clock, Settings as SettingsIcon, Search, ClipboardList } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { AdminSettings } from '../components/settings/AdminSettings';
import { WorkManagementOverview } from '../components/workManagement/WorkManagementOverview';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const { companies, addCompany, selectCompany, loading, setCompanyData, initialCompanyData, companyData } = useCompany();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNewCompanyDialog, setShowNewCompanyDialog] = React.useState(false);
  const [showAdminSettings, setShowAdminSettings] = React.useState(false);
  const [showWorkManagement, setShowWorkManagement] = React.useState(false);
  const [newCompanyName, setNewCompanyName] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCompanyName.trim()) {
      try {
        const companyId = await addCompany(newCompanyName.trim());
        setNewCompanyName('');
        setShowNewCompanyDialog(false);
        
        // Wait for company to be created and data loaded
        await selectCompany(companyId);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error creating company:', error);
      }
    }
  };

  const handleSelectCompany = async (companyId: string) => {
    try {
      setIsSelecting(true);
      setError(null);
      
      await selectCompany(companyId);
      
      // Use replace instead of push to avoid navigation stack issues
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Error selecting company:', error);
      setError('Failed to load company data. Please try again.');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleSwitchCompany = async () => {
    try {
      setIsSelecting(true);
      // Clear company data first
      await selectCompany('');
      // Force a small delay
      await new Promise(resolve => setTimeout(resolve, 100));
      // Then navigate
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error switching company:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  const filteredCompanies = React.useMemo(() => {
    if (!searchTerm) return companies;
    const term = searchTerm.toLowerCase();
    return companies.filter(company => 
      company.name.toLowerCase().includes(term) ||
      company.taxId?.toLowerCase().includes(term) ||
      company.email?.toLowerCase().includes(term)
    );
  }, [companies, searchTerm]);

  if (loading || isSelecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="mt-2 text-sm text-gray-500">Select a company to manage or create a new one</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowWorkManagement(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Work Overview
          </button>
          <button
            onClick={() => setShowAdminSettings(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Admin Settings
          </button>
          <button
            onClick={() => setShowNewCompanyDialog(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Company
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search companies by name, tax ID, or email..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <button
            key={company.id}
            onClick={() => handleSelectCompany(company.id)}
            disabled={isSelecting}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left relative disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Building2 className="w-10 h-10 text-indigo-600" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">{company.name}</h2>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Last accessed {new Date(company.lastAccessed).toLocaleDateString()}
                  </div>
                  {company.taxId && (
                    <div className="mt-1 text-sm text-gray-500">
                      Tax ID: {company.taxId}
                    </div>
                  )}
                  {company.email && (
                    <div className="mt-1 text-sm text-gray-500">
                      {company.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
        {filteredCompanies.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Create a new company to get started'}
            </p>
          </div>
        )}
      </div>

      {showNewCompanyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Company</h2>
            <form onSubmit={handleCreateCompany}>
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter company name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewCompanyDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminSettings isOpen={showAdminSettings} onClose={() => setShowAdminSettings(false)} />
      <WorkManagementOverview isOpen={showWorkManagement} onClose={() => setShowWorkManagement(false)} />
    </div>
  );
}

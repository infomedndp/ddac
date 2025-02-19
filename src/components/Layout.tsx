import React from 'react';
import { 
  LayoutGrid, 
  FileText, 
  DollarSign, 
  Users, 
  FileSpreadsheet,
  ClipboardList,
  Settings as SettingsIcon,
  Building,
  LogOut,
  ArrowLeft,
  ClipboardList as WorkManager,
  ChevronDown,
  ChevronRight,
  GripVertical,
  FileUp,
  ScrollText,
  Scale,
  Book
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { Settings } from './settings/Settings';
import { CompanySettings } from './settings/CompanySettings';
import { CompanyInfo } from './CompanyInfo';
import { WorkManagement } from './workManagement/WorkManagement';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}

interface NavGroup {
  id: string;
  type: 'group' | 'item';
  title: string;
  items?: NavItem[];
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  isOpen?: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  currentPage: string;
  onInvoiceTypeChange: (type: 'in' | 'out') => void;
  invoiceType: 'in' | 'out';
}

function ErrorFallback() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
        <button
          onClick={() => {
            navigate('/');
            window.location.reload();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

export function Layout({ 
  children, 
  onNavigate, 
  currentPage,
  onInvoiceTypeChange,
  invoiceType
}: LayoutProps) {
  const { logout, user } = useAuth();
  const { selectedCompany, selectCompany, loading, companyData, setCompanyData } = useCompany();
  const [showSettings, setShowSettings] = React.useState(false);
  const [showCompanySettings, setShowCompanySettings] = React.useState(false);
  const [showCompanyInfo, setShowCompanyInfo] = React.useState(false);
  const [showWorkManagement, setShowWorkManagement] = React.useState(false);
  const [navGroups, setNavGroups] = useLocalStorage<NavGroup[]>('nav-groups', [
    {
      id: 'dashboard',
      type: 'item',
      title: 'Dashboard',
      icon: <LayoutGrid className="w-5 h-5" />,
      onClick: () => handleNavigation('dashboard'),
      isActive: currentPage === 'dashboard'
    },
    {
      id: 'ar-ap',
      type: 'group',
      title: 'AR/AP',
      items: [
        {
          id: 'invoices-out',
          title: 'Customer Invoices',
          icon: <FileText className="w-5 h-5" />,
          onClick: () => handleNavigation('invoices-out'),
          isActive: currentPage === 'invoices-out'
        },
        {
          id: 'invoices-in',
          title: 'Vendor Bills',
          icon: <FileText className="w-5 h-5" />,
          onClick: () => handleNavigation('invoices-in'),
          isActive: currentPage === 'invoices-in'
        }
      ],
      isOpen: false
    },
    {
      id: 'transactions',
      type: 'group',
      title: 'Transactions Manager',
      items: [
        {
          id: 'transactions',
          title: 'Transactions',
          icon: <DollarSign className="w-5 h-5" />,
          onClick: () => handleNavigation('transactions'),
          isActive: currentPage === 'transactions'
        },
        {
          id: 'reconcile',
          title: 'Reconcile',
          icon: <Scale className="w-5 h-5" />,
          onClick: () => handleNavigation('reconcile'),
          isActive: currentPage === 'reconcile'
        },
        {
          id: 'category-rules',
          title: 'Category Rules',
          icon: <FileSpreadsheet className="w-5 h-5" />,
          onClick: () => handleNavigation('category-rules'),
          isActive: currentPage === 'category-rules'
        },
        {
          id: 'chart-of-accounts',
          title: 'Chart of Accounts',
          icon: <FileSpreadsheet className="w-5 h-5" />,
          onClick: () => handleNavigation('chart-of-accounts'),
          isActive: currentPage === 'chart-of-accounts'
        }
      ],
      isOpen: false
    },
    {
      id: 'payroll',
      type: 'item',
      title: 'Payroll',
      icon: <Users className="w-5 h-5" />,
      onClick: () => handleNavigation('payroll'),
      isActive: currentPage === 'payroll'
    },
    {
      id: 'reports',
      type: 'item',
      title: 'Reports',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      onClick: () => handleNavigation('reports'),
      isActive: currentPage === 'reports'
    },
    {
      id: 'tools',
      type: 'group',
      title: 'Tools',
      items: [
        {
          id: 'zeal-check',
          title: 'Zeal Check',
          icon: <FileSpreadsheet className="w-5 h-5" />,
          onClick: () => handleNavigation('tools/zeal-check'),
          isActive: currentPage === 'tools/zeal-check'
        },
        {
          id: 'file-converter',
          title: 'File Converter',
          icon: <FileUp className="w-5 h-5" />,
          onClick: () => handleNavigation('tools/file-converter'),
          isActive: currentPage === 'tools/file-converter'
        },
        {
          id: 'fill-forms',
          title: 'Fill Forms',
          icon: <ScrollText className="w-5 h-5" />,
          onClick: () => handleNavigation('tools/fill-forms'),
          isActive: currentPage === 'tools/fill-forms'
        }
      ],
      isOpen: false
    }
  ]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigate = useNavigate();

  const handleSwitchCompany = async () => {
    try {
      // Navigate first
      navigate('/');
      // Then clear company data
      await selectCompany('');
      setCompanyData(initialCompanyData);
    } catch (error) {
      console.error('Error switching company:', error);
    }
  };

  const toggleGroup = (groupId: string) => {
    setNavGroups(groups => 
      groups.map(group => 
        group.id === groupId && group.type === 'group'
          ? { ...group, isOpen: !group.isOpen }
          : group
      )
    );
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.add('bg-gray-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('bg-gray-50');
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('bg-gray-50');
    
    const draggedId = e.dataTransfer.getData('text/plain');
    
    setNavGroups(groups => {
      const draggedIndex = groups.findIndex(g => g.id === draggedId);
      const targetIndex = groups.findIndex(g => g.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return groups;
      
      const newGroups = [...groups];
      const [draggedItem] = newGroups.splice(draggedIndex, 1);
      newGroups.splice(targetIndex, 0, draggedItem);
      
      return newGroups;
    });
  };

  const renderNavItem = (item: NavGroup) => {
    if (item.type === 'group') {
      return (
        <div
          key={item.id}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item.id)}
          className="mb-2 transition-colors duration-200"
        >
          <div 
            className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 rounded-md"
            onClick={() => toggleGroup(item.id)}
          >
            <div className="flex items-center">
              <GripVertical className="w-4 h-4 mr-2 cursor-move text-gray-400" />
              <span>{item.title}</span>
            </div>
            {item.isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          {item.isOpen && item.items && (
            <div className="mt-1 space-y-1 ml-4">
              {item.items.map((subItem) => (
                <button
                  key={subItem.id}
                  onClick={subItem.onClick}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                    subItem.isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {subItem.icon}
                  <span className="ml-3">{subItem.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          key={item.id}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item.id)}
          className="mb-2 transition-colors duration-200"
        >
          <button
            onClick={item.onClick}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
              item.isActive
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <GripVertical className="w-4 h-4 mr-2 cursor-move text-gray-400" />
            {item.icon}
            <span className="ml-3">{item.title}</span>
          </button>
        </div>
      );
    }
  };

  const handleNavigation = (page: string) => {
    onNavigate(page);
    navigate(`/${page}`);
  };

  React.useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gray-100">
        {/* Top Header */}
        <div className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-end h-full px-8 space-x-4">
            <button
              onClick={() => setShowWorkManagement(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <WorkManager className="w-4 h-4 mr-2" />
              Work Manager
            </button>
            <button
              onClick={handleSwitchCompany}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Switch Company
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Company Info */}
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => setShowCompanyInfo(true)}
                className="w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <Building className="w-6 h-6 text-indigo-600" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-medium text-gray-900 truncate">
                      {selectedCompany?.name}
                    </h2>
                  </div>
                </div>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navGroups.map(renderNavItem)}
            </nav>

            {/* Settings */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCompanySettings(true)}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
              >
                <SettingsIcon className="w-5 h-5 mr-3" />
                Company Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pl-64 pt-16">
          <main className="p-8">
            {children}
          </main>
        </div>

        {/* Modals */}
        {showSettings && (
          <Settings
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showCompanySettings && (
          <CompanySettings
            isOpen={showCompanySettings}
            onClose={() => setShowCompanySettings(false)}
          />
        )}

        {showCompanyInfo && (
          <CompanyInfo
            isOpen={showCompanyInfo}
            onClose={() => setShowCompanyInfo(false)}
          />
        )}

        {showWorkManagement && (
          <WorkManagement
            isOpen={showWorkManagement}
            onClose={() => setShowWorkManagement(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

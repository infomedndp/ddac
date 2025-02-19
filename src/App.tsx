import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionManager } from './components/transactions/TransactionManager';
import { CategoryRulesPage } from './components/transactions/CategoryRulesPage';
import { ChartOfAccounts } from './components/transactions/ChartOfAccounts';
import { ReconcilePage } from './components/transactions/ReconcilePage';
import { Payroll } from './components/payroll/Payroll';
import { Reports } from './components/reports/Reports';
import { FileConverter } from './components/FileConverter';
import { FillForms } from './pages/FillForms';
import { InvoiceManager } from './components/invoices/InvoiceManager';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { AdminAuth } from './pages/AdminAuth';
import { AdminDashboard } from './pages/admin/Dashboard';
import { Users } from './pages/admin/Users';
import { Practices } from './pages/admin/Practices';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { PrivateRoute } from './components/PrivateRoute';
import { ZealCheck } from './components/tools/zeal-check/ZealCheck';

function CustomErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();
  
  const handleReset = () => {
    resetErrorBoundary();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <pre className="text-sm bg-gray-100 p-4 rounded mb-4 overflow-auto">
          {error.message}
        </pre>
        <button
          onClick={handleReset}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { selectedId: selectedCompanyId, loading, companyData } = useCompany();
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [invoiceType, setInvoiceType] = React.useState<'in' | 'out'>('in');
  const location = useLocation();
  const navigate = useNavigate();
  const [isClient, setIsClient] = React.useState(false);
  const navigationAttempted = React.useRef(false);
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug logging
  React.useEffect(() => {
    console.log('AppContent render:', { 
      selectedId: selectedCompanyId, 
      loading, 
      pathname: location.pathname,
      hasCompanyData: !!companyData,
      isClient,
      navigationAttempted: navigationAttempted.current,
      isInitialMount: isInitialMount.current
    });
  }, [selectedCompanyId, loading, location.pathname, companyData, isClient]);

  // Protect routes and handle redirects
  React.useEffect(() => {
    if (!isClient || loading) return; // Don't run on server or while loading

    const isProtectedRoute = location.pathname !== '/' && 
                            location.pathname !== '/auth' && 
                            location.pathname !== '/admin/auth' &&
                            !location.pathname.startsWith('/admin/');
    
    const navigationState = location.state as { 
      selecting?: boolean; 
      companyId?: string; 
      timestamp?: number;
      source?: string;
    } | null;
    
    console.log('Route protection check:', { 
      isProtectedRoute, 
      selectedId: selectedCompanyId, 
      pathname: location.pathname,
      loading,
      state: navigationState,
      navigationAttempted: navigationAttempted.current,
      isInitialMount: isInitialMount.current
    });

    // Skip redirect on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only redirect if we haven't already attempted navigation
    if (!selectedCompanyId && 
        isProtectedRoute && 
        !navigationState?.selecting && 
        !navigationState?.timestamp &&
        navigationState?.source !== 'home' &&
        !navigationAttempted.current) {
      console.log('No company selected for protected route, redirecting to home');
      navigationAttempted.current = true;
      navigate('/', { 
        replace: true,
        state: { 
          redirected: true,
          timestamp: Date.now()
        }
      });
    }
  }, [selectedCompanyId, location.pathname, loading, navigate, location.state, isClient]);

  // Reset navigation attempt flag when location changes
  React.useEffect(() => {
    navigationAttempted.current = false;
  }, [location.pathname]);

  if (!isClient) {
    return null; // Return null for SSR to avoid hydration mismatch
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin/auth" element={<AdminAuth />} />
      
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Layout 
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onInvoiceTypeChange={setInvoiceType}
              invoiceType={invoiceType}
            >
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } 
      />
      <Route path="/transactions" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <TransactionManager />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/category-rules" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <CategoryRulesPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/chart-of-accounts" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <ChartOfAccounts />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/reconcile" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <ReconcilePage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/payroll" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <Payroll />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/reports" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <Reports />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/tools/file-converter" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <FileConverter />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/tools/fill-forms" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <FillForms />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/tools/zeal-check" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <ZealCheck />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/invoices-in" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <InvoiceManager type="in" />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/invoices-out" element={
        <PrivateRoute>
          <Layout 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onInvoiceTypeChange={setInvoiceType}
            invoiceType={invoiceType}
          >
            <InvoiceManager type="out" />
          </Layout>
        </PrivateRoute>
      } />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute><Users /></PrivateRoute>} />
      <Route path="/admin/practices" element={<PrivateRoute><Practices /></PrivateRoute>} />
    </Routes>
  );
}

function ErrorBoundaryWrapper() {
  return (
    <ErrorBoundary
      FallbackComponent={CustomErrorFallback}
      onReset={() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }}
    >
      <AuthProvider>
        <CompanyProvider>
          <AppContent />
        </CompanyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundaryWrapper />
    </BrowserRouter>
  );
}

export default App;

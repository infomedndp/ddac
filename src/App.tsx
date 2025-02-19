import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
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
import { ErrorFallback } from './components/ErrorFallback';

function ErrorFallback({ error, resetErrorBoundary }) {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    console.error('Error caught by boundary:', error);
  }, [error]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => {
            resetErrorBoundary();
            navigate('/', { replace: true });
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { selectedId: selectedCompanyId } = useCompany();
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [invoiceType, setInvoiceType] = React.useState<'in' | 'out'>('in');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleInvoiceTypeChange = (type: 'in' | 'out') => {
    setInvoiceType(type);
  };

  return (
    <Suspense 
      key={selectedCompanyId}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/auth" element={<AdminAuth />} />
        
        {/* Protected User Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout 
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
              invoiceType={invoiceType}
            >
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/transactions" element={
          <PrivateRoute>
            <Layout 
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
              onNavigate={handleNavigate}
              onInvoiceTypeChange={handleInvoiceTypeChange}
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
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
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
    </BrowserRouter>
  );
}

export default App;

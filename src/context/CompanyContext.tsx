import React, { useState, useMemo, useEffect, useContext } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc,
  onSnapshot,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Company, CompanyData } from '../types/company';
import { v4 as uuidv4 } from 'uuid';

interface CompanyContextType {
  companies: Company[];
  selectedId: string | null;
  selectedCompanyId: string | null;
  selectedCompany: Company | null;
  companyData: CompanyData;
  isOffline: boolean;
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  addCompany: (name: string) => Promise<void>;
  selectCompany: (id: string) => Promise<string | null>;
  updateCompanyData: (data: Partial<CompanyData & { id?: string }>) => Promise<void>;
  updateCompanyInfo: (info: Partial<Company>) => Promise<void>;
}

const CompanyContext = React.createContext<CompanyContextType | null>(null);

// Default Uncategorized account that should always exist
const defaultUncategorizedAccount = {
  id: 'uncategorized-default',
  accountNumber: '00000',
  accountName: 'Uncategorized',
  accountType: 'Other',
  category: 'Other',
  description: 'Default account for uncategorized transactions',
  balance: 0,
  isActive: true,
  version: 'default',
  subtype: null
};

const initialCompanyData: CompanyData = {
  transactions: [],
  accounts: [defaultUncategorizedAccount],
  categoryRules: [],
  customers: [],
  vendors: [],
  invoices: [],
  bankAccounts: [], // Initialize empty bank accounts array
  payroll: {
    employees: [],
    contractors: [],
    payrollRuns: []
  },
  workManagement: {
    tasks: [],
    documents: [],
    overview: {}
  },
  tools: {
    zealCheck: {
      documents: [],
      webhookUrl: ''
    }
  }
};

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState(initialCompanyData);
  const [isOffline, setIsOffline] = useState(false); // Initialize as false for SSR
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribeCompanyData, setUnsubscribeCompanyData] = useState<(() => void) | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Hydration safety effect
  useEffect(() => {
    setIsClient(true);
    setIsOffline(!window.navigator.onLine);
  }, []);

  // Network status monitoring
  useEffect(() => {
    if (!isClient) return; // Don't run on server

    const handleOnline = async () => {
      try {
        setIsOffline(false);
        if (db) {
          await enableNetwork(db);
        }
      } catch (error) {
        console.error('Error enabling network:', error);
      }
    };

    const handleOffline = async () => {
      try {
        setIsOffline(true);
        if (db) {
          await disableNetwork(db);
        }
      } catch (error) {
        console.error('Error disabling network:', error);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isClient]);

  // Companies subscription
  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setSelectedId(null);
      setCompanyData(initialCompanyData);
      setLoading(false);
      return;
    }

    setLoading(true);
    const companiesRef = collection(db, 'companies');
    const q = query(companiesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const companiesList: Company[] = [];
        snapshot.forEach((doc) => {
          companiesList.push({ id: doc.id, ...doc.data() } as Company);
        });
        console.log('Companies loaded:', companiesList.length);
        setCompanies(companiesList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching companies:', error);
        setCompanies([]);
        setError('Failed to load companies');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Company data subscription
  useEffect(() => {
    if (unsubscribeCompanyData) {
      unsubscribeCompanyData();
    }

    if (!selectedId) {
      setCompanyData(initialCompanyData);
      setLoading(false);
      return;
    }

    const companyRef = doc(db, 'companies', selectedId);
    
    const unsubscribe = onSnapshot(companyRef, (doc) => {
      if (!doc.exists()) return;
      const data = doc.data();
      setCompanyData({
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
        accounts: Array.isArray(data.accounts) ? data.accounts : [defaultUncategorizedAccount],
        categoryRules: Array.isArray(data.categoryRules) ? data.categoryRules : [],
        customers: Array.isArray(data.customers) ? data.customers : [],
        vendors: Array.isArray(data.vendors) ? data.vendors : [],
        invoices: Array.isArray(data.invoices) ? data.invoices : [],
        bankAccounts: Array.isArray(data.bankAccounts) ? data.bankAccounts : [],
        payroll: {
          employees: Array.isArray(data.payroll?.employees) ? data.payroll.employees : [],
          contractors: Array.isArray(data.payroll?.contractors) ? data.payroll.contractors : [],
          payrollRuns: Array.isArray(data.payroll?.payrollRuns) ? data.payroll.payrollRuns : []
        },
        workManagement: {
          tasks: Array.isArray(data.workManagement?.tasks) ? data.workManagement.tasks : [],
          documents: Array.isArray(data.workManagement?.documents) ? data.workManagement.documents : [],
          overview: data.workManagement?.overview || {}
        },
        tools: {
          zealCheck: data.tools?.zealCheck || { documents: [], webhookUrl: '' }
        }
      });
      setIsSubscribed(true);
    });

    setUnsubscribeCompanyData(() => unsubscribe);
    return () => unsubscribe();
  }, [selectedId]);

  const addCompany = async (name: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyId = `${name.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().split('-')[0]}`;
      const newCompany: Company = {
        id: companyId,
        userId: user.uid,
        name,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        bankAccounts: [] // Initialize empty bank accounts array
      };

      const companyRef = doc(db, 'companies', companyId);
      await setDoc(companyRef, {
        ...newCompany,
        ...initialCompanyData
      });

      setCompanies(prev => [...prev, newCompany]);
      return companyId;
    } catch (error) {
      console.error('Error adding company:', error);
      setError('Failed to add company');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectCompany = async (id: string): Promise<string | null> => {
    try {
      console.log('Starting company selection with ID:', id);
      setLoading(true);
      setError(null);

      if (!id) {
        console.log('Clearing company selection');
        setSelectedId(null);
        setCompanyData(initialCompanyData);
        setLoading(false);
        return null;
      }

      const companyRef = doc(db, 'companies', id);
      const docSnap = await getDoc(companyRef);

      if (!docSnap.exists()) {
        throw new Error('Company not found');
      }

      const data = docSnap.data();
      
      // Update last accessed timestamp
      await updateDoc(companyRef, {
        lastAccessed: new Date().toISOString()
      });

      // Create a new company data object with all required fields
      const newCompanyData: CompanyData = {
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
        accounts: Array.isArray(data.accounts) ? data.accounts : [defaultUncategorizedAccount],
        categoryRules: Array.isArray(data.categoryRules) ? data.categoryRules : [],
        customers: Array.isArray(data.customers) ? data.customers : [],
        vendors: Array.isArray(data.vendors) ? data.vendors : [],
        invoices: Array.isArray(data.invoices) ? data.invoices : [],
        bankAccounts: Array.isArray(data.bankAccounts) ? data.bankAccounts : [],
        payroll: {
          employees: Array.isArray(data.payroll?.employees) ? data.payroll.employees : [],
          contractors: Array.isArray(data.payroll?.contractors) ? data.payroll.contractors : [],
          payrollRuns: Array.isArray(data.payroll?.payrollRuns) ? data.payroll.payrollRuns : []
        },
        workManagement: {
          tasks: Array.isArray(data.workManagement?.tasks) ? data.workManagement.tasks : [],
          documents: Array.isArray(data.workManagement?.documents) ? data.workManagement.documents : [],
          overview: data.workManagement?.overview || {}
        },
        tools: {
          zealCheck: data.tools?.zealCheck || { documents: [], webhookUrl: '' }
        }
      };

      // Set company data and ID in a single batch
      await Promise.all([
        new Promise<void>(resolve => {
          setCompanyData(newCompanyData);
          resolve();
        }),
        new Promise<void>(resolve => {
          setSelectedId(id);
          resolve();
        })
      ]);

      console.log('Company selection completed successfully for ID:', id);
      return id;
    } catch (error) {
      console.error('Error in selectCompany:', error);
      // Reset state in case of error
      setSelectedId(null);
      setCompanyData(initialCompanyData);
      setError('Failed to select company');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyData = async (data: Partial<CompanyData & { id?: string }>) => {
    const companyId = data.id || selectedId;
    if (!companyId) {
      setError('No company selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyRef = doc(db, 'companies', companyId);
      const companyDoc = await getDoc(companyRef);
      
      if (companyDoc.exists()) {
        const currentData = companyDoc.data();
        
        // Ensure Uncategorized account is preserved
        let updatedAccounts = data.accounts;
        if (Array.isArray(updatedAccounts)) {
          const hasUncategorized = updatedAccounts.some(acc => acc.accountNumber === '00000');
          if (!hasUncategorized) {
            updatedAccounts = [defaultUncategorizedAccount, ...updatedAccounts];
          }
        }

        // Ensure bankAccounts array exists
        const bankAccounts = Array.isArray(data.bankAccounts) ? data.bankAccounts : currentData.bankAccounts || [];

        const updatedData = {
          ...currentData,
          ...data,
          accounts: updatedAccounts || currentData.accounts,
          bankAccounts: bankAccounts
        };

        // Remove the id from the data before updating
        const { id, ...dataToUpdate } = updatedData;
        await updateDoc(companyRef, dataToUpdate);
      }
    } catch (error) {
      console.error('Error updating company data:', error);
      setError('Failed to update company data');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyInfo = async (info: Partial<Company>) => {
    if (!selectedId) {
      setError('No company selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const companyRef = doc(db, 'companies', selectedId);
      await updateDoc(companyRef, info);
    } catch (error) {
      console.error('Error updating company info:', error);
      setError('Failed to update company info');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectedCompany = React.useMemo(
    () => companies.find(c => c.id === selectedId) || null,
    [companies, selectedId]
  );

  // Debug effect to track state changes
  useEffect(() => {
    console.log('CompanyContext state changed:', {
      selectedId,
      hasData: !!companyData,
      loading,
      error
    });
  }, [selectedId, companyData, loading, error]);

  // Create a stable context value with useMemo
  const contextValue = useMemo(() => ({
    companies,
    selectedId,
    selectedCompanyId: selectedId,
    companyData,
    loading,
    error,
    isOffline,
    setLoading,
    addCompany,
    selectCompany,
    selectedCompany: companies.find(c => c.id === selectedId),
    setCompanyData,
    updateCompanyData,
    updateCompanyInfo
  }), [companies, selectedId, companyData, loading, error, isOffline]);

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

import React from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { auth, isOnline } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user);
        setLoading(false);
        setInitialized(true);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError('Authentication error occurred');
        setLoading(false);
        setInitialized(true);
      }
    );

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const handleAuthError = (err: AuthError) => {
    console.error('Auth error:', err);
    switch (err.code) {
      case 'auth/network-request-failed':
        if (!isOnline()) {
          setError('No internet connection. Please check your network and try again.');
        } else {
          setError('Network error occurred. Please try again.');
        }
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setError('Invalid email or password');
        break;
      case 'auth/too-many-requests':
        setError('Too many failed attempts. Please try again later.');
        break;
      case 'auth/email-already-in-use':
        setError('This email is already registered');
        break;
      case 'auth/invalid-email':
        setError('Invalid email address');
        break;
      case 'auth/weak-password':
        setError('Password is too weak');
        break;
      case 'auth/operation-not-allowed':
        setError('Operation not allowed. Please contact support.');
        break;
      default:
        setError('An unexpected error occurred. Please try again.');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (!isOnline()) {
        throw new Error('No internet connection');
      }
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      if (!isOnline()) {
        throw new Error('No internet connection');
      }
      setError(null);
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!isOnline()) {
        throw new Error('No internet connection');
      }
      setError(null);
      setLoading(true);
      await signOut(auth);
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!isOnline()) {
        throw new Error('No internet connection');
      }
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    clearError
  };

  // Show loading state until Firebase Auth is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && user.email === 'admin@admin.com') {
          setAdminUser(user);
        } else {
          setAdminUser(null);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      if (username === 'Admin' && password === 'Mamanaga2805!!!') {
        const userCredential = await signInWithEmailAndPassword(auth, 'admin@admin.com', 'Mamanaga2805!!!');
        setAdminUser(userCredential.user);
      } else {
        throw new Error('Invalid admin credentials');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Invalid admin credentials');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setAdminUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
      throw err;
    }
  };

  return {
    adminUser,
    loading,
    error,
    login,
    logout
  };
}

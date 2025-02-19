import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, Plus, Check } from 'lucide-react';

interface User {
  id: string;
  email: string;
  companies: string[];
}

interface Company {
  id: string;
  name: string;
}

export function Users() {
  const navigate = useNavigate();
  const { adminUser, loading } = useAdminAuth();
  const [users, setUsers] = React.useState<User[]>([]);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, loading, navigate]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          companies: doc.data().companies || []
        } as User));

        // Fetch companies
        const companiesQuery = query(collection(db, 'companies'));
        const companiesSnapshot = await getDocs(companiesQuery);
        const companiesData = companiesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));

        setUsers(usersData);
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCompanyToggle = async (userId: string, companyId: string, hasAccess: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      const companyRef = doc(db, 'companies', companyId);

      if (hasAccess) {
        // Remove access
        await updateDoc(userRef, {
          companies: arrayRemove(companyId)
        });
        await updateDoc(companyRef, {
          users: arrayRemove(userId)
        });
      } else {
        // Grant access
        await updateDoc(userRef, {
          companies: arrayUnion(companyId)
        });
        await updateDoc(companyRef, {
          users: arrayUnion(userId)
        });
      }

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            const updatedCompanies = hasAccess
              ? user.companies.filter(id => id !== companyId)
              : [...user.companies, companyId];
            return { ...user, companies: updatedCompanies };
          }
          return user;
        })
      );
    } catch (error) {
      console.error('Error updating company access:', error);
      alert('Failed to update company access');
    }
  };

  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  if (loading || !adminUser) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          </div>

          <div className="mt-4">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <li key={user.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{user.email}</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {companies.map(company => (
                              <button
                                key={company.id}
                                onClick={() => handleCompanyToggle(
                                  user.id,
                                  company.id,
                                  user.companies.includes(company.id)
                                )}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  user.companies.includes(company.id)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {user.companies.includes(company.id) && (
                                  <Check className="w-4 h-4 mr-1" />
                                )}
                                {company.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

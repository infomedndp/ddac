import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Practice } from '../../types/admin';
import { Search, Building2, Users } from 'lucide-react';

export function Practices() {
  const navigate = useNavigate();
  const { adminUser, loading } = useAdminAuth();
  const [practices, setPractices] = React.useState<Practice[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, loading, navigate]);

  React.useEffect(() => {
    const fetchPractices = async () => {
      try {
        const practicesQuery = query(collection(db, 'practices'));
        const snapshot = await getDocs(practicesQuery);
        const practiceData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Practice));
        setPractices(practiceData);
      } catch (error) {
        console.error('Error fetching practices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPractices();
  }, []);

  const handleStatusChange = async (practiceId: string, newStatus: Practice['status']) => {
    try {
      const practiceRef = doc(db, 'practices', practiceId);
      await updateDoc(practiceRef, { status: newStatus });
      
      setPractices(prevPractices =>
        prevPractices.map(practice =>
          practice.id === practiceId ? { ...practice, status: newStatus } : practice
        )
      );
    } catch (error) {
      console.error('Error updating practice status:', error);
    }
  };

  const filteredPractices = React.useMemo(() => {
    return practices.filter(practice => {
      if (statusFilter !== 'all' && practice.status !== statusFilter) {
        return false;
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return practice.name.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  }, [practices, searchTerm, statusFilter]);

  if (loading || !adminUser) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Practices</h1>
            <button
              onClick={() => {/* TODO: Implement add practice */}}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Add Practice
            </button>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search practices..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ml-4 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Practice Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Members
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Created
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredPractices.map((practice) => (
                        <tr key={practice.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <Building2 className="h-10 w-10 text-gray-300" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{practice.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="h-5 w-5 text-gray-400 mr-2" />
                              {practice.members.length} members
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <select
                              value={practice.status}
                              onChange={(e) => handleStatusChange(practice.id, e.target.value as Practice['status'])}
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                practice.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(practice.createdAt).toLocaleDateString()}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => {/* TODO: Implement edit practice */}}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

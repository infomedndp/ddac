import React from 'react';
import { Users, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function UserStats() {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPractices: 0,
    activePractices: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user stats
        const usersQuery = query(collection(db, 'users'));
        const activeUsersQuery = query(collection(db, 'users'), where('status', '==', 'active'));
        
        const [usersSnapshot, activeUsersSnapshot] = await Promise.all([
          getDocs(usersQuery),
          getDocs(activeUsersQuery)
        ]);

        // Get practice stats
        const practicesQuery = query(collection(db, 'practices'));
        const activePracticesQuery = query(collection(db, 'practices'), where('status', '==', 'active'));
        
        const [practicesSnapshot, activePracticesSnapshot] = await Promise.all([
          getDocs(practicesQuery),
          getDocs(activePracticesQuery)
        ]);

        setStats({
          totalUsers: usersSnapshot.size,
          activeUsers: activeUsersSnapshot.size,
          totalPractices: practicesSnapshot.size,
          activePractices: activePracticesSnapshot.size
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {stats.activeUsers} active
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Practices</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.totalPractices}</div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {stats.activePractices} active
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

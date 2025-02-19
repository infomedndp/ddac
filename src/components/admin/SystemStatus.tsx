import React from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function SystemStatus() {
  const [status, setStatus] = React.useState({
    activeUsers24h: 0,
    errorRate24h: 0,
    systemHealth: 'healthy' as 'healthy' | 'degraded' | 'critical'
  });

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const yesterday = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

        // Get active users in last 24h
        const activeUsersQuery = query(
          collection(db, 'userActivity'),
          where('timestamp', '>=', yesterday)
        );
        const activeUsersSnapshot = await getDocs(activeUsersQuery);

        // Get errors in last 24h
        const errorsQuery = query(
          collection(db, 'systemErrors'),
          where('timestamp', '>=', yesterday)
        );
        const errorsSnapshot = await getDocs(errorsQuery);

        // Calculate error rate
        const errorRate = errorsSnapshot.size / Math.max(activeUsersSnapshot.size, 1);

        // Determine system health
        let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
        if (errorRate > 0.1) {
          systemHealth = 'critical';
        } else if (errorRate > 0.05) {
          systemHealth = 'degraded';
        }

        setStatus({
          activeUsers24h: activeUsersSnapshot.size,
          errorRate24h: errorRate,
          systemHealth
        });
      } catch (error) {
        console.error('Error fetching system status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = () => {
    switch (status.systemHealth) {
      case 'critical':
        return 'text-red-600';
      case 'degraded':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const getHealthIcon = () => {
    switch (status.systemHealth) {
      case 'critical':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'degraded':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">System Status</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {status.activeUsers24h} active users
                </div>
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${getHealthColor()}`}>
                  {getHealthIcon()}
                  <span className="ml-1">
                    {status.systemHealth.charAt(0).toUpperCase() + status.systemHealth.slice(1)}
                  </span>
                </div>
              </dd>
            </dl>
            <div className="mt-2">
              <div className="text-sm text-gray-500">
                Error rate (24h): {(status.errorRate24h * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

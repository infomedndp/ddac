import React from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';

interface ActivityItem {
  id: string;
  type: string;
  userId: string;
  userEmail: string;
  details: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
}

export function RecentActivity() {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const q = query(
          collection(db, 'adminActivity'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const activityData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ActivityItem));

        setActivities(activityData);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatTimestamp = (timestamp: ActivityItem['timestamp']): string => {
    try {
      if (!timestamp || !timestamp.seconds) {
        return 'Invalid date';
      }
      const date = new Date(timestamp.seconds * 1000);
      return format(date, 'MMM d, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created':
        return '👤';
      case 'practice_created':
        return '🏢';
      case 'user_suspended':
        return '🚫';
      case 'practice_updated':
        return '📝';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        <div className="mt-6 flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {activity.details}{' '}
                          <span className="font-medium text-gray-900">
                            {activity.userEmail}
                          </span>
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {activities.length === 0 && (
              <li className="text-center py-4 text-gray-500">
                No recent activity
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

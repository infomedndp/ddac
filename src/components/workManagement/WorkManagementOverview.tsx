import React from 'react';
import { X, List, Calendar as CalendarIcon } from 'lucide-react';
import { WorkManagementDashboard } from '../Dashboard/WorkManagementDashboard';
import { CalendarView } from './CalendarView';

interface WorkManagementOverviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkManagementOverview({ isOpen, onClose }: WorkManagementOverviewProps) {
  const [view, setView] = React.useState<'list' | 'calendar'>('list');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Companies Overview</h2>
          <div className="flex items-center space-x-4">
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  view === 'list'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  view === 'calendar'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' ? (
            <WorkManagementDashboard />
          ) : (
            <CalendarView />
          )}
        </div>
      </div>
    </div>
  );
}

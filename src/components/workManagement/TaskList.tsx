import React from 'react';
import { Clock, CheckCircle, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Task } from '../../types/workManagement';
import { format, parseISO } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: 'todo' | 'completed', initials?: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ tasks, onUpdateStatus, onEditTask, onDeleteTask }: TaskListProps) {
  const [initials, setInitials] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(23, 59, 59, 999);
    return dueDate < new Date();
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'completed') => {
    if (newStatus === 'completed') {
      if (!initials.trim()) {
        setError('Please enter your initials before marking as completed');
        return;
      }
      if (initials.length > 3) {
        setError('Initials should not exceed 3 characters');
        return;
      }
      setError(null);
      onUpdateStatus(taskId, newStatus, initials.toUpperCase());
    } else {
      onUpdateStatus(taskId, newStatus);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Create a new task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2 mb-4">
        <div className="relative">
          <input
            type="text"
            value={initials}
            onChange={(e) => {
              setInitials(e.target.value.slice(0, 3));
              setError(null);
            }}
            placeholder="Your initials"
            maxLength={3}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {error && (
            <div className="absolute right-0 mt-1 text-xs text-red-600 whitespace-nowrap">
              {error}
            </div>
          )}
        </div>
      </div>

      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                {task.completedBy && (
                  <span className="text-xs text-gray-500">
                    (Completed by: {task.completedBy})
                  </span>
                )}
              </div>
              {task.description && (
                <p className="mt-1 text-sm text-gray-500">{task.description}</p>
              )}
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Created {formatDate(task.createdAt)}
                </div>
                {task.dueDate && (
                  <div className={`flex items-center ${isOverdue(task) ? 'text-red-600' : ''}`}>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Due {formatDate(task.dueDate)}
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed {formatDate(task.completedAt)}
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4 flex items-center space-x-3">
              <button
                onClick={() => onEditTask(task)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value as 'todo' | 'completed')}
                className={`text-sm font-medium rounded-md border-0 ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                } px-3 py-1`}
              >
                <option value="todo">To Do</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

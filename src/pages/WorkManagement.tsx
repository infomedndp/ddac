import React from 'react';
import { X, Plus, Search } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { Task } from '../types/workManagement';

interface WorkManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkManagement({ isOpen, onClose }: WorkManagementProps) {
  const { companyData, updateCompanyData, selectedCompany } = useCompany();
  const [activeTab, setActiveTab] = React.useState<'todo' | 'completed'>('todo');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const tasks = React.useMemo(() => {
    return Array.isArray(companyData?.workManagement?.tasks) 
      ? companyData.workManagement.tasks 
      : [];
  }, [companyData?.workManagement?.tasks]);

  const handleAddTask = async (task: Task) => {
    if (!selectedCompany?.id) return;

    try {
      const currentTasks = Array.isArray(companyData?.workManagement?.tasks) 
        ? companyData.workManagement.tasks 
        : [];

      const newTask = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'todo',
        companyId: selectedCompany.id
      };

      await updateCompanyData({
        workManagement: {
          tasks: [...currentTasks, newTask]
        }
      });

      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: 'todo' | 'completed') => {
    if (!selectedCompany?.id) return;

    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? {
          ...task,
          status,
          updatedAt: new Date().toISOString(),
          completedAt: status === 'completed' ? new Date().toISOString() : undefined
        } : task
      );

      await updateCompanyData({
        workManagement: {
          tasks: updatedTasks
        }
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedCompany?.id || !window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);

      await updateCompanyData({
        workManagement: {
          tasks: updatedTasks
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      if (task.status !== activeTab) return false;

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return task.title.toLowerCase().includes(searchLower) ||
               task.description?.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }, [tasks, activeTab, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Work Management</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('todo')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'todo'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                To Do ({tasks.filter(t => t.status === 'todo').length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'completed'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Completed ({tasks.filter(t => t.status === 'completed').length})
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      {task.dueDate && (
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                      <span>•</span>
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      {task.completedAt && (
                        <>
                          <span>•</span>
                          <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value as 'todo' | 'completed')}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="todo">To Do</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search' : 'Add a task to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddTask({
                id: '',
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                dueDate: formData.get('dueDate') as string,
                status: 'todo',
                createdAt: new Date().toISOString(),
                companyId: selectedCompany?.id || ''
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

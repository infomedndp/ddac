import React from 'react';
import { Clock, CheckCircle, AlertCircle, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Task } from '../../types/workManagement';
import { useCompany } from '../../context/CompanyContext';
import { MultiCompanyTaskModal } from './MultiCompanyTaskModal';
import { format, parseISO } from 'date-fns';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function WorkManagementDashboard() {
  const { companies, updateCompanyData } = useCompany();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [companyFilter, setCompanyFilter] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'todo' | 'completed' | 'overdue'>('todo');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
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

  // Collect tasks from all companies
  const allTasks = React.useMemo(() => {
    return companies.reduce((tasks: Task[], company) => {
      const companyTasks = company.workManagement?.tasks || [];
      return [...tasks, ...companyTasks.map(task => ({
        ...task,
        companyName: company.name,
        companyId: company.id,
        compositeId: `${task.id}-${company.id}`
      }))];
    }, []);
  }, [companies]);

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(23, 59, 59, 999);
    return dueDate < new Date();
  };

  const stats = React.useMemo(() => {
    return {
      todo: allTasks.filter(t => t.status === 'todo' && !isOverdue(t)).length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      overdue: allTasks.filter(isOverdue).length
    };
  }, [allTasks]);

  const filteredTasks = React.useMemo(() => {
    return allTasks.filter(task => {
      if (activeTab === 'overdue') {
        if (!isOverdue(task)) return false;
      } else {
        if (activeTab === 'todo' && isOverdue(task)) return false;
        if (task.status !== activeTab) return false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.companyName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (companyFilter && task.companyId !== companyFilter) {
        return false;
      }

      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [allTasks, searchTerm, activeTab, priorityFilter, companyFilter]);

  const handleUpdateTaskStatus = async (task: Task, newStatus: 'todo' | 'completed') => {
    try {
      if (newStatus === 'completed') {
        if (!initials.trim()) {
          setError('Please enter your initials before marking as completed');
          return;
        }
        if (initials.length > 3) {
          setError('Initials should not exceed 3 characters');
          return;
        }
      }
      setError(null);

      // Get fresh company data from Firestore
      const companyRef = doc(db, 'companies', task.companyId);
      const companyDoc = await getDoc(companyRef);
      
      if (!companyDoc.exists()) {
        throw new Error('Company not found');
      }

      const companyData = companyDoc.data();
      const currentTasks = companyData.workManagement?.tasks || [];

      // Update the specific task
      const updatedTasks = currentTasks.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString().split('T')[0],
            completedAt: newStatus === 'completed' 
              ? new Date().toISOString().split('T')[0] 
              : undefined,
            completedBy: newStatus === 'completed' ? initials.toUpperCase() : undefined
          };
        }
        return t;
      });

      // Update Firestore directly
      await updateDoc(companyRef, {
        'workManagement.tasks': updatedTasks
      });

      // Update local state through context
      await updateCompanyData({
        id: task.companyId,
        workManagement: {
          ...companyData.workManagement,
          tasks: updatedTasks
        }
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      // Get fresh company data from Firestore
      const companyRef = doc(db, 'companies', task.companyId);
      const companyDoc = await getDoc(companyRef);
      
      if (!companyDoc.exists()) {
        throw new Error('Company not found');
      }

      const companyData = companyDoc.data();
      const currentTasks = companyData.workManagement?.tasks || [];

      // Filter out the task to be deleted
      const updatedTasks = currentTasks.filter(t => t.id !== task.id);

      // Update Firestore directly
      await updateDoc(companyRef, {
        'workManagement.tasks': updatedTasks
      });

      // Update local state through context
      await updateCompanyData({
        id: task.companyId,
        workManagement: {
          ...companyData.workManagement,
          tasks: updatedTasks
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'todo': return 'To-Do Tasks';
      case 'completed': return 'Completed Tasks';
      case 'overdue': return 'Overdue Tasks';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-colors ${
              activeTab === 'todo' ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setActiveTab('todo')}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">To-Do</h3>
              <span className="text-2xl font-semibold text-gray-900">{stats.todo}</span>
            </div>
          </div>
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-colors ${
              activeTab === 'completed' ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setActiveTab('completed')}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-green-600">Completed</h3>
              <span className="text-2xl font-semibold text-green-600">{stats.completed}</span>
            </div>
          </div>
          <div 
            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-colors ${
              activeTab === 'overdue' ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => setActiveTab('overdue')}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-red-600">Overdue</h3>
              <span className="text-2xl font-semibold text-red-600">{stats.overdue}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {getTabTitle()}
            </h2>
            <div className="flex items-center space-x-4">
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
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks or companies..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.compositeId} className="bg-gray-50 p-4 rounded-lg">
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
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{task.companyName}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Created {formatDate(task.createdAt)}
                      </div>
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <div className={`flex items-center ${isOverdue(task) ? 'text-red-600' : ''}`}>
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Due {formatDate(task.dueDate)}
                          </div>
                        </>
                      )}
                      {task.completedAt && (
                        <>
                          <span>•</span>
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed {formatDate(task.completedAt)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task, e.target.value as 'todo' | 'completed')}
                      className={`text-sm font-medium rounded-md border-0 ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      } px-3 py-1`}
                    >
                      <option value="todo">To Do</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          handleDeleteTask(task);
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm || priorityFilter !== 'all' || companyFilter
                    ? 'Try adjusting your filters'
                    : `No ${activeTab} tasks available`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <MultiCompanyTaskModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          companies={companies}
        />
      )}

      {editingTask && (
        <MultiCompanyTaskModal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          companies={companies}
          editingTask={editingTask}
        />
      )}
    </div>
  );
}

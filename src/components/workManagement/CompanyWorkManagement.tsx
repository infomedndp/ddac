import React from 'react';
import { X, Plus, Search } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { Task } from '../../types/workManagement';
import { TaskList } from './TaskList';
import { AddTaskModal } from './AddTaskModal';
import { EditTaskModal } from './EditTaskModal';

interface CompanyWorkManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyWorkManagement({ isOpen, onClose }: CompanyWorkManagementProps) {
  const { companyData, updateCompanyData, selectedCompany } = useCompany();
  const [activeTab, setActiveTab] = React.useState<'todo' | 'completed'>('todo');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dueDateFilter, setDueDateFilter] = React.useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('all');

  // Get all tasks and filter for the current company
  const tasks = React.useMemo(() => {
    const allTasks = Array.isArray(companyData?.workManagement?.tasks) 
      ? companyData.workManagement.tasks 
      : [];
    
    // Filter tasks that belong to the current company
    return allTasks.filter(task => task.companyId === selectedCompany?.id);
  }, [companyData?.workManagement?.tasks, selectedCompany?.id]);

  const handleAddTask = async (task: Task | Task[]) => {
    if (!selectedCompany?.id) return;

    try {
      const currentTasks = Array.isArray(companyData?.workManagement?.tasks) 
        ? companyData.workManagement.tasks 
        : [];

      const newTasks = Array.isArray(task) ? task : [task];
      const tasksWithCompanyId = newTasks.map(t => ({
        ...t,
        companyId: selectedCompany.id
      }));

      // Preserve tasks from other companies while adding new ones
      const updatedTasks = [
        ...currentTasks.filter(t => t.companyId !== selectedCompany.id),
        ...tasksWithCompanyId
      ];

      await updateCompanyData({
        workManagement: {
          ...companyData?.workManagement,
          tasks: updatedTasks
        }
      });

      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: 'todo' | 'completed') => {
    if (!selectedCompany?.id) return;

    try {
      const now = new Date().toISOString();
      const allTasks = Array.isArray(companyData?.workManagement?.tasks) 
        ? companyData.workManagement.tasks 
        : [];

      const updatedTasks = allTasks.map(task => 
        task.id === taskId && task.companyId === selectedCompany.id
          ? {
              ...task,
              status,
              updatedAt: now,
              completedAt: status === 'completed' ? now : undefined
            }
          : task
      );

      await updateCompanyData({
        workManagement: {
          ...companyData?.workManagement,
          tasks: updatedTasks
        }
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    if (!selectedCompany?.id) return;

    try {
      const allTasks = Array.isArray(companyData?.workManagement?.tasks) 
        ? companyData.workManagement.tasks 
        : [];

      const updatedTasks = allTasks.map(task => 
        task.id === updatedTask.id && task.companyId === selectedCompany.id
          ? {
              ...updatedTask,
              updatedAt: new Date().toISOString()
            }
          : task
      );

      await updateCompanyData({
        workManagement: {
          ...companyData?.workManagement,
          tasks: updatedTasks
        }
      });

      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedCompany?.id || !window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const allTasks = Array.isArray(companyData?.workManagement?.tasks) 
        ? companyData.workManagement.tasks 
        : [];

      const updatedTasks = allTasks.filter(task => 
        !(task.id === taskId && task.companyId === selectedCompany.id)
      );

      await updateCompanyData({
        workManagement: {
          ...companyData?.workManagement,
          tasks: updatedTasks
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      // Status filter
      if (task.status !== activeTab) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) &&
            !task.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Due date filter
      if (dueDateFilter !== 'all' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        
        switch (dueDateFilter) {
          case 'week':
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return dueDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date();
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return dueDate <= monthFromNow;
          case 'quarter':
            const quarterFromNow = new Date();
            quarterFromNow.setMonth(quarterFromNow.getMonth() + 3);
            return dueDate <= quarterFromNow;
          case 'year':
            const yearFromNow = new Date();
            yearFromNow.setFullYear(yearFromNow.getFullYear() + 1);
            return dueDate <= yearFromNow;
        }
      }

      return true;
    });
  }, [tasks, activeTab, searchTerm, dueDateFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Company Tasks</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
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

        <div className="p-6 flex items-center space-x-4">
          <div className="flex-1 relative">
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
          <select
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value as any)}
            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Due Dates</option>
            <option value="week">Due This Week</option>
            <option value="month">Due This Month</option>
            <option value="quarter">Due This Quarter</option>
            <option value="year">Due This Year</option>
          </select>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <TaskList
            tasks={filteredTasks}
            onUpdateStatus={handleUpdateTaskStatus}
            onEditTask={setEditingTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>

      {showAddModal && (
        <AddTaskModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTask}
        />
      )}

      {editingTask && (
        <EditTaskModal
          isOpen={true}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEditTask}
        />
      )}
    </div>
  );
}

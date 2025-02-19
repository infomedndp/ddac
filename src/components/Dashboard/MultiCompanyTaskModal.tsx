import React from 'react';
import { X } from 'lucide-react';
import { Task } from '../../types/workManagement';
import { Company } from '../../types/company';
import { useCompany } from '../../context/CompanyContext';
import { dateUtils } from '../../utils/dateUtils';

interface MultiCompanyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  editingTask?: Task | null;
}

export function MultiCompanyTaskModal({ 
  isOpen, 
  onClose, 
  companies,
  editingTask 
}: MultiCompanyTaskModalProps) {
  const { updateCompanyData } = useCompany();
  const [formData, setFormData] = React.useState({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    dueDate: editingTask?.dueDate || '',
    priority: editingTask?.priority || 'medium' as 'low' | 'medium' | 'high',
    selectedCompanies: editingTask ? [editingTask.companyId] : [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const taskId = editingTask?.id || `task-${Date.now()}`;
    const now = dateUtils.today();

    // Create base task
    const baseTask: Task = {
      id: taskId,
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate || undefined,
      priority: formData.priority,
      status: editingTask?.status || 'todo',
      createdAt: editingTask?.createdAt || now,
      updatedAt: now,
      companyId: '' // Will be set for each company
    };

    // Update each selected company
    for (const companyId of formData.selectedCompanies) {
      const company = companies.find(c => c.id === companyId);
      if (!company) continue;

      const companyTask = {
        ...baseTask,
        companyId
      };

      const currentTasks = company.workManagement?.tasks || [];
      const updatedTasks = editingTask
        ? currentTasks.map(t => t.id === taskId ? companyTask : t)
        : [...currentTasks, companyTask];

      await updateCompanyData({
        id: companyId,
        workManagement: {
          ...company.workManagement,
          tasks: updatedTasks
        }
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTask ? 'Edit Task' : 'Create Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Companies *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
              {companies.map(company => (
                <label key={company.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.selectedCompanies.includes(company.id)}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        selectedCompanies: e.target.checked
                          ? [...prev.selectedCompanies, company.id]
                          : prev.selectedCompanies.filter(id => id !== company.id)
                      }));
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-900">{company.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.selectedCompanies.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

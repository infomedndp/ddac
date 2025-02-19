import { useState, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/workManagement';
import { useCompany } from '../context/CompanyContext';

export function useTaskManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedCompany, companyData, updateCompanyData } = useCompany();

  const addTask = useCallback(async (task: Task) => {
    if (!selectedCompany?.id) {
      setError('No company selected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const currentTasks = Array.isArray(companyData?.workManagement?.tasks) 
        ? companyData.workManagement.tasks 
        : [];

      const newTask = {
        ...task,
        createdAt: serverTimestamp(),
        companyId: selectedCompany.id
      };

      const updatedWorkManagement = {
        ...companyData?.workManagement,
        tasks: [...currentTasks, newTask]
      };

      await updateCompanyData({
        workManagement: updatedWorkManagement
      });

      return newTask;
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?.id, companyData, updateCompanyData]);

  const updateTask = useCallback(async (taskId: string, updatedTask: Task) => {
    if (!selectedCompany?.id) {
      setError('No company selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentTasks = Array.isArray(companyData?.workManagement?.tasks) 
        ? companyData.workManagement.tasks 
        : [];

      const updatedTasks = currentTasks.map(task => 
        task.id === taskId ? { ...updatedTask, updatedAt: serverTimestamp() } : task
      );

      const updatedWorkManagement = {
        ...companyData?.workManagement,
        tasks: updatedTasks
      };

      await updateCompanyData({
        workManagement: updatedWorkManagement
      });
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?.id, companyData, updateCompanyData]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!selectedCompany?.id) {
      setError('No company selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentTasks = Array.isArray(companyData?.workManagement?.tasks) 
        ? companyData.workManagement.tasks 
        : [];

      const updatedTasks = currentTasks.filter(task => task.id !== taskId);

      const updatedWorkManagement = {
        ...companyData?.workManagement,
        tasks: updatedTasks
      };

      await updateCompanyData({
        workManagement: updatedWorkManagement
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?.id, companyData, updateCompanyData]);

  const updateTaskStatus = useCallback(async (taskId: string, status: 'todo' | 'completed') => {
    if (!selectedCompany?.id) {
      setError('No company selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentTasks = Array.isArray(companyData?.workManagement?.tasks) 
        ? companyData.workManagement.tasks 
        : [];

      const updatedTasks = currentTasks.map(task => 
        task.id === taskId 
          ? {
              ...task,
              status,
              updatedAt: serverTimestamp(),
              completedAt: status === 'completed' ? serverTimestamp() : undefined
            }
          : task
      );

      const updatedWorkManagement = {
        ...companyData?.workManagement,
        tasks: updatedTasks
      };

      await updateCompanyData({
        workManagement: updatedWorkManagement
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?.id, companyData, updateCompanyData]);

  const tasks = Array.isArray(companyData?.workManagement?.tasks) 
    ? companyData.workManagement.tasks 
    : [];

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus
  };
}

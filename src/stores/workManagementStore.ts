import { create } from 'zustand';
import { produce } from 'immer';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/workManagement';
import { v4 as uuidv4 } from 'uuid';

interface WorkManagementState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: 'todo' | 'completed') => Promise<void>;
  loadTasks: (companyId: string) => Promise<void>;
}

export const useWorkManagementStore = create<WorkManagementState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  selectedCompanyId: null,

  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),

  loadTasks: async (companyId) => {
    set({ loading: true, error: null });
    try {
      const companyRef = doc(db, 'companies', companyId);
      const companyDoc = await getDoc(companyRef);
      
      if (companyDoc.exists()) {
        const data = companyDoc.data();
        if (!data.workManagement) {
          // Initialize workManagement if it doesn't exist
          await updateDoc(companyRef, {
            workManagement: {
              tasks: []
            }
          });
          set({ tasks: [], selectedCompanyId: companyId });
        } else {
          set({ 
            tasks: Array.isArray(data.workManagement.tasks) ? data.workManagement.tasks : [],
            selectedCompanyId: companyId 
          });
        }
      }
    } catch (error) {
      set({ error: 'Failed to load tasks' });
      console.error('Error loading tasks:', error);
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (taskData) => {
    const { selectedCompanyId, tasks } = get();
    if (!selectedCompanyId) {
      set({ error: 'No company selected' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const companyRef = doc(db, 'companies', selectedCompanyId);
      const companyDoc = await getDoc(companyRef);
      
      if (!companyDoc.exists()) {
        throw new Error('Company not found');
      }

      const newTask: Task = {
        id: uuidv4(),
        ...taskData,
        createdAt: new Date().toISOString(),
        status: 'todo',
        companyId: selectedCompanyId
      };

      const updatedTasks = [...tasks, newTask];

      await updateDoc(companyRef, {
        workManagement: {
          tasks: updatedTasks
        }
      });

      set({ tasks: updatedTasks });
    } catch (error) {
      set({ error: 'Failed to add task' });
      console.error('Error adding task:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (taskId, updates) => {
    const { selectedCompanyId, tasks } = get();
    if (!selectedCompanyId) {
      set({ error: 'No company selected' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const companyRef = doc(db, 'companies', selectedCompanyId);
      
      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      );

      await updateDoc(companyRef, {
        workManagement: {
          tasks: updatedTasks
        }
      });

      set({ tasks: updatedTasks });
    } catch (error) {
      set({ error: 'Failed to update task' });
      console.error('Error updating task:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteTask: async (taskId) => {
    const { selectedCompanyId, tasks } = get();
    if (!selectedCompanyId) {
      set({ error: 'No company selected' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const companyRef = doc(db, 'companies', selectedCompanyId);
      
      const updatedTasks = tasks.filter(task => task.id !== taskId);

      await updateDoc(companyRef, {
        workManagement: {
          tasks: updatedTasks
        }
      });

      set({ tasks: updatedTasks });
    } catch (error) {
      set({ error: 'Failed to delete task' });
      console.error('Error deleting task:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateTaskStatus: async (taskId, status) => {
    const { selectedCompanyId, tasks } = get();
    if (!selectedCompanyId) {
      set({ error: 'No company selected' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const companyRef = doc(db, 'companies', selectedCompanyId);
      
      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status,
              updatedAt: new Date().toISOString(),
              completedAt: status === 'completed' ? new Date().toISOString() : undefined
            }
          : task
      );

      await updateDoc(companyRef, {
        workManagement: {
          tasks: updatedTasks
        }
      });

      set({ tasks: updatedTasks });
    } catch (error) {
      set({ error: 'Failed to update task status' });
      console.error('Error updating task status:', error);
    } finally {
      set({ loading: false });
    }
  }
}));

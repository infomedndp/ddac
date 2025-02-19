import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types/workManagement';
import { v4 as uuidv4 } from 'uuid';

export async function addTask(companyId: string, task: Omit<Task, 'id' | 'createdAt' | 'status'>) {
  try {
    const companyRef = doc(db, 'companies', companyId);
    
    const newTask: Task = {
      id: uuidv4(),
      ...task,
      createdAt: new Date().toISOString(),
      status: 'todo',
    };

    await updateDoc(companyRef, {
      'workManagement.tasks': arrayUnion(newTask)
    });

    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
}

export async function updateTask(companyId: string, taskId: string, updates: Partial<Task>) {
  try {
    const companyRef = doc(db, 'companies', companyId);
    
    // First get the current tasks
    const companyDoc = await companyRef.get();
    const currentTasks = companyDoc.data()?.workManagement?.tasks || [];
    
    // Update the specific task
    const updatedTasks = currentTasks.map((task: Task) =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    );

    await updateDoc(companyRef, {
      'workManagement.tasks': updatedTasks
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function deleteTask(companyId: string, taskId: string) {
  try {
    const companyRef = doc(db, 'companies', companyId);
    
    // First get the current tasks
    const companyDoc = await companyRef.get();
    const currentTasks = companyDoc.data()?.workManagement?.tasks || [];
    
    // Filter out the task to delete
    const updatedTasks = currentTasks.filter((task: Task) => task.id !== taskId);

    await updateDoc(companyRef, {
      'workManagement.tasks': updatedTasks
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

export async function updateTaskStatus(companyId: string, taskId: string, status: 'todo' | 'completed') {
  try {
    const companyRef = doc(db, 'companies', companyId);
    
    // First get the current tasks
    const companyDoc = await companyRef.get();
    const currentTasks = companyDoc.data()?.workManagement?.tasks || [];
    
    // Update the status of the specific task
    const updatedTasks = currentTasks.map((task: Task) =>
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
      'workManagement.tasks': updatedTasks
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
}

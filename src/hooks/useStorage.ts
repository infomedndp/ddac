import { useState, useCallback } from 'react';
import { useCompany } from '../context/CompanyContext';
import * as storageService from '../services/storage';
import { StorageFile } from '../services/storage';

export function useStorage(folder: string = 'general') {
  const { selectedCompany } = useCompany();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<StorageFile | null> => {
    if (!selectedCompany?.id) {
      setError('No company selected');
      return null;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const storageFile = await storageService.uploadFile(
        selectedCompany.id,
        file,
        folder,
        (progress) => setProgress(progress)
      );

      return storageFile;
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      return null;
    } finally {
      setUploading(false);
    }
  }, [selectedCompany?.id, folder]);

  const listFiles = useCallback(async (): Promise<StorageFile[]> => {
    if (!selectedCompany?.id) {
      setError('No company selected');
      return [];
    }

    try {
      setError(null);
      return await storageService.listFiles(selectedCompany.id, folder);
    } catch (err) {
      console.error('Error listing files:', err);
      setError(err instanceof Error ? err.message : 'Failed to list files');
      return [];
    }
  }, [selectedCompany?.id, folder]);

  const deleteFile = useCallback(async (fileName: string): Promise<boolean> => {
    if (!selectedCompany?.id) {
      setError('No company selected');
      return false;
    }

    try {
      setError(null);
      await storageService.deleteFile(selectedCompany.id, fileName, folder);
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      return false;
    }
  }, [selectedCompany?.id, folder]);

  const getFileUrl = useCallback(async (fileName: string): Promise<string | null> => {
    if (!selectedCompany?.id) {
      setError('No company selected');
      return null;
    }

    try {
      setError(null);
      return await storageService.getFileUrl(selectedCompany.id, fileName, folder);
    } catch (err) {
      console.error('Error getting file URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to get file URL');
      return null;
    }
  }, [selectedCompany?.id, folder]);

  return {
    uploadFile,
    listFiles,
    deleteFile,
    getFileUrl,
    uploading,
    progress,
    error,
    clearError: () => setError(null)
  };
}

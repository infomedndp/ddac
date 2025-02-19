import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';

interface UploadProgressCallback {
  (progress: number): void;
}

export function useFileStorage(folder: string = 'forms') {
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!selectedCompany?.id) {
      setError('No company selected');
      return null;
    }

    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Create the company folder path
      const companyFolderPath = `companies/${selectedCompany.id}/${folder}`;
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${companyFolderPath}/${fileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, filePath);
      
      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            setError(error.message || 'Failed to upload file');
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              setError('Failed to get download URL');
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
      throw error;
    } finally {
      setUploading(false);
    }
  }, [selectedCompany?.id, folder, user]);

  return {
    uploadFile,
    uploading,
    progress,
    error,
    clearError
  };
}

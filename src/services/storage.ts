import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  listAll,
  deleteObject,
  StorageReference,
  UploadTask
} from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface StorageFile {
  name: string;
  url: string;
  path: string;
  size?: number;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export const uploadFile = async (
  companyId: string,
  file: File,
  folder: string = 'general',
  onProgress?: UploadProgressCallback
): Promise<StorageFile> => {
  try {
    // Create file path: companies/{companyId}/{folder}/{fileName}
    const filePath = `companies/${companyId}/${folder}/${file.name}`;
    const storageRef = ref(storage, filePath);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const storageFile: StorageFile = {
              name: file.name,
              url: downloadURL,
              path: filePath,
              size: file.size,
              type: file.type,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            resolve(storageFile);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const listFiles = async (companyId: string, folder: string = 'general'): Promise<StorageFile[]> => {
  try {
    const folderRef = ref(storage, `companies/${companyId}/${folder}`);
    const result = await listAll(folderRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url,
          path: itemRef.fullPath,
          createdAt: new Date().toISOString(), // Firebase Storage doesn't provide metadata by default
          updatedAt: new Date().toISOString()
        };
      })
    );

    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

export const deleteFile = async (companyId: string, fileName: string, folder: string = 'general'): Promise<void> => {
  try {
    const fileRef = ref(storage, `companies/${companyId}/${folder}/${fileName}`);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const getFileUrl = async (companyId: string, fileName: string, folder: string = 'general'): Promise<string> => {
  try {
    const fileRef = ref(storage, `companies/${companyId}/${folder}/${fileName}`);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

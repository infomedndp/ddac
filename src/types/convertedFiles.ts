export interface ConvertedFile {
  id: string;
  originalName: string;
  convertedUrl: string;
  documentType: string;
  convertedAt: string;
  status: 'completed' | 'failed';
  size?: number;
}

import React from 'react';
import { Document } from '../types';

interface DocumentViewerProps {
  document: Document | null;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  if (!document) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Select a document to view</p>
      </div>
    );
  }

  return (
    <iframe
      src={document.url}
      className="w-full h-full rounded-lg"
      title="Document Viewer"
    />
  );
} 
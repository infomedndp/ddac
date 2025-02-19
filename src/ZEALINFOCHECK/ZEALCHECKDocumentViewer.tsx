import React from 'react';
import { Document } from '../types';

interface DocumentViewerProps {
  document: Document | null;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  if (!document) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Select a document to view</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg shadow">
      <iframe
        src={document.url}
        className="w-full h-full rounded-lg"
        title={document.name}
      />
    </div>
  );
}
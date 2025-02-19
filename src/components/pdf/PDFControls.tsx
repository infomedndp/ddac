import React from 'react';
import { ZoomIn, ZoomOut, Type, Printer } from 'lucide-react';

interface PDFControlsProps {
  scale: number;
  isAddingText: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAddText: () => void;
  onPrint: () => void;
}

export function PDFControls({
  scale,
  isAddingText,
  onZoomIn,
  onZoomOut,
  onAddText,
  onPrint
}: PDFControlsProps) {
  return (
    <div className="flex items-center justify-between bg-white p-2 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <input
          type="file"
          accept=".pdf"
          className="w-64 text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <button
          onClick={onAddText}
          className={`p-1.5 border rounded-md ${
            isAddingText 
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          title="Add Text"
        >
          T
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-200 rounded-md">
          <button
            onClick={onZoomOut}
            className="p-1 hover:bg-gray-100 rounded-l-md"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-sm border-l border-r border-gray-200">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1 hover:bg-gray-100 rounded-r-md"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onPrint}
          className="inline-flex items-center px-3 py-1 text-sm border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Printer className="w-4 h-4 mr-1" />
          Print
        </button>
      </div>
    </div>
  );
}

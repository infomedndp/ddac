import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Trash2, GripVertical, Plus, Printer, ZoomIn, ZoomOut, Type, Upload, AlertCircle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useCompany } from '../context/CompanyContext';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface TextField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  pageIndex: number;
}

export function FillForms() {
  const { selectedCompany } = useCompany();
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [numPages, setNumPages] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  const [fields, setFields] = React.useState<TextField[]>([]);
  const [selectedField, setSelectedField] = React.useState<string | null>(null);
  const [isAddingText, setIsAddingText] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const printRef = React.useRef<HTMLDivElement>(null);

  const [fontSize, setFontSize] = React.useState(16);
  const [fontFamily, setFontFamily] = React.useState('Arial');
  const [textColor, setTextColor] = React.useState('#000000');

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompany?.id) {
      return;
    }

    try {
      setPdfFile(file);
      // Create a local URL for the file
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  // Cleanup URL when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleAddText = (e: React.MouseEvent) => {
    if (!isAddingText || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const newField: TextField = {
      id: `field-${Date.now()}`,
      x,
      y,
      width: 150,
      height: 30,
      value: '',
      fontSize,
      fontFamily,
      color: textColor,
      pageIndex: 0
    };

    setFields(prev => [...prev, newField]);
    setSelectedField(newField.id);
    setIsAddingText(false);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFields(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate new width based on content
      const tempSpan = document.createElement('span');
      tempSpan.style.font = `${newItems[index].fontSize}px ${newItems[index].fontFamily}`;
      tempSpan.style.position = 'absolute';
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.whiteSpace = 'nowrap';
      tempSpan.textContent = value;
      document.body.appendChild(tempSpan);
      
      const textWidth = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);

      // Add padding and set minimum width
      const newWidth = Math.max(150, textWidth + 20);

      newItems[index] = { ...newItems[index], width: newWidth };
      return newItems;
    });
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedField && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale - dragOffset.x;
        const y = (e.clientY - rect.top) / scale - dragOffset.y;

        setFields(prev => prev.map(field => 
          field.id === selectedField ? { ...field, x, y } : field
        ));
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedField, scale, dragOffset]);

  if (!selectedCompany) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please select a company to use the PDF editor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF
            </label>
          </div>
          <button
            onClick={() => setIsAddingText(!isAddingText)}
            className={`inline-flex items-center px-3 py-2 border rounded-md ${
              isAddingText 
                ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                : 'text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Type className="w-4 h-4 mr-2" />
            Add Text
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {selectedField && (
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Font Size</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => {
                const size = parseInt(e.target.value);
                setFontSize(size);
                setFields(prev => prev.map(field => 
                  field.id === selectedField ? { ...field, fontSize: size } : field
                ));
              }}
              className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                setFields(prev => prev.map(field => 
                  field.id === selectedField ? { ...field, fontFamily: e.target.value } : field
                ));
              }}
              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                setFields(prev => prev.map(field => 
                  field.id === selectedField ? { ...field, color: e.target.value } : field
                ));
              }}
              className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      )}

      {pdfUrl && (
        <div 
          ref={containerRef}
          className="relative border border-gray-300 rounded-lg"
          onClick={handleAddText}
          style={{ cursor: isAddingText ? 'text' : 'default' }}
        >
          <style>
            {`
              @media print {
                .text-field-outline {
                  outline: none !important;
                }
                .text-field-controls {
                  display: none !important;
                }
              }
            `}
          </style>
          <div ref={printRef}>
            <Document
              file={pdfUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              className="mx-auto"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div key={`page-${index + 1}`} className="relative mb-4">
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    scale={scale}
                  />
                  {fields.map(field => (
                    <div
                      key={field.id}
                      style={{
                        position: 'absolute',
                        left: `${field.x * scale}px`,
                        top: `${field.y * scale}px`,
                        width: `${field.width * scale}px`,
                        height: `${field.height * scale}px`,
                        zIndex: selectedField === field.id ? 50 : 40,
                        userSelect: 'none'
                      }}
                      className={`group text-field-outline ${
                        selectedField === field.id 
                          ? 'outline outline-1 outline-dashed outline-indigo-500' 
                          : 'hover:outline hover:outline-1 hover:outline-dashed hover:outline-gray-400'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedField(field.id);
                      }}
                    >
                      <div className="relative w-full h-full flex items-center">
                        <button
                          className="text-field-controls absolute -left-6 p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            if (!containerRef.current) return;
                            const rect = containerRef.current.getBoundingClientRect();
                            setDragOffset({
                              x: (e.clientX - rect.left) / scale - field.x,
                              y: (e.clientY - rect.top) / scale - field.y
                            });
                            setIsDragging(true);
                            setSelectedField(field.id);
                          }}
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleItemChange(fields.indexOf(field), 'value', e.target.value)}
                          className="w-full h-full bg-transparent border-none px-1 focus:outline-none cursor-text"
                          style={{
                            fontSize: `${field.fontSize * scale}px`,
                            fontFamily: field.fontFamily,
                            color: field.color,
                            caretColor: field.color
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFields(prev => prev.filter(f => f.id !== field.id));
                            setSelectedField(null);
                          }}
                          className="text-field-controls absolute -right-6 p-1 text-red-600 hover:text-red-800 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </Document>
          </div>
        </div>
      )}
    </div>
  );
}

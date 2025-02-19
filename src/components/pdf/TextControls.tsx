import React from 'react';

interface TextControlsProps {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onColorChange: (color: string) => void;
}

export function TextControls({
  fontSize,
  fontFamily,
  textColor,
  onFontSizeChange,
  onFontFamilyChange,
  onColorChange
}: TextControlsProps) {
  return (
    <div className="flex items-center space-x-2 bg-white p-2 border-b border-gray-200">
      <input
        type="number"
        value={fontSize}
        onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md"
      />
      <select
        value={fontFamily}
        onChange={(e) => onFontFamilyChange(e.target.value)}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
      </select>
      <input
        type="color"
        value={textColor}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-8 h-8 p-0 border border-gray-300 rounded-md cursor-pointer"
      />
    </div>
  );
}

import React from 'react';
import { Upload } from 'lucide-react';

export const UploadZone = ({ isDragging, onDrop, onDragOver, onDragLeave, onFileSelect }) => {
  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-8
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-700'
        }
        transition-colors duration-200
      `}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={onFileSelect}
        accept=".pdf,.docx,.jpg,.jpeg,.png"
      />
      
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          Drag and drop your resume here
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          or click to browse (PDF, DOCX, JPG, PNG)
        </p>
      </div>
    </div>
  );
};

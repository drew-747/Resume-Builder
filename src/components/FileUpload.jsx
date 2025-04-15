import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FileUpload = ({ onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type !== 'application/pdf' && 
          selectedFile.type !== 'application/msword' && 
          selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast.error('Please upload a PDF or Word document');
        return;
      }
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  const removeFile = () => {
    setFile(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive || isDragging 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-400' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-6">
          <motion.div
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center">
              <FiUpload className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
          </motion.div>
          <div className="space-y-2">
            <p className="text-xl font-medium text-gray-700 dark:text-gray-200">
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>
        </div>
      </div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                <FiFile className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                {file.name}
              </span>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FileUpload;
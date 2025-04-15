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
        className={`group relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive || isDragging 
            ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-400 scale-[1.02]' 
            : 'border-gray-300/50 dark:border-gray-600/50 hover:border-blue-400/70 dark:hover:border-blue-500/70 hover:bg-white/50 dark:hover:bg-gray-800/30 backdrop-blur-lg'}`}
      >
        <input {...getInputProps()} />
        
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 dark:from-blue-900/10 dark:to-purple-900/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative space-y-6">
          <motion.div
            animate={{ 
              scale: isDragActive ? 1.1 : 1,
              rotate: isDragActive ? 5 : 0
            }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <FiUpload className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <div className="space-y-3">
            <p className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400">
              or click to browse files
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
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
          <div className="flex items-center justify-between bg-white/70 dark:bg-gray-800/30 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-xl flex items-center justify-center shadow-md">
                <FiFile className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <span className="text-base font-medium text-gray-900 dark:text-white truncate max-w-xs block">
                  {file.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Ready to transform
                </span>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
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
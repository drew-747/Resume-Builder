import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUpload, FiFile } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FileUpload = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size too large. Please upload a file smaller than 10MB.');
        return;
      }
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        {...getRootProps()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`relative overflow-hidden group cursor-pointer transition-all duration-300
          ${isDragActive || isDragging 
            ? 'bg-blue-50/80 dark:bg-blue-900/20' 
            : 'bg-white/80 dark:bg-gray-800/80'} 
          backdrop-blur-lg rounded-xl p-12 shadow-xl border-2 border-dashed
          ${isDragActive || isDragging 
            ? 'border-blue-400 dark:border-blue-500' 
            : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative space-y-6">
          <motion.div
            animate={{
              y: isDragActive ? -10 : 0,
              scale: isDragActive ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
              <FiUpload className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <motion.div
            animate={{
              y: isDragActive ? -5 : 0,
              scale: isDragActive ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="space-y-4 text-center"
          >
            <motion.p 
              className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
            >
              {isDragActive ? 'Drop your resume here' : 'Drop your resume here or click to browse'}
            </motion.p>
            <p className="text-gray-500 dark:text-gray-400">
              Supports PDF, DOC, DOCX, and TXT files
            </p>
          </motion.div>

          {/* File Format Icons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center space-x-4"
          >
            {['.PDF', '.DOC', '.DOCX', '.TXT'].map((format, index) => (
              <motion.div
                key={format}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400"
              >
                <FiFile className="w-4 h-4" />
                <span>{format}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUpload;
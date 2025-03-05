import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FileUpload = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <motion.div
      className={`border-2 border-dashed rounded-lg p-8 text-center 
        ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <FaCloudUploadAlt className="mx-auto text-5xl text-primary-500 mb-4" />
      <p className="text-lg text-gray-600">
        Drag & drop your resume here, or <span className="text-primary-500">browse</span>
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Supported formats: PDF, DOCX, DOC
      </p>
    </motion.div>
  );
};

export default FileUpload;
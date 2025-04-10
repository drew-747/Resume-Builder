import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiEdit2, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

const ResumePreview = ({ previewUrl, onDownload, onEdit }) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Resume Preview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your resume has been successfully processed
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isPreviewVisible ? (
                <FiEyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <FiEye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiEdit2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={onDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiDownload className="w-5 h-5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isPreviewVisible ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-6">
          <iframe
            src={previewUrl}
            className="w-full h-[800px] border border-gray-200 dark:border-gray-700 rounded-lg"
            title="Resume Preview"
          />
        </div>
      </motion.div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ready to download
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your resume has been processed and is ready for download
            </p>
          </div>
          <button
            onClick={onDownload}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumePreview;
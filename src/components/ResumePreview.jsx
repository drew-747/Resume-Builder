import { motion } from 'framer-motion';
import { FaDownload, FaEdit } from 'react-icons/fa';

const ResumePreview = ({ previewUrl, onDownload, onEdit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Preview</h3>
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <FaEdit className="mr-2" />
            Edit
          </button>
          <button
            onClick={onDownload}
            className="flex items-center px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <FaDownload className="mr-2" />
            Download
          </button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <iframe
          src={previewUrl}
          className="w-full h-[600px]"
          title="Resume Preview"
        />
      </div>
    </motion.div>
  );
};

export default ResumePreview;
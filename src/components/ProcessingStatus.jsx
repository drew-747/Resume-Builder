import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

const ProcessingStatus = ({ status }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md"
    >
      <FaSpinner className="animate-spin text-4xl text-primary-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-800">Processing Your Resume</h3>
      <p className="text-gray-600 mt-2">{status}</p>
    </motion.div>
  );
};

export default ProcessingStatus;
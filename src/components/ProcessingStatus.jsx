import { motion } from 'framer-motion';
import { FiLoader, FiCheckCircle, FiFileText } from 'react-icons/fi';

const ProcessingStatus = ({ status }) => {
  const steps = [
    {
      icon: <FiFileText className="w-5 h-5" />,
      title: "Extracting",
      description: "Reading your resume content"
    },
    {
      icon: <FiCheckCircle className="w-5 h-5" />,
      title: "Formatting",
      description: "Applying professional formatting"
    },
    {
      icon: <FiLoader className="w-5 h-5" />,
      title: "Generating",
      description: "Creating your PDF"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
    >
      <div className="flex flex-col items-center space-y-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"
        >
          <FiLoader className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        </motion.div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Processing Your Resume
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {status}
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-md">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                {step.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessingStatus;
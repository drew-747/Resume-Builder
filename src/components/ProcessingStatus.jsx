import { motion } from 'framer-motion';
import { FiLoader, FiFileText, FiCode, FiCheckCircle } from 'react-icons/fi';

const ProcessingStatus = ({ status }) => {
  const steps = [
    {
      icon: <FiFileText className="w-6 h-6" />,
      title: "Extracting",
      description: "Reading your resume content"
    },
    {
      icon: <FiCode className="w-6 h-6" />,
      title: "Formatting",
      description: "Applying LaTeX formatting"
    },
    {
      icon: <FiCheckCircle className="w-6 h-6" />,
      title: "Generating",
      description: "Creating your PDF"
    }
  ];

  const currentStep = status.toLowerCase().includes('extract') ? 0 
    : status.toLowerCase().includes('format') ? 1 
    : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-12 relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50" />

      {/* Content */}
      <div className="relative space-y-8">
        {/* Main Loading Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-full border-4 border-blue-100"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FiLoader className="w-8 h-8 text-blue-500" />
            </motion.div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2">
          <motion.h3
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            Processing Your Resume
          </motion.h3>
          <p className="text-gray-600">{status}</p>
        </div>

        {/* Progress Steps */}
        <div className="grid grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`p-4 rounded-lg transition-colors duration-300 ${
                index === currentStep 
                  ? 'bg-blue-50/80 border border-blue-200/50' 
                  : index < currentStep 
                    ? 'bg-green-50/80 border border-green-200/50'
                    : 'bg-gray-50/80 border border-gray-200/50'
              }`}
            >
              <motion.div
                animate={index === currentStep ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center space-y-2"
              >
                <div className={`p-2 rounded-lg ${
                  index === currentStep 
                    ? 'text-blue-500' 
                    : index < currentStep 
                      ? 'text-green-500'
                      : 'text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ProcessingStatus;
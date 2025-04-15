import { motion } from 'framer-motion';
import { FiLoader, FiCheckCircle, FiFileText } from 'react-icons/fi';

const ProcessingStatus = ({ status }) => {
  const steps = [
    {
      icon: <FiFileText className="w-6 h-6" />,
      title: "Extracting",
      description: "Reading your resume content"
    },
    {
      icon: <FiCheckCircle className="w-6 h-6" />,
      title: "Formatting",
      description: "Applying professional formatting"
    },
    {
      icon: <FiLoader className="w-6 h-6" />,
      title: "Generating",
      description: "Creating your PDF"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30" />

      <div className="relative flex flex-col items-center space-y-10">
        {/* Main Loading Icon */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border-4 border-blue-100 dark:border-blue-900/20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-blue-500 dark:border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-24 h-24 rounded-full border-4 border-r-purple-500 dark:border-r-purple-400 border-t-transparent border-b-transparent border-l-transparent"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FiLoader className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </motion.div>
          </div>
        </div>
        
        {/* Status Text */}
        <div className="space-y-3">
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Processing Your Resume
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {status}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: "100%",
                background: ["hsl(216, 100%, 50%)", "hsl(270, 100%, 50%)", "hsl(216, 100%, 50%)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut",
                background: { duration: 4, repeat: Infinity }
              }}
              className="h-full"
            />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center space-y-4"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 backdrop-blur-xl flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-lg"
              >
                {step.icon}
              </motion.div>
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
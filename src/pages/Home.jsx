import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiUpload, FiDownload, FiClock, FiShield, FiZap } from 'react-icons/fi';
import FileUpload from '../components/FileUpload';
import ProcessingStatus from '../components/ProcessingStatus';
import { ResumeProcessor } from '../utils/resumeProcessor';

// Animation variants for floating elements
const floatingAnimation = {
  initial: { y: 0, x: 0 },
  animate: {
    y: [0, -20, 0],
    x: [0, 15, 0],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const FloatingElement = ({ delay, children, className }) => (
  <motion.div
    variants={floatingAnimation}
    initial="initial"
    animate="animate"
    style={{ animationDelay: `${delay}s` }}
    className={`absolute pointer-events-none ${className}`}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileSelect = async (file) => {
    setIsProcessing(true);
    setPreviewUrl(null);
    try {
      setProcessingStatus('Extracting text from your resume...');
      const extractedData = await ResumeProcessor.extractText(file);
      
      setProcessingStatus('Formatting your resume...');
      
      setProcessingStatus('Generating PDF...');
      const pdfUrl = await ResumeProcessor.generatePDF(extractedData);
      setPreviewUrl(pdfUrl);
      toast.success('Resume transformed successfully!');
    } catch (error) {
      console.error('Error processing resume:', error);
      toast.error(error.message || 'Error processing resume. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = 'transformed-resume.pdf';
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Original blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/30 dark:bg-blue-500/5 rounded-full mix-blend-multiply dark:mix-blend-hard-light filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/30 dark:bg-indigo-500/5 rounded-full mix-blend-multiply dark:mix-blend-hard-light filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100/30 dark:bg-purple-500/5 rounded-full mix-blend-multiply dark:mix-blend-hard-light filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        
        {/* New floating elements */}
        <FloatingElement delay={0} className="top-20 left-[15%]">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10 backdrop-blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={2} className="top-[40%] right-[10%]">
          <div className="w-32 h-32 rounded-lg rotate-45 bg-gradient-to-r from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 backdrop-blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={4} className="bottom-[20%] left-[20%]">
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-green-400/20 to-teal-400/20 dark:from-green-400/10 dark:to-teal-400/10 backdrop-blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={1} className="top-[30%] left-[5%]">
          <div className="w-20 h-20 rounded-lg rotate-12 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-yellow-400/10 dark:to-orange-400/10 backdrop-blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={3} className="bottom-[10%] right-[15%]">
          <div className="w-36 h-36 rounded-full bg-gradient-to-r from-red-400/20 to-pink-400/20 dark:from-red-400/10 dark:to-pink-400/10 backdrop-blur-3xl" />
        </FloatingElement>
      </div>

      <main className="relative pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
            >
              Transform Your Resume
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            >
              Convert your resume to a professional LaTeX format with one click
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12"
            >
              {[
                { icon: <FiClock className="w-6 h-6" />, text: "Instant Transform" },
                { icon: <FiShield className="w-6 h-6" />, text: "ATS-Friendly" },
                { icon: <FiZap className="w-6 h-6" />, text: "Professional Format" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="text-blue-600 dark:text-blue-400">{feature.icon}</div>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{feature.text}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isProcessing && !previewUrl && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <FileUpload onFileSelect={handleFileSelect} />
              </motion.div>
            )}

            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProcessingStatus status={processingStatus} />
              </motion.div>
            )}

            {previewUrl && !isProcessing && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
              >
                <div className="p-6">
                  <iframe
                    src={previewUrl}
                    className="w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                    title="Resume Preview"
                  />
                </div>
                <div className="bg-gray-50/80 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200"
                  >
                    <FiDownload className="w-5 h-5" />
                    <span>Download your New Resume</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 space-y-2"
          >
            <p>No data is permanently stored on our servers.</p>
            <p>Made by Leonard Ang ❤️!</p>
          </motion.footer>
        </div>
      </main>
    </div>
  );
};

export default Home;
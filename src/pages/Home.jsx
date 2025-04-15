import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiUpload, FiDownload, FiEdit2, FiCheckCircle } from 'react-icons/fi';
import FileUpload from '../components/FileUpload';
import ResumePreview from '../components/ResumePreview';
import ProcessingStatus from '../components/ProcessingStatus';
import { ResumeProcessor } from '../utils/resumeProcessor';

const Home = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileSelect = async (file) => {
    setIsProcessing(true);
    setPreviewUrl(null); // Clear any previous preview
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please upload a file smaller than 10MB.');
      }

      setProcessingStatus('Extracting text from your resume...');
      const extractedData = await ResumeProcessor.extractText(file);
      
      if (!extractedData.contact.email && !extractedData.contact.phone) {
        toast.warning('No contact information found in the resume');
      }
      
      setProcessingStatus('Formatting your resume...');
      setResumeData(extractedData);
      
      setProcessingStatus('Generating PDF...');
      const pdfUrl = await ResumeProcessor.generatePDF(extractedData);
      setPreviewUrl(pdfUrl);
      toast.success('Resume processed successfully!');
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
      link.download = 'professional-resume.pdf';
      link.click();
    }
  };

  const handleEdit = () => {
    toast.info('Edit functionality coming soon!');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-6xl mx-auto relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30" />
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative pt-20 pb-10"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Transform Your Resume
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            We help software engineers transform their resumes into professional, industry-standard documents
            that stand out to recruiters and pass ATS systems.
          </motion.p>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16"
          >
            {[
              { title: "Professional Template", desc: "Designed for software engineers" },
              { title: "Smart Extraction", desc: "Automatic content formatting" },
              { title: "ATS-Friendly", desc: "Optimized for applicant tracking systems" },
              { title: "LaTeX Style", desc: "Industry-standard formatting" },
              { title: "Instant PDF", desc: "Quick generation and preview" },
              { title: "Modern Design", desc: "Clean and professional layout" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 * index }}
                className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            {!isProcessing && !previewUrl && (
              <FileUpload onFileSelect={handleFileSelect} />
            )}
          </motion.div>
        </motion.div>

        {/* Processing Status */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12"
            >
              <ProcessingStatus status={processingStatus} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Section */}
        <AnimatePresence>
          {previewUrl && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12 bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8"
            >
              <ResumePreview
                previewUrl={previewUrl}
                onDownload={handleDownload}
                onEdit={handleEdit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
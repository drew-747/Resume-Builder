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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 opacity-50" />
        <div className="relative text-center py-20">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Transform Your Resume
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Upload your resume and transform it into an industry-standard format
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            {!isProcessing && !previewUrl && (
              <FileUpload onFileSelect={handleFileSelect} />
            )}
          </motion.div>
        </div>
      </motion.div>

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

      <AnimatePresence>
        {previewUrl && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
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
  );
};

export default Home;
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiUpload, FiDownload, FiEdit2, FiCheckCircle, FiZap, FiShield, FiClock, FiLoader } from 'react-icons/fi';
import FileUpload from '../components/FileUpload';
import ResumePreview from '../components/ResumePreview';
import { ResumeProcessor } from '../utils/resumeProcessor';

const Home = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  const handleFileSelect = async (file) => {
    setIsProcessing(true);
    setIsAIProcessing(true);
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please upload a file smaller than 10MB.');
      }

      const extractedData = await ResumeProcessor.extractText(file);
      setIsAIProcessing(false);
      
      if (!extractedData.contact.email && !extractedData.contact.phone) {
        toast.warning('No contact information found in the resume');
      }
      
      setResumeData(extractedData);
      const pdfUrl = await ResumeProcessor.generatePDF(extractedData);
      setPreviewUrl(pdfUrl);
      toast.success('Resume processed successfully!');
    } catch (error) {
      console.error('Error processing resume:', error);
      toast.error(error.message || 'Error processing resume. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsAIProcessing(false);
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
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50" />
        <div className="relative text-center py-20">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Transform Your Resume with AI
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Upload your resume and let AI transform it into an industry-standard format
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

      {isAIProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-4"
        >
          <FiLoader className="animate-spin text-blue-500" size={24} />
          <span className="text-gray-700 dark:text-gray-300">AI Processing Resume...</span>
        </motion.div>
      )}

      <AnimatePresence>
        {previewUrl && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12"
          >
            <ResumePreview
              previewUrl={previewUrl}
              onDownload={handleDownload}
              onEdit={handleEdit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resumeData && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Extracted Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <FiCheckCircle className="mr-2 text-blue-500" />
                    Contact Information
                  </h3>
                  <p className="text-gray-600">Email: {resumeData.contact.email || 'Not found'}</p>
                  <p className="text-gray-600">Phone: {resumeData.contact.phone || 'Not found'}</p>
                </div>
                {resumeData.skills.length > 0 && (
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FiCheckCircle className="mr-2 text-purple-500" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                {resumeData.experience && resumeData.experience.length > 0 && (
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FiCheckCircle className="mr-2 text-green-500" />
                      Experience
                    </h3>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="font-medium text-gray-800">{exp.title}</p>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
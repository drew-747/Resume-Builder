import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import FileUpload from '../components/FileUpload';
import ProcessingStatus from '../components/ProcessingStatus';
import ResumePreview from '../components/ResumePreview';
import { ResumeProcessor } from '../utils/resumeProcessor';

const Home = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  const handleFileSelect = async (file) => {
    setIsProcessing(true);
    try {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size too large. Please upload a file smaller than 10MB.');
      }

      // Extract content from the resume
      const extractedData = await ResumeProcessor.extractText(file);
      
      if (!extractedData.contact.email && !extractedData.contact.phone) {
        toast.warning('No contact information found in the resume');
      }
      
      setResumeData(extractedData);

      // Generate PDF preview
      const pdfUrl = await ResumeProcessor.generatePDF(extractedData);
      setPreviewUrl(pdfUrl);

      toast.success('Resume processed successfully!');
    } catch (error) {
      console.error('Error processing resume:', error);
      toast.error(error.message || 'Error processing resume. Please try again.');
    } finally {
      setIsProcessing(false);
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
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Transform Your Resume
        </h1>
        <p className="text-xl text-gray-600">
          Upload your resume and let AI transform it into an industry-standard format
        </p>
      </motion.div>

      {!isProcessing && !previewUrl && (
        <FileUpload onFileSelect={handleFileSelect} />
      )}

      {isProcessing && (
        <ProcessingStatus status="Analyzing and reformatting your resume..." />
      )}

      {previewUrl && !isProcessing && (
        <ResumePreview
          previewUrl={previewUrl}
          onDownload={handleDownload}
          onEdit={handleEdit}
        />
      )}

      {resumeData && !isProcessing && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Extracted Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Contact Information</h3>
              <p className="text-gray-600">Email: {resumeData.contact.email || 'Not found'}</p>
              <p className="text-gray-600">Phone: {resumeData.contact.phone || 'Not found'}</p>
            </div>
            {resumeData.skills.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700">Skills</h3>
                <p className="text-gray-600">{resumeData.skills.join(' • ')}</p>
              </div>
            )}
            {resumeData.experience.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700">Experience</h3>
                {resumeData.experience.map((exp, index) => (
                  <p key={index} className="text-gray-600">{exp}</p>
                ))}
              </div>
            )}
            {resumeData.education.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700">Education</h3>
                {resumeData.education.map((edu, index) => (
                  <p key={index} className="text-gray-600">{edu}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
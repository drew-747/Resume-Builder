import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Upload, FileType, Download, Eye, FileText, ChevronRight, Moon, Sun, Github, RefreshCw, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Button } from './components/ui/button';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { UploadZone } from './components/ui/upload-zone';
import { ProgressSteps } from './components/ui/progress-steps';

const ResumeTransformer = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [currentStep, setCurrentStep] = useState(1);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const STEPS = ['Upload Resume', 'Processing', 'Download & Preview'];

  // Initialize dark mode based on user preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // File upload handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (uploadedFile) => {
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(uploadedFile.type)) {
      setErrorMessage("Invalid file type. Please upload a PDF, DOCX, JPG or PNG file.");
      return;
    }

    setFile(uploadedFile);
    setErrorMessage("");
    setCurrentStep(2);
    
    // Process the resume
    processResume(uploadedFile);
  };

  const processResume = async (uploadedFile) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      
      const response = await fetch(`${API_URL}/api/transform-resume`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process resume');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResumeData(data.resumeData);
        setPdfUrl(`${API_URL}${data.pdfPath}`);
        setIsComplete(true);
        setCurrentStep(3);
      } else {
        throw new Error(data.error || 'Failed to process resume');
      }
    } catch (error) {
      setErrorMessage(error.message || 'An unexpected error occurred');
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const downloadResume = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const resetProcess = () => {
    setFile(null);
    setIsProcessing(false);
    setIsComplete(false);
    setResumeData(null);
    setPdfUrl(null);
    setErrorMessage("");
    setCurrentStep(1);
  };

  const Header = () => (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Transformer</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          leftIcon={darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Github className="w-4 h-4" />}
          onClick={() => window.open('https://github.com/yourusername/resume-transformer', '_blank')}
        >
          GitHub
        </Button>
      </div>
    </header>
  );

  const StepIndicator = () => (
    <ProgressSteps currentStep={currentStep} steps={STEPS} />
  );

  const renderUploadSection = () => (
    <div className="space-y-6">
      <UploadZone
        isDragging={isDragging}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onFileSelect={handleFileChange}
      />
    </div>
  );

  const renderProcessingSection = () => (
    <div className="text-center py-12">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
        Processing your resume...
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        This may take a few moments
      </p>
    </div>
  );

  const ResumePreview = ({ data }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg resume-preview">
      {Object.entries(data).map(([section, content], index) => (
        <div key={index} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {section}
          </h3>
          <div className="text-gray-600 dark:text-gray-300">
            {typeof content === 'string' ? (
              <p>{content}</p>
            ) : (
              <ul className="list-disc list-inside">
                {Array.isArray(content) ? content.map((item, i) => (
                  <li key={i}>{item}</li>
                )) : null}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCompletedSection = () => (
    <div className="rounded-lg p-6 bg-white dark:bg-gray-800 shadow">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
            <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 dark:text-white">Resume transformation complete!</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={resetProcess}
          >
            Start Over
          </Button>
          <Button 
            variant="outline"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={togglePreview}
          >
            {previewMode ? "Hide Preview" : "Preview"}
          </Button>
          <Button 
            variant="default"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={downloadResume}
          >
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center mr-3">
            <FileType className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-gray-800 dark:text-white">{file?.name || "Your Resume"}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Transformed into LaTeX-style professional format</div>
          </div>
        </div>
      </div>
      
      {previewMode && resumeData && (
        <div className="mt-8 border dark:border-gray-700 rounded-md overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 border-b dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">Resume Preview</div>
          <ResumePreview data={resumeData} />
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-12`}>
      <div className="max-w-4xl mx-auto p-6">
        <Header />
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Professional Resume Transformer</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Transform your resume into an industry-standard format for software engineering roles with our AI-powered tool.
          </p>
        </div>
        
        <StepIndicator />
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {!file && renderUploadSection()}
        {file && isProcessing && renderProcessingSection()}
        {file && isComplete && renderCompletedSection()}
        
        <div className="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-800 dark:text-white text-lg mb-3">How it works</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Upload your current resume (PDF, DOCX, JPG, or PNG)</li>
            <li>Our AI system extracts key information from your document</li>
            <li>We reformat your resume into a professional LaTeX-style template</li>
            <li>Preview and download your transformed resume as a PDF</li>
          </ol>
          
          <div className="mt-6">
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Why use our transformer?</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Professional format preferred by tech recruiters</li>
              <li>Clean, consistent typography and layout</li>
              <li>Improved readability for both humans and ATS systems</li>
              <li>Highlights your skills and experience effectively</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTransformer;
import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Upload, FileType, Download, Eye, FileText, ChevronRight, Moon, Sun, Github, RefreshCw, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Button } from './components/ui/button';

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
    setIsComplete(false);
    setResumeData(null);
    setPdfUrl(null);
    setCurrentStep(1);
  };

  // UI Components
  const Header = () => (
    <header className="w-full pb-6 border-b border-gray-200 dark:border-gray-800 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Resume Transformer</h1>
        </div>
        <div className="flex items-center space-x-4">
          <a 
            href="https://github.com/drew-747/Resume-Builder" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            aria-label="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
          1
        </div>
        <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
          2
        </div>
        <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
          3
        </div>
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <div className={`${currentStep >= 1 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>Upload</div>
        <div className={`${currentStep >= 2 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>Process</div>
        <div className={`${currentStep >= 3 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>Result</div>
      </div>
    </div>
  );

  const renderUploadSection = () => (
    <div 
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300
        ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 upload-pulse' : 'border-gray-300 dark:border-gray-700'} 
        hover:border-blue-400 dark:hover:border-blue-600`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <Upload className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-white">Drag and drop your resume here</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Supported formats: PDF, DOCX, JPG, PNG</p>
        <div>
          <Button
            variant="default"
            leftIcon={<ChevronRight className="w-4 h-4" />}
          >
            <label className="cursor-pointer">
              Browse Files
              <input
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderProcessingSection = () => (
    <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 dark:border-blue-400 border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-white">Processing your resume...</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few moments while we extract and format your information</p>
        
        <div className="mt-8 w-full max-w-md bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );

  const ResumePreview = ({ data }) => {
    if (!data || !data.personalInfo) {
      return <div className="p-4 text-center">No preview data available</div>;
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg font-sans max-w-2xl mx-auto resume-preview">
        {/* Header with contact info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.personalInfo.name || 'Name Not Found'}</h1>
          <div className="flex flex-wrap justify-center text-sm text-gray-600 dark:text-gray-300 mt-2 gap-x-4">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.email && data.personalInfo.phone && <span>|</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {(data.personalInfo.email || data.personalInfo.phone) && data.personalInfo.location && <span>|</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          </div>
          <div className="flex flex-wrap justify-center text-sm text-gray-600 dark:text-gray-300 mt-1 gap-x-4">
            {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
            {data.personalInfo.linkedin && data.personalInfo.github && <span>|</span>}
            {data.personalInfo.github && <span>{data.personalInfo.github}</span>}
          </div>
        </div>

        {/* Skills Section */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-1 mb-3">SKILLS</h2>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
              {data.skills.join(" • ")}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {data.workExperience && data.workExperience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-1 mb-3">EXPERIENCE</h2>
            {data.workExperience.map((job, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-baseline flex-wrap">
                  <span className="font-bold text-gray-800 dark:text-white">{job.company}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{job.duration}</span>
                </div>
                <div className="text-gray-800 dark:text-gray-300 italic mb-1">{job.position}</div>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1 pl-2">
                  {job.description.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {data.education && data.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-1 mb-3">EDUCATION</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-baseline flex-wrap">
                  <span className="font-bold text-gray-800 dark:text-white">{edu.institution}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{edu.duration}</span>
                </div>
                <div className="flex justify-between items-baseline flex-wrap">
                  <span className="text-gray-800 dark:text-gray-300 italic">{edu.degree}</span>
                  {edu.gpa && <span className="text-sm text-gray-600 dark:text-gray-400">GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects Section */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-1 mb-3">PROJECTS</h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-3">
                <div className="font-bold text-gray-800 dark:text-white">{project.name}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">{project.description}</div>
                <div className="text-sm italic text-gray-600 dark:text-gray-400">Technologies: {project.technologies}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
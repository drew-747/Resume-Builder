import React, { useState } from 'react';
import { AlertCircle, Check, Upload, FileType, Download, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';

const ResumeTransformer = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
      } else {
        throw new Error(data.error || 'Failed to process resume');
      }
    } catch (error) {
      setErrorMessage(error.message || 'An unexpected error occurred');
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

  const renderUploadSection = () => (
    <div 
      className={`border-2 border-dashed rounded-lg p-12 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <Upload className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Drag and drop your resume here</h3>
        <p className="text-sm text-gray-500 mb-6">Supported formats: PDF, DOCX, JPG, PNG</p>
        <div>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
            Browse Files
            <input
              type="file"
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderProcessingSection = () => (
    <div className="text-center p-12">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Processing your resume...</h3>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
    </div>
  );

  const ResumePreview = ({ data }) => {
    if (!data || !data.personalInfo) {
      return <div className="p-4 text-center">No preview data available</div>;
    }
    
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg font-sans max-w-2xl mx-auto">
        {/* Header with contact info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{data.personalInfo.name || 'Name Not Found'}</h1>
          <div className="flex flex-wrap justify-center text-sm text-gray-600 mt-2 gap-x-4">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.email && data.personalInfo.phone && <span>|</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {(data.personalInfo.email || data.personalInfo.phone) && data.personalInfo.location && <span>|</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          </div>
          <div className="flex flex-wrap justify-center text-sm text-gray-600 mt-1 gap-x-4">
            {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
            {data.personalInfo.linkedin && data.personalInfo.github && <span>|</span>}
            {data.personalInfo.github && <span>{data.personalInfo.github}</span>}
          </div>
        </div>

        {/* Skills Section */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">SKILLS</h2>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
              {data.skills.join(" • ")}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {data.workExperience && data.workExperience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">EXPERIENCE</h2>
            {data.workExperience.map((job, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-baseline flex-wrap">
                  <span className="font-bold">{job.company}</span>
                  <span className="text-sm text-gray-600">{job.duration}</span>
                </div>
                <div className="text-gray-800 italic mb-1">{job.position}</div>
                <ul className="list-disc list-inside text-sm space-y-1 pl-2">
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
            <h2 className="text-lg font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">EDUCATION</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-baseline flex-wrap">
                  <span className="font-bold">{edu.institution}</span>
                  <span className="text-sm text-gray-600">{edu.duration}</span>
                </div>
                <div className="flex justify-between items-baseline flex-wrap">
                  <span className="text-gray-800 italic">{edu.degree}</span>
                  {edu.gpa && <span className="text-sm">GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects Section */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">PROJECTS</h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-3">
                <div className="font-bold">{project.name}</div>
                <div className="text-sm mb-1">{project.description}</div>
                <div className="text-sm italic">Technologies: {project.technologies}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCompletedSection = () => (
    <div className="rounded-lg p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Check className="w-6 h-6 text-green-500 mr-2" />
          <h3 className="text-lg font-medium">Resume transformation complete!</h3>
        </div>
        <div className="space-x-4">
          <button 
            onClick={togglePreview} 
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center text-sm hover:bg-gray-100 transition-colors"
          >
            {previewMode ? "Hide Preview" : "Preview"}
            <Eye className="w-4 h-4 ml-2" />
          </button>
          <button 
            onClick={downloadResume} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center text-sm hover:bg-blue-700 transition-colors"
          >
            Download PDF
            <Download className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
      
      <div className="bg-white border rounded-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <FileType className="w-8 h-8 text-gray-400 mr-3" />
          <div>
            <div className="font-medium">{file?.name || "Your Resume"}</div>
            <div className="text-sm text-gray-500">Transformed into LaTeX-style professional format</div>
          </div>
        </div>
      </div>
      
      {previewMode && resumeData && (
        <div className="mt-8 border rounded-md overflow-hidden">
          <div className="bg-gray-100 p-3 border-b text-sm font-medium">Resume Preview</div>
          <ResumePreview data={resumeData} />
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Resume Transformer</h1>
      <p className="text-gray-600 mb-6">Transform your resume into an industry-standard format for software engineering roles</p>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {!file && renderUploadSection()}
      {file && isProcessing && renderProcessingSection()}
      {file && isComplete && renderCompletedSection()}
      
      <div className="mt-8 text-sm text-gray-500">
        <h3 className="font-medium text-gray-700 mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Upload your current resume (PDF, DOCX, JPG, or PNG)</li>
          <li>Our system extracts key information from your document</li>
          <li>We reformat your resume into a professional LaTeX-style template</li>
          <li>Preview and download your transformed resume</li>
        </ol>
      </div>
    </div>
  );
};

export default ResumeTransformer;
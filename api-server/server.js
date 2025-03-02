// server.js - Express server for Resume Transformer
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const { createWorker } = require('tesseract.js');
const { exec } = require('child_process');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|docx|jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('File upload only supports PDF, DOCX, JPG, and PNG formats'));
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// API endpoint for resume upload and processing
app.post('/api/transform-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from the uploaded file based on its type
    const filePath = req.file.path;
    const fileExtension = path.extname(filePath).toLowerCase();
    
    let extractedText = '';
    
    if (fileExtension === '.pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else if (fileExtension === '.docx') {
      extractedText = await extractTextFromDOCX(filePath);
    } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
      extractedText = await extractTextFromImage(filePath);
    }

    // Parse the extracted text to structured data
    const resumeData = parseResumeText(extractedText);
    
    // Generate LaTeX document from structured data
    const latexContent = generateLaTeX(resumeData);
    
    // Compile LaTeX to PDF
    const outputPath = await compileLaTeX(latexContent, req.file.filename);
    
    // Return the path to the generated PDF and structured data for preview
    res.status(200).json({ 
      success: true,
      resumeData: resumeData,
      pdfPath: `/api/download/${path.basename(outputPath)}`
    });
    
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to process resume', details: error.message });
  }
});

// Endpoint to download generated PDF
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'outputs', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

// Extract text from DOCX
async function extractTextFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

// Extract text from images (JPG, PNG)
async function extractTextFromImage(filePath) {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  return text;
}

// Parse extracted text into structured resume data
function parseResumeText(text) {
  const resumeData = {
    personalInfo: {},
    workExperience: [],
    education: [],
    skills: [],
    projects: []
  };
  
  // Normalize text for better parsing
  const normalizedText = text.replace(/\r\n/g, '\n');
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Find potential section boundaries
  const sectionIndices = findSectionBoundaries(lines);
  
  // Extract personal information
  extractPersonalInfo(normalizedText, lines, resumeData);
  
  // Extract skills
  extractSkills(normalizedText, lines, sectionIndices, resumeData);
  
  // Extract work experience
  extractWorkExperience(lines, sectionIndices, resumeData);
  
  // Extract education
  extractEducation(lines, sectionIndices, resumeData);
  
  // Extract projects
  extractProjects(lines, sectionIndices, resumeData);
  
  return resumeData;
}

// Find the start and end lines of different resume sections
function findSectionBoundaries(lines) {
  const sections = {
    experience: {
      regex: /^(?:experience|work|employment|professional experience|work history)/i,
      startLine: -1,
      endLine: -1
    },
    education: {
      regex: /^(?:education|academic|qualifications|degree)/i,
      startLine: -1,
      endLine: -1
    },
    skills: {
      regex: /^(?:skills|technical skills|technologies|competencies|proficiencies)/i,
      startLine: -1,
      endLine: -1
    },
    projects: {
      regex: /^(?:projects|portfolio|personal projects|side projects)/i,
      startLine: -1,
      endLine: -1
    }
  };
  
  // Find the starting line of each section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const section in sections) {
      if (sections[section].regex.test(line) && line.length < 30) {
        sections[section].startLine = i;
      }
    }
  }
  
  // Determine the end line of each section
  const sectionKeys = Object.keys(sections);
  for (let i = 0; i < sectionKeys.length; i++) {
    const currentSection = sections[sectionKeys[i]];
    if (currentSection.startLine === -1) continue;
    
    // Find the next section that starts after the current one
    let nextSectionStart = lines.length;
    for (const otherSection of sectionKeys) {
      if (sections[otherSection].startLine > currentSection.startLine) {
        nextSectionStart = Math.min(nextSectionStart, sections[otherSection].startLine);
      }
    }
    
    currentSection.endLine = nextSectionStart;
  }
  
  return sections;
}

// Extract personal information from resume text
function extractPersonalInfo(normalizedText, lines, resumeData) {
  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = normalizedText.match(emailRegex);
  if (emails && emails.length > 0) {
    resumeData.personalInfo.email = emails[0];
  }
  
  // Extract phone number
  const phoneRegex = /(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g;
  const phones = normalizedText.match(phoneRegex);
  if (phones && phones.length > 0) {
    resumeData.personalInfo.phone = phones[0];
  }
  
  // Extract name - look at the first 5 lines for a name-like pattern
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line && line.length > 2 && line.length < 50 && 
        !/[@\(\):]/.test(line) && 
        !/(University|College|School)/.test(line)) {
      resumeData.personalInfo.name = line;
      break;
    }
  }
  
  // Extract location (City, State format)
  const locationRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*(?:[A-Z]{2}|Philippines)/g;
  const locations = normalizedText.match(locationRegex);
  if (locations && locations.length > 0) {
    resumeData.personalInfo.location = locations[0];
  }
  
  // Extract LinkedIn and GitHub profiles
  const githubRegex = /(?:github\.com\/|github:)([a-zA-Z0-9_-]+)/i;
  const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin:)([a-zA-Z0-9_-]+)/i;
  
  const githubMatch = normalizedText.match(githubRegex);
  if (githubMatch && githubMatch.length > 1) {
    resumeData.personalInfo.github = `github.com/${githubMatch[1]}`;
  }
  
  const linkedinMatch = normalizedText.match(linkedinRegex);
  if (linkedinMatch && linkedinMatch.length > 1) {
    resumeData.personalInfo.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
  }
}

// Extract skills from resume text
function extractSkills(normalizedText, lines, sectionIndices, resumeData) {
  // Common technical skills for software engineers
  const techSkillsList = [
    // Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C\\+\\+', 'C#', 'Ruby', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin',
    // Frontend
    'React', 'Angular', 'Vue', 'HTML', 'CSS', 'SASS', 'LESS', 'jQuery', 'Bootstrap', 'Tailwind', 'Material UI',
    // Backend
    'Node\\.js', 'Express', 'Django', 'Flask', 'Spring', 'Rails', 'Laravel', 'ASP\\.NET', 'GraphQL', 'REST API',
    // Databases
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'Oracle', 'Firebase',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'CircleCI', 'GitHub Actions', 'CI/CD',
    // Tools & Others
    'Git', 'Agile', 'Scrum', 'TDD', 'Unit Testing', 'Microservices', 'OOP', 'Design Patterns'
  ];
  
  // Create regex pattern for tech skills
  const skillsPattern = new RegExp(`\\b(${techSkillsList.join('|')})\\b`, 'gi');
  
  // Priority to skills section if we found one
  if (sectionIndices.skills.startLine !== -1) {
    // Extract text from skills section
    const skillsSection = lines.slice(
      sectionIndices.skills.startLine + 1, 
      sectionIndices.skills.endLine !== -1 ? sectionIndices.skills.endLine : undefined
    ).join(' ');
    
    // Extract skills from the skills section
    const sectionSkills = extractSkillsFromText(skillsSection, skillsPattern);
    if (sectionSkills.length > 0) {
      resumeData.skills = sectionSkills;
      return;
    }
  }
  
  // If no skills section was found or it was empty, try to find skills in the entire document
  resumeData.skills = extractSkillsFromText(normalizedText, skillsPattern);
}

function extractSkillsFromText(text, skillsPattern) {
  const matches = text.match(skillsPattern);
  if (!matches) return [];
  
  // Remove duplicates while preserving case
  const uniqueSkills = [...new Set(matches.map(s => s.trim()))];
  
  // Handle case variations (e.g., "javascript" and "JavaScript")
  const normalizedSkills = [];
  const lowerCaseMap = {};
  
  for (const skill of uniqueSkills) {
    const lowerCaseSkill = skill.toLowerCase();
    
    if (!lowerCaseMap[lowerCaseSkill]) {
      lowerCaseMap[lowerCaseSkill] = skill;
      normalizedSkills.push(skill);
    } else {
      // If both "javascript" and "JavaScript" exist, prefer the proper case version
      if (skill[0] === skill[0].toUpperCase() && lowerCaseMap[lowerCaseSkill][0] !== lowerCaseSkill[0].toUpperCase()) {
        const index = normalizedSkills.indexOf(lowerCaseMap[lowerCaseSkill]);
        normalizedSkills[index] = skill;
        lowerCaseMap[lowerCaseSkill] = skill;
      }
    }
  }
  
  return normalizedSkills;
}

// Extract work experience from resume text
function extractWorkExperience(lines, sectionIndices, resumeData) {
  if (sectionIndices.experience.startLine === -1) return;
  
  const startLine = sectionIndices.experience.startLine + 1;
  const endLine = sectionIndices.experience.endLine !== -1 ? sectionIndices.experience.endLine : lines.length;
  
  const experienceLines = lines.slice(startLine, endLine);
  
  let currentJob = null;
  let currentCompany = null;
  let currentDuration = null;
  let bulletPoints = [];
  
  for (let i = 0; i < experienceLines.length; i++) {
    const line = experienceLines[i];
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Check for date ranges which often indicate new job entries
    const dateRangeMatch = line.match(/(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(\d{4})\s*(?:-|–|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(\d{4}|Present|Current)/i);
    
    // If we find a line with a date range, it's likely the start of a new job entry
    if (dateRangeMatch) {
      // Save the previous job if we have one
      if (currentCompany) {
        saveCurrentJob(resumeData, currentJob, currentCompany, currentDuration, bulletPoints);
        bulletPoints = [];
      }
      
      currentDuration = line.trim();
      
      // Look ahead for company and job title (usually within the next 2 lines)
      for (let j = 1; j <= 2 && i + j < experienceLines.length; j++) {
        const nextLine = experienceLines[i + j].trim();
        
        // Skip empty lines
        if (!nextLine) continue;
        
        // If no company set yet, the first non-empty line is likely the company
        if (!currentCompany) {
          currentCompany = nextLine;
        }
        // If company is set but job title is not, this is likely the job title
        else if (!currentJob) {
          currentJob = nextLine;
          break;
        }
      }
      
      continue;
    }
    
    // Check for bullet points or numbered lists that describe job responsibilities
    if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
      // Clean up bullet point format
      const cleanBullet = line.trim().replace(/^[•\-\d\.]+\s*/, '');
      bulletPoints.push(cleanBullet);
    }
    // If no date range found yet, this could be company or job title
    else if (!currentCompany) {
      currentCompany = line.trim();
    }
    else if (!currentJob) {
      currentJob = line.trim();
    }
  }
  
  // Save the last job entry if we have one
  if (currentCompany) {
    saveCurrentJob(resumeData, currentJob, currentCompany, currentDuration, bulletPoints);
  }
}

function saveCurrentJob(resumeData, jobTitle, company, duration, bullets) {
  resumeData.workExperience.push({
    company: company || 'Unknown Company',
    position: jobTitle || 'Unknown Position',
    duration: duration || 'Unknown Duration',
    description: bullets.length > 0 ? bullets : ['Responsibilities not specified']
  });
}

// Extract education information from resume text
function extractEducation(lines, sectionIndices, resumeData) {
  if (sectionIndices.education.startLine === -1) return;
  
  const startLine = sectionIndices.education.startLine + 1;
  const endLine = sectionIndices.education.endLine !== -1 ? sectionIndices.education.endLine : lines.length;
  
  const educationLines = lines.slice(startLine, endLine);
  
  let currentInstitution = null;
  let currentDegree = null;
  let currentDuration = null;
  let currentGPA = null;
  
  for (let i = 0; i < educationLines.length; i++) {
    const line = educationLines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Look for institution names (usually have "University", "College", etc.)
    if (!currentInstitution && 
        /(?:University|College|Institute|School|Academy)/i.test(line) && 
        line.length < 60) {
      currentInstitution = line;
      continue;
    }
    
    // Look for degree information
    if (!currentDegree && 
        /(?:Bachelor|Master|Ph\.D|MBA|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Degree)/i.test(line)) {
      currentDegree = line;
      continue;
    }
    
    // Look for date ranges
    if (!currentDuration && 
        /\b(?:19|20)\d{2}\s*(?:-|–|to)\s*(?:(?:19|20)\d{2}|Present|Current)\b/i.test(line)) {
      currentDuration = line;
      continue;
    }
    
    // Look for GPA
    const gpaMatch = line.match(/GPA\s*(?::|of|=)?\s*([\d\.]+)(?:\s*\/\s*([\d\.]+))?/i);
    if (!currentGPA && gpaMatch) {
      if (gpaMatch[2]) {
        currentGPA = `${gpaMatch[1]}/${gpaMatch[2]}`;
      } else {
        currentGPA = gpaMatch[1];
      }
      continue;
    }
    
    // If we have an institution but no degree yet, this might be a degree line
    if (currentInstitution && !currentDegree) {
      currentDegree = line;
      continue;
    }
  }
  
  // Save education entry if we have at least an institution
  if (currentInstitution) {
    resumeData.education.push({
      institution: currentInstitution,
      degree: currentDegree || 'Degree not specified',
      duration: currentDuration || '',
      gpa: currentGPA || ''
    });
  }
}

// Extract project information from resume text
function extractProjects(lines, sectionIndices, resumeData) {
  if (sectionIndices.projects.startLine === -1) return;
  
  const startLine = sectionIndices.projects.startLine + 1;
  const endLine = sectionIndices.projects.endLine !== -1 ? sectionIndices.projects.endLine : lines.length;
  
  const projectLines = lines.slice(startLine, endLine);
  
  let currentProject = null;
  let currentDescription = [];
  let currentTechnologies = null;
  
  for (let i = 0; i < projectLines.length; i++) {
    const line = projectLines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this is a new project header (short, standalone line)
    if (line.length < 50 && line.split(' ').length <= 5 && !line.startsWith('•') && !line.startsWith('-')) {
      // Save previous project if we have one
      if (currentProject) {
        saveCurrentProject(resumeData, currentProject, currentDescription, currentTechnologies);
        currentDescription = [];
        currentTechnologies = null;
      }
      
      currentProject = line;
      continue;
    }
    
    // Check for technology stack indicators
    if (/(?:Technolog(?:y|ies)|Stack|Built with|Developed using):/i.test(line)) {
      currentTechnologies = line.replace(/^.*?:\s*/, '').trim();
      continue;
    }
    
    // Handle bullet points as part of project description
    if (line.startsWith('•') || line.startsWith('-') || line.match(/^\d+\./)) {
      currentDescription.push(line.replace(/^[•\-\d\.]+\s*/, '').trim());
      continue;
    }
    
    // Regular line, add to description
    currentDescription.push(line);
  }
  
  // Save the last project if we have one
  if (currentProject) {
    saveCurrentProject(resumeData, currentProject, currentDescription, currentTechnologies);
  }
}

function saveCurrentProject(resumeData, projectName, description, technologies) {
  // Join description points into a single string for simplicity
  const projectDescription = description.join(' ').trim();
  
  resumeData.projects.push({
    name: projectName,
    description: projectDescription || 'No description provided',
    technologies: technologies || 'Technologies not specified'
  });
}

// Generate LaTeX document from resume data
function generateLaTeX(resumeData) {
  // Extract personal info
  const name = resumeData.personalInfo.name || 'Full Name';
  const email = resumeData.personalInfo.email || 'email@example.com';
  const phone = resumeData.personalInfo.phone || '123-456-7890';
  const linkedin = resumeData.personalInfo.linkedin || 'linkedin.com/in/profile';
  const github = resumeData.personalInfo.github || 'github.com/username';

  // Generate the LaTeX document using the provided template
  return `%-------------------------
% Resume in Latex
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

%----------FONT OPTIONS----------
% sans-serif
% \\usepackage[sfdefault]{FiraSans}
% \\usepackage[sfdefault]{roboto}
% \\usepackage[sfdefault]{noto-sans}
% \\usepackage[default]{sourcesanspro}

% serif
% \\usepackage{CormorantGaramond}
% \\usepackage{charter}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
    \\small ${phone} $|$ \\href{mailto:${email}}{\\underline{${email}}} $|$ 
    \\href{https://${linkedin}}{\\underline{${linkedin}}} $|$
    \\href{https://${github}}{\\underline{${github}}}
\\end{center}

${generateEducationSection(resumeData.education)}

${generateExperienceSection(resumeData.workExperience)}

${generateProjectsSection(resumeData.projects)}

${generateSkillsSection(resumeData.skills)}

%-------------------------------------------
\\end{document}`;
}

// Helper function to generate Education section
function generateEducationSection(education) {
  if (!education || education.length === 0) {
    return '';
  }
  
  let content = `
%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart`;
  
  education.forEach(edu => {
    // Extract location from institution if available
    let location = '';
    const locationMatch = edu.institution.match(/(.*),\s*([A-Z]{2}|[A-Za-z\s]+)$/);
    
    if (locationMatch) {
      location = locationMatch[2];
    }
    
    content += `
    \\resumeSubheading
      {${edu.institution.replace(/,\s*([A-Z]{2}|[A-Za-z\s]+)$/, '')}}{${location}}
      {${edu.degree}}{${edu.duration}}`;
  });
  
  content += `
  \\resumeSubHeadingListEnd`;
  
  return content;
}

// Helper function to generate Experience section
function generateExperienceSection(experiences) {
  if (!experiences || experiences.length === 0) {
    return '';
  }
  
  let content = `
%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart`;
  
  experiences.forEach(exp => {
    // Extract location if available
    let location = '';
    const locationMatch = exp.company.match(/(.*),\s*([A-Z]{2}|[A-Za-z\s]+)$/);
    
    if (locationMatch) {
      location = locationMatch[2];
    }
    
    content += `
    \\resumeSubheading
      {${exp.position}}{${exp.duration}}
      {${exp.company.replace(/,\s*([A-Z]{2}|[A-Za-z\s]+)$/, '')}}{${location}}
      \\resumeItemListStart`;
    
    // Add bullet points for job responsibilities
    exp.description.forEach(desc => {
      content += `
        \\resumeItem{${desc}}`;
    });
    
    content += `
      \\resumeItemListEnd`;
  });
  
  content += `
  \\resumeSubHeadingListEnd`;
  
  return content;
}

// Helper function to generate Projects section
function generateProjectsSection(projects) {
  if (!projects || projects.length === 0) {
    return '';
  }
  
  let content = `
%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart`;
  
  projects.forEach(project => {
    content += `
      \\resumeProjectHeading
          {\\textbf{${project.name}} $|$ \\emph{${project.technologies}}}{${''}}
          \\resumeItemListStart
            \\resumeItem{${project.description}}
          \\resumeItemListEnd`;
  });
  
  content += `
    \\resumeSubHeadingListEnd`;
  
  return content;
}

// Helper function to generate Skills section
function generateSkillsSection(skills) {
  if (!skills || skills.length === 0) {
    return '';
  }
  
  // Group skills by category if possible
  const techSkills = skills.filter(skill => 
    /javascript|python|java|c\+\+|c#|ruby|php|html|css/i.test(skill));
  
  const frameworkSkills = skills.filter(skill => 
    /react|angular|vue|node|express|django|flask|spring|laravel/i.test(skill));
  
  const toolSkills = skills.filter(skill => 
    /git|docker|kubernetes|aws|azure|gcp|ci\/cd/i.test(skill));
  
  // Other skills that don't fit in the categories above
  const otherSkills = skills.filter(skill => 
    !techSkills.includes(skill) && 
    !frameworkSkills.includes(skill) && 
    !toolSkills.includes(skill));
  
  return `
%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Languages}{: ${techSkills.join(', ') || 'N/A'}} \\\\
     \\textbf{Frameworks}{: ${frameworkSkills.join(', ') || 'N/A'}} \\\\
     \\textbf{Developer Tools}{: ${toolSkills.join(', ') || 'N/A'}} \\\\
     ${otherSkills.length > 0 ? `\\textbf{Other}{: ${otherSkills.join(', ')}}` : ''}
    }}
 \\end{itemize}`;
}

// Compile LaTeX to PDF
async function compileLaTeX(latexContent, filename) {
  const outputDir = path.join(__dirname, 'outputs');
  const tempDir = path.join(__dirname, 'temp');
  
  // Ensure directories exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const baseName = path.basename(filename, path.extname(filename));
  const texFilePath = path.join(tempDir, `${baseName}.tex`);
  const outputFilePath = path.join(outputDir, `${baseName}.pdf`);
  
  // Write LaTeX content to file
  fs.writeFileSync(texFilePath, latexContent);
  
  try {
    // Attempt to compile LaTeX to PDF
    // This requires LaTeX to be installed on the server
    const result = await new Promise((resolve, reject) => {
      exec(`pdflatex -output-directory="${outputDir}" "${texFilePath}"`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(outputFilePath);
        }
      });
    });
    
    return result;
  } catch (error) {
    console.error('LaTeX compilation error:', error);
    
    // Fallback to PDFKit if LaTeX compilation fails
    return new Promise((resolve, reject) => {
      try {
        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputFilePath);
        
        // Handle stream events
        stream.on('error', reject);
        stream.on('finish', () => resolve(outputFilePath));
        
        // Pipe the PDF output to a file
        doc.pipe(stream);
        
        // Extract name from LaTeX content
        const nameMatch = latexContent.match(/\\scshape\s+(.+?)}\s*\\\\/);
        const name = nameMatch ? nameMatch[1] : 'Resume';
        
        // Add header with name
        doc.fontSize(24).text(name, { align: 'center' });
        doc.moveDown();
        
        // Add content sections from LaTeX
        const sections = ['Education', 'Experience', 'Projects', 'Technical Skills'];
        
        for (const section of sections) {
          if (latexContent.includes(`\\section{${section}}`)) {
            doc.fontSize(16).text(section, { underline: true });
            doc.moveDown(0.5);
            
            // Extract and add some content for this section
            // This is a simplified fallback, the real LaTeX formatting is better
            const sectionStart = latexContent.indexOf(`\\section{${section}}`);
            const nextSectionStart = Math.min(
              ...sections.map(s => {
                const idx = latexContent.indexOf(`\\section{${s}}`, sectionStart + 1);
                return idx > -1 ? idx : Infinity;
              })
            );
            
            const sectionContent = latexContent.substring(
              sectionStart,
              nextSectionStart !== Infinity ? nextSectionStart : undefined
            );
            
            // Clean up LaTeX commands for plain text
            const plainText = sectionContent
              .replace(/\\resumeItem{([^}]*)}/g, '• $1')
              .replace(/\\textbf{([^}]*)}/g, '$1')
              .replace(/\\textit{([^}]*)}/g, '$1')
              .replace(/\\begin{[^}]*}|\\end{[^}]*}|\\resumeSubheading{[^}]*}{[^}]*}{[^}]*}{[^}]*}/g, '')
              .replace(/\\\\/g, '\n')
              .replace(/\\[a-zA-Z]+/g, '')
              .replace(/\$[^$]*\$/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            doc.fontSize(12).text(plainText);
            doc.moveDown();
          }
        }
        
        // Finalize the PDF
        doc.end();
        
      } catch (pdfError) {
        reject(pdfError);
      }
    });
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Resume Transformer server running on port ${port}`);
});
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/webpack';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

// Set worker source path for PDF.js
const pdfjsVersion = '4.0.269';
const PDFJS_WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

export class ResumeProcessor {
  static async extractText(file) {
    try {
      console.log('Starting text extraction...', file.type);
      const fileType = file.type.toLowerCase();
      let text = '';

      if (fileType === 'application/pdf') {
        console.log('Processing PDF file...');
        text = await this.extractFromPDF(file);
      } else if (fileType.includes('word') || file.name.toLowerCase().endsWith('.docx')) {
        console.log('Processing DOCX file...');
        text = await this.extractFromDOCX(file);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      if (!text) {
        throw new Error('No text could be extracted from the file');
      }

      console.log('Text extracted successfully, processing content...');

      // Extract structured data
      const data = {
        contact: this.extractContactInfo(text),
        education: this.extractEducation(text),
        experience: this.extractExperience(text),
        projects: this.extractProjects(text),
        skills: this.extractSkills(text)
      };

      console.log('Data extraction complete:', {
        contactFound: !!data.contact.email || !!data.contact.phone,
        educationCount: data.education.length,
        experienceCount: data.experience.length,
        projectsCount: data.projects.length,
        skillsFound: Object.values(data.skills).some(s => s.length > 0)
      });

      return data;
    } catch (error) {
      console.error('Error in extractText:', error);
      throw new Error(`Failed to process resume: ${error.message}`);
    }
  }

  static async extractFromPDF(file) {
    try {
      console.log('Reading PDF file...');
      const arrayBuffer = await file.arrayBuffer();
      
      console.log('Initializing PDF parser...');
      const loadingTask = getDocument({
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: true,
        useSystemFonts: true
      });

      console.log('Loading PDF document...');
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);

      const pagePromises = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}...`);
        pagePromises.push(
          pdf.getPage(i).then(async page => {
            const textContent = await page.getTextContent();
            return textContent.items.map(item => item.str).join(' ');
          })
        );
      }
      
      console.log('Waiting for all pages to be processed...');
      const pageTexts = await Promise.all(pagePromises);
      const fullText = pageTexts.join('\n');
      
      console.log('PDF text extraction complete. Text length:', fullText.length);
      return fullText;
    } catch (error) {
      console.error('Error in extractFromPDF:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  static async extractFromDOCX(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error in extractFromDOCX:', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  static extractContactInfo(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/;
    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/i;
    const githubRegex = /github\.com\/[a-zA-Z0-9-]+/i;
    const nameRegex = /^([A-Z][a-z]+(?: [A-Z][a-z]+)+)/m;
    
    return {
      name: text.match(nameRegex)?.[0] || 'Your Name',
      email: text.match(emailRegex)?.[0] || '',
      phone: text.match(phoneRegex)?.[0] || '',
      linkedin: text.match(linkedinRegex)?.[0] || 'linkedin.com/in/your-profile',
      github: text.match(githubRegex)?.[0] || 'github.com/your-username'
    };
  }

  static extractEducation(text) {
    const education = [];
    const lines = text.split('\n');
    let currentEducation = null;
    
    const degreeKeywords = ['Bachelor', 'Master', 'PhD', 'BSc', 'MSc', 'Associate'];
    const dateRegex = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})/gi;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(new RegExp(degreeKeywords.join('|'), 'i'))) {
        if (currentEducation) {
          education.push(currentEducation);
        }
        
        const dates = line.match(dateRegex) || [];
        currentEducation = {
          institution: line.split(',')[0] || '',
          degree: line,
          date: dates.join(' - '),
          location: line.split(',').slice(-1)[0]?.trim() || ''
        };
      }
    }
    
    if (currentEducation) {
      education.push(currentEducation);
    }
    
    return education;
  }

  static extractExperience(text) {
    const experience = [];
    const lines = text.split('\n');
    let currentExp = null;
    let responsibilities = [];
    
    const dateRegex = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})/gi;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(dateRegex)) {
        if (currentExp) {
          currentExp.responsibilities = responsibilities;
          experience.push(currentExp);
          responsibilities = [];
        }
        
        const dates = line.match(dateRegex) || [];
        currentExp = {
          title: line.split('at')[0]?.trim() || line,
          company: line.split('at')[1]?.trim() || '',
          date: dates.join(' - '),
          location: line.split(',').slice(-1)[0]?.trim() || '',
          responsibilities: []
        };
      } else if (line.startsWith('•') || line.startsWith('-')) {
        responsibilities.push(line.substring(1).trim());
      }
    }
    
    if (currentExp) {
      currentExp.responsibilities = responsibilities;
      experience.push(currentExp);
    }
    
    return experience;
  }

  static extractProjects(text) {
    const projects = [];
    const lines = text.split('\n');
    let currentProject = null;
    let details = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.toLowerCase().includes('project') || (line.length < 50 && line.includes('|'))) {
        if (currentProject) {
          currentProject.details = details;
          projects.push(currentProject);
          details = [];
        }
        
        const [name, technologies] = line.split('|').map(s => s.trim());
        currentProject = {
          name: name.replace(/project/i, '').trim(),
          technologies: technologies || '',
          date: '',
          details: []
        };
      } else if (line.startsWith('•') || line.startsWith('-')) {
        details.push(line.substring(1).trim());
      }
    }
    
    if (currentProject) {
      currentProject.details = details;
      projects.push(currentProject);
    }
    
    return projects;
  }

  static extractSkills(text) {
    const skillCategories = {
      languages: [
        'Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
        'SQL', 'R', 'Swift', 'Kotlin', 'Go', 'Ruby', 'PHP'
      ],
      frameworks: [
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
        'Spring', 'TensorFlow', 'PyTorch', '.NET', 'Laravel'
      ],
      tools: [
        'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins',
        'Travis CI', 'CircleCI', 'Jira', 'Confluence'
      ],
      libraries: [
        'NumPy', 'Pandas', 'Scikit-learn', 'Matplotlib', 'jQuery',
        'Bootstrap', 'Material-UI', 'Redux'
      ]
    };

    const skills = {
      languages: [],
      frameworks: [],
      tools: [],
      libraries: []
    };

    const lowerText = text.toLowerCase();
    
    for (const [category, categorySkills] of Object.entries(skillCategories)) {
      skills[category] = categorySkills.filter(skill => 
        lowerText.includes(skill.toLowerCase())
      );
    }

    return {
      languages: skills.languages.join(', '),
      frameworks: skills.frameworks.join(', '),
      tools: skills.tools.join(', '),
      libraries: skills.libraries.join(', ')
    };
  }

  static async generatePDF(data) {
    try {
      const doc = new jsPDF({
        format: 'letter',
        unit: 'pt'
      });

      // Set fonts
      doc.setFont('helvetica');
      
      // Constants for layout
      const margin = 50;
      const pageWidth = doc.internal.pageSize.width;
      let yPos = margin;

      // Header - Name
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(data.contact.name, pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;

      // Contact Information
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contactInfo = [
        data.contact.phone,
        data.contact.email,
        data.contact.linkedin,
        data.contact.github
      ].filter(Boolean).join(' | ');
      doc.text(contactInfo, pageWidth / 2, yPos, { align: 'center' });
      yPos += 30;

      // Education Section
      this.addSection(doc, 'EDUCATION', yPos);
      yPos += 20;

      data.education.forEach(edu => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(edu.institution, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(edu.date, pageWidth - margin, yPos, { align: 'right' });
        yPos += 15;
        
        doc.setFont('helvetica', 'italic');
        doc.text(edu.degree, margin, yPos);
        doc.text(edu.location, pageWidth - margin, yPos, { align: 'right' });
        yPos += 20;
      });

      // Experience Section
      this.addSection(doc, 'EXPERIENCE', yPos);
      yPos += 20;

      data.experience.forEach(exp => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(exp.title, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(exp.date, pageWidth - margin, yPos, { align: 'right' });
        yPos += 15;
        
        doc.setFont('helvetica', 'italic');
        doc.text(exp.company, margin, yPos);
        doc.text(exp.location, pageWidth - margin, yPos, { align: 'right' });
        yPos += 15;

        doc.setFont('helvetica', 'normal');
        exp.responsibilities.forEach(resp => {
          const bulletPoint = '• ';
          const text = bulletPoint + resp;
          const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
          
          lines.forEach(line => {
            doc.text(line, margin + 10, yPos);
            yPos += 12;
          });
        });
        yPos += 10;
      });

      // Projects Section
      this.addSection(doc, 'PROJECTS', yPos);
      yPos += 20;

      data.projects.forEach(project => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const projectHeader = `${project.name} | ${project.technologies}`;
        doc.text(projectHeader, margin, yPos);
        if (project.date) {
          doc.setFont('helvetica', 'normal');
          doc.text(project.date, pageWidth - margin, yPos, { align: 'right' });
        }
        yPos += 15;

        doc.setFont('helvetica', 'normal');
        project.details.forEach(detail => {
          const bulletPoint = '• ';
          const text = bulletPoint + detail;
          const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
          
          lines.forEach(line => {
            doc.text(line, margin + 10, yPos);
            yPos += 12;
          });
        });
        yPos += 10;
      });

      // Skills Section
      this.addSection(doc, 'TECHNICAL SKILLS', yPos);
      yPos += 20;

      const skillCategories = [
        { label: 'Languages', skills: data.skills.languages },
        { label: 'Frameworks', skills: data.skills.frameworks },
        { label: 'Developer Tools', skills: data.skills.tools },
        { label: 'Libraries', skills: data.skills.libraries }
      ];

      skillCategories.forEach(category => {
        if (category.skills) {
          doc.setFont('helvetica', 'bold');
          doc.text(`${category.label}: `, margin, yPos);
          doc.setFont('helvetica', 'normal');
          const skillsText = doc.splitTextToSize(category.skills, pageWidth - margin * 2 - doc.getTextWidth(`${category.label}: `));
          doc.text(skillsText, margin + doc.getTextWidth(`${category.label}: `), yPos);
          yPos += 15;
        }
      });

      return doc.output('dataurlstring');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  static addSection(doc, title, yPos) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, 50, yPos);
    
    // Add underline
    const titleWidth = doc.getTextWidth(title);
    doc.setLineWidth(0.5);
    doc.line(50, yPos + 2, doc.internal.pageSize.width - 50, yPos + 2);
  }
}
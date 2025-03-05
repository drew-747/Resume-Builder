import { getDocument } from 'pdfjs-dist/webpack';
import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';

// Set worker source path
const pdfjsVersion = '4.0.269';
const PDFJS_WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

export class ResumeProcessor {
  static async extractText(file) {
    try {
      const fileType = file.type.toLowerCase();
      let text = '';

      if (fileType === 'application/pdf') {
        text = await this.extractFromPDF(file);
      } else if (fileType.includes('word') || file.name.toLowerCase().endsWith('.docx')) {
        text = await this.extractFromDOCX(file);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      if (!text) {
        throw new Error('No text could be extracted from the file');
      }

      return this.parseResumeContent(text);
    } catch (error) {
      console.error('Error in extractText:', error);
      throw new Error(`Failed to process resume: ${error.message}`);
    }
  }

  static async extractFromPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = getDocument({
        data: arrayBuffer,
        workerSrc: PDFJS_WORKER_SRC
      });

      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('Error in extractFromPDF:', error);
      throw new Error('Failed to extract text from PDF');
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

  static parseResumeContent(text) {
    try {
      const sections = {
        contact: {},
        education: [],
        experience: [],
        skills: []
      };

      // Extract email
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
      const emails = text.match(emailRegex);
      if (emails) {
        sections.contact.email = emails[0];
      }

      // Extract phone
      const phoneRegex = /(\+?1?[-.]?\s*)?(\([0-9]{3}\)|[0-9]{3})[-.]?\s*[0-9]{3}[-.]?\s*[0-9]{4}/g;
      const phones = text.match(phoneRegex);
      if (phones) {
        sections.contact.phone = phones[0];
      }

      // Extract skills
      const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular',
        'Vue.js', 'TypeScript', 'HTML', 'CSS', 'SQL', 'MongoDB', 'AWS',
        'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'CI/CD',
        'Agile', 'Scrum', 'Redux', 'Express', 'Spring Boot', 'Ruby',
        'PHP', 'Swift', 'Kotlin', 'Flutter', 'React Native'
      ];

      const skillRegex = new RegExp(skillKeywords.join('|'), 'gi');
      const foundSkills = text.match(skillRegex);
      if (foundSkills) {
        sections.skills = [...new Set(foundSkills)];
      }

      // Extract education
      const eduKeywords = ['Bachelor', 'Master', 'PhD', 'BSc', 'MSc', 'B.S.', 'M.S.', 'University', 'College', 'Institute'];
      const lines = text.split(/[\n\r]+/);
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (eduKeywords.some(keyword => 
          trimmedLine.includes(keyword) || 
          trimmedLine.includes(keyword.toUpperCase())
        )) {
          if (!sections.education.includes(trimmedLine)) {
            sections.education.push(trimmedLine);
          }
        }
      });

      // Extract experience (looking for date patterns and common job titles)
      const datePattern = /\b(19|20)\d{2}\b/;
      const jobTitles = ['Engineer', 'Developer', 'Architect', 'Manager', 'Lead', 'Consultant'];
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (datePattern.test(trimmedLine) && 
            jobTitles.some(title => trimmedLine.includes(title))) {
          sections.experience.push(trimmedLine);
        }
      });

      return sections;
    } catch (error) {
      console.error('Error in parseResumeContent:', error);
      throw new Error('Failed to parse resume content');
    }
  }

  static async generatePDF(data) {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Add header
      doc.setFontSize(24);
      doc.setTextColor(44, 62, 80);
      doc.text('Professional Resume', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
      yPos += 20;

      // Add contact information
      if (data.contact.email || data.contact.phone) {
        doc.setFontSize(12);
        doc.setTextColor(52, 73, 94);
        
        const contactInfo = [];
        if (data.contact.email) contactInfo.push(data.contact.email);
        if (data.contact.phone) contactInfo.push(data.contact.phone);
        
        doc.text(contactInfo.join(' | '), doc.internal.pageSize.width / 2, yPos, { align: 'center' });
        yPos += 15;
      }

      // Add skills section
      if (data.skills.length > 0) {
        yPos += 10;
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text('Technical Skills', 20, yPos);
        
        yPos += 8;
        doc.setFontSize(11);
        doc.setTextColor(52, 73, 94);
        
        const skillsText = data.skills.join(' • ');
        const splitSkills = doc.splitTextToSize(skillsText, doc.internal.pageSize.width - 40);
        doc.text(splitSkills, 20, yPos);
        yPos += (splitSkills.length * 7) + 10;
      }

      // Add experience section
      if (data.experience.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text('Professional Experience', 20, yPos);
        
        yPos += 8;
        doc.setFontSize(11);
        doc.setTextColor(52, 73, 94);
        
        data.experience.forEach(exp => {
          const splitExp = doc.splitTextToSize(exp, doc.internal.pageSize.width - 40);
          doc.text(splitExp, 20, yPos);
          yPos += (splitExp.length * 7) + 5;
        });
        
        yPos += 10;
      }

      // Add education section
      if (data.education.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text('Education', 20, yPos);
        
        yPos += 8;
        doc.setFontSize(11);
        doc.setTextColor(52, 73, 94);
        
        data.education.forEach(edu => {
          const splitEdu = doc.splitTextToSize(edu, doc.internal.pageSize.width - 40);
          doc.text(splitEdu, 20, yPos);
          yPos += (splitEdu.length * 7) + 5;
        });
      }

      return doc.output('dataurlstring');
    } catch (error) {
      console.error('Error in generatePDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
}
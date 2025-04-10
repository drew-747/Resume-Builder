import { getDocument } from 'pdfjs-dist/webpack';
import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';
import { GeminiAI } from './geminiAI';

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

      try {
        // First attempt: Use Gemini AI to process the resume text
        const processedData = await GeminiAI.processResume(text);
        
        // Second attempt: Enhance the resume data using Gemini AI
        const enhancedData = await GeminiAI.enhanceResume(processedData);
        
        return enhancedData;
      } catch (aiError) {
        console.error('AI processing failed, falling back to basic extraction:', aiError);
        // Fallback to basic extraction if AI processing fails
        return {
          contact: await this.extractContactInfo(text),
          skills: await this.extractSkills(text),
          education: await this.extractEducation(text),
          experience: await this.extractExperience(text)
        };
      }
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
      const numPages = pdf.numPages;
      
      // Process pages in parallel
      const pagePromises = Array.from({ length: numPages }, (_, i) => 
        pdf.getPage(i + 1).then(page => page.getTextContent())
      );
      
      const textContents = await Promise.all(pagePromises);
      return textContents
        .map(content => content.items.map(item => item.str).join(' '))
        .join('\n');
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

  static async extractContactInfo(text) {
    const contact = {};
    
    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      contact.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = text.match(/(\+?1?[-.]?\s*)?(\([0-9]{3}\)|[0-9]{3})[-.]?\s*[0-9]{3}[-.]?\s*[0-9]{4}/);
    if (phoneMatch) {
      contact.phone = phoneMatch[0];
    }

    return contact;
  }

  static async extractSkills(text) {
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular',
      'Vue.js', 'TypeScript', 'HTML', 'CSS', 'SQL', 'MongoDB', 'AWS',
      'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'CI/CD',
      'Agile', 'Scrum', 'Redux', 'Express', 'Spring Boot', 'Ruby',
      'PHP', 'Swift', 'Kotlin', 'Flutter', 'React Native'
    ];

    // Create a single regex pattern for all skills
    const skillPattern = new RegExp(skillKeywords.join('|'), 'gi');
    const foundSkills = text.match(skillPattern);
    
    return foundSkills ? [...new Set(foundSkills)] : [];
  }

  static async extractEducation(text) {
    const eduKeywords = ['Bachelor', 'Master', 'PhD', 'BSc', 'MSc', 'B.S.', 'M.S.', 'University', 'College', 'Institute'];
    const eduPattern = new RegExp(eduKeywords.join('|'), 'i');
    
    return text.split(/[\n\r]+/)
      .filter(line => eduPattern.test(line.trim()))
      .map(line => line.trim());
  }

  static async extractExperience(text) {
    const datePattern = /\b(19|20)\d{2}\b/;
    const jobTitles = ['Engineer', 'Developer', 'Architect', 'Manager', 'Lead', 'Consultant'];
    const jobPattern = new RegExp(jobTitles.join('|'), 'i');
    
    return text.split(/[\n\r]+/)
      .filter(line => {
        const trimmedLine = line.trim();
        return datePattern.test(trimmedLine) && jobPattern.test(trimmedLine);
      })
      .map(line => line.trim());
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
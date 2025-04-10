import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCodLJXffHPU-aPigpqdo4DQikM1zjL7mY';
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiAI {
  static async processResume(text) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Analyze the following resume text and extract structured information.
      Format your response as a JSON object with these exact keys: contact, skills, education, experience.
      
      For contact, include email and phone if present.
      For skills, list all technical and professional skills as an array.
      For education, include an array of objects with degree, institution, and dates.
      For experience, include an array of objects with job title, company, dates, and responsibilities.
      
      Only respond with valid JSON, no additional text or explanation.
      
      Resume text:
      ${text}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = textResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const parsedData = JSON.parse(cleanedResponse);
        
        // Validate and structure the data
        return {
          contact: {
            email: parsedData.contact?.email || '',
            phone: parsedData.contact?.phone || ''
          },
          skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
          education: Array.isArray(parsedData.education) ? parsedData.education : [],
          experience: Array.isArray(parsedData.experience) ? parsedData.experience : []
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('Error processing resume with Gemini:', error);
      throw new Error('Failed to process resume with AI. Please try again.');
    }
  }

  static async enhanceResume(data) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Enhance the following resume data to make it more professional and impactful.
      Format your response as a JSON object with the same structure as the input.
      Focus on making the content more achievement-oriented and quantifiable.
      Only respond with valid JSON, no additional text or explanation.
      
      Current resume data:
      ${JSON.stringify(data, null, 2)}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = textResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const enhancedData = JSON.parse(cleanedResponse);
        
        // Validate and structure the enhanced data
        return {
          contact: {
            email: enhancedData.contact?.email || data.contact.email,
            phone: enhancedData.contact?.phone || data.contact.phone
          },
          skills: Array.isArray(enhancedData.skills) ? enhancedData.skills : data.skills,
          education: Array.isArray(enhancedData.education) ? enhancedData.education : data.education,
          experience: Array.isArray(enhancedData.experience) ? enhancedData.experience : data.experience
        };
      } catch (parseError) {
        console.error('Error parsing enhanced data:', parseError);
        // Return original data if enhancement fails
        return data;
      }
    } catch (error) {
      console.error('Error enhancing resume with Gemini:', error);
      // Return original data if enhancement fails
      return data;
    }
  }
} 
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

const About = () => {
  const features = [
    'Professional template designed for software engineers',
    'Smart content extraction and formatting',
    'ATS-friendly output',
    'Industry-standard LaTeX-style formatting',
    'Instant PDF generation'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        About ResumeAI
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        We help software engineers transform their resumes into professional, 
        industry-standard documents that stand out to recruiters and pass ATS systems.
      </p>
      
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Key Features
      </h2>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center text-gray-700"
          >
            <FaCheck className="text-green-500 mr-3" />
            {feature}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default About;
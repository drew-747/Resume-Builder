import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiArrowRight, FiCheck, FiMoon, FiSun } from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement email submission
    console.log('Email submitted:', email);
  };

  const handleTryForFree = () => {
    navigate('/builder');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Resume Builder</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-900 dark:text-white hover:text-blue-600">Home</a>
              <a href="#features" className="text-gray-900 dark:text-white hover:text-blue-600">Features</a>
              <a href="#contact" className="text-gray-900 dark:text-white hover:text-blue-600">Contact</a>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              >
                {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={heroInView ? { scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 dark:text-white text-gray-900">
              Transform Your Resume with AI
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8">
              Convert any resume format to a professional, ATS-friendly design in seconds
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTryForFree}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center mx-auto"
            >
              Try for Free <FiArrowRight className="ml-2" />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 dark:text-white text-gray-900">
                The Problem
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Job seekers struggle with formatting resumes for different job applications and ATS systems. Manual formatting is time-consuming and error-prone.
              </p>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 dark:text-white text-gray-900">
                Our Solution
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Our AI-powered platform automatically converts any resume format into a professional, ATS-friendly design, saving you hours of manual work.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 dark:text-white text-gray-900">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Smart Formatting',
                description: 'Automatically formats your resume for any job application',
              },
              {
                title: 'ATS Optimization',
                description: 'Ensures your resume passes through applicant tracking systems',
              },
              {
                title: 'Multiple Formats',
                description: 'Export to PDF, Word, or plain text with perfect formatting',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-4 dark:text-white text-gray-900">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 dark:text-white text-gray-900">
              Join the Waitlist
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Be among the first to transform your resume with AI
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Join Waitlist
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-700 dark:text-gray-400">
            © 2024 Resume Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
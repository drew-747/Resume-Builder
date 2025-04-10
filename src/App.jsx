import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import DarkModeToggle from './components/DarkModeToggle';
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a dark mode preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/builder" element={<Home isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            style: {
              background: isDarkMode ? '#1F2937' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
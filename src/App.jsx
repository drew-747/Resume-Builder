import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import DarkModeToggle from './components/DarkModeToggle';
import Home from './pages/Home';

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
      <div className="min-h-screen bg-white transition-colors duration-200">
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <Routes>
          <Route path="/" element={<Home isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
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
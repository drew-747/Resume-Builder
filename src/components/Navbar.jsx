import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FiZap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Resume Builder
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
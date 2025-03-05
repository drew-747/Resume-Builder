import { Link } from 'react-router-dom';
import { FaFileAlt } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FaFileAlt className="text-primary-600 text-2xl" />
            <span className="font-bold text-xl text-gray-800">ResumeAI</span>
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-primary-600">
              Home
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-primary-600">
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
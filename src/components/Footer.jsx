import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Resume Builder
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Transform your resume to Industry Standar
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                <FiMail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {["Home", "Features", "Pricing", "About"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              {["Blog", "Documentation", "Help Center", "Community"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">
              © {currentYear} Resume Builder. All rights reserved.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-4 md:mt-0">
              Made with ❤️ by Your Name
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
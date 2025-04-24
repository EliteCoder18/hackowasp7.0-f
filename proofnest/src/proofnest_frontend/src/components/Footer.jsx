import React from 'react';
import { Link } from 'react-router-dom';
import { FaFingerprint, FaGithub, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg mr-3">
                <FaFingerprint className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                ProofNest
              </h2>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              Secure your creative works with blockchain verification. ProofNest provides tamper-proof certification for your digital assets.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <FaTwitter className="text-gray-600" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <FaGithub className="text-gray-600" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <FaLinkedinIn className="text-gray-600" />
              </a>
            </div>
          </div>

          {/* Quick Links - only includes links to pages that exist */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Verify Content
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-lg">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4 text-lg">Contact</h3>
            <p className="text-gray-600 mb-2">Have a question?</p>
            <a
              href="mailto:support@proofnest.com"
              className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
            >
              support@proofnest.com
            </a>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} ProofNest. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-500 text-sm">
              Secured by Blockchain Technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

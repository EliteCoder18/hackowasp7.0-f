import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
  const { isAuthenticated, principal, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-white text-xl font-bold">ProofNest</Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`transition-colors duration-150 ${isActive('/') 
                ? 'text-white font-medium' 
                : 'text-gray-300 hover:text-white'}`}
            >
              Home
            </Link>
            <Link 
              to="/verify" 
              className={`transition-colors duration-150 ${isActive('/verify') 
                ? 'text-white font-medium' 
                : 'text-gray-300 hover:text-white'}`}
            >
              Verify
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/files" 
                className={`transition-colors duration-150 ${isActive('/files') 
                  ? 'text-white font-medium' 
                  : 'text-gray-300 hover:text-white'}`}
              >
                My Files
              </Link>
            )}
            
            <Link 
              to="/about" 
              className={`transition-colors duration-150 ${isActive('/about') 
                ? 'text-white font-medium' 
                : 'text-gray-300 hover:text-white'}`}
            >
              About
            </Link>
            
            <Link 
              to="/contact" 
              className={`transition-colors duration-150 ${isActive('/contact') 
                ? 'text-white font-medium' 
                : 'text-gray-300 hover:text-white'}`}
            >
              Contact
            </Link>
            
            <Link 
              to="/feedback" 
              className={`transition-colors duration-150 ${isActive('/feedback') 
                ? 'text-white font-medium' 
                : 'text-gray-300 hover:text-white'}`}
            >
              Feedback
            </Link>
            
            {isAuthenticated ? (
              <>
                <div className="hidden lg:block">
                  <span className="text-gray-300 text-sm mr-2">Principal:</span>
                  <span className="text-gray-400 text-xs truncate max-w-[140px] inline-block align-bottom">{principal}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Link 
                    to="/register" 
                    className={`px-3 py-1 rounded text-sm transition-colors duration-150 ${isActive('/register') 
                      ? 'bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    Register
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors duration-150"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors duration-150"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 py-4 px-4 space-y-4">
          <Link 
            to="/" 
            className={`block py-2 ${isActive('/') ? 'text-white font-medium' : 'text-gray-300'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/verify" 
            className={`block py-2 ${isActive('/verify') ? 'text-white font-medium' : 'text-gray-300'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Verify
          </Link>
          
          {isAuthenticated && (
            <Link 
              to="/files" 
              className={`block py-2 ${isActive('/files') ? 'text-white font-medium' : 'text-gray-300'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Files
            </Link>
          )}
          
          <Link 
            to="/about" 
            className={`block py-2 ${isActive('/about') ? 'text-white font-medium' : 'text-gray-300'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          
          <Link 
            to="/contact" 
            className={`block py-2 ${isActive('/contact') ? 'text-white font-medium' : 'text-gray-300'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          
          <Link 
            to="/feedback" 
            className={`block py-2 ${isActive('/feedback') ? 'text-white font-medium' : 'text-gray-300'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Feedback
          </Link>
          
          <div className="pt-4 border-t border-gray-700">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="text-gray-400 text-xs">
                  <span className="text-gray-300">Principal:</span> {principal}
                </div>
                <div className="flex flex-col space-y-2">
                  <Link 
                    to="/register" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors duration-150 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register Content
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors duration-150"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors duration-150 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
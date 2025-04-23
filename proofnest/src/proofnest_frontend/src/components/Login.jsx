import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaFingerprint, FaArrowRight } from 'react-icons/fa';

function Login() {
  const [error, setError] = useState(null);
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/register');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    setError(null);
    try {
      await login();
    } catch (error) {
      setError('Failed to authenticate. Please try again.');
      console.error('Login error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50 flex items-center justify-center">
        <motion.div
          className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-purple-100 text-center max-w-md w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-6">
            <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Authenticating</h3>
          <p className="text-gray-600">Checking your credentials...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50 flex items-center justify-center py-20 px-4 relative overflow-hidden select-none">
      {/* Decorative elements similar to landing page */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full bg-indigo-100/30 blur-3xl"
          style={{ top: '20%', left: '-20%' }}
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full bg-purple-100/20 blur-3xl"
          style={{ bottom: '-10%', right: '-10%' }}
          animate={{ 
            scale: [1, 1.2, 1],
            y: [0, -30, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Connecting dots pattern */}
      <div className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}>
      </div>

      <motion.div
        className="relative z-10 bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl border border-white/50 max-w-md w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.8,
            type: "spring",
            bounce: 0.5,
            delay: 0.2
          }}
          className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-purple-200/20 mb-8 border border-white/50 mx-auto"
        >
          <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-3 text-white">
            <FaFingerprint className="h-8 w-8" />
          </div>
        </motion.div>

        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-3xl font-serif font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to ProofNest
          </h2>
          <p className="text-gray-600">
            Secure your creative legacy with blockchain protection
          </p>
        </motion.div>

        {error && (
          <motion.div
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={handleLogin}
          className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-200/50 relative overflow-hidden group"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="relative z-10">Sign in with Internet Identity</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          <motion.div
            className="relative z-10"
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
          >
            <FaArrowRight />
          </motion.div>
        </motion.button>
        
        <div className="mt-10 text-center">
          <motion.div 
            className="w-24 h-1 mx-auto mb-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          ></motion.div>
          
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            New to Internet Identity?
          </motion.p>
          <motion.a
            href="https://identity.ic0.app/#create"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
          >
            Create an Internet Identity
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;

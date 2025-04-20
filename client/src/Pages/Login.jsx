import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Vortex } from '../components/ui/vortex';
import { Meteors } from '../components/ui/meteors';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ICP host URL
const ICP_HOST = 'https://identity.ic0.app';

const Login = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();

  
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authClient = await AuthClient.create();

      await authClient.login({
        identityProvider: ICP_HOST,
        onSuccess: () => {
          navigate('/copyright');
        },
        onError: (error) => {
          console.error('Login error:', error);
          setError('Authentication failed');
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Login initialization error:', error);
      setError('Failed to start authentication');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Vortex>

        <div className="flex items-center justify-center min-h-[90vh] bg-transparent">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </motion.div>
        </div>
      </Vortex>
    );
  }

  return (
    <Vortex>
      <div className="flex items-center justify-center min-h-[90vh] bg-transparent mt-10">
        <motion.div
          className="relative bg-black/70 backdrop-blur-md p-10 rounded-2xl shadow-xl max-w-lg w-full border border-gray-800 min-h-[400px]"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Meteors Animation Inside the Box */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <Meteors number={15} className="bg-gradient-to-r from-gray-700 to-black" />
          </div>

          <div className="relative z-10 text-center mb-8">
            <motion.h1
              className="text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              ProofNest
            </motion.h1>
            <motion.p
              className="text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Secure blockchain content verification
            </motion.p>
          </div>

          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
            className="mt-8 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-md font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Login with Internet Identity
          </motion.button>

          <div className="mt-8 text-center"> {/* Added mt-8 for padding */}
            <motion.p
              className="text-lg text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              New to Internet Identity?{' '}
              <a
                href="https://identity.ic0.app/#create"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                Create an Internet Identity
              </a>
            </motion.p>
          </div>
        </motion.div>
      </div>

    </Vortex>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useNavigate } from 'react-router-dom';

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
        
        if (isAuthenticated) {
          // Already authenticated, redirect to copyright page
          navigate('/copyright');
        }
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
      
      // Start the login flow
      await authClient.login({
        identityProvider: ICP_HOST,
        onSuccess: () => {
          navigate('/copyright');
        },
        onError: (error) => {
          console.error('Login error:', error);
          setError('Authentication failed');
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Login initialization error:', error);
      setError('Failed to start authentication');
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ProofNest</h1>
          <p className="text-gray-600">Secure blockchain content verification</p>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Authentication with Internet Identity is required to use ProofNest.
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-md font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Login with Internet Identity
        </button>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            New to Internet Identity?{' '}
            <a 
              href="https://identity.ic0.app/#create" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Create an Internet Identity
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);

  // Initialize auth client
  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);

        const isLoggedIn = await client.isAuthenticated();

        if (isLoggedIn) {
          const identity = client.getIdentity();
          const principal = identity.getPrincipal().toString();

          setIdentity(identity);
          setPrincipal(principal);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async () => {
    if (!authClient) return;

    setIsLoading(true);

    try {
      // This will redirect to the II service
      await authClient.login({
        identityProvider: process.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.app/#authorize'
          : `http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai#authorize`,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toString();

          setIdentity(identity);
          setPrincipal(principal);
          setIsAuthenticated(true);
          setIsLoading(false);
        },
        onError: (error) => {
          console.error("Login error:", error);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Login function error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    if (!authClient) return;

    setIsLoading(true);

    try {
      await authClient.logout();
      setIdentity(null);
      setPrincipal(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    identity,
    principal,
    login,
    logout,
    authClient
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
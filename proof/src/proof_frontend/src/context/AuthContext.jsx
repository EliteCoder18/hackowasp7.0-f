import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthClient } from '@dfinity/auth-client';

// Internet Computer host URL
const ICP_HOST = 'https://identity.ic0.app';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authClient, setAuthClient] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        
        const isLoggedIn = await client.isAuthenticated();
        setIsAuthenticated(isLoggedIn);
        
        if (isLoggedIn) {
          const currentIdentity = client.getIdentity();
          setIdentity(currentIdentity);
          setPrincipal(currentIdentity.getPrincipal().toString());
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;
    
    await authClient.login({
      identityProvider: ICP_HOST,
      onSuccess: () => {
        setIsAuthenticated(true);
        const currentIdentity = authClient.getIdentity();
        setIdentity(currentIdentity);
        setPrincipal(currentIdentity.getPrincipal().toString());
      },
    });
  };

  const logout = async () => {
    if (!authClient) return;
    
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setPrincipal(null);
  };

  const value = {
    isAuthenticated,
    identity,
    principal,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
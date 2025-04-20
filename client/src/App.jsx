import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import Compiler from './Pages/Compiler';
import Landing from './Pages/Landing';
import About from './Pages/About';
import Feedback from './Pages/Feedback';
import ContactSupport from './Pages/Contact';
import Login from './Pages/Login';
import Copyright from './Pages/CopyRight';
import FilesList from './Pages/FilesList';

// Context for authentication
export const AuthContext = React.createContext();

// Provider component
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authClient = await AuthClient.create();
        const isLoggedIn = await authClient.isAuthenticated();
        
        setIsAuthenticated(isLoggedIn);
        
        if (isLoggedIn) {
          const currentIdentity = authClient.getIdentity();
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

  const logout = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const authValue = {
    isAuthenticated,
    identity,
    principal,
    isLoading,
    logout
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = React.useContext(AuthContext);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/" element={<Compiler />}>
            <Route path="about" element={<About />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="contact" element={<ContactSupport />} />
            <Route path="register-asset" element={<Copyright />} />
          </Route>
          <Route 
            path="/copyright" 
            element={
              <ProtectedRoute>
                <Copyright />
              </ProtectedRoute>
            } 
          />
          <Route path="/files" element={<FilesList />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


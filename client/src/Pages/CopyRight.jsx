import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { useNavigate } from 'react-router-dom';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8000';
// ICP host URL
const ICP_HOST = 'https://identity.ic0.app';

// Global auth state
const AuthContext = React.createContext();

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [authClient, setAuthClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return {
    isAuthenticated,
    login,
    logout,
    identity,
    principal,
    isLoading
  };
};

const Register = () => {
  const { principal } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [hash, setHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (2MB limit)
      const maxSizeBytes = 2 * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        setMessage('File size exceeds the 2MB limit. Please choose a smaller file.');
        setFile(null);
        e.target.value = null; // Reset the file input
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleRegister = async () => {
    // Check if user is authenticated
    if (!principal) {
      setMessage('You must be logged in to upload files.');
      return;
    }

    if (!file) {
      setMessage('Please upload a file.');
      return;
    }

    setIsUploading(true);
    setMessage('Registering file on the blockchain...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('principal', principal);
      formData.append('name', fileName); // Add the name to the form data

      const response = await axios.post(`${API_BASE_URL}/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setHash(response.data.hash);
      setMessage(`File "${fileName}" registered successfully on the blockchain!`);
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 413) {
        setMessage('Error: File too large - maximum size is 2MB');
      } else if (error.response?.status === 409) {
        // Already registered
        setHash(error.response.data.hash || '');
        setMessage(`This file is already registered.`);
      } else {
        setMessage('Error: ' + (error.response?.data?.error || 'Unknown error'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    setMessage('Hash copied to clipboard');
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Register File</h2>
      
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 w-full p-2 border rounded"
        />
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">File Name/Description:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter a name or description"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={isUploading || !file}
          className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${
            (isUploading || !file) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Registering on blockchain...' : 'Register'}
        </button>
      </div>
      
      {message && <p className="mt-4 text-center font-medium">{message}</p>}
      
      {hash && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm font-bold mb-1">Generated Hash:</p>
          <div className="flex items-center">
            <p className="font-mono text-xs break-all mr-2">{hash}</p>
            <button
              onClick={copyToClipboard}
              className="bg-gray-200 hover:bg-gray-300 text-sm px-2 py-1 rounded"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Verify = () => {
  const [hash, setHash] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState('hash');
  const [fileContent, setFileContent] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (result) {
      console.log('Verification result:', result);
      console.log('File content available:', !!fileContent);
    }
  }, [result, fileContent]);

  const handleVerifyHash = async () => {
    if (!hash.trim()) return;
    
    setIsVerifying(true);
    setResult(null);
    setFileContent(null);
    
    try {
      console.log('Verifying hash:', hash);
      
      const response = await axios.post(`${API_BASE_URL}/verify`, { 
        hash,
        fetchContent: true // Request file content from blockchain
      });
      
      console.log('Verification API response:', response.data);
      
      setResult(response.data);
      
      // If file content was returned from the blockchain
      if (response.data.fileContent) {
        console.log('File content received, length:', response.data.fileContent.length);
        setFileContent(response.data.fileContent);
      } else {
        console.log('No file content in response');
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      
      // Check if we got an error response with data
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        const errorData = error.response.data || {};
        
        setResult({
          verified: false,
          message: errorData.message || 'Hash not found',
          error: errorData.error,
          hash
        });
      } else {
        // Network error or unexpected error
        setResult({
          verified: false,
          message: 'Connection error',
          error: error.message,
          hash
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyFile = async () => {
    if (!file) return;
    
    console.log('Verifying file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    setIsVerifying(true);
    setResult(null);
    setFileContent(null); // Reset file content when verifying a new file
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending file for verification...');
      
      // For better troubleshooting, add:
      console.log('POST URL:', `${API_BASE_URL}/verify-file`);
      
      // Add timeout and additional options for more reliable uploads
      const response = await axios.post(`${API_BASE_URL}/verify-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000, // Increase timeout to 60 seconds for larger files
        onUploadProgress: (progressEvent) => {
          console.log('Upload progress:', Math.round((progressEvent.loaded * 100) / progressEvent.total) + '%');
        }
      });
      
      console.log('File verification response received:', response.status);
      console.log('File verification response data:', response.data);
      
      setResult(response.data);
      // Set the hash value from the response
      if (response.data.hash) {
        setHash(response.data.hash);
      }
    } catch (error) {
      console.error('File verification error:', error);
      // More detailed error logging
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        setResult({
          verified: false,
          message: error.response.data.message || 'Error verifying file',
          error: error.response.data.error,
          hash: error.response.data.hash
        });
      } else if (error.request) {
        // Request was made but no response received
        console.log('No response received:', error.request);
        setResult({
          verified: false,
          message: 'No response from server. The file may be too large or the server may be unavailable.',
          error: error.message
        });
      } else {
        // Error in setting up the request
        setResult({
          verified: false,
          message: 'Error preparing request',
          error: error.message
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    console.log('Raw timestamp received:', timestamp);
    
    // Handle different timestamp formats
    let timestampMs;
    
    if (typeof timestamp === 'string') {
      // If it's a string, parse it first
      timestamp = Number(timestamp);
    }
    
    if (timestamp > 1000000000000000) {
      // Very large number in nanoseconds
      timestampMs = Number(timestamp) / 1000000;
      console.log('Converting from nanoseconds:', timestampMs);
    } else if (timestamp > 1000000000000) {
      // Already in milliseconds (from backend conversion)
      timestampMs = timestamp;
      console.log('Already in milliseconds:', timestampMs);
    } else {
      // Regular timestamp
      timestampMs = timestamp;
    }
    
    // Create a Date object and format it
    const date = new Date(timestampMs);
    
    // Log the resulting date for debugging
    console.log('Formatted date:', date.toString());
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid timestamp';
    }
    
    // Format the date nicely
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFilePreview = () => {
    if (!fileContent) {
      console.log('No file content available for preview');
      return null;
    }
    
    console.log('Rendering file preview, content type:', result?.contentType || 'unknown');
    
    const contentType = result?.contentType || result?.content_type || 'application/octet-stream';
    const isImage = contentType.startsWith('image/');
    const isText = contentType.startsWith('text/');
    const isPdf = contentType === 'application/pdf';
    
    try {
      // Ensure fileContent is properly converted to a Uint8Array
      let fileContentArray;
      if (fileContent instanceof Uint8Array) {
        fileContentArray = fileContent;
      } else if (Array.isArray(fileContent)) {
        fileContentArray = new Uint8Array(fileContent);
      } else {
        console.error('Unsupported file content format:', typeof fileContent);
        return (
          <div className="mt-4 p-2 border rounded">
            <h3 className="font-bold mb-2">File Preview:</h3>
            <div className="bg-red-100 text-red-700 p-2 rounded">
              Unable to preview file: Unsupported content format
            </div>
          </div>
        );
      }
      
      // Convert the binary data to the appropriate format
      const blob = new Blob([fileContentArray], { type: contentType });
      const url = URL.createObjectURL(blob);
      
      return (
        <div className="mt-4 p-2 border rounded">
          <h3 className="font-bold mb-2">File Preview:</h3>
          <div className="bg-gray-100 p-2 rounded">
            {isImage && <img src={url} alt="File preview" className="max-w-full max-h-64 mx-auto" />}
            {isPdf && <embed src={url} type="application/pdf" width="100%" height="400px" />}
            {isText && (
              <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-80">
                {new TextDecoder().decode(fileContentArray)}
              </pre>
            )}
            {!isImage && !isText && !isPdf && (
              <div className="text-center">
                <p>File preview not available for this file type ({contentType})</p>
                <a href={url} download={result.filename || "download"} className="text-blue-500 underline mt-2 inline-block">
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering file preview:', error);
      return (
        <div className="mt-4 p-2 border rounded">
          <h3 className="font-bold mb-2">File Preview:</h3>
          <div className="bg-red-100 text-red-700 p-2 rounded">
            Error previewing file: {error.message}
          </div>
        </div>
      );
    }
  };

  const handleDownload = () => {
    if (!fileContent || !result) return;
    
    // Create a Uint8Array from the fileContent array
    const uint8Array = new Uint8Array(fileContent);
    const blob = new Blob([uint8Array], { type: result.contentType || 'application/octet-stream' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name || 'downloaded-file';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Debug function to help diagnose issues
  const troubleshootVerification = async () => {
    if (!hash.trim()) {
      setMessage("Please enter a hash to troubleshoot");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Special debug endpoint that returns raw canister results
      const response = await axios.post(`${API_BASE_URL}/debug-verify`, { 
        hash,
      });
      
      console.log("Raw debug response:", response.data);
      
      setResult({
        ...result,
        debug: response.data,
        debugMessage: "Debug info received. Check browser console for details."
      });
      
    } catch (error) {
      console.error("Debug error:", error);
      setResult({
        ...result,
        debug: { error: error.message },
        debugMessage: "Debug error. Check browser console for details."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const renderVerificationResult = () => {
    if (!result) return null;
    
    // Special handling for "Unknown" name and user - likely a false positive
    // Skip this check if verification was done by file upload, which is more reliable
    if (result.verified && 
        result.verificationMethod !== 'file' && 
        (result.name === 'Unknown (file name not recovered)' || result.name === 'Unknown') && 
        (result.user === 'Unknown (recovered)' || result.user === 'Unknown')) {
      
      return (
        <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
          <div className="font-bold text-yellow-700">⚠️ Verification Unreliable</div>
          <div className="mt-2">
            <p>This content cannot be fully verified.</p>
          </div>
        </div>
      );
    }

    // Verified result - showing name and timestamp
    if (result.verified) {
      return (
        <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 rounded">
          <div className="font-bold text-green-700">✓ Content Verified</div>
          <div className="mt-2">
            <div className="text-xl font-semibold">{result.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              Registered on: {formatTimestamp(result.timestamp)}
            </div>
            
            {/* Only show download and preview options for file verification */}
            {result.verificationMethod === 'file' && fileContent && (
              <div className="mt-2">
                <button 
                  onClick={handleDownload}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2"
                >
                  Download Original File
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Not verified result
    return (
      <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 rounded">
        <div className="font-bold text-red-700">✗ Not Verified</div>
        <div className="mt-2">
          <div>{result.message || 'Content not found on the blockchain'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Verify Content</h2>
      
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${verifyMethod === 'hash' ? 
            'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setVerifyMethod('hash')}
        >
          Verify by Hash
        </button>
        <button
          className={`px-4 py-2 rounded ${verifyMethod === 'file' ? 
            'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setVerifyMethod('file')}
        >
          Verify by File
        </button>
      </div>
      
      {verifyMethod === 'hash' ? (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter hash value"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="border p-2 mb-4 w-full rounded"
          />
          <button
            onClick={handleVerifyHash}
            disabled={isVerifying || !hash.trim()}
            className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${
              (isVerifying || !hash.trim()) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify Hash'}
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 w-full border p-2 rounded"
          />
          <button
            onClick={handleVerifyFile}
            disabled={isVerifying || !file}
            className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${
              (isVerifying || !file) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify File'}
          </button>
        </div>
      )}
      
      {renderVerificationResult()}
      {result && result.verified && fileContent && renderFilePreview()}
      {result && (
        <div className="mt-4 text-right">
          <button 
            onClick={troubleshootVerification}
            className="text-xs text-gray-500 underline"
          >
            Troubleshoot
          </button>
          {result.debugMessage && (
            <p className="text-xs text-gray-600 mt-1">{result.debugMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

const Copyright = () => {
  const [activeTab, setActiveTab] = useState('register');
  const { isAuthenticated, principal, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ProofNest</h1>
        <div className="flex items-center">
          <span className="mr-4 text-sm text-green-600">
            Logged in as: {principal?.substring(0, 10)}...
          </span>
          <button 
            onClick={handleLogout} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${
              activeTab === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${
              activeTab === 'verify' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setActiveTab('verify')}
          >
            Verify
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'register' ? <Register /> : <Verify />}
        </div>
      </div>
      <div className="text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
      </div>
    </div>
  );
};

const App = () => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <Copyright />
    </AuthContext.Provider>
  );
};

export default App;

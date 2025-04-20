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

// Update the Register component
const Register = () => {
  const { principal } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [hash, setHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerDob, setOwnerDob] = useState('');
  const [hasRoyalty, setHasRoyalty] = useState(false);
  const [royaltyFee, setRoyaltyFee] = useState('0');
  const [contactDetails, setContactDetails] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      // Check file size (2MB limit)
      const maxSizeBytes = 2 * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        setMessage('File size exceeds the 2MB limit. Please choose a smaller file.');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null; // Reset the file input
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage('');
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
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

    if (!ownerName) {
      setMessage('Owner name is required.');
      return;
    }

    if (!ownerDob) {
      setMessage('Owner date of birth is required as a passkey for downloads.');
      return;
    }

    if (hasRoyalty && !royaltyFee) {
      setMessage('Please enter a royalty fee or disable royalties.');
      return;
    }

    setIsUploading(true);
    setMessage('Registering file on the blockchain...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('principal', principal);
      formData.append('name', fileName);
      formData.append('description', description);
      formData.append('ownerName', ownerName);
      formData.append('ownerDob', ownerDob);
      formData.append('hasRoyalty', hasRoyalty);
      formData.append('royaltyFee', royaltyFee);
      formData.append('contactDetails', contactDetails);

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
        // Already registered - show complete file info
        setHash(error.response.data.hash || '');
        
        // Fetch the complete file information for the already registered file
        try {
          const verifyResponse = await axios.post(`${API_BASE_URL}/verify`, {
            hash: error.response.data.hash
          });
          
          if (verifyResponse.data.verified) {
            const fileInfo = verifyResponse.data;
            // Create a rich message with all the details
            setMessage(
              <div className="space-y-3">
                <div className="text-yellow-300 font-medium text-lg">This file is already registered!</div>
                
                <div className="bg-gray-700 p-4 rounded-lg mt-3">
                  <h3 className="font-medium text-blue-300 mb-2">File Details:</h3>
                  
                  <div className="space-y-2 text-gray-300">
                    <div><span className="font-medium">Name:</span> {fileInfo.name}</div>
                    
                    {fileInfo.description && (
                      <div><span className="font-medium">Description:</span> {fileInfo.description}</div>
                    )}
                    
                    {fileInfo.ownerName && (
                      <div><span className="font-medium">Owner:</span> {fileInfo.ownerName}</div>
                    )}
                    
                    <div><span className="font-medium">Registered on:</span> {new Date(fileInfo.timestamp).toLocaleString()}</div>
                    
                    {fileInfo.hasRoyalty && (
                      <div className="mt-3 p-3 bg-gray-600 rounded-md">
                        <div className="text-yellow-300 font-medium">
                          Royalty Required: ${parseFloat(fileInfo.royaltyFee).toFixed(2)}
                        </div>
                        
                        {fileInfo.contactDetails && (
                          <div className="mt-2">
                            <span className="font-medium">Contact:</span> {fileInfo.contactDetails}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-400 mt-1">
                          Please contact the owner to arrange payment before using this asset.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          } else {
            setMessage(`This file is already registered with hash: ${error.response.data.hash}`);
          }
        } catch (verifyError) {
          console.error('Error fetching registered file details:', verifyError);
          setMessage(`This file is already registered with hash: ${error.response.data.hash}`);
        }
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
    <div className="space-y-8">
      {/* File upload area with drag and drop */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 
          ${isDragging ? 'border-blue-400 bg-blue-50/10' : 'border-gray-600 hover:border-blue-300'} 
          ${file ? 'bg-gray-800/50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {!file ? (
          <div className="space-y-4 cursor-pointer">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-gray-300 font-medium text-lg">Drag and drop your file here</div>
            <div className="text-gray-500 text-sm">or click to browse</div>
            <div className="text-xs text-gray-600">Maximum file size: 2MB</div>
          </div>
        ) : (
          <div className="space-y-3 cursor-pointer">
            <div className="flex items-center justify-center">
              <div className="bg-gray-700 p-3 rounded-lg inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-200 font-medium truncate max-w-xs">{file.name}</span>
              </div>
            </div>
            <div className="text-green-400">File selected - click to change</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md">
            <h3 className="text-lg font-medium text-blue-400 mb-4">File Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">File Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter a name"
                  className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for this file"
                  className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 h-28 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md">
            <h3 className="text-lg font-medium text-blue-400 mb-4">Ownership Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter the owner's name"
                  className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Owner Date of Birth (passkey)</label>
                <input
                  type="date"
                  value={ownerDob}
                  onChange={(e) => setOwnerDob(e.target.value)}
                  className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used as a passkey for others to download this file
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Royalty Section */}
      <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md">
        <div className="flex items-center mb-4">
          <div className="form-control">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                id="royaltyOption"
                checked={hasRoyalty}
                onChange={(e) => setHasRoyalty(e.target.checked)}
                className="checkbox border-gray-600 checked:border-blue-500"
              />
              <span className="text-gray-300 font-medium ml-2">Enable royalty service for this file</span>
            </label>
          </div>
        </div>
        
        {hasRoyalty && (
          <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700 mt-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Royalty Fee (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={royaltyFee}
                  onChange={(e) => setRoyaltyFee(e.target.value)}
                  placeholder="Enter the royalty amount"
                  className="w-full bg-gray-800 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Contact Details</label>
                <input
                  type="text"
                  value={contactDetails}
                  onChange={(e) => setContactDetails(e.target.value)}
                  placeholder="Email or phone number"
                  className="w-full bg-gray-800 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The contact information will be visible to users who wish to contact you about using this asset
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleRegister}
        disabled={isUploading || !file}
        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-lg font-medium text-lg shadow-lg transform transition-all duration-200
          ${(isUploading || !file) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'}`}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Registering on Blockchain...
          </div>
        ) : (
          <>Register on Blockchain</>
        )}
      </button>

      {/* Messages and Results */}
      {message && (
        <div className="p-5 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
          <div className="text-gray-300">{message}</div>
        </div>
      )}
      
      {hash && (
        <div className="p-5 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-blue-400 mb-3">Generated Hash</h3>
          <div className="flex items-center space-x-2 bg-gray-900 p-3 rounded-lg">
            <code className="flex-1 text-sm text-gray-300 break-all font-mono">{hash}</code>
            <button
              onClick={copyToClipboard}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
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

  // Update the renderVerificationResult function in Verify component
  const renderVerificationResult = () => {
    if (!result) return null;
    
    console.log("Full verification result:", result); // Add this to debug what's coming from the backend
    
    if (result.verified) {
      const isUnreliable = 
        !result.name || result.name === 'Unknown' || 
        !result.user || result.user === 'Unknown (recovered)';
        
      // If file verification is unreliable, show warning only if not verified by test registration
      if (isUnreliable && result.verificationMethod !== 'registration-test') {
        return (
          <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
            <div className="font-bold text-yellow-700">⚠️ Verification Unreliable</div>
            <div className="mt-2">
              <p>This content cannot be fully verified.</p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 rounded">
          <div className="font-bold text-green-700 text-lg">✓ Content Verified</div>
          <div className="mt-4">
            <div className="text-xl font-semibold">{result.name}</div>
            
            {/* Make description more prominent */}
            {result.description && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <div className="font-medium text-blue-800 mb-1">Description:</div>
                <div className="text-gray-700 italic">"{result.description}"</div>
              </div>
            )}
            
            {!result.description && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="text-gray-500 italic">No description provided</div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {result.ownerName && (
                <div className="flex items-center text-gray-700">
                  <span className="font-medium mr-2">Owner:</span> {result.ownerName}
                </div>
              )}
              
              <div className="text-gray-700">
                <span className="font-medium mr-2">Registered on:</span> 
                {formatTimestamp(result.timestamp)}
              </div>
            </div>
            
            {result.hasRoyalty && (
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md">
                <div className="font-semibold text-yellow-800 text-lg">
                  Royalty Required: ${parseFloat(result.royaltyFee).toFixed(2)}
                </div>
                
                {result.contactDetails && (
                  <div className="text-gray-700 mt-2 p-2 bg-white rounded">
                    <div className="font-medium mb-1">Contact the owner:</div>
                    {result.contactDetails}
                  </div>
                )}
                
                <div className="text-gray-700 mt-2 text-sm">
                  Please contact the owner to arrange payment before using this asset.
                </div>
              </div>
            )}
            
            {/* File content preview and download options remain the same */}
            {fileContent && (
              <div className="mt-4">
                <button 
                  onClick={handleDownload}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Download Original File
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Not verified result remains the same
    return (
      <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 rounded">
        <div className="font-bold text-red-700">✗ Not Verified</div>
        <div className="mt-2">
          <div>{result.message || 'Content not found on the blockchain'}</div>
        </div>
      </div>
    );
  };
};

// Modify the Sidebar component
const Sidebar = ({ principal, onLogout, recentFiles, onRefresh }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleRefreshClick = () => {
    setIsRotating(true);
    onRefresh();
    // Reset rotation after animation completes
    setTimeout(() => setIsRotating(false), 1000);
  };

  return (
    <div className="h-screen w-80 bg-gray-900 text-white p-6 overflow-y-auto">
      {/* User Section */}
      <div className="mb-10 mt-1">
        <h2 className="text-xl font-bold mb-2">Hi User</h2>
        <p className="text-sm text-gray-400 break-all">{principal}</p>
      </div>

      {/* Recent Files Section with Refresh Button */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
        <button onClick={()=>{
          window.location.href = '/files';
         }}>
           <h3 className="text-sm font-medium bg-gray-300 p-2 rounded-lg text-gray-800 uppercase">Recent Files</h3>
           </button>
          <button
            onClick={handleRefreshClick}
            className={`p-2 text-gray-400 hover:text-white transition-colors ${
              isRotating ? 'animate-spin' : ''
            }`}
            disabled={isRotating}
            title="Refresh files"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          {recentFiles?.slice(0, 5).map((file) => (
            <div key={file.hash} className="bg-gray-800 rounded-lg p-3">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(file.timestamp).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200"
      >
        Logout
      </button>
    </div>
  );
};

// Update the Copyright component to include the refresh handler
const Copyright = () => {
  const [activeTab, setActiveTab] = useState('register');
  const { isAuthenticated, principal, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recentFiles, setRecentFiles] = useState([]);
  
  // Add this useEffect to fetch recent files
  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get-all-files`);
        setRecentFiles(response.data);
      } catch (error) {
        console.error('Error fetching recent files:', error);
      }
    };

    fetchRecentFiles();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-all-files`);
      setRecentFiles(response.data);
    } catch (error) {
      console.error('Error refreshing files:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className="flex-none">
        <Sidebar 
          principal={principal}
          onLogout={handleLogout}
          recentFiles={recentFiles}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
         
           
          </div>

          {/* Content Area */}
          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {activeTab === 'register' ? 'Register File' : 'Verify'}
            </h2>
            {activeTab === 'register' ? <Register /> : <Verify />}
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm mt-8">
            © {new Date().getFullYear()} ProofNest - Blockchain Content Verification
          </div>
        </div>
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

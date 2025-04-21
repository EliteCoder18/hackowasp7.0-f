import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerProof } from '../services/api';
import { MAX_FILE_SIZE } from '../config';
import { FaFileAlt, FaSync, FaCopy, FaSignOutAlt } from 'react-icons/fa';
import { proofnest_backend } from '../../../declarations/proofnest_backend';
import { createActor } from '../../../declarations/proofnest_backend';

function Register() {
  // Existing state
  const { principal, identity, logout } = useAuth();
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
  const fileInputRef = useRef(null);
  
  // New state for files sidebar
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  // Add this new state for responsive sidebar
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Add useEffect to handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth > 768);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch files from the canister
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const actor = identity ? createActor(process.env.CANISTER_ID_PROOFNEST_BACKEND, {
        agentOptions: {
          identity,
        },
      }) : proofnest_backend;

      const result = await actor.get_all_files();
      console.log("Files fetched:", result); // Debug log
      
      // Transform the result into an array of files with properties
      const filesArray = result.map(([hash, info]) => ({
        hash,
        name: info.name,
        description: info.description,
        timestamp: Number(info.timestamp),
        contentType: info.content_type,
        ownerName: info.owner_name,
        user: info.user.toString()
      }));
      
      console.log("Parsed files:", filesArray); // Debug log
      console.log("Current principal:", identity?.getPrincipal().toString()); // Debug log
      
      setFiles(filesArray);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshClick = () => {
    setIsRotating(true);
    fetchFiles();
    setTimeout(() => setIsRotating(false), 1000);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Existing functions
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      // Check file size (2MB limit)
      if (selectedFile.size > MAX_FILE_SIZE) {
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

  const calculateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  };

  const handleRegister = async () => {
    if (!file) {
      setMessage('Please select a file to register.');
      return;
    }

    try {
      setIsUploading(true);
      setMessage('Registering on blockchain...');
      
      // Calculate file hash
      const fileHash = await calculateSHA256(file);
      
      // Log file size before upload
      console.log("File size before upload:", file.size);
      
      // Call registerProof with ALL required parameters
      await registerProof(
        fileHash,       // hash
        fileName,       // fileName
        description,    // description
        royaltyFee,     // royaltyFee
        contactDetails, // contactInfo
        ownerName,      // ownerName
        ownerDob,       // ownerDob
        file            // <-- pass the file object here!
      );
      
      setHash(fileHash);
      setMessage(`File registered successfully!`);
      
      // Refresh files list after successful registration
      fetchFiles();
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(`Error: ${error.message || 'Registration failed'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    setMessage('Hash copied to clipboard');
  };

  const copyHash = (hash, name) => {
    // Try modern clipboard API first
    navigator.clipboard.writeText(hash)
      .then(() => {
        showCopyFeedback(name);
      })
      .catch(err => {
        console.error('Clipboard API failed, trying fallback:', err);
        
        // Fallback method
        try {
          const textArea = document.createElement('textarea');
          textArea.value = hash;
          
          // Make the textarea invisible
          textArea.style.position = 'fixed';
          textArea.style.opacity = 0;
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            showCopyFeedback(name);
          } else {
            setMessage(`Could not copy hash: execCommand failed`);
          }
        } catch (err) {
          console.error('Fallback copy method failed:', err);
          setMessage(`Could not copy hash: ${err.message}`);
        }
      });
  };

  // Helper function for showing feedback
  const showCopyFeedback = (name) => {
    setMessage(`Hash for ${name} copied to clipboard`);
    
    // Create visual feedback
    const feedback = document.createElement('div');
    feedback.textContent = 'Copied!';
    feedback.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
    document.body.appendChild(feedback);
    
    // Remove after delay
    setTimeout(() => {
      if (document.body.contains(feedback)) {
        document.body.removeChild(feedback);
      }
    }, 2000);
  };

  // Filter files to only show those from the current user
  const userFiles = files.filter(file => 
    file.user === identity?.getPrincipal().toString()
  );

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-4 bg-gray-900 text-white flex justify-between items-center border-b border-gray-800">
        <h2 className="text-xl font-bold">ProofNest</h2>
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 bg-gray-800 rounded-md"
        >
          {showSidebar ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-80 bg-gray-900 text-white flex flex-col h-[calc(100vh-64px)] md:h-screen border-r border-gray-800`}>
        {/* Scrollable content area - flex-grow will push logout to bottom */}
        <div className="flex-grow overflow-y-auto p-6">
          {/* User Section */}
          <div className="mb-6 mt-1">
            <h2 className="text-xl font-bold mb-2">Hi User</h2>
            <p className="text-sm text-gray-400 break-all">{principal || 'Not logged in'}</p>
          </div>

          {/* Your Files Section - Add debugging logs */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium bg-gray-300 p-2 rounded-lg text-gray-800 uppercase">Your Files</h3>
              <button
                onClick={handleRefreshClick}
                className={`p-2 text-gray-400 hover:text-white transition-colors ${
                  isRotating ? 'animate-spin' : ''
                }`}
                disabled={isRotating}
                title="Refresh files"
              >
                <FaSync className="h-4 w-4" />
              </button>
            </div>

            {/* Debug info - remove in production */}
            <div className="hidden">
              <p>Files count: {files.length}</p>
              <p>User Files count: {userFiles.length}</p>
              <p>Principal: {identity?.getPrincipal?.().toString() || 'No Principal'}</p>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-400 text-sm">Loading...</p>
              </div>
            ) : !identity ? (
              <div className="text-center py-8 bg-gray-800 bg-opacity-30 rounded-lg">
                <FaFileAlt className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Please log in to view your files</p>
              </div>
            ) : userFiles.length === 0 ? (
              <div className="text-center py-8 bg-gray-800 bg-opacity-30 rounded-lg">
                <FaFileAlt className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No files registered yet</p>
                <p className="text-gray-500 text-xs mt-1">Files you register will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userFiles.map((file) => (
                  <div key={file.hash} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition cursor-pointer">
                    <div className="flex items-center">
                      {/* File icon - no changes needed */}
                      {file.contentType?.includes('image') ? (
                        <div className="w-10 h-10 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ) : file.contentType?.includes('pdf') ? (
                        <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ) : file.contentType?.includes('video') ? (
                        <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-600 bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                          <FaFileAlt className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-200">{file.name}</p>
                        <p className="text-xs text-gray-400 truncate">{formatDate(file.timestamp)}</p>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyHash(file.hash, file.name);
                        }}
                        className="ml-2 text-blue-400 hover:text-blue-300 p-1 hover:bg-gray-700 rounded-full"
                        title="Copy hash"
                      >
                        <FaCopy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Logout Button - Fixed at bottom with shrink-0 to prevent it from being squeezed */}
        <div className="p-6 border-t border-gray-800 shrink-0">
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Register File</h2>
          
          {/* Original Register Form Content - Made responsive */}
          <div className="space-y-6 md:space-y-8">
            {/* File upload area with drag and drop */}
            <div 
              className={`border-2 border-dashed rounded-xl p-4 md:p-8 text-center transition-all duration-200 
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
                  <div className="mx-auto w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-gray-800 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-gray-300 font-medium text-base md:text-lg">Drag and drop your file here</div>
                  <div className="text-gray-500 text-xs md:text-sm">or click to browse</div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 truncate text-left">
                    <div className="text-white font-medium truncate text-sm md:text-base">{file.name}</div>
                    <div className="text-gray-500 text-xs md:text-sm">{(file.size / 1024).toFixed(2)} KB</div>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = null;
                    }}
                    className="rounded-full p-1 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Metadata Input Section - Made responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* File Details */}
              <div className="bg-gray-800 p-4 md:p-5 rounded-lg border border-gray-700 shadow-md">
                <h3 className="text-md md:text-lg font-medium text-blue-400 mb-3 md:mb-4">File Details</h3>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1 md:mb-2 font-medium text-sm md:text-base">File Name</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Enter a name"
                      className="w-full bg-gray-900 text-gray-300 text-sm md:text-base rounded-lg p-2 md:p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1 md:mb-2 font-medium text-sm md:text-base">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a description for this file"
                      className="w-full bg-gray-900 text-gray-300 text-sm md:text-base rounded-lg p-2 md:p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 min-h-[80px] md:min-h-[100px]"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Owner Details */}
              <div className="bg-gray-800 p-4 md:p-5 rounded-lg border border-gray-700 shadow-md">
                <h3 className="text-md md:text-lg font-medium text-blue-400 mb-3 md:mb-4">Owner Details</h3>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1 md:mb-2 font-medium text-sm md:text-base">Owner Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Enter owner's name"
                      className="w-full bg-gray-900 text-gray-300 text-sm md:text-base rounded-lg p-2 md:p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-1 md:mb-2 font-medium text-sm md:text-base">Owner Date of Birth (passkey)</label>
                    <input
                      type="date"
                      value={ownerDob}
                      onChange={(e) => setOwnerDob(e.target.value)}
                      className="w-full bg-gray-900 text-gray-300 text-sm md:text-base rounded-lg p-2 md:p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be used as a passkey for others to download this file
                    </p>
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
                        className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        required={hasRoyalty}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Contact Details</label>
                      <input
                        type="text"
                        value={contactDetails}
                        onChange={(e) => setContactDetails(e.target.value)}
                        placeholder="Email, phone, or website"
                        className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        required={hasRoyalty}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
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
              <div className="p-4 md:p-5 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
                <h3 className="text-md md:text-lg font-medium text-blue-400 mb-3 md:mb-4">Registration Successful</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-900 p-3 rounded-lg">
                  <div className="font-mono text-gray-300 break-all pr-2 text-sm md:text-base mb-2 sm:mb-0">
                    {hash}
                  </div>
                  <button
                    onClick={() => copyHash(hash, fileName)}
                    className="ml-0 sm:ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="text-center text-gray-600 text-xs md:text-sm mt-6 md:mt-8">
            © {new Date().getFullYear()} ProofNest - Blockchain Content Verification
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerProof } from '../services/api';
import { MAX_FILE_SIZE } from '../config';
import { FaFileAlt, FaSync, FaCopy, FaSignOutAlt, FaCloudUploadAlt, FaBars, FaTimes, FaLock, FaShieldAlt, FaRegFileAlt, FaUser, FaMoneyBillWave, FaRegLightbulb } from 'react-icons/fa';
import { proofnest_backend } from '../../../declarations/proofnest_backend';
import { createActor } from '../../../declarations/proofnest_backend';

function Register() {
  // Keep all existing state and functions
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
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Keep all useEffects and handlers
  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, []);

  // All your existing functions remain the same
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const actor = identity ? createActor(process.env.CANISTER_ID_PROOFNEST_BACKEND, {
        agentOptions: { identity },
      }) : proofnest_backend;

      const result = await actor.get_all_files();
      
      const filesArray = result.map(([hash, info]) => ({
        hash,
        name: info.name,
        description: info.description,
        timestamp: Number(info.timestamp),
        contentType: info.content_type,
        ownerName: info.owner_name,
        user: info.user.toString()
      }));
      
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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage('File size exceeds the 2MB limit. Please choose a smaller file.');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
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
      
      const fileHash = await calculateSHA256(file);
      
      await registerProof(
        fileHash,
        fileName,
        description,
        royaltyFee,
        contactDetails,
        ownerName,
        ownerDob,
        file
      );
      
      setHash(fileHash);
      setMessage(`File registered successfully!`);
      
      fetchFiles();
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(`Error: ${error.message || 'Registration failed'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const copyHash = (hash, name) => {
    navigator.clipboard.writeText(hash)
      .then(() => {
        showCopyFeedback(name);
      })
      .catch(err => {
        console.error('Clipboard API failed, trying fallback:', err);
        
        try {
          const textArea = document.createElement('textarea');
          textArea.value = hash;
          
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

  const showCopyFeedback = (name) => {
    setMessage(`Hash for ${name} copied to clipboard`);
    
    const feedback = document.createElement('div');
    feedback.textContent = 'Copied!';
    feedback.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      if (document.body.contains(feedback)) {
        document.body.removeChild(feedback);
      }
    }, 2000);
  };

  const userFiles = files.filter(file => 
    file.user === identity?.getPrincipal().toString()
  );

  // Get file icon based on content type
  const getFileIcon = (contentType) => {
    if (contentType?.includes('image')) {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mr-3 border border-purple-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else if (contentType?.includes('pdf')) {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg flex items-center justify-center mr-3 border border-red-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else if (contentType?.includes('video')) {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mr-3 border border-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-lg flex items-center justify-center mr-3 border border-gray-500/30">
        <FaFileAlt className="h-5 w-5 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex flex-col md:flex-row relative">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl opacity-30 pointer-events-none"></div>
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-5 bg-gray-900/80 backdrop-blur-sm text-white flex justify-between items-center border-b border-gray-700/50 sticky top-0 z-20">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">ProofNest</h2>
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 bg-gray-800/80 rounded-md transition-all hover:bg-gray-700/80"
        >
          {showSidebar ? (
            <FaTimes className="h-5 w-5 text-gray-300" />
          ) : (
            <FaBars className="h-5 w-5 text-gray-300" />
          )}
        </button>
      </div>
      
      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-80 bg-gray-900/70 backdrop-blur-md text-white flex flex-col h-[calc(100vh-64px)] md:h-screen border-r border-gray-800/50 relative z-10`}>
        {/* Sidebar decorative header */}
        <div className="hidden md:block p-6 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-gray-800">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">ProofNest</h2>
          <p className="text-sm text-gray-400 mt-1">Blockchain Content Verification</p>
        </div>
        
        {/* Scrollable content area */}
        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {/* User Section */}
          <div className="mb-8 mt-1">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
                <FaUser className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Welcome</h2>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <p className="text-sm text-gray-300 break-all font-mono">{principal || 'Not logged in'}</p>
            </div>
          </div>

          {/* Your Files Section */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center">
                <div className="bg-blue-500/20 w-8 h-8 flex items-center justify-center rounded-md mr-2">
                  <FaRegFileAlt className="text-blue-400" />
                </div>
                <h3 className="text-md font-semibold text-white">Your Files</h3>
              </div>
              <button
                onClick={handleRefreshClick}
                className={`p-2 text-gray-400 hover:text-blue-400 transition-all hover:bg-gray-800/70 rounded-full ${
                  isRotating ? 'animate-spin' : ''
                }`}
                disabled={isRotating}
                title="Refresh files"
              >
                <FaSync className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-400 text-sm">Loading your files...</p>
              </div>
            ) : !identity ? (
              <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="bg-gray-700/50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
                  <FaLock className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-300 font-medium">Authentication Required</p>
                <p className="text-gray-400 text-sm mt-1">Log in to view your files</p>
              </div>
            ) : userFiles.length === 0 ? (
              <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <div className="bg-gray-700/50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
                  <FaRegFileAlt className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-300 font-medium">No files yet</p>
                <p className="text-gray-400 text-sm mt-1">Files you register will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userFiles.map((file) => (
                  <div 
                    key={file.hash} 
                    className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl p-3 hover:from-gray-700/80 hover:to-gray-800/80 transition-all duration-300 cursor-pointer border border-gray-700/50 hover:border-gray-600/50 hover:shadow-lg hover:shadow-blue-900/10"
                  >
                    <div className="flex items-center">
                      {getFileIcon(file.contentType)}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">{file.name}</p>
                        <p className="text-xs text-blue-300/80 truncate">{formatDate(file.timestamp)}</p>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyHash(file.hash, file.name);
                        }}
                        className="ml-2 text-gray-400 hover:text-blue-400 p-1.5 hover:bg-blue-900/20 rounded-full transition-all"
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
        
        {/* Logout Button */}
        <div className="p-5 border-t border-gray-800/50 shrink-0 bg-gradient-to-b from-transparent to-gray-900/50">
          <button
            onClick={logout}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center font-medium shadow-lg shadow-red-900/20"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 md:p-10 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-3 rounded-xl border border-blue-500/20 mb-4">
              <FaShieldAlt className="text-blue-400 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-white">Register Content</h2>
            <p className="text-gray-400">Secure your digital assets on the blockchain with tamper-proof verification</p>
          </div>
          
          {/* Register Form Content */}
          <div className="space-y-6 md:space-y-8">
            {/* File upload area with drag and drop */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 md:p-10 text-center transition-all duration-300 
                ${isDragging ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/10' : 'border-gray-600/50 hover:border-blue-500/70'} 
                ${file ? 'bg-gray-800/40 backdrop-blur-sm' : ''}`}
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
                  <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/30 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                    <FaCloudUploadAlt className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-lg">Drag and drop your file here</div>
                    <div className="text-gray-400 text-sm mt-1">or click to browse your device</div>
                  </div>
                  <div className="text-xs text-gray-500 max-w-sm mx-auto">
                    Supported file types: images, PDFs, videos, documents. Maximum size: 2MB
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-600/20 text-blue-400 border border-blue-500/30">
                    <FaRegFileAlt className="h-6 w-6" />
                  </div>
                  <div className="flex-1 truncate text-center md:text-left">
                    <div className="text-white font-semibold truncate text-lg">{file.name}</div>
                    <div className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB • Ready to register</div>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = null;
                    }}
                    className="rounded-full p-2 hover:bg-gray-700/70 text-gray-400 hover:text-white transition-all"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Form Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Details */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-600/5 px-5 py-4 border-b border-gray-700/50">
                  <div className="flex items-center">
                    <div className="bg-blue-600/20 p-2 rounded-lg mr-3">
                      <FaRegFileAlt className="text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">File Details</h3>
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">File Name</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Enter a descriptive name"
                      className="w-full bg-gray-900/70 text-gray-200 rounded-lg p-3 border border-gray-700/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the content of this file..."
                      className="w-full bg-gray-900/70 text-gray-200 rounded-lg p-3 border border-gray-700/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all min-h-[100px] shadow-inner outline-none resize-none"
                    ></textarea>
                    <p className="mt-2 text-xs text-gray-500">This description will help others understand what this file contains</p>
                  </div>
                </div>
              </div>
              
              {/* Owner Details */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-indigo-600/20 to-indigo-600/5 px-5 py-4 border-b border-gray-700/50">
                  <div className="flex items-center">
                    <div className="bg-indigo-600/20 p-2 rounded-lg mr-3">
                      <FaUser className="text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Owner Details</h3>
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Owner Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Enter the owner's name"
                      className="w-full bg-gray-900/70 text-gray-200 rounded-lg p-3 border border-gray-700/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Owner Date of Birth</label>
                    <input
                      type="date"
                      value={ownerDob}
                      onChange={(e) => setOwnerDob(e.target.value)}
                      className="w-full bg-gray-900/70 text-gray-200 rounded-lg p-3 border border-gray-700/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner outline-none"
                      required
                    />
                    <div className="mt-2 bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
                      <p className="text-xs flex items-start text-blue-300">
                        <FaRegLightbulb className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                        This will be used as a secure passkey for others to verify and download this file
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Royalty Section */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 shadow-xl overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-purple-600/20 to-purple-600/5 px-5 py-4 border-b border-gray-700/50">
                <div className="flex items-center">
                  <div className="bg-purple-600/20 p-2 rounded-lg mr-3">
                    <FaMoneyBillWave className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Royalty Options</h3>
                </div>
              </div>
              
              <div className="p-5">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="royaltyOption"
                    checked={hasRoyalty}
                    onChange={(e) => setHasRoyalty(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-600 focus:ring-blue-500 focus:ring-offset-gray-900 transition duration-150"
                  />
                  <span className="text-white font-medium">Enable royalty service for this file</span>
                </label>
                
                <p className="mt-2 text-sm text-gray-400">
                  Enabling royalties allows you to monetize your content when others use it
                </p>
                
                {hasRoyalty && (
                  <div className="mt-5 space-y-4 bg-gradient-to-r from-purple-900/20 to-gray-900 rounded-xl border border-purple-800/30 p-5 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Royalty Fee (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={royaltyFee}
                            onChange={(e) => setRoyaltyFee(e.target.value)}
                            className="w-full bg-gray-900/70 text-gray-200 rounded-lg p-3 pl-8 border border-gray-700/70 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all shadow-inner outline-none"
                            required={hasRoyalty}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Contact Details</label>
                        <input
                          type="text"
                          value={contactDetails}
                          onChange={(e) => setContactDetails(e.target.value)}
                          placeholder="Email, phone, or website"
                          className="w-full bg-gray-900/70 text-gray-200 rounded-lg p-3 border border-gray-700/70 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all shadow-inner outline-none"
                          required={hasRoyalty}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-purple-900/30 border border-purple-800/30 rounded-lg p-4 mt-4">
                      <p className="text-sm flex items-start text-purple-300">
                        <FaRegLightbulb className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        Your contact details will be shown to users who would like to license your content. You'll handle payment collection directly with interested parties.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleRegister}
              disabled={isUploading || !file}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-medium text-lg shadow-xl transform transition-all duration-300
                ${(isUploading || !file) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-blue-700 hover:to-indigo-800 hover:shadow-2xl hover:shadow-blue-700/20 hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Registering on Blockchain...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FaShieldAlt className="mr-2" />
                  <span>Register on Blockchain</span>
                </div>
              )}
            </button>

            {/* Messages and Results */}
            {message && (
              <div className="p-5 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 shadow-xl backdrop-blur-sm animate-fadeIn">
                <div className="text-gray-300">{message}</div>
              </div>
            )}
            
            {hash && (
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-700/30 shadow-xl overflow-hidden backdrop-blur-sm animate-fadeIn">
                <div className="bg-gradient-to-r from-green-600/20 to-green-600/5 px-5 py-4 border-b border-green-700/30">
                  <div className="flex items-center">
                    <div className="bg-green-600/30 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-green-400">Registration Successful</h3>
                  </div>
                </div>
                
                <div className="p-5 space-y-3">
                  <p className="text-sm text-gray-300 mb-2">
                    Your file has been successfully registered on the blockchain. The unique content hash is:
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-900/80 p-4 rounded-lg border border-gray-700/50">
                    <div className="font-mono text-gray-100 break-all pr-2 text-sm mb-3 sm:mb-0">
                      {hash}
                    </div>
                    <button
                      onClick={() => copyHash(hash, fileName)}
                      className="ml-0 sm:ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center text-sm whitespace-nowrap shadow-lg shadow-blue-700/20"
                    >
                      <FaCopy className="h-4 w-4 mr-2" />
                      Copy Hash
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-3">
                    Store this hash safely. It serves as proof of your content registration and can be used to verify ownership.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-10">
            © {new Date().getFullYear()} ProofNest - Blockchain Content Verification
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

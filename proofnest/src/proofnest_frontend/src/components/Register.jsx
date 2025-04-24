import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerProof } from '../services/api';
import { MAX_FILE_SIZE } from '../config';
import { FaFileAlt, FaSync, FaCopy, FaSignOutAlt, FaCloudUploadAlt, FaBars, FaTimes, FaLock, FaShieldAlt, FaRegFileAlt, FaUser, FaMoneyBillWave, FaRegLightbulb, FaFingerprint, FaArrowRight } from 'react-icons/fa';
import { proofnest_backend } from '../../../declarations/proofnest_backend';
import { createActor } from '../../../declarations/proofnest_backend';
import { motion } from 'framer-motion';

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

  // Generate particles for background
  const particles = [...Array(40)].map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    color: Math.random() > 0.6 ? "rgba(139, 92, 246, 0.4)" : "rgba(99, 102, 241, 0.3)"
  }));

  // Keep all existing useEffects and handlers
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

  useEffect(() => {
    if (identity) {
      fetchFiles();
    }
  }, [identity]);

  // Keep all your existing function implementations
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

    if (hasRoyalty && !contactDetails.trim()) {
      setMessage('Please provide contact details for royalty service.');
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
      setMessage(`Error: ${"Hash already registered OR Canister error" || 'Registration failed'}`);
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

  const userFiles = files

  // Get file icon based on content type
  const getFileIcon = (contentType) => {
    if (contentType?.includes('image')) {
      return (
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 border border-indigo-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else if (contentType?.includes('pdf')) {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 border border-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else if (contentType?.includes('video')) {
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 border border-blue-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 border border-gray-200">
        <FaFileAlt className="h-5 w-5 text-gray-500" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50/50 flex flex-col md:flex-row relative select-none">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      {/* Background patterns */}
      <div className="absolute inset-0 bg-creative-dots"></div>
      <div className="absolute inset-0 bg-creative-lines"></div>
      <div className="absolute inset-0 bg-watercolor opacity-50"></div>

      {/* Constellation particles */}
      <div className="absolute select-none inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full">
          {particles.map((particle, index) => (
            <motion.circle
              key={`particle-${index}`}
              cx={`${particle.x}%`}
              cy={`${particle.y}%`}
              r={particle.size}
              fill={particle.color}
              animate={{
                opacity: [0.4, 1, 0.4],
                r: [particle.size, particle.size + 1.5, particle.size],
                y: [`${particle.y}%`, `${particle.y - 1}%`, `${particle.y}%`]
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Connecting lines between nearby particles */}
          {particles.map((particle, idx) => {
            return particles
              .slice(idx + 1)
              .filter(p => {
                const distance = Math.sqrt(
                  Math.pow(p.x - particle.x, 2) + Math.pow(p.y - particle.y, 2)
                );
                return distance < 20; // Only connect nearby particles
              })
              .map((p, lineIdx) => (
                <motion.line
                  key={`line-${idx}-${lineIdx}`}
                  x1={`${particle.x}%`}
                  y1={`${particle.y}%`}
                  x2={`${p.x}%`}
                  y2={`${p.y}%`}
                  strokeWidth="0.5"
                  stroke="rgba(139, 92, 246, 0.2)"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                    strokeWidth: ["0.5px", "1px", "0.5px"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              ))
          })}
        </svg>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-5 bg-white/80 backdrop-blur-sm text-gray-800 flex justify-between items-center border-b border-gray-200/50 sticky top-0 z-20">
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">ProofNest</h2>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-all"
        >
          {showSidebar ? (
            <FaTimes className="h-5 w-5 text-gray-600" />
          ) : (
            <FaBars className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar - with improved structure */}
      <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-80 bg-white/90 backdrop-blur-md fixed md:sticky top-[64px] md:top-0 left-0 h-[calc(100vh-64px)] md:h-screen border-r border-gray-200/50 z-20 flex flex-col`}>
        {/* Sidebar header */}
        <div className="hidden md:block p-6 border-b border-gray-200/50 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2
            }}
            className="inline-flex items-center justify-center mb-4"
          >
           
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">ProofNest</h2>
          <p className="text-sm text-gray-500 mt-1">Blockchain Content Verification</p>
        </div>

        {/* Scrollable content area with visible scrollbar */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent"
          style={{ maxHeight: 'calc(100vh - 64px - 88px)' }} // 64px header + 88px logout
        >
          {/* User Section */}
          <div className="mb-8 mt-1">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-200/50">
                <FaUser className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Welcome</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-600 break-all font-mono">{principal || 'Not logged in'}</p>
            </div>
          </div>

          {/* Files Section */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center">
                <div className="bg-indigo-100 w-8 h-8 flex items-center justify-center rounded-md mr-2">
                  <FaRegFileAlt className="text-indigo-600" />
                </div>
                <h3 className="text-md font-semibold text-gray-800">Recent Files</h3>
              </div>
              <motion.button
                onClick={handleRefreshClick}
                className={`p-2 text-gray-500 hover:text-indigo-600 transition-all hover:bg-indigo-100 rounded-full`}
                disabled={isRotating}
                title="Refresh files"
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaSync className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>

            {/* Files list - remains unchanged */}
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-2 text-gray-500 text-sm">Loading your files...</p>
              </div>
            ) : !identity ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <div className="bg-gray-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
                  <FaLock className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-700 font-medium">Authentication Required</p>
                <p className="text-gray-500 text-sm mt-1">Log in to view your files</p>
              </div>
            ) : userFiles.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <div className="bg-gray-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
                  <FaRegFileAlt className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-700 font-medium">No files yet</p>
                <p className="text-gray-500 text-sm mt-1">Files you register will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userFiles.map((file) => (
                  <motion.div
                    key={file.hash}
                    className="bg-white rounded-xl p-3 hover:bg-indigo-50 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-200 hover:shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-center">
                      {getFileIcon(file.contentType)}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-gray-800">{file.name}</p>
                      </div>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyHash(file.hash, file.name);
                        }}
                        className="ml-2 text-gray-500 hover:text-indigo-600 p-1.5 hover:bg-indigo-100 rounded-full transition-all"
                        title="Copy hash"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaCopy className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Newsletter section - optional, you can remove if not needed */}
          <div className="mt-8 mb-20">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Subscribe to our newsletter</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-gray-50 text-gray-800 rounded-l-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
              />
              <button className="bg-indigo-600 text-white px-4 rounded-r-lg hover:bg-indigo-700 transition-all">
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Logout button fixed at the bottom */}
        <div className="sticky bottom-0 left-0 w-full bg-white/90 border-t border-gray-200/50 p-5 z-30 flex-shrink-0">
          <motion.button
            onClick={logout}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center font-medium shadow-lg shadow-red-300/20"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 md:p-10 overflow-y-auto relative z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-purple-200/20 mb-4 border border-white/50"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                bounce: 0.5,
                delay: 0.2
              }}
            >
              <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-3 text-white">
                <FaShieldAlt className="h-6 w-6" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-serif font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Register Content</h2>
            <p className="text-gray-600">Secure your digital assets on the blockchain with tamper-proof verification</p>
          </motion.div>

          {/* Register Form Content */}
          <div className="space-y-6 md:space-y-8">
            {/* File upload area with drag and drop */}
            <motion.div
              className={`border-2 border-dashed rounded-xl p-6 md:p-10 text-center transition-all duration-300 bg-white/60 backdrop-blur-sm
                ${isDragging ? 'border-indigo-400 bg-indigo-50 shadow-lg shadow-indigo-200/50' : 'border-gray-300 hover:border-indigo-300'} 
                ${file ? 'bg-indigo-50/40' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div className="space-y-4 cursor-pointer">
                  <motion.div
                    className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-500 border border-indigo-200 shadow-lg"
                    animate={{
                      y: [0, -10, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FaCloudUploadAlt className="h-8 w-8" />
                  </motion.div>
                  <div>
                    <div className="text-gray-800 font-medium text-lg">Drag and drop your file here</div>
                    <div className="text-gray-500 text-sm mt-1">or click to browse your device</div>
                  </div>
                  <div className="text-xs text-gray-500 max-w-sm mx-auto">
                    Supported file types: images, PDFs, videos, documents. Maximum size: 2MB
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-500 border border-indigo-200">
                    <FaRegFileAlt className="h-6 w-6" />
                  </div>
                  <div className="flex-1 truncate text-center md:text-left">
                    <div className="text-gray-800 font-semibold truncate text-lg">{file.name}</div>
                    <div className="text-gray-600 text-sm">{(file.size / 1024).toFixed(2)} KB • Ready to register</div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = null;
                    }}
                    className="rounded-full p-2 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimes className="h-5 w-5" />
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Form Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Details */}
              <motion.div
                className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.1)" }}
              >
                <div className="bg-gradient-to-r from-indigo-50 to-white px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                      <FaRegFileAlt className="text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">File Details</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">File Name</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Enter a descriptive name"
                      className="w-full bg-gray-50 text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the content of this file..."
                      className="w-full bg-gray-50 text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all min-h-[100px] outline-none resize-none"
                    ></textarea>
                    <p className="mt-2 text-xs text-gray-500">This description will help others understand what this file contains</p>
                  </div>
                </div>
              </motion.div>

              {/* Owner Details */}
              <motion.div
                className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.1)" }}
              >
                <div className="bg-gradient-to-r from-purple-50 to-white px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <FaUser className="text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Owner Details</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Owner Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Enter the owner's name"
                      className="w-full bg-gray-50 text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Owner Date of Birth</label>
                    <input
                      type="date"
                      value={ownerDob}
                      onChange={(e) => setOwnerDob(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
                      required
                    />
                    <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-xs flex items-start text-blue-600">
                        <FaRegLightbulb className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                        This will be used as a secure passkey for others to verify and download this file
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Royalty Section */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.1)" }}
            >
              <div className="bg-gradient-to-r from-pink-50 to-white px-5 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-pink-100 p-2 rounded-lg mr-3">
                    <FaMoneyBillWave className="text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Royalty Options</h3>
                </div>
              </div>

              <div className="p-5">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="royaltyOption"
                    checked={hasRoyalty}
                    onChange={(e) => setHasRoyalty(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 focus:ring-offset-white transition duration-150"
                  />
                  <span className="text-gray-800 font-medium">Enable royalty service for this file</span>
                </label>

                <p className="mt-2 text-sm text-gray-600">
                  Enabling royalties allows you to monetize your content when others use it
                </p>

                {hasRoyalty && (
                  <motion.div
                    className="mt-5 space-y-4 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-200 p-5"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">Royalty Fee (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={royaltyFee}
                            onChange={(e) => setRoyaltyFee(e.target.value)}
                            className="w-full bg-white text-gray-800 rounded-lg p-3 pl-8 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all outline-none"
                            required={hasRoyalty}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">Contact Details <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={contactDetails}
                          onChange={(e) => setContactDetails(e.target.value)}
                          placeholder="Email, phone, or website"
                          className="w-full bg-white text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mt-4">
                      <p className="text-sm flex items-start text-purple-700">
                        <FaRegLightbulb className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        Your contact details will be shown to users who would like to license your content. You'll handle payment collection directly with interested parties.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.button
              onClick={handleRegister}
              disabled={isUploading || !file}
              className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-medium text-lg shadow-xl overflow-hidden relative group
                ${(isUploading || !file)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-2xl hover:shadow-indigo-200'}`}
              whileHover={{ scale: isUploading || !file ? 1 : 1.02 }}
              whileTap={{ scale: isUploading || !file ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {isUploading ? (
                <div className="flex items-center justify-center relative z-10">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="relative z-10">Registering on Blockchain...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center relative z-10">
                  <FaShieldAlt className="mr-2" />
                  <span>Register on Blockchain</span>
                  <motion.div
                    className="relative z-10 ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
                  >
                    <FaArrowRight />
                  </motion.div>
                </div>
              )}
            </motion.button>

            {/* Messages and Results */}
            {message && (
              <motion.div
                className="p-5 bg-white rounded-xl border border-gray-200 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-gray-700">{message}</div>
              </motion.div>
            )}

            {hash && (
              <motion.div
                className="bg-gradient-to-r from-green-50 to-indigo-50 rounded-xl border border-green-200 shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring" }}
              >
                <div className="bg-gradient-to-r from-green-100 to-green-50 px-5 py-4 border-b border-green-200">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-green-700">Registration Successful</h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-sm text-gray-700 mb-2">
                    Your file has been successfully registered on the blockchain. The unique content hash is:
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                    <div className="font-mono text-gray-800 break-all pr-2 text-sm mb-3 sm:mb-0">
                      {hash}
                    </div>
                    <motion.button
                      onClick={() => copyHash(hash, fileName)}
                      className="ml-0 sm:ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center text-sm whitespace-nowrap shadow-lg shadow-indigo-200/50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaCopy className="h-4 w-4 mr-2" />
                      Copy Hash
                    </motion.button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Store this hash safely. It serves as proof of your content registration and can be used to verify ownership.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-10">
            © {new Date().getFullYear()} ProofNest - Blockchain Content Verification
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;

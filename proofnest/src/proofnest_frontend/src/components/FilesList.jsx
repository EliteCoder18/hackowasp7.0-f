import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { proofnest_backend } from '../../../declarations/proofnest_backend';
import { createActor } from '../../../declarations/proofnest_backend';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FaFileAlt, FaDownload, FaCopy, FaUser, FaInfoCircle,
  FaUpload, FaSort, FaSearch, FaFilter, FaListUl, FaTh,
  FaFingerprint, FaCheck, FaImage, FaFilePdf, FaFileWord,
  FaFileExcel, FaFileVideo, FaLock, FaArrowRight, FaTimes
} from 'react-icons/fa';

function FilesList() {
  // State management
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [copiedHashes, setCopiedHashes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(10);

  // DOB verification modal state
  const [showDobModal, setShowDobModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dobInput, setDobInput] = useState('');
  const [dobError, setDobError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const { identity } = useAuth();

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch files from the canister
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const actor = identity ? createActor(process.env.CANISTER_ID_PROOFNEST_BACKEND, {
        agentOptions: {
          identity,
        },
      }) : proofnest_backend;

      const result = await actor.get_all_files();

      // Transform the result into an array of files with properties
      const filesArray = result.map(([hash, info]) => ({
        hash,
        name: info.name,
        description: info.description,
        timestamp: Number(info.timestamp),
        contentType: info.content_type,
        ownerName: info.owner_name,
        ownerDob: info.owner_dob,
        royaltyFee: info.royalty_fee,
        hasRoyalty: info.has_royalty,
        contactDetails: info.contact_details,
        user: info.user.toString()
      }));

      setFiles(filesArray);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file download with DOB verification
  const initiateDownload = (file) => {
    setSelectedFile(file);
    setDobInput('');
    setDobError('');
    setShowDobModal(true);
  };

  // Process download after DOB verification
  const handleDownload = async () => {
    if (!selectedFile) return;

    setVerifying(true);
    setDobError('');

    try {
      const actor = identity ? createActor(process.env.CANISTER_ID_PROOFNEST_BACKEND, {
        agentOptions: {
          identity,
        },
      }) : proofnest_backend;

      // Get file info first (for metadata and DOB verification)
      let fileInfo = await actor.get_hash_info(selectedFile.hash);
      if (Array.isArray(fileInfo)) fileInfo = fileInfo[0];

      if (!fileInfo) {
        setDobError("File not found on the blockchain.");
        return;
      }

      // Verify DOB (normalize both sides)
      console.log("Comparing DOBs:", fileInfo.owner_dob, dobInput);
      if (String(fileInfo.owner_dob).trim() !== String(dobInput).trim()) {
        setDobError("Verification failed. Please check the date of birth.");
        return;
      }

      // Download file in chunks
      const CHUNK_SIZE = 500000; // 500KB chunks
      const chunks = [];
      let offset = 0;
      let totalSize = 0;

      console.log("Starting chunked download...");

      // Loop to download all chunks
      while (true) {
        const chunk = await actor.get_file_chunk(selectedFile.hash, offset, CHUNK_SIZE);
        console.log(`Downloaded chunk: offset=${offset}, size=${chunk.length}`);

        if (chunk.length === 0) break; // No more chunks

        chunks.push(new Uint8Array(chunk));
        offset += chunk.length;
        totalSize += chunk.length;

        // If we got less than the chunk size, we're done
        if (chunk.length < CHUNK_SIZE) break;
      }

      console.log(`Download complete: ${chunks.length} chunks, total size ${totalSize} bytes`);

      if (chunks.length === 0 || totalSize === 0) {
        setDobError("File content not available.");
        return;
      }

      // Combine chunks into a single Uint8Array
      const fileContent = new Uint8Array(totalSize);
      let position = 0;

      for (const chunk of chunks) {
        fileContent.set(chunk, position);
        position += chunk.length;
      }

      // Create the download
      const blob = new Blob([fileContent], { type: fileInfo.content_type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      // Create a download link and click it
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.name || 'downloaded-file';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      setShowDobModal(false);
    } catch (err) {
      console.error('Download error:', err);
      setDobError(`Download failed: ${err.message || 'Unknown error'}`);
    } finally {
      setVerifying(false);
    }
  };

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.ownerName && file.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'timestamp') {
      return sortDirection === 'asc'
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp;
    } else if (sortBy === 'ownerName') {
      return sortDirection === 'asc'
        ? (a.ownerName || '').localeCompare(b.ownerName || '')
        : (b.ownerName || '').localeCompare(a.ownerName || '');
    }
    return 0;
  });

  // Pagination
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = sortedFiles.slice(indexOfFirstFile, indexOfLastFile);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(sortedFiles.length / filesPerPage);

  // Handle sort column change
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';

    let timestampMs = timestamp;
    if (timestamp > 1000000000000000) {
      // Convert from nanoseconds to milliseconds if needed
      timestampMs = Number(timestamp) / 1000000;
    }

    const date = new Date(timestampMs);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get file type icon based on file extension
  const getFileTypeIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="h-5 w-5 text-gray-600" />;

    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="h-5 w-5 text-red-600" />;
      case 'docx':
      case 'doc':
        return <FaFileWord className="h-5 w-5 text-blue-600" />;
      case 'xlsx':
      case 'xls':
        return <FaFileExcel className="h-5 w-5 text-emerald-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaImage className="h-5 w-5 text-purple-600" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <FaFileVideo className="h-5 w-5 text-orange-600" />;
      default:
        return <FaFileAlt className="h-5 w-5 text-gray-600" />;
    }
  };

  // Add this function near your other utility functions in the component
  const copyToClipboard = (text) => {
    // Try modern clipboard API first
    navigator.clipboard.writeText(text)
      .then(() => {
        // Success! We'll handle UI feedback separately
      })
      .catch(err => {
        console.error('Clipboard API failed, trying fallback:', err);

        // Fallback method
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;

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

          if (!successful) {
            console.error('execCommand copy failed');
          }
        } catch (err) {
          console.error('Fallback copy method failed:', err);
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50 pt-16 px-4 pb-10 relative overflow-hidden select-none flex flex-col items-center">
      {/* Decorative elements similar to landing page */}
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

      {/* Connecting dots pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}>
      </div>

      {/* Content container with centered alignment */}
      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Header with animation */}
        <motion.div
          className="mb-10 text-center w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              type: "spring",
              bounce: 0.5,
              delay: 0.2
            }}
            className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg shadow-purple-200/20 mb-6 border border-white/50"
          >
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-3 text-white">
              <FaFingerprint className="h-8 w-8" />
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-serif font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Blockchain Verified Files
          </motion.h1>
          <motion.p
            className="text-gray-700 max-w-3xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Browse, download, and manage all registered content on our secure blockchain network
          </motion.p>
        </motion.div>

        {/* Main content area with full width for proper centering of table elements */}
        <motion.div
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Toolbar */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left controls: search and view toggle */}
            <div className="flex items-center flex-1 gap-3">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files, owners, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-800 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  <FaListUl />
                </button>
                <button
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <FaTh />
                </button>
              </div>
            </div>

            {/* Right controls: sort */}
            <div className="flex gap-3">
              <div className="relative group">
                <button
                  className="bg-white text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                  onClick={() => { }}
                >
                  <FaSort className="text-indigo-600" />
                  <span>Sort By: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
                </button>
                <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 w-48">
                  <button onClick={() => handleSort('name')} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 flex justify-between items-center">
                    Name
                    {sortBy === 'name' && <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                  <button onClick={() => handleSort('ownerName')} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 flex justify-between items-center">
                    Owner
                    {sortBy === 'ownerName' && <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                  <button onClick={() => handleSort('timestamp')} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 flex justify-between items-center">
                    Date
                    {sortBy === 'timestamp' && <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                </div>
              </div>
              <Link
                to="/register"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50 transition-all"
              >
                <FaUpload /> Register New File
              </Link>
            </div>
          </div>

          {/* Content area */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-4 text-indigo-500 animate-pulse font-medium">Loading files...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 m-4 rounded-lg flex flex-col items-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Files</h3>
              <p className="mb-4 text-gray-600">{error}</p>
              <motion.button
                onClick={fetchFiles}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="animate-spin inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"></span>
                Try Again
              </motion.button>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center p-16">
              <div className="text-gray-400 text-5xl mb-4">📂</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Files Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to register and protect your content</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
              >
                <FaUpload /> Register Your First File
              </Link>
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="text-center p-16">
              <div className="text-gray-400 text-5xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Matching Files</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
              <motion.button
                onClick={() => setSearchTerm('')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Search
              </motion.button>
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                // List view
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500">
                        <th className="px-4 py-3 text-left">File</th>
                        <th className="px-4 py-3 text-left">Owner</th>
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-left">Registration Date</th>
                        <th className="px-4 py-3 text-left">Hash</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentFiles.map((file) => (
                        <motion.tr
                          key={file.hash}
                          className="hover:bg-indigo-50 transition group"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="px-4 py-4 text-gray-900 font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                {getFileTypeIcon(file.name || 'file.txt')}
                              </div>
                              <span>{file.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            {file.ownerName ? (
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white mr-2 overflow-hidden shadow-sm">
                                  {file.ownerName.charAt(0).toUpperCase()}
                                </div>
                                {file.ownerName}
                              </div>
                            ) : (
                              <span className="text-gray-400">Unknown</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {file.description ? (
                              <div className="max-w-xs truncate">{file.description}</div>
                            ) : (
                              <span className="text-gray-400 italic">No description</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-gray-600">{formatDate(file.timestamp)}</td>
                          <td className="px-4 py-4">
                            <span className="text-gray-600 font-mono text-xs break-all flex items-center">
                              <span className="bg-gray-100 p-1 rounded-md">{file.hash.substring(0, 10)}...</span>
                              <motion.button
                                onClick={() => {
                                  copyToClipboard(file.hash);
                                  setCopiedHashes(prev => ({
                                    ...prev,
                                    [file.hash]: true
                                  }));
                                  setTimeout(() => {
                                    setCopiedHashes(prev => ({
                                      ...prev,
                                      [file.hash]: false
                                    }));
                                  }, 1200);
                                }}
                                className="ml-2 text-indigo-500 hover:text-indigo-700 transition"
                                title="Copy hash"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FaCopy />
                              </motion.button>
                              {copiedHashes[file.hash] && (
                                <span className="ml-2 text-green-600 text-xs bg-green-100 py-0.5 px-2 rounded animate-pulse">Copied!</span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <motion.button
                              onClick={() => initiateDownload(file)}
                              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow hover:shadow-emerald-200/70 transition"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaDownload /> Download
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Grid view
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                  {currentFiles.map((file, index) => (
                    <motion.div
                      key={file.hash}
                      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all transform hover:-translate-y-1 group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-100 flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm mr-3">
                          {getFileTypeIcon(file.name || 'file.txt')}
                        </div>
                        <div className="truncate flex-1">
                          <h3 className="text-gray-900 font-medium truncate">{file.name}</h3>
                          <p className="text-gray-500 text-xs">{formatDate(file.timestamp)}</p>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="mb-3">
                          {file.ownerName ? (
                            <div className="flex items-center text-sm">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white mr-2 text-xs shadow-sm">
                                {file.ownerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-gray-700">{file.ownerName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Owner Unknown</span>
                          )}
                        </div>

                        <div className="text-gray-600 text-sm mb-3 h-10 overflow-hidden">
                          {file.description ? file.description :
                            <span className="text-gray-400 italic">No description</span>}
                        </div>

                        <div className="flex items-center mb-3">
                          <span className="text-gray-600 font-mono text-xs bg-gray-100 p-1 rounded">
                            {file.hash.substring(0, 8)}...
                          </span>
                          <motion.button
                            onClick={() => {
                              copyToClipboard(file.hash);
                              setCopiedHashes(prev => ({
                                ...prev,
                                [file.hash]: true
                              }));
                              setTimeout(() => {
                                setCopiedHashes(prev => ({
                                  ...prev,
                                  [file.hash]: false
                                }));
                              }, 1200);
                            }}
                            className="ml-2 text-indigo-500 hover:text-indigo-700 text-xs"
                            title="Copy hash"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaCopy />
                          </motion.button>
                          {copiedHashes[file.hash] && (
                            <span className="ml-2 text-green-600 text-xs bg-green-100 py-0.5 px-2 rounded animate-pulse">Copied!</span>
                          )}
                        </div>

                        <motion.button
                          onClick={() => initiateDownload(file)}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white p-2 rounded-lg text-sm font-medium shadow hover:shadow-emerald-200/50 transition"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <FaDownload /> Download
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {sortedFiles.length > filesPerPage && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-center">
                  <nav className="flex items-center gap-1">
                    <motion.button
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-md ${currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm'
                        }`}
                      whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                      whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                    >
                      Previous
                    </motion.button>

                    {/* Page numbers */}
                    <div className="flex items-center">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <motion.button
                            key={i}
                            onClick={() => paginate(pageNum)}
                            className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md ${currentPage === pageNum
                                ? 'bg-indigo-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-indigo-100 border border-gray-200'
                              }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded-md ${currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm'
                        }`}
                      whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                      whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                    >
                      Next
                    </motion.button>
                  </nav>
                </div>
              )}
            </>
          )}
        </motion.div>

        <motion.div
          className="flex justify-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={fetchFiles}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-indigo-300/50 transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white opacity-75" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Refresh Files
          </motion.button>
        </motion.div>

        <div className="text-center text-gray-500 text-xs mt-8 w-full">
          &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
        </div>
      </div>

      {/* DOB Verification Modal */}
      {showDobModal && selectedFile && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 w-96 max-w-full shadow-2xl border border-gray-200 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="absolute top-4 right-4">
              <motion.button
                onClick={() => setShowDobModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes />
              </motion.button>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-3 mr-4 shadow-lg text-white flex items-center justify-center">
                <FaLock />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Verification Required</h2>
            </div>

            <p className="text-gray-600 mb-6">
              This file requires identity verification before download. Please enter <span className="font-semibold text-indigo-600">{selectedFile.ownerName || "the owner"}</span>'s date of birth:
            </p>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Date of Birth</label>
              <input
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 rounded-lg p-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all outline-none"
              />
            </div>

            {dobError && (
              <motion.div
                className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md text-red-800 flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {dobError}
              </motion.div>
            )}

            <div className="flex justify-end gap-3 mt-8">
              <motion.button
                onClick={() => setShowDobModal(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition focus:outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleDownload}
                disabled={!dobInput || verifying}
                className={`px-5 py-2 flex items-center gap-2 rounded-lg transition shadow-lg ${!dobInput || verifying
                    ? 'bg-emerald-300 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-emerald-200/70'
                  }`}
                whileHover={!dobInput || verifying ? {} : { scale: 1.05 }}
                whileTap={!dobInput || verifying ? {} : { scale: 0.95 }}
              >
                {verifying ? (
                  <>
                    <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    <span>Download File</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
                    >
                      <FaArrowRight />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default FilesList;

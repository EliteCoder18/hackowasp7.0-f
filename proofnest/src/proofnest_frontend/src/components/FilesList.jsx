import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { proofnest_backend } from '../../../declarations/proofnest_backend';
import { createActor } from '../../../declarations/proofnest_backend';
import { useAuth } from '../context/AuthContext';
import { 
  FaFileAlt, FaDownload, FaCopy, FaUser, FaInfoCircle, 
  FaUpload, FaSort, FaSearch, FaFilter, FaListUl, FaTh
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

      // Get file info with content
      const fileInfo = await actor.get_hash_info(selectedFile.hash);
      
      if (!fileInfo) {
        setDobError("File not found on the blockchain.");
        return;
      }
      
      // Verify DOB
      if (fileInfo.owner_dob !== dobInput) {
        setDobError("Verification failed. Please check the date of birth.");
        return;
      }

      // If content exists, create a download
      if (fileInfo.content && fileInfo.content.length > 0) {
        // Convert the array to a Uint8Array
        const uint8Array = new Uint8Array(fileInfo.content);
        const blob = new Blob([uint8Array], { type: fileInfo.content_type });
        const url = URL.createObjectURL(blob);
        
        // Create a download link
        const a = document.createElement('a');
        a.href = url;
        a.download = fileInfo.name;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
        
        // Close modal
        setShowDobModal(false);
      } else {
        setDobError("File content not available.");
      }
    } catch (err) {
      console.error('Download error:', err);
      setDobError("Failed to download file. Please try again.");
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
    if (!fileName) return <div className="bg-gray-600 text-white p-2 rounded">FILE</div>;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf': 
        return <div className="bg-red-500 text-white p-2 rounded">PDF</div>;
      case 'docx':
      case 'doc': 
        return <div className="bg-blue-600 text-white p-2 rounded">DOC</div>;
      case 'xlsx':
      case 'xls': 
        return <div className="bg-green-600 text-white p-2 rounded">XLS</div>;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': 
        return <div className="bg-purple-500 text-white p-2 rounded">IMG</div>;
      case 'mp4':
      case 'mov':
      case 'avi': 
        return <div className="bg-orange-500 text-white p-2 rounded">VID</div>;
      default: 
        return <div className="bg-gray-600 text-white p-2 rounded">FILE</div>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-block p-3 bg-blue-600 rounded-full mb-4 animate-pulse">
          <FaFileAlt className="text-4xl text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-wide mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Blockchain Verified Files
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          View, download, and manage copyright registered files on our secure blockchain network.
        </p>
      </div>
      
      {/* Main content area */}
      <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 backdrop-blur-sm mb-8">
        {/* Toolbar */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left controls: search and view toggle */}
          <div className="flex items-center flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files, owners, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <FaListUl />
              </button>
              <button
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
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
                className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-700 hover:bg-gray-700"
                onClick={() => {}}
              >
                <FaSort className="text-blue-400" />
                <span>Sort By: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
              </button>
              <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 w-48">
                <button onClick={() => handleSort('name')} className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-200 flex justify-between items-center">
                  Name
                  {sortBy === 'name' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </button>
                <button onClick={() => handleSort('ownerName')} className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-200 flex justify-between items-center">
                  Owner
                  {sortBy === 'ownerName' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </button>
                <button onClick={() => handleSort('timestamp')} className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-200 flex justify-between items-center">
                  Date
                  {sortBy === 'timestamp' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </button>
              </div>
            </div>
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-indigo-800 transition flex items-center gap-2"
            >
              <FaUpload /> Register New File
            </Link>
          </div>
        </div>
        
        {/* Content area */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-400 animate-pulse">Loading files...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-30 text-red-200 p-6 m-4 rounded-lg flex flex-col items-center">
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Error Loading Files</h3>
            <p className="mb-4">{error}</p>
            <button
              onClick={fetchFiles}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <span className="animate-spin inline-block h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"></span>
              Try Again
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center p-16 bg-gray-800 bg-opacity-50">
            <div className="text-gray-500 text-5xl mb-4">📂</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Files Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to register and protect your content</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FaUpload /> Register Your First File
            </Link>
          </div>
        ) : sortedFiles.length === 0 ? (
          <div className="text-center p-16 bg-gray-800 bg-opacity-50">
            <div className="text-gray-500 text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Matching Files</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search criteria</p>
            <button
              onClick={() => setSearchTerm('')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              // List view
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead>
                    <tr className="bg-gray-800 bg-opacity-50 text-gray-300">
                      <th className="px-4 py-3 text-left">File</th>
                      <th className="px-4 py-3 text-left">Owner</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Registration Date</th>
                      <th className="px-4 py-3 text-left">Hash</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {currentFiles.map((file) => (
                      <tr key={file.hash} className="hover:bg-gray-800 transition group">
                        <td className="px-4 py-4 text-white font-medium">
                          <div className="flex items-center gap-3">
                            {getFileTypeIcon(file.name || 'file.txt')}
                            <span>{file.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-300">
                          {file.ownerName ? (
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white mr-2 overflow-hidden">
                                {file.ownerName.charAt(0).toUpperCase()}
                              </div>
                              {file.ownerName}
                            </div>
                          ) : (
                            <span className="text-gray-500">Unknown</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-300">
                          {file.description ? (
                            <div className="max-w-xs truncate">{file.description}</div>
                          ) : (
                            <span className="text-gray-500 italic">No description</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-300">{formatDate(file.timestamp)}</td>
                        <td className="px-4 py-4">
                          <span className="text-gray-400 font-mono text-xs break-all flex items-center">
                            <span className="bg-gray-800 p-1 rounded-md">{file.hash.substring(0, 10)}...</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(file.hash);
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
                              className="ml-2 text-blue-400 hover:text-blue-600 transition"
                              title="Copy hash"
                            >
                              <FaCopy />
                            </button>
                            {copiedHashes[file.hash] && (
                              <span className="ml-2 text-green-400 text-xs bg-green-900 bg-opacity-30 py-0.5 px-2 rounded animate-pulse">Copied!</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => initiateDownload(file)}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow hover:from-green-600 hover:to-emerald-700 transition"
                          >
                            <FaDownload /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Grid view
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                {currentFiles.map((file) => (
                  <div key={file.hash} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 group">
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 flex items-center">
                      {getFileTypeIcon(file.name || 'file.txt')}
                      <div className="ml-3 truncate flex-1">
                        <h3 className="text-white font-medium truncate">{file.name}</h3>
                        <p className="text-gray-400 text-xs">{formatDate(file.timestamp)}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-3">
                        {file.ownerName ? (
                          <div className="flex items-center text-sm">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white mr-2 text-xs">
                              {file.ownerName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-300">{file.ownerName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Owner Unknown</span>
                        )}
                      </div>
                      
                      <div className="text-gray-400 text-sm mb-3 h-10 overflow-hidden">
                        {file.description ? file.description : 
                          <span className="text-gray-500 italic">No description</span>}
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <span className="text-gray-400 font-mono text-xs bg-gray-700 p-1 rounded">
                          {file.hash.substring(0, 8)}...
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(file.hash);
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
                          className="ml-2 text-blue-400 hover:text-blue-600 text-xs"
                          title="Copy hash"
                        >
                          <FaCopy />
                        </button>
                        {copiedHashes[file.hash] && (
                          <span className="ml-2 text-green-400 text-xs bg-green-900 bg-opacity-30 py-0.5 px-2 rounded animate-pulse">Copied!</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => initiateDownload(file)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-lg text-sm font-medium shadow hover:from-green-600 hover:to-emerald-700 transition"
                      >
                        <FaDownload /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {sortedFiles.length > filesPerPage && (
              <div className="p-4 bg-gray-800 bg-opacity-50 border-t border-gray-800 flex justify-center">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Previous
                  </button>
                  
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
                        <button
                          key={i}
                          onClick={() => paginate(pageNum)}
                          className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          onClick={fetchFiles}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
        >
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Refresh Files
        </button>
      </div>
      
      {/* DOB Verification Modal */}
      {showDobModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div 
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 w-96 max-w-full shadow-2xl border border-gray-700"
            style={{boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)'}}
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 rounded-full p-3 mr-3">
                <FaInfoCircle className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">Verification Required</h2>
            </div>
            
            <p className="text-gray-300 mb-4">
              This file requires identity verification before download. Please enter <strong>{selectedFile.ownerName || "the owner"}</strong>'s date of birth:
            </p>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">Date of Birth</label>
              <input
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            {dobError && (
              <div className="mb-4 bg-red-900 bg-opacity-40 border-l-4 border-red-700 p-3 rounded flex items-start text-red-300">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {dobError}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowDobModal(false)}
                className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={!dobInput || verifying}
                className={`px-5 py-2 flex items-center gap-2 rounded-lg transition ${
                  !dobInput || verifying
                    ? 'bg-green-700 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/20'
                }`}
              >
                {verifying ? (
                  <>
                    <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Download File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilesList;

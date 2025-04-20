import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import { 
  FaFileAlt, FaDownload, FaCopy, FaUser, FaInfoCircle, 
  FaUpload, FaSort, FaSearch, FaFilter, FaListUl, FaTh
} from 'react-icons/fa';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const FilesList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [copiedHashes, setCopiedHashes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dropzoneActive, setDropzoneActive] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(10);
  
  // DOB verification modal state
  const [showDobModal, setShowDobModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dobInput, setDobInput] = useState('');
  const [dobError, setDobError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/get-all-files`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError('Failed to load files. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setDropzoneActive(false);
    
    // Create preview objects for files
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'preparing'
    }));
    
    setUploadingFiles(prev => [...prev, ...newFiles]);
    
    // For each file, initiate upload
    newFiles.forEach(fileObj => {
      handleFileUpload(fileObj);
    });
  }, []);

  const handleFileUpload = async (fileObj) => {
    // Update status to uploading
    updateFileProgress(fileObj.id, 0, 'uploading');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fileObj.file);
    
    try {
      // Simulate upload (replace with actual upload logic)
      // In a real application, you would upload to your API
      for (let progress = 0; progress <= 100; progress += 5) {
        await new Promise(r => setTimeout(r, 100)); // Simulate delay
        updateFileProgress(fileObj.id, progress, 'uploading');
      }
      
      // After successful upload, redirect to the copyright registration page
      // In real implementation, you might want to navigate or show success
      updateFileProgress(fileObj.id, 100, 'complete');
      
      // Remove from uploading list after 2 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileObj.id));
      }, 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      updateFileProgress(fileObj.id, 0, 'error');
    }
  };

  const updateFileProgress = (id, progress, status) => {
    setUploadingFiles(prev => 
      prev.map(f => f.id === id ? {...f, progress, status} : f)
    );
    
    setUploadProgress(prev => ({
      ...prev,
      [id]: progress
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    onDragEnter: () => setDropzoneActive(true),
    onDragLeave: () => setDropzoneActive(false)
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Updated to show DOB modal instead of direct download
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
      // Verify DOB passkey first
      const verifyResponse = await axios.post(`${API_BASE_URL}/verify-download-access`, {
        hash: selectedFile.hash,
        dob: dobInput
      });
      
      if (verifyResponse.data.verified) {
        // DOB verified, proceed with download
        const url = `${API_BASE_URL}/download-file/${selectedFile.hash}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name || 'file';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 0);
        
        // Close modal
        setShowDobModal(false);
      } else {
        setDobError('Verification failed. Please check the date of birth.');
      }
    } catch (err) {
      console.error('Download error:', err);
      setDobError(err.response?.data?.error || 'Failed to verify access. Please check the date of birth.');
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

  const getFileTypeIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
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
    <div className={`min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col items-center py-10 px-4 transition-all duration-300 ${dropzoneActive ? 'bg-gray-800' : ''}`}>
      {/* Global dropzone */}
      <div 
        {...getRootProps()} 
        className={`absolute inset-0 transition-all duration-300 z-10 ${isDragActive || dropzoneActive ? 'bg-blue-900 bg-opacity-40 flex items-center justify-center border-4 border-dashed border-blue-400' : 'pointer-events-none opacity-0'}`}
      >
        <input {...getInputProps()} />
        {(isDragActive || dropzoneActive) && (
          <div className="text-center text-white bg-black bg-opacity-70 p-8 rounded-xl shadow-2xl transform scale-110 transition-transform duration-200">
            <FaUpload className="text-5xl mx-auto mb-4 text-blue-400" />
            <h3 className="text-2xl font-bold mb-2">Drop files to upload</h3>
            <p className="text-blue-300">Files will be queued for copyright registration</p>
          </div>
        )}
      </div>
      
      {/* Header with animation */}
      <div className="w-full max-w-6xl">
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
      
        {/* Upload status area */}
        {uploadingFiles.length > 0 && (
          <div className="mb-8 bg-gray-900 bg-opacity-80 rounded-xl p-4 border border-gray-700 shadow-lg">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <FaUpload className="mr-2 text-blue-400" />
              Uploads in Progress
            </h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {uploadingFiles.map(file => (
                <div key={file.id} className="bg-gray-800 rounded-lg p-2 flex items-center">
                  {getFileTypeIcon(file.name)}
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <span className="text-white text-sm">{file.name}</span>
                      <span className="text-xs text-gray-400">
                        {file.status === 'complete' ? 'Complete' : 
                         file.status === 'error' ? 'Failed' :
                         `${Math.round(file.progress)}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${
                          file.status === 'error' ? 'bg-red-500' : 
                          file.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 backdrop-blur-sm">
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
            
            {/* Right controls: upload button */}
            <div className="flex gap-3">
              <div className="relative group">
                <button
                  className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-700 hover:bg-gray-700"
                  onClick={() => {
                    document.getElementById('fileInput').click();
                  }}
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
                to="/copyright"
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-indigo-800 transition flex items-center gap-2"
              >
                <FaUpload /> Register New File
              </Link>
            </div>
          </div>
          <input
            type="file"
            id="fileInput"
            multiple
            className="hidden"
            onChange={(e) => onDrop(Array.from(e.target.files))}
          />
          
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
                to="/copyright"
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
        
        <div className="text-center text-gray-500 text-xs mt-8 mb-4">
          &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
        </div>
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
              <label className="block text-gray-400 mb-2 text-sm font-medium">Date of Birth:</label>
              <input
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            
            {dobError && (
              <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
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
};

export default FilesList;

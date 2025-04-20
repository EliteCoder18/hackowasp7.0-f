import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../config";
import { FaFileAlt, FaDownload, FaCopy, FaUser, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

const FilesList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [iscopied, setIsCopied] = useState(false);

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

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
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
  const totalPages = Math.ceil(files.length / filesPerPage);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-5xl bg-gray-900 rounded-2xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <FaFileAlt className="text-3xl text-blue-400" />
            <h1 className="text-3xl font-bold text-white tracking-wide">All Registered Files</h1>
          </div>
          <Link
            to="/copyright"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition"
          >
            Register New File
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
            <button
              onClick={fetchFiles}
              className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center p-8 bg-gray-800 rounded-lg text-gray-300">
            No files have been registered yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="min-w-full bg-black rounded-lg">
                <thead>
                  <tr className="bg-gray-800 text-gray-300">
                    <th
                      className="px-4 py-3 text-left cursor-pointer select-none"
                      onClick={() => handleSort('name')}
                    >
                      File Name
                      {sortBy === 'name' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer select-none"
                      onClick={() => handleSort('ownerName')}
                    >
                      Owner
                      {sortBy === 'ownerName' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer select-none"
                      onClick={() => handleSort('timestamp')}
                    >
                      Registration Date
                      {sortBy === 'timestamp' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left">Hash</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFiles.map((file) => (
                    <tr key={file.hash} className="border-t border-gray-800 hover:bg-gray-900 transition">
                      <td className="px-4 py-3 text-white font-medium">{file.name}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {file.ownerName ? (
                          <div className="flex items-center">
                            <FaUser className="mr-2 text-blue-400" />
                            {file.ownerName}
                          </div>
                        ) : (
                          <span className="text-gray-500">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {file.description ? (
                          <div className="max-w-xs truncate">{file.description}</div>
                        ) : (
                          <span className="text-gray-500 italic">No description</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{formatDate(file.timestamp)}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 font-mono text-xs break-all flex items-center">
                          {file.hash.substring(0, 10)}...
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(file.hash);
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 1200);
                            }}
                            className="ml-2 text-blue-400 hover:text-blue-600"
                            title="Copy hash"
                          >
                            <FaCopy />
                          </button>
                          {iscopied && (
                            <span className="ml-2 text-green-400 text-xs">Copied!</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
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

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Previous
                </button>
                <span className="mx-2 text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </>
        )}

        <button
          onClick={fetchFiles}
          className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition"
        >
          Refresh List
        </button>
      </div>
      <div className="text-center text-gray-500 text-xs mt-8">
        &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
      </div>

      {/* DOB Verification Modal */}
      {showDobModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full">
            <div className="flex items-center mb-4">
              <FaInfoCircle className="text-blue-400 mr-2 text-xl" />
              <h2 className="text-xl font-bold text-white">Access Protected</h2>
            </div>
            
            <p className="text-gray-300 mb-4">
              This file was created by <strong>{selectedFile.ownerName || "Unknown"}</strong>. 
              Please enter the owner's date of birth to download.
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2 text-sm">Date of Birth:</label>
              <input
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            
            {dobError && (
              <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded mb-4">
                {dobError}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDobModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={!dobInput || verifying}
                className={`px-4 py-2 flex items-center gap-2 rounded
                  ${!dobInput || verifying
                    ? 'bg-green-700 text-gray-300 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
              >
                {verifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Download
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../config"; // This is now correct since config.js is in the src folder

const FilesList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(10); // Show 10 files per page

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/get-all-files`);
      setFiles(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending
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

  const handleDownload = async (hash, name) => {
    try {
      // Create a direct download link
      const url = `${API_BASE_URL}/download-file/${hash}`;
      
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = name || 'file';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
      }, 0);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  // Sort files based on current sort settings
  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'timestamp') {
      return sortDirection === 'asc'
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp;
    }
    return 0;
  });

  // Get current page of files
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = sortedFiles.slice(indexOfFirstFile, indexOfLastFile);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(files.length / filesPerPage);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">All Registered Files</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">All Registered Files</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
        <button 
          onClick={fetchFiles}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Registered Files</h1>
      
      <div className="mb-4">
        <Link to="/copyright" className="bg-blue-500 text-white px-4 py-2 rounded">
          Register New File
        </Link>
      </div>
      
      {files.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded">
          No files have been registered yet.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th 
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    File Name
                    {sortBy === 'name' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('timestamp')}
                  >
                    Registration Date
                    {sortBy === 'timestamp' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-4 py-2 text-left">Hash</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentFiles.map((file) => (
                  <tr key={file.hash} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{file.name}</td>
                    <td className="px-4 py-2">{formatDate(file.timestamp)}</td>
                    <td className="px-4 py-2">
                      <span className="text-gray-600 truncate block" style={{maxWidth: "200px"}}>
                        {file.hash}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDownload(file.hash, file.name)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <nav className="flex items-center">
              <button
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white'
                }`}
              >
                Previous
              </button>
              
              <span className="mx-2">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white'
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
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Refresh List
      </button>
    </div>
  );
};

export default FilesList;
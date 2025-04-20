import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8000';

const VerifyPage = () => {
  const [hash, setHash] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState('hash');
  const [fileContent, setFileContent] = useState(null);

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
      return null;
    }
    
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
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Verify Content Authenticity</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <p className="mb-4 text-gray-600">
            Verify the authenticity of any digital content by providing its hash or uploading the original file.
          </p>
          
          <div className="flex space-x-2 mb-6">
            <button
              className={`px-4 py-2 rounded flex-1 ${verifyMethod === 'hash' ? 
                'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setVerifyMethod('hash')}
            >
              Verify by Hash
            </button>
            <button
              className={`px-4 py-2 rounded flex-1 ${verifyMethod === 'file' ? 
                'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setVerifyMethod('file')}
            >
              Verify by File
            </button>
          </div>
          
          {verifyMethod === 'hash' ? (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Enter Hash Value</label>
              <input
                type="text"
                placeholder="e.g., d6a9a933c8aafc51e55ac0662b6e4d4a..."
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="border p-3 mb-4 w-full rounded"
              />
              <button
                onClick={handleVerifyHash}
                disabled={isVerifying || !hash.trim()}
                className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${
                  (isVerifying || !hash.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Verify Hash'}
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Upload File to Verify</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-4 w-full border p-3 rounded"
              />
              <button
                onClick={handleVerifyFile}
                disabled={isVerifying || !file}
                className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${
                  (isVerifying || !file) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Verify File'}
              </button>
            </div>
          )}
          
          {renderVerificationResult()}
          {result && result.verified && fileContent && renderFilePreview()}
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">How Verification Works</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li>Every registered file on our blockchain gets a unique cryptographic hash</li>
          <li>When you verify content, we check if it matches any registered assets</li>
          <li>If verified, you can see when it was registered and download original files</li>
          <li>Anyone can verify content without needing an account</li>
        </ul>
      </div>
      
      <div className="text-center text-gray-600 text-sm mt-8">
        &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
      </div>
    </div>
  );
};

export default VerifyPage;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaFileAlt, FaCloudUploadAlt, FaUserAlt, FaMoneyBillWave } from 'react-icons/fa';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8000';

const VerifyPage = () => {
  const [hash, setHash] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState('hash');
  const [fileContent, setFileContent] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (result) {
      // Optionally log or handle result/fileContent
    }
  }, [result, fileContent]);

  const handleVerifyHash = async () => {
    if (!hash.trim()) return;
    setIsVerifying(true);
    setResult(null);
    setFileContent(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/verify`, { 
        hash,
        fetchContent: true
      });
      setResult(response.data);
      if (response.data.fileContent) {
        setFileContent(response.data.fileContent);
      }
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        setResult({
          verified: false,
          message: errorData.message || 'Hash not found',
          error: errorData.error,
          hash
        });
      } else {
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
    setIsVerifying(true);
    setResult(null);
    setFileContent(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE_URL}/verify-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      setResult(response.data);
      if (response.data.hash) setHash(response.data.hash);
      if (response.data.fileContent) setFileContent(response.data.fileContent);
    } catch (error) {
      if (error.response) {
        setResult({
          verified: false,
          message: error.response.data.message || 'Error verifying file',
          error: error.response.data.error,
          hash: error.response.data.hash
        });
      } else if (error.request) {
        setResult({
          verified: false,
          message: 'No response from server. The file may be too large or the server may be unavailable.',
          error: error.message
        });
      } else {
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
    let timestampMs;
    if (typeof timestamp === 'string') timestamp = Number(timestamp);
    if (timestamp > 1000000000000000) {
      timestampMs = Number(timestamp) / 1000000;
    } else if (timestamp > 1000000000000) {
      timestampMs = timestamp;
    } else {
      timestampMs = timestamp;
    }
    const date = new Date(timestampMs);
    if (isNaN(date.getTime())) return 'Invalid timestamp';
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFilePreview = () => {
    if (!fileContent) return null;
    const contentType = result?.contentType || result?.content_type || 'application/octet-stream';
    const isImage = contentType.startsWith('image/');
    const isText = contentType.startsWith('text/');
    const isPdf = contentType === 'application/pdf';
    try {
      let fileContentArray;
      if (fileContent instanceof Uint8Array) {
        fileContentArray = fileContent;
      } else if (Array.isArray(fileContent)) {
        fileContentArray = new Uint8Array(fileContent);
      } else {
        return (
          <div className="mt-4 p-2 border rounded">
            <h3 className="font-bold mb-2">File Preview:</h3>
            <div className="bg-red-100 text-red-700 p-2 rounded">
              Unable to preview file: Unsupported content format
            </div>
          </div>
        );
      }
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
    const uint8Array = new Uint8Array(fileContent);
    const blob = new Blob([uint8Array], { type: result.contentType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.name || 'downloaded-file';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const renderVerificationResult = () => {
    if (!result) return null;
    
    console.log("Full verification result:", result); // Add this for debugging
    
    if (result.verified) {
      return (
        <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 rounded">
          <div className="font-bold text-green-700">✓ Content Verified</div>
          <div className="mt-2">
            <div className="text-xl font-semibold">{result.name}</div>
            
            {/* Display verification method for debugging */}
            <div className="text-xs text-gray-500 mt-1">
              Verification method: {result.verificationMethod || 'unknown'}
            </div>
            
            {/* Owner Information */}
            {result.ownerName && (
              <div className="mt-2 flex items-center text-gray-700">
                <FaUserAlt className="mr-2" />
                <span className="font-medium">Owner:</span> 
                <span className="ml-1">{result.ownerName}</span>
              </div>
            )}
            
            <div className="text-sm text-gray-600 mt-1">
              Registered on: {formatTimestamp(result.timestamp)}
            </div>
            
            {/* Royalty Information */}
            {result.hasRoyalty && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                <div className="font-medium text-yellow-800 flex items-center">
                  <FaMoneyBillWave className="mr-2" />
                  Royalty Required: ${parseFloat(result.royaltyFee).toFixed(2)}
                </div>
                
                {/* Contact Details */}
                {result.contactDetails && (
                  <div className="text-sm text-gray-700 mt-2">
                    <strong>Contact the owner:</strong> {result.contactDetails}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  Please contact the owner to arrange payment before using this asset.
                </div>
              </div>
            )}
            
            {/* File Download Option */}
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
    
    return (
      <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 rounded">
        <div className="font-bold text-red-700">✗ Not Verified</div>
        <div className="mt-2">
          <div>{result.message || 'Content not found on the blockchain'}</div>
        </div>
      </div>
    );
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <FaFileAlt className="text-3xl text-blue-400" />
          <h1 className="text-3xl font-bold text-white tracking-wide">Verify Content Authenticity</h1>
        </div>
        <div className="bg-gray-900 rounded-xl shadow p-6">
          <div className="flex space-x-2 mb-6">
            <button
              className={`px-4 py-2 rounded flex-1 ${verifyMethod === 'hash' ? 
                'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              onClick={() => setVerifyMethod('hash')}
            >
              Verify by Hash
            </button>
            <button
              className={`px-4 py-2 rounded flex-1 ${verifyMethod === 'file' ? 
                'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              onClick={() => setVerifyMethod('file')}
            >
              Verify by File
            </button>
          </div>
          {verifyMethod === 'hash' ? (
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Enter Hash Value</label>
              <input
                type="text"
                placeholder="e.g., d6a9a933c8aafc51e55ac0662b6e4d4a..."
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="border p-3 mb-4 w-full rounded bg-gray-800 text-white border-gray-700"
              />
              <button
                onClick={handleVerifyHash}
                disabled={isVerifying || !hash.trim()}
                className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded w-full font-semibold transition hover:from-blue-600 hover:to-indigo-700 ${
                  (isVerifying || !hash.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Verify Hash'}
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Upload File to Verify</label>
              <div
                className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition ${
                  dragActive ? 'border-blue-400 bg-blue-950/40' : 'border-gray-700 bg-gray-800'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                style={{ minHeight: 120 }}
              >
                <FaCloudUploadAlt className="text-4xl text-blue-400 mb-2" />
                <p className="text-gray-300 mb-2">
                  {file ? (
                    <span className="font-semibold text-white">{file.name}</span>
                  ) : (
                    <>
                      Drag & drop your file here, or <span className="underline text-blue-400">choose file</span>
                    </>
                  )}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <button
                onClick={handleVerifyFile}
                disabled={isVerifying || !file}
                className={`mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded w-full font-semibold transition hover:from-blue-600 hover:to-indigo-700 ${
                  (isVerifying || !file) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Verify File'}
              </button>
            </div>
          )}
          {renderVerificationResult()}
          {result && result.verified && fileContent && renderFilePreview()}
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-sm mt-8">
          <h2 className="text-xl font-semibold mb-2 text-white">How Verification Works</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li>Every registered file on our blockchain gets a unique cryptographic hash</li>
            <li>When you verify content, we check if it matches any registered assets</li>
            <li>If verified, you can see when it was registered and download original files</li>
            <li>Anyone can verify content without needing an account</li>
          </ul>
        </div>
        <div className="text-center text-gray-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;

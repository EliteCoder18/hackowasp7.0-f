import React, { useState } from 'react';
import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8000';

const Register = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [hash, setHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleRegister = async () => {
    if (!file) {
      setMessage('Please upload a file.');
      return;
    }

    setIsUploading(true);
    setMessage('Registering file...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setHash(response.data.hash);
      setMessage(`File registered successfully!`);
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 409) {
        // Already registered
        setHash(error.response.data.hash || '');
        setMessage(`This file is already registered.`);
      } else {
        setMessage('Error: ' + (error.response?.data?.error || 'Unknown error'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    setMessage('Hash copied to clipboard');
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Register File</h2>
      <div className="mb-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 w-full p-2 border rounded"
        />
        <button
          onClick={handleRegister}
          disabled={isUploading || !file}
          className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${
            (isUploading || !file) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Registering...' : 'Register'}
        </button>
      </div>
      
      {message && <p className="mt-4 text-center font-medium">{message}</p>}
      
      {hash && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm font-bold mb-1">Generated Hash:</p>
          <div className="flex items-center">
            <p className="font-mono text-xs break-all mr-2">{hash}</p>
            <button
              onClick={copyToClipboard}
              className="bg-gray-200 hover:bg-gray-300 text-sm px-2 py-1 rounded"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Verify = () => {
  const [hash, setHash] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState('hash'); // 'hash' or 'file'

  const handleVerifyHash = async () => {
    if (!hash.trim()) return;
    
    setIsVerifying(true);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/verify`, { hash });
      setResult(response.data);
    } catch (error) {
      console.error('Verification error:', error);
      if (error.response?.status === 404) {
        setResult({
          verified: false,
          message: 'Hash not found',
          hash
        });
      } else {
        setResult({
          verified: false,
          error: error.response?.data?.error || 'Unknown error',
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
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/verify-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResult(response.data);
      // Set the hash value from the response
      if (response.data.hash) {
        setHash(response.data.hash);
      }
    } catch (error) {
      console.error('File verification error:', error);
      setResult({
        verified: false,
        message: error.response?.data?.message || 'File not verified',
        error: error.response?.data?.error || undefined,
        hash: error.response?.data?.hash
      });
      
      // Set the hash if it was returned despite verification failing
      if (error.response?.data?.hash) {
        setHash(error.response?.data?.hash);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(Number(timestamp) / 1000000); // Convert to milliseconds
    return date.toLocaleString();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Verify Content</h2>
      
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${verifyMethod === 'hash' ? 
            'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setVerifyMethod('hash')}
        >
          Verify by Hash
        </button>
        <button
          className={`px-4 py-2 rounded ${verifyMethod === 'file' ? 
            'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setVerifyMethod('file')}
        >
          Verify by File
        </button>
      </div>
      
      {verifyMethod === 'hash' ? (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter hash value"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="border p-2 mb-4 w-full rounded"
          />
          <button
            onClick={handleVerifyHash}
            disabled={isVerifying || !hash.trim()}
            className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${
              (isVerifying || !hash.trim()) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify Hash'}
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 w-full border p-2 rounded"
          />
          <button
            onClick={handleVerifyFile}
            disabled={isVerifying || !file}
            className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${
              (isVerifying || !file) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify File'}
          </button>
        </div>
      )}
      
      {result && (
        <div className={`mt-6 p-4 rounded ${
          result.verified ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
        }`}>
          {result.hash && (
            <p className="font-mono text-xs break-all mb-2">
              <span className="font-bold">Hash:</span> {result.hash}
            </p>
          )}
          {result.filename && (
            <p className="mb-2">
              <span className="font-bold">Filename:</span> {result.filename}
            </p>
          )}
          <div className={result.verified ? "text-green-700" : "text-red-700"}>
            <p className="text-lg font-bold">
              {result.verified ? "✓ VERIFIED" : "✗ NOT VERIFIED"}
            </p>
            {result.message && <p>{result.message}</p>}
            {result.error && <p className="text-red-600">Error: {result.error}</p>}
          </div>
          
          {result.verified && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p><span className="font-bold">Registered by:</span> {result.user}</p>
              <p><span className="font-bold">Registration time:</span> {formatTimestamp(result.timestamp)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">ProofNest</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${
              activeTab === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${
              activeTab === 'verify' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setActiveTab('verify')}
          >
            Verify
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'register' ? <Register /> : <Verify />}
        </div>
      </div>
      <div className="text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
      </div>
    </div>
  );
};

export default App;

import React, { useState, useRef } from 'react';
import { FaFileAlt, FaCloudUploadAlt, FaUserAlt, FaMoneyBillWave } from 'react-icons/fa';
import { verifyProof } from '../services/api';
import { MAX_FILE_SIZE } from '../config';

function Verify() {
  const [verifyMethod, setVerifyMethod] = useState('hash');
  const [hash, setHash] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    let timestampMs = timestamp;
    if (typeof timestamp === 'string') timestampMs = Number(timestamp);
    if (timestampMs > 1000000000000000) {
      timestampMs = Number(timestampMs) / 1000000;
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

  // File hash calculation
  const calculateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setResult({
          verified: false,
          message: 'File size exceeds the 2MB limit. Please choose a smaller file.'
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  // Verification by hash
  const handleVerifyHash = async () => {
    if (!hash.trim()) return;
    setIsVerifying(true);
    setResult(null);
    console.log("Verifying hash:", hash.trim());
    try {
      const res = await verifyProof(hash.trim());
      console.log("VerifyProof result:", res);
      setResult({
        ...res,
        hash,
        verified: res.exists,
        message: res.exists
          ? 'This file is registered on the blockchain.'
          : 'This file is not registered on the blockchain.'
      });
    } catch (error) {
      console.error("Verify hash error:", error);
      setResult({
        verified: false,
        message: error.message || 'Error verifying hash'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Verification by file
  const handleVerifyFile = async () => {
    if (!file) return;
    setIsVerifying(true);
    setResult(null);
    console.log("Verifying file:", file.name);
    try {
      const fileHash = await calculateSHA256(file);
      console.log("Calculated file hash:", fileHash);
      const res = await verifyProof(fileHash);
      console.log("VerifyProof result:", res);
      setResult({
        ...res,
        hash: fileHash,
        verified: res.exists,
        message: res.exists
          ? 'This file is registered on the blockchain.'
          : 'This file is not registered on the blockchain.'
      });
    } catch (error) {
      console.error("Verify file error:", error);
      setResult({
        verified: false,
        message: error.message || 'Error verifying file'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Render verification result
  const renderVerificationResult = () => {
    if (!result) return null;
    if (result.verified) {
      return (
        <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 rounded">
          <div className="font-bold text-green-700">✓ Content Verified</div>
          <div className="mt-2">
            <div className="text-xl font-semibold">{result.fileName || result.name}</div>
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
            {result.hasRoyalty && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                <div className="font-medium text-yellow-800 flex items-center">
                  <FaMoneyBillWave className="mr-2" />
                  Royalty Required: {result.royaltyFee}
                </div>
                {result.contactInfo && (
                  <div className="text-sm text-gray-700 mt-2">
                    <strong>Contact the owner:</strong> {result.contactInfo}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Please contact the owner to arrange payment before using this asset.
                </div>
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
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-sm mt-8">
          <h2 className="text-xl font-semibold mb-2 text-white">How Verification Works</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li>Every registered file on our blockchain gets a unique cryptographic hash</li>
            <li>When you verify content, we check if it matches any registered assets</li>
            <li>If verified, you can see when it was registered and who owns it</li>
            <li>Anyone can verify content without needing an account</li>
          </ul>
        </div>
        <div className="text-center text-gray-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
        </div>
      </div>
    </div>
  );
}

export default Verify;

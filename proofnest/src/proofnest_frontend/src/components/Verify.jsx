import React, { useState, useRef } from 'react';
import { FaFileAlt, FaCloudUploadAlt, FaUserAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
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
        <div className="mt-8 animate-fadeIn">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-green-500/30">
            <div className="bg-green-500/10 px-6 py-4 border-b border-green-500/30 flex items-center">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-green-500">Content Verified Successfully</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <FaFileAlt className="text-green-600 text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white">{result.fileName || result.name || "Verified File"}</h4>
                  <p className="text-gray-400">
                    Registered on <span className="text-green-400 font-medium">{formatTimestamp(result.timestamp)}</span>
                  </p>
                </div>
              </div>
              
              {result.hash && (
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Content Hash</p>
                  <p className="font-mono text-gray-300 text-sm break-all">{result.hash}</p>
                </div>
              )}
              
              {result.ownerName && (
                <div className="flex items-center px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white mr-3">
                    <FaUserAlt />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Owner</p>
                    <p className="text-white font-medium">{result.ownerName}</p>
                  </div>
                </div>
              )}
              
              {result.hasRoyalty && (
                <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-amber-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mr-3">
                        <FaMoneyBillWave size={18} />
                      </div>
                      <div>
                        <h4 className="text-amber-500 font-bold">Royalty Required</h4>
                        <p className="text-amber-400/90 text-xl font-medium">${result.royaltyFee}</p>
                      </div>
                    </div>
                    {result.contactInfo && (
                      <div className="mt-4 bg-gray-800/30 p-3 rounded-lg border border-amber-600/20">
                        <p className="text-xs text-gray-400 mb-1">Contact the owner</p>
                        <p className="text-gray-300">{result.contactInfo}</p>
                      </div>
                    )}
                    <p className="text-amber-300/70 text-sm mt-4 flex items-center">
                      <FaInfoCircle className="mr-2 flex-shrink-0" /> 
                      Please contact the owner to arrange payment before using this asset.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="mt-8 animate-fadeIn">
        <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-2xl overflow-hidden backdrop-blur-sm border border-red-500/30">
          <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/30 flex items-center">
            <div className="bg-red-500 rounded-full p-2 mr-3">
              <FaTimesCircle className="text-white text-xl" />
            </div>
            <h3 className="text-xl font-bold text-red-500">Content Not Verified</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-4">{result.message || 'Content not found on the blockchain'}</p>
            <div className="flex items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <FaInfoCircle className="text-red-400 mr-3 flex-shrink-0" />
              <p className="text-gray-400 text-sm">
                This content either doesn't exist in our registry or there might be an issue with the provided hash or file.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl opacity-30"></div>
      
      <div className="w-full max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg shadow-blue-500/20 mb-6">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-3">
            Content Verification
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Verify the authenticity and ownership of digital content on our secure blockchain network
          </p>
        </div>
        
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800/80 overflow-hidden">
          {/* Tab Selection */}
          <div className="grid grid-cols-2 gap-px bg-gray-800/80 p-1 mb-6 rounded-t-xl">
            <button
              className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
                verifyMethod === 'hash'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
              }`}
              onClick={() => setVerifyMethod('hash')}
            >
              <span className="mr-2">#</span>
              <span>Verify by Hash</span>
            </button>
            <button
              className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
                verifyMethod === 'file'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
              }`}
              onClick={() => setVerifyMethod('file')}
            >
              <FaFileAlt className="mr-2" />
              <span>Verify by File</span>
            </button>
          </div>
          
          <div className="p-8">
            {verifyMethod === 'hash' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Content Hash</label>
                  <input
                    type="text"
                    placeholder="e.g., d6a9a933c8aafc51e55ac0662b6e4d4a..."
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    className="border w-full rounded-lg py-3 px-4 mb-2 bg-gray-800/80 text-white border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500/30 focus:ring-opacity-50 transition-all"
                  />
                  <p className="text-gray-500 text-xs">Enter the SHA-256 hash of the content you want to verify</p>
                </div>
                
                <button
                  onClick={handleVerifyHash}
                  disabled={isVerifying || !hash.trim()}
                  className={`relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg w-full font-semibold transition-all transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] ${
                    (isVerifying || !hash.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white opacity-75" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Hash'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-3">Upload File</label>
                  <div
                    className={`w-full border-2 border-dashed rounded-xl py-10 px-6 cursor-pointer transition-all ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/20' 
                        : 'border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/70'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="rounded-full bg-blue-600/20 p-4">
                        <FaCloudUploadAlt className="text-4xl text-blue-500" />
                      </div>
                      
                      {file ? (
                        <>
                          <p className="text-blue-400 font-medium text-lg">File Selected</p>
                          <p className="text-white font-semibold">{file.name}</p>
                          <p className="text-gray-500 text-sm">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-300 font-medium">
                            Drag & drop your file here
                          </p>
                          <p className="text-gray-500">
                            or <span className="text-blue-400 underline">browse</span> to choose a file
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            Maximum file size: 2MB
                          </p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleVerifyFile}
                  disabled={isVerifying || !file}
                  className={`relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg w-full font-semibold transition-all transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] ${
                    (isVerifying || !file) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3 text-white opacity-75" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Verify File Authenticity'
                  )}
                </button>
              </div>
            )}
            
            {renderVerificationResult()}
            
            <div className="mt-10 bg-gray-800/70 rounded-xl p-5 border border-gray-700/70">
              <div className="flex items-start mb-4">
                <div className="bg-blue-600/30 rounded-lg p-2 mr-4">
                  <FaInfoCircle className="text-blue-400 text-lg" />
                </div>
                <h3 className="text-xl font-semibold text-white">How Verification Works</h3>
              </div>
              
              <ul className="space-y-3 text-gray-300 ml-4">
                <li className="flex items-center">
                  <div className="bg-blue-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs text-blue-400 font-bold">1</div>
                  Every registered file on our blockchain gets a unique cryptographic hash
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs text-blue-400 font-bold">2</div>
                  When you verify content, we check if it matches any registered assets
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs text-blue-400 font-bold">3</div>
                  If verified, you can see when it was registered and who owns it
                </li>
                <li className="flex items-center">
                  <div className="bg-blue-500/20 w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs text-blue-400 font-bold">4</div>
                  Anyone can verify content without needing an account
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 border-t border-gray-800 flex justify-center">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verify;

import React, { useState, useRef } from 'react';
import { FaFileAlt, FaCloudUploadAlt, FaUserAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaShieldAlt, FaFingerprint } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { verifyProof } from '../services/api';
import { MAX_FILE_SIZE } from '../config';
import BackgroundDecoration from './BackgroundDecoration';

function Verify() {
  const [verifyMethod, setVerifyMethod] = useState('hash');
  const [hash, setHash] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Generate particles for background
  const particles = [...Array(40)].map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    color: Math.random() > 0.6 ? "rgba(139, 92, 246, 0.4)" : "rgba(99, 102, 241, 0.3)"
  }));

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
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-green-200">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 border-b border-green-200 flex items-center">
              <div className="bg-white rounded-full p-2 mr-3 shadow-md">
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Content Verified Successfully</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 shadow-md">
                  <FaFileAlt className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{result.fileName || result.name || "Verified File"}</h4>
                  <p className="text-gray-600">
                    Registered on <span className="text-indigo-600 font-medium">{formatTimestamp(result.timestamp)}</span>
                  </p>
                </div>
              </div>

              {result.hash && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Content Hash</p>
                  <p className="font-mono text-gray-700 text-sm break-all">{result.hash}</p>
                </div>
              )}

              {result.ownerName && (
                <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white mr-3 shadow-md">
                    <FaUserAlt />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Owner</p>
                    <p className="text-gray-800 font-medium">{result.ownerName}</p>
                  </div>
                </div>
              )}

              {result.hasRoyalty && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-amber-100 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mr-3 shadow-md">
                        <FaMoneyBillWave size={18} />
                      </div>
                      <div>
                        <h4 className="text-amber-700 font-bold">Royalty Required</h4>
                        <p className="text-amber-600 text-xl font-medium">${result.royaltyFee}</p>
                      </div>
                    </div>
                    {result.contactInfo && (
                      <div className="mt-4 bg-white p-3 rounded-lg border border-amber-200">
                        <p className="text-xs text-gray-500 mb-1">Contact the owner</p>
                        <p className="text-gray-700">{result.contactInfo}</p>
                      </div>
                    )}
                    <p className="text-amber-600 text-sm mt-4 flex items-center">
                      <FaInfoCircle className="mr-2 flex-shrink-0" />
                      Please contact the owner to arrange payment before using this asset.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }
    return (
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-red-200">
          <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 border-b border-red-200 flex items-center">
            <div className="bg-white rounded-full p-2 mr-3 shadow-md">
              <FaTimesCircle className="text-red-500 text-xl" />
            </div>
            <h3 className="text-xl font-bold text-white">Content Not Verified</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">{result.message || 'Content not found on the blockchain'}</p>
            <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <FaInfoCircle className="text-red-500 mr-3 flex-shrink-0" />
              <p className="text-gray-600 text-sm">
                This content either doesn't exist in our registry or there might be an issue with the provided hash or file.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50/50 pt-16 pb-12 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Decorative background elements */}
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

      {/* Background patterns */}
      <div className="absolute inset-0 bg-creative-dots"></div>
      <div className="absolute inset-0 bg-creative-lines"></div>
      <div className="absolute inset-0 bg-watercolor opacity-50"></div>

      {/* Constellation particles */}
      <div className="absolute select-none inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full">
          {particles.map((particle, index) => (
            <motion.circle
              key={`particle-${index}`}
              cx={`${particle.x}%`}
              cy={`${particle.y}%`}
              r={particle.size}
              fill={particle.color}
              animate={{
                opacity: [0.4, 1, 0.4],
                r: [particle.size, particle.size + 1.5, particle.size],
                y: [`${particle.y}%`, `${particle.y - 1}%`, `${particle.y}%`]
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Connecting lines between nearby particles */}
          {particles.map((particle, idx) => {
            return particles
              .slice(idx + 1)
              .filter(p => {
                const distance = Math.sqrt(
                  Math.pow(p.x - particle.x, 2) + Math.pow(p.y - particle.y, 2)
                );
                return distance < 20; // Only connect nearby particles
              })
              .map((p, lineIdx) => (
                <motion.line
                  key={`line-${idx}-${lineIdx}`}
                  x1={`${particle.x}%`}
                  y1={`${particle.y}%`}
                  x2={`${p.x}%`}
                  y2={`${p.y}%`}
                  strokeWidth="0.5"
                  stroke="rgba(139, 92, 246, 0.2)"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                    strokeWidth: ["0.5px", "1px", "0.5px"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              ))
          })}
        </svg>
      </div>

      {/* Existing content with center alignment */}
      <div className="container max-w-5xl mx-auto px-4 relative z-10 flex flex-col items-center justify-center">
        <BackgroundDecoration />
        {/* Connecting dots pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}>
        </div>

        <div className="w-full max-w-3xl relative z-10 flex flex-col items-center">
          <motion.div
            className="text-center mb-10 w-full"
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
              className="inline-flex items-center justify-center bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl shadow-purple-200/20 mb-8 border border-white/50"
            >
              <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-3 text-white">
                <FaFingerprint className="h-9 w-9" />
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-serif font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Content Verification
            </motion.h1>
            <motion.p
              className="text-gray-700 max-w-2xl mx-auto text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Verify the authenticity and ownership of digital content on our secure blockchain network
            </motion.p>
          </motion.div>

          <motion.div
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Tab Selection - centered */}
            <div className="grid grid-cols-2 gap-px bg-gray-100 p-1 mb-6 rounded-t-xl text-center">
              <motion.button
                className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${verifyMethod === 'hash'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                onClick={() => setVerifyMethod('hash')}
                whileHover={verifyMethod !== 'hash' ? { scale: 1.05 } : {}}
                whileTap={verifyMethod !== 'hash' ? { scale: 0.95 } : {}}
              >
                <span className="mr-2">#</span>
                <span>Verify by Hash</span>
              </motion.button>
              <motion.button
                className={`py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${verifyMethod === 'file'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                onClick={() => setVerifyMethod('file')}
                whileHover={verifyMethod !== 'file' ? { scale: 1.05 } : {}}
                whileTap={verifyMethod !== 'file' ? { scale: 0.95 } : {}}
              >
                <FaFileAlt className="mr-2" />
                <span>Verify by File</span>
              </motion.button>
            </div>

            <div className="p-8 flex flex-col items-center">
              {verifyMethod === 'hash' ? (
                <motion.div
                  className="space-y-6 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key="hash-form"
                >
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Content Hash</label>
                    <input
                      type="text"
                      placeholder="e.g., d6a9a933c8aafc51e55ac0662b6e4d4a..."
                      value={hash}
                      onChange={(e) => setHash(e.target.value)}
                      className="border w-full rounded-lg py-3 px-4 mb-2 bg-white text-gray-800 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 focus:ring-opacity-50 transition-all shadow-sm"
                    />
                    <p className="text-gray-500 text-xs">Enter the SHA-256 hash of the content you want to verify</p>
                  </div>

                  <motion.button
                    onClick={handleVerifyHash}
                    disabled={isVerifying || !hash.trim()}
                    className={`relative bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl w-full font-semibold transition-all transform ${(isVerifying || !hash.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    whileHover={!isVerifying && hash.trim() ? { scale: 1.03 } : {}}
                    whileTap={!isVerifying && hash.trim() ? { scale: 0.97 } : {}}
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
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-6 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key="file-form"
                >
                  <div>
                    <label className="block text-gray-700 font-medium mb-3">Upload File</label>
                    <div
                      className={`w-full border-2 border-dashed rounded-xl py-10 px-6 cursor-pointer transition-all ${dragActive
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                        : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <motion.div
                          className="rounded-full bg-indigo-100 p-4"
                          animate={{
                            y: dragActive ? [0, -10, 0] : 0
                          }}
                          transition={{ duration: 1, repeat: dragActive ? Infinity : 0 }}
                        >
                          <FaCloudUploadAlt className="text-4xl text-indigo-500" />
                        </motion.div>

                        {file ? (
                          <>
                            <p className="text-indigo-600 font-medium text-lg">File Selected</p>
                            <p className="text-gray-800 font-semibold">{file.name}</p>
                            <p className="text-gray-500 text-sm">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-700 font-medium">
                              Drag & drop your file here
                            </p>
                            <p className="text-gray-500">
                              or <span className="text-indigo-600 underline">browse</span> to choose a file
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

                  <motion.button
                    onClick={handleVerifyFile}
                    disabled={isVerifying || !file}
                    className={`relative bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl w-full font-semibold transition-all transform ${(isVerifying || !file) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    whileHover={!isVerifying && file ? { scale: 1.03 } : {}}
                    whileTap={!isVerifying && file ? { scale: 0.97 } : {}}
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
                  </motion.button>
                </motion.div>
              )}

              {renderVerificationResult()}

              <motion.div
                className="mt-10 bg-white rounded-xl p-6 shadow-lg border border-indigo-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="flex items-start mb-4">
                  <div className="bg-indigo-100 rounded-lg p-2 mr-4">
                    <FaInfoCircle className="text-indigo-600 text-lg" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-gray-800">How Verification Works</h3>
                </div>

                <ul className="space-y-4 text-gray-700 ml-4 mt-6">
                  <motion.li
                    className="flex items-center"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="bg-indigo-100 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-xs text-indigo-600 font-bold shadow-sm">1</div>
                    Every registered file on our blockchain gets a unique cryptographic hash
                  </motion.li>
                  <motion.li
                    className="flex items-center"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="bg-indigo-100 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-xs text-indigo-600 font-bold shadow-sm">2</div>
                    When you verify content, we check if it matches any registered assets
                  </motion.li>
                  <motion.li
                    className="flex items-center"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="bg-indigo-100 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-xs text-indigo-600 font-bold shadow-sm">3</div>
                    If verified, you can see when it was registered and who owns it
                  </motion.li>
                  <motion.li
                    className="flex items-center"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <div className="bg-indigo-100 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-xs text-indigo-600 font-bold shadow-sm">4</div>
                    Anyone can verify content without needing an account
                  </motion.li>
                </ul>
              </motion.div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-center">
              <p className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} ProofNest - Blockchain Content Verification
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Verify;

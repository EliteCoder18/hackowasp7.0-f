import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { verifyProof } from '../services/api'; // Add this import
import { MAX_FILE_SIZE } from '../config';

function Verify() {
  const { principal } = useAuth();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // File handling functions
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      // Check file size (2MB limit)
      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage('File size exceeds the 2MB limit. Please choose a smaller file.');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
        return;
      }
      setFile(selectedFile);
      setMessage('');
      setVerificationResult(null);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const calculateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  };

  // Replace direct actor call with API service
  const handleVerify = async () => {
    if (!file) {
      setMessage('Please upload a file to verify.');
      return;
    }

    setIsVerifying(true);
    setMessage('Verifying file on the blockchain...');
    setVerificationResult(null);

    try {
      // Calculate file hash
      const fileHash = await calculateSHA256(file);
      
      // Use the API service instead of directly calling the actor
      const result = await verifyProof(fileHash);
      
      setVerificationResult(result);
      
      if (result.exists) {
        setMessage(`This file is registered on the blockchain.`);
      } else {
        setMessage(`This file is not registered on the blockchain.`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage(`Error: ${error.message || 'Unknown error occurred during verification'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* File upload area with drag and drop */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 
          ${isDragging ? 'border-purple-400 bg-purple-50/10' : 'border-gray-600 hover:border-purple-300'} 
          ${file ? 'bg-gray-800/50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {!file ? (
          <div className="space-y-4 cursor-pointer">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-gray-300 font-medium text-lg">Drag and drop your file here</div>
            <div className="text-gray-500 text-sm">or click to browse</div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 truncate text-left">
              <div className="text-white font-medium truncate">{file.name}</div>
              <div className="text-gray-500 text-sm">{(file.size / 1024).toFixed(2)} KB</div>
            </div>
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setVerificationResult(null);
                if (fileInputRef.current) fileInputRef.current.value = null;
              }}
              className="rounded-full p-1 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleVerify}
        disabled={isVerifying || !file}
        className={`w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 rounded-lg font-medium text-lg shadow-lg transform transition-all duration-200
          ${(isVerifying || !file) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:from-purple-700 hover:to-indigo-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'}`}
      >
        {isVerifying ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying on Blockchain...
          </div>
        ) : (
          <>Verify on Blockchain</>
        )}
      </button>

      {/* Messages */}
      {message && !verificationResult && (
        <div className="p-5 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
          <div className="text-gray-300">{message}</div>
        </div>
      )}
      
      {/* Verification Result */}
      {verificationResult && (
        <div className="p-5 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-purple-400 mb-4">Verification Result</h3>
          
          {verificationResult.exists ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">File is registered on the blockchain</span>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                <div>
                  <span className="text-gray-500">File Name:</span>
                  <span className="text-white ml-2">{verificationResult.fileName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Owner:</span>
                  <span className="text-white ml-2">{verificationResult.ownerName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Description:</span>
                  <span className="text-white ml-2">{verificationResult.description}</span>
                </div>
                <div>
                  <span className="text-gray-500">Registration Date:</span>
                  <span className="text-white ml-2">
                    {new Date(verificationResult.timestamp / 1000000).toLocaleString()}
                  </span>
                </div>
                
                {verificationResult.hasRoyalty && (
                  <div>
                    <span className="text-gray-500">Royalty Fee:</span>
                    <span className="text-white ml-2">{verificationResult.royaltyFee}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-500">Contact Information:</span>
                  <span className="text-white ml-2">{verificationResult.contactInfo}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">This file is not registered on the blockchain</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Verify;
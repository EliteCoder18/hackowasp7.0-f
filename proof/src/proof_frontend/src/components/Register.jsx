import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerProof } from '../services/api'; // Add this import
import { MAX_FILE_SIZE } from '../config';

function Register() {
  const { principal, identity } = useAuth();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [hash, setHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerDob, setOwnerDob] = useState('');
  const [hasRoyalty, setHasRoyalty] = useState(false);
  const [royaltyFee, setRoyaltyFee] = useState('0');
  const [contactDetails, setContactDetails] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
        if (fileInputRef.current) fileInputRef.current.value = null; // Reset the file input
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage('');
    }
  };

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

  const handleRegister = async () => {
    // Your existing validation code...
    
    try {
      setIsUploading(true);
      setMessage('Registering on blockchain...');
      
      // Calculate file hash
      const fileHash = await calculateSHA256(file);
      
      // Call registerProof with ALL required parameters
      await registerProof(
        fileHash,       // hash
        fileName,       // fileName
        royaltyFee,     // royaltyFee
        contactDetails, // contactInfo
        ownerName,      // ownerName
        ownerDob        // ownerDob
      );
      
      setHash(fileHash);
      setMessage(`File registered successfully!`);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(`Error: ${error.message || 'Registration failed'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
    setMessage('Hash copied to clipboard');
  };

  return (
    <div className="space-y-8">
      {/* File upload area with drag and drop */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 
          ${isDragging ? 'border-blue-400 bg-blue-50/10' : 'border-gray-600 hover:border-blue-300'} 
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
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-gray-300 font-medium text-lg">Drag and drop your file here</div>
            <div className="text-gray-500 text-sm">or click to browse</div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
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

      {/* Metadata Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Details */}
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-blue-400 mb-4">File Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">File Name</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter a name"
                className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for this file"
                className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 min-h-[100px]"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Owner Details */}
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-blue-400 mb-4">Owner Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter owner's name"
                className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Owner Date of Birth (passkey)</label>
              <input
                type="date"
                value={ownerDob}
                onChange={(e) => setOwnerDob(e.target.value)}
                className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used as a passkey for others to download this file
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Royalty Section */}
      <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md">
        <div className="flex items-center mb-4">
          <div className="form-control">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                id="royaltyOption"
                checked={hasRoyalty}
                onChange={(e) => setHasRoyalty(e.target.checked)}
                className="checkbox border-gray-600 checked:border-blue-500"
              />
              <span className="text-gray-300 font-medium ml-2">Enable royalty service for this file</span>
            </label>
          </div>
        </div>
        
        {hasRoyalty && (
          <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700 mt-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Royalty Fee (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={royaltyFee}
                  onChange={(e) => setRoyaltyFee(e.target.value)}
                  className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  required={hasRoyalty}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Contact Details</label>
                <input
                  type="text"
                  value={contactDetails}
                  onChange={(e) => setContactDetails(e.target.value)}
                  placeholder="Email, phone, or website"
                  className="w-full bg-gray-900 text-gray-300 rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  required={hasRoyalty}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              The contact information will be visible to users who wish to contact you about using this asset
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleRegister}
        disabled={isUploading || !file}
        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-lg font-medium text-lg shadow-lg transform transition-all duration-200
          ${(isUploading || !file) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'}`}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Registering on Blockchain...
          </div>
        ) : (
          <>Register on Blockchain</>
        )}
      </button>

      {/* Messages and Results */}
      {message && (
        <div className="p-5 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
          <div className="text-gray-300">{message}</div>
        </div>
      )}
      
      {hash && (
        <div className="p-5 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-blue-400 mb-4">Registration Successful</h3>
          <div className="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
            <div className="font-mono text-gray-300 break-all pr-2">
              {hash}
            </div>
            <button
              onClick={copyToClipboard}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
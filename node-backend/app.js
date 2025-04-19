// app.js
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { HttpAgent, Actor } = require('@dfinity/agent');
const { IDL } = require('@dfinity/candid');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Set a file size limit to prevent canister overload
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit

// Update multer configuration to enforce size limit
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// Enable CORS
app.use(cors());
app.use(express.json());

// Special handling for OPTIONS requests (preflight)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Add error handling for multer file size errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File too large - maximum size is 2MB'
      });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// Create the agent and interface
const createActor = async () => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943',
    fetch
  });
  
  // Local development needs this
  await agent.fetchRootKey().catch(err => {
    console.warn("Unable to fetch root key. Is the local replica running?");
    console.error(err);
  });
  
  // Based on your Candid interface
  const idlFactory = ({ IDL }) => {
    return IDL.Service({
      'register_hash': IDL.Func([
        IDL.Text, // hash
        IDL.Vec(IDL.Nat8), // file bytes
        IDL.Text // content type
      ], [], []),
      'get_hash_info': IDL.Func(
        [IDL.Text], 
        [IDL.Opt(IDL.Record({
          'user': IDL.Principal,
          'timestamp': IDL.Nat64,
          'content': IDL.Opt(IDL.Vec(IDL.Nat8)),
          'contentType': IDL.Text
        }))], 
        ['query']
      )
    });
  };
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId: 'uxrrr-q7777-77774-qaaaq-cai'
  });
};

// Register endpoint - handles file uploads
app.post('/register', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }
    
    // Get principal from request
    const principal = req.body.principal;
    if (!principal) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Calculate hash from file
    const hash = crypto.createHash('sha256')
      .update(req.file.buffer)
      .digest('hex');
    
    console.log('Registering hash:', hash);
    console.log('Filename:', req.file.originalname);
    console.log('Principal:', principal);
    console.log('File size:', req.file.size, 'bytes');
    
    // Register with canister
    try {
      const actor = await createActor();
      await actor.register_hash(
        hash, 
        [...new Uint8Array(req.file.buffer)], 
        req.file.mimetype
      );
      
      res.json({
        message: 'Hash and file registered successfully on blockchain',
        hash,
        filename: req.file.originalname,
        fileType: req.file.mimetype
      });
    } catch (canisterError) {
      console.error('Canister error:', canisterError);
      
      if (canisterError.message && canisterError.message.includes('File too large')) {
        return res.status(413).json({ error: 'File too large - maximum size is 2MB' });
      } else if (canisterError.message && canisterError.message.includes('Hash already registered')) {
        return res.status(409).json({ 
          error: 'This file has already been registered',
          hash
        });
      } else {
        throw canisterError; // Re-throw to be caught by outer catch
      }
    }
  } catch (error) {
    console.error('Error registering hash:', error);
    res.status(500).json({ error: error.message || 'Unknown error occurred' });
  }
});

// Verify hash endpoint
app.post('/verify', express.json(), async (req, res) => {
  try {
    const { hash, fetchContent } = req.body;
    if (!hash) {
      return res.status(400).json({ error: 'Hash is required' });
    }
    
    console.log('Verifying hash:', hash);
    
    // Verify with canister
    const actor = await createActor();
    const result = await actor.get_hash_info(hash);
    
    console.log('Verification result:', result);
    
    if (result && result.length > 0 && result[0]) {
      // Successfully verified
      const response = {
        verified: true,
        user: result[0].user.toString(),
        timestamp: Number(result[0].timestamp),
        hash
      };
      
      // Add content info if it exists and was requested
      if (fetchContent && result[0].content && result[0].content.length > 0) {
        response.fileContent = new Uint8Array(result[0].content[0]);
        response.contentType = result[0].contentType;
      }
      
      res.json(response);
    } else {
      // Hash not found
      res.status(404).json({ 
        verified: false,
        message: 'Hash not found',
        hash 
      });
    }
  } catch (error) {
    console.error('Error verifying hash:', error);
    res.status(500).json({ 
      verified: false,
      error: error.message,
      hash: req.body.hash 
    });
  }
});

// Verify file directly endpoint
app.post('/verify-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }
    
    // Calculate hash
    const hash = crypto.createHash('sha256')
      .update(req.file.buffer)
      .digest('hex');
    
    console.log('File hash:', hash);
    console.log('Filename:', req.file.originalname);
    
    // Verify with canister
    const actor = await createActor();
    const result = await actor.get_hash_info(hash);
    
    console.log('File verification result:', result);
    
    if (result && result.length > 0 && result[0]) {
      // Successfully verified
      res.json({
        verified: true,
        user: result[0].user.toString(),
        timestamp: Number(result[0].timestamp),
        message: 'File is verified',
        hash,
        filename: req.file.originalname
      });
    } else {
      // Hash not found
      res.status(404).json({
        verified: false,
        message: 'File not verified',
        hash,
        filename: req.file.originalname
      });
    }
  } catch (error) {
    console.error('Error verifying file:', error);
    res.status(500).json({
      verified: false,
      error: error.message,
      hash: 'unknown',
      filename: req.file?.originalname || 'unknown'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


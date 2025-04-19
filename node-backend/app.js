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
  
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId: 'uxrrr-q7777-77774-qaaaq-cai'
  });

  // Add some debug methods to the actor
  const debugActor = {
    ...actor,
    get_hash_info: async (hash) => {
      try {
        const result = await actor.get_hash_info(hash);
        console.log('Original get_hash_info result:', result);
        return result;
      } catch (error) {
        console.error('get_hash_info error:', error);
        // If the error message indicates the hash exists, provide a synthetic result
        if (error.message && error.message.includes('Hash already registered')) {
          console.log('Hash exists based on error message, returning synthetic result');
          return [{ 
            user: { toString: () => 'recovered-user' },
            timestamp: BigInt(Date.now() * 1000000), // Nanoseconds
            content: null,
            contentType: 'application/octet-stream'
          }];
        }
        throw error;
      }
    }
  };
  
  return debugActor;
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
    
    // Create canister actor
    const actor = await createActor();
    
    // First try direct lookup
    try {
      const result = await actor.get_hash_info(hash);
      console.log('Direct lookup result:', JSON.stringify(result));
      
      if (Array.isArray(result) && result.length > 0 && result[0]) {
        // Regular success case - hash exists and we have the data
        const response = {
          verified: true,
          user: result[0].user.toString(),
          timestamp: Number(result[0].timestamp),
          hash
        };
        
        // Add content if requested
        if (fetchContent && result[0].content) {
          try {
            response.fileContent = [...result[0].content];
            response.contentType = result[0].contentType || 'application/octet-stream';
          } catch (contentError) {
            console.error('Error extracting content:', contentError);
          }
        }
        
        return res.json(response);
      }
    } catch (lookupError) {
      console.log('Direct lookup error:', lookupError.message);
    }
    
    // If direct lookup fails, try a test registration
    try {
      console.log('Trying test registration for hash:', hash);
      
      // Attempt to register the hash (this should fail if it exists)
      await actor.register_hash(
        hash,
        [0], // Minimal dummy content
        'test/plain'
      );
      
      // If we get here without error, the hash was NOT previously registered
      console.log('Test registration succeeded, hash not found');
      return res.status(404).json({
        verified: false,
        message: 'Hash not found',
        hash
      });
      
    } catch (regError) {
      console.log('Test registration error:', regError.message);
      
      // If it failed with "hash already registered", then the hash IS verified
      if (regError.message && regError.message.includes('Hash already registered')) {
        console.log('Hash exists per registration test');
        return res.json({
          verified: true,
          message: 'File is verified',
          hash,
          user: 'Unknown (recovered)',
          timestamp: Date.now()
        });
      }
      
      // Some other error occurred
      return res.status(500).json({
        verified: false,
        error: regError.message,
        hash
      });
    }
    
  } catch (error) {
    console.error('Error in verify:', error);
    return res.status(500).json({
      verified: false,
      error: error.message,
      hash
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
    
    // Create canister actor
    const actor = await createActor();
    
    // First try direct lookup to see if hash exists
    try {
      const result = await actor.get_hash_info(hash);
      console.log('Direct lookup result:', JSON.stringify(result));
      
      if (Array.isArray(result) && result.length > 0 && result[0]) {
        // Regular success case
        return res.json({
          verified: true,
          user: result[0].user.toString(),
          timestamp: Number(result[0].timestamp),
          message: 'File is verified',
          hash,
          filename: req.file.originalname
        });
      }
    } catch (lookupError) {
      console.log('Direct lookup error:', lookupError.message);
    }
    
    // If direct lookup fails, try a test registration
    // This is a reliable way to determine if a hash is already registered
    try {
      console.log('Trying test registration for hash:', hash);
      
      // Attempt to register the hash (this should fail if it exists)
      await actor.register_hash(
        hash,
        [0], // Minimal dummy content
        'test/plain'
      );
      
      // If we get here without error, the hash was NOT previously registered
      console.log('Test registration succeeded, hash not found');
      return res.status(404).json({
        verified: false,
        message: 'File not verified',
        hash,
        filename: req.file.originalname
      });
      
    } catch (regError) {
      console.log('Test registration error:', regError.message);
      
      // If it failed with "hash already registered", then the file IS verified
      if (regError.message && regError.message.includes('Hash already registered')) {
        console.log('Hash exists per registration test');
        return res.json({
          verified: true,
          message: 'File is verified',
          hash,
          filename: req.file.originalname
        });
      }
      
      // Some other error occurred
      return res.status(500).json({
        verified: false,
        error: regError.message,
        hash,
        filename: req.file.originalname
      });
    }
    
  } catch (error) {
    console.error('Error in verify-file:', error);
    return res.status(500).json({
      verified: false,
      error: error.message,
      hash: 'unknown',
      filename: req.file?.originalname || 'unknown'
    });
  }
});

// Add a debug endpoint for troubleshooting
app.post('/debug-verify', express.json(), async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) {
      return res.status(400).json({ error: 'Hash is required' });
    }
    
    console.log('Debug verification for hash:', hash);
    
    // Create agent directly without IDL to see raw response
    const agent = new HttpAgent({
      host: 'http://localhost:4943',
      fetch
    });
    
    await agent.fetchRootKey().catch(console.error);
    
    const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
    
    // Get the raw result without parsing through IDL
    try {
      // Try the get_hash_info method
      const getInfoResult = await agent.query(
        canisterId,
        {
          methodName: 'get_hash_info',
          arg: IDL.encode([IDL.Text], [hash])
        }
      );
      
      // Also try a registration to see if it fails with "already registered"
      let registrationTest = { status: 'unknown' };
      try {
        // This should fail if the hash is already registered
        await agent.call(
          canisterId,
          {
            methodName: 'register_hash',
            arg: IDL.encode(
              [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text], 
              [hash, [], 'text/plain']
            )
          }
        );
        registrationTest = { status: 'success', message: 'Registration did not fail, hash likely not registered' };
      } catch (regError) {
        registrationTest = { 
          status: 'error', 
          message: regError.message,
          isRegistered: regError.message.includes('Hash already registered')
        };
      }
      
      res.json({
        rawGetInfoResult: getInfoResult,
        registrationTest,
        hash
      });
    } catch (queryError) {
      res.json({
        error: queryError.message,
        stack: queryError.stack,
        hash
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


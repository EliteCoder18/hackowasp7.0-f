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

// Set more permissive CORS headers for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
  
  // Update the IDL factory to include the name field
  const idlFactory = ({ IDL }) => {
    return IDL.Service({
      'register_hash': IDL.Func([
        IDL.Text, // hash
        IDL.Vec(IDL.Nat8), // file bytes
        IDL.Text, // content type
        IDL.Text  // name - add this parameter
      ], [], []),
      'get_hash_info': IDL.Func(
        [IDL.Text], 
        [IDL.Opt(IDL.Record({
          'user': IDL.Principal,
          'timestamp': IDL.Nat64,
          'content': IDL.Opt(IDL.Vec(IDL.Nat8)),
          'content_type': IDL.Text, // Changed from contentType to content_type to match Rust
          'name': IDL.Text
        }))], 
        ['query']
      ),
      'get_hash_metadata': IDL.Func(
        [IDL.Text], 
        [IDL.Opt(IDL.Record({
          'user': IDL.Principal,
          'timestamp': IDL.Nat64,
          'content': IDL.Opt(IDL.Vec(IDL.Nat8)),
          'content_type': IDL.Text,
          'name': IDL.Text
        }))], 
        ['query']
      )
      // Add other methods as needed
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
        
        // Extract and preserve name from the result
        if (result) {
          const hashInfo = Array.isArray(result) && result.length > 0 ? result[0] : result;
          if (hashInfo && hashInfo.name) {
            // Store the name in a global variable
            global.__lastExtractedName = hashInfo.name;
            console.log('Preserved name:', global.__lastExtractedName);
          }
        }
        
        return result;
      } catch (error) {
        console.error('get_hash_info error:', error);
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
    
    // Get principal and name from request
    const principal = req.body.principal;
    const name = req.body.name || req.file.originalname; // Use the provided name or filename as fallback
    
    if (!principal) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Calculate hash from file
    const hash = crypto.createHash('sha256')
      .update(req.file.buffer)
      .digest('hex');
    
    console.log('Registering hash:', hash);
    console.log('Filename:', req.file.originalname);
    console.log('Name:', name);
    console.log('Principal:', principal);
    console.log('File size:', req.file.size, 'bytes');
    
    // Register with canister
    try {
      const actor = await createActor();
      await actor.register_hash(
        hash, 
        [...new Uint8Array(req.file.buffer)], 
        req.file.mimetype,
        name // Add the name parameter
      );
      
      res.json({
        message: 'Hash and file registered successfully on blockchain',
        hash,
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        name
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

    // Validate hash format (should be 64 hex characters for SHA-256)
    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      return res.status(400).json({ 
        error: 'Invalid hash format - must be a valid SHA-256 hash (64 hex characters)',
        hash 
      });
    }
    
    console.log('Verifying hash:', hash);
    
    // Create canister actor
    const actor = await createActor();
    
    // First try direct lookup
    try {
      const result = await actor.get_hash_info(hash);
      
      // Safe console logging to avoid BigInt serialization errors
      console.log('Direct lookup result type:', typeof result);
      try {
        console.log('Direct lookup result:', JSON.stringify(result, (_, value) => 
          typeof value === 'bigint' ? value.toString() : value
        ));
      } catch (logError) {
        console.log('Error logging result:', logError.message);
      }
      
      // Check if we got a valid result (not null or undefined)
      if (result) {
        // Check if result is an array and handle accordingly
        const hashInfo = Array.isArray(result) && result.length > 0 ? result[0] : result;
        
        // Convert BigInt to Number for the timestamp (dividing by 1,000,000 to convert from nanoseconds to milliseconds)
        const timestamp = typeof hashInfo.timestamp === 'bigint' 
          ? Number(hashInfo.timestamp / BigInt(1000000)) 
          : typeof hashInfo.timestamp === 'string'
            ? Number(hashInfo.timestamp) / 1000000
            : Date.now();
        
        const response = {
          verified: true,
          user: hashInfo.user ? 
                (hashInfo.user.__principal__ ? hashInfo.user.__principal__ : hashInfo.user.toString()) 
                : 'Unknown',
          timestamp: timestamp,
          hash,
          name: hashInfo.name || 'Unknown'
        };
        
        // Add content if requested
        if (fetchContent && hashInfo.content) {
          try {
            response.fileContent = [...hashInfo.content];
            response.contentType = hashInfo.content_type || 'application/octet-stream';
          } catch (contentError) {
            console.error('Error extracting content:', contentError);
          }
        }
        
        return res.json(response);
      }
    } catch (lookupError) {
      console.log('Direct lookup error:', lookupError.message);
      
      // If it's a BigInt serialization error, retry with different approach
      if (lookupError.message && lookupError.message.includes('serialize a BigInt')) {
        console.log('Attempting to use metadata endpoint instead');
        try {
          // Try the metadata endpoint which might not have the content
          const metadataResult = await actor.get_hash_metadata(hash);
          if (metadataResult) {
            // Check if result is an array and handle accordingly
            const metadataInfo = Array.isArray(metadataResult) && metadataResult.length > 0 
              ? metadataResult[0] 
              : metadataResult;
            
            const timestamp = typeof metadataInfo.timestamp === 'bigint' 
              ? Number(metadataInfo.timestamp / BigInt(1000000)) 
              : typeof metadataInfo.timestamp === 'string'
                ? Number(metadataInfo.timestamp) / 1000000
                : Date.now();
            
            return res.json({
              verified: true,
              user: metadataInfo.user ? 
                    (metadataInfo.user.__principal__ ? metadataInfo.user.__principal__ : metadataInfo.user.toString()) 
                    : 'Unknown',
              timestamp: timestamp,
              hash,
              name: metadataInfo.name || 'Unknown',
              message: 'File is verified (metadata lookup)'
            });
          }
        } catch (metadataError) {
          console.log('Metadata lookup error:', metadataError.message);
        }
      }
    }
    
    // If direct lookup fails, try a test registration
    try {
      console.log('Trying test registration for hash:', hash);
      
      // Attempt to register the hash (this should fail if it exists)
      await actor.register_hash(
        hash,
        [0], // Minimal dummy content
        'test/plain',
        'Test File'
      );
      
      // If we get here without error, the hash was NOT previously registered
      console.log('Test registration succeeded, hash not found');
      return res.status(404).json({
        verified: false,
        message: 'Hash not found',
        hash
      });
      
    } catch (regError) {
      console.log('Test registration error type:', typeof regError);
      console.log('Test registration error full message:', regError.message);
      console.log('Test registration error:', regError.message);
      
      // Only verify if the registered hash matches the requested hash exactly
      if (registeredHash && registeredHash === hash) {
        console.log('Hash exists per registration test, verified hash:', registeredHash);
        
        // Try to extract name from the original get_hash_info request if possible
        let name = 'Unknown';
        try {
          // Check if we have access to the original result
          const origResult = lookupError && lookupError.data;
          if (origResult) {
            const origInfo = Array.isArray(origResult) && origResult.length > 0 ? origResult[0] : origResult;
            if (origInfo && origInfo.name) {
              name = origInfo.name;
              console.log('Successfully extracted name from original lookup:', name);
            }
          }
        } catch (nameError) {
          console.log('Error extracting name:', nameError.message);
        }
        
        return res.json({
          verified: true,
          message: 'File content has been verified on the blockchain!',
          hash,
          filename: req.file.originalname,
          name: name, // Use extracted name if possible
          user: 'Unknown (recovered)',
          timestamp: Date.now(),
          verificationMethod: 'file'
        });
      }
      
      // Any other errors should result in not verified
      console.log('Hash verification failed: registration test failed for reasons other than hash existence');
      return res.status(404).json({
        verified: false,
        message: 'Hash not found or verification error',
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
    
    // Validate hash format (should be 64 hex characters for SHA-256)
    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      return res.status(400).json({ 
        error: 'Invalid hash format - must be a valid SHA-256 hash (64 hex characters)',
        hash 
      });
    }

    console.log('File hash:', hash);
    console.log('Filename:', req.file.originalname);
    
    // Create canister actor
    const actor = await createActor();
    
    // First try direct lookup to see if hash exists
    try {
      const result = await actor.get_hash_info(hash);
      console.log('Direct lookup result:', JSON.stringify(result));
      
      // Check if we got a valid result
      if (result) {
        const hashInfo = Array.isArray(result) && result.length > 0 ? result[0] : result;
        
        const timestamp = typeof hashInfo.timestamp === 'bigint' 
          ? Number(hashInfo.timestamp / BigInt(1000000)) 
          : typeof hashInfo.timestamp === 'string'
            ? Number(hashInfo.timestamp) / 1000000
            : Date.now();
        
        // Extract the name from the captured result
        const rawName = hashInfo && hashInfo.name ? hashInfo.name : 'Unknown';
        // Clean the name to just the filename part
        const cleanName = rawName.includes('/') || rawName.includes('\\')
          ? rawName.split(/[\/\\]/).pop()
          : rawName;
        console.log('Extracted and cleaned name from captured result:', cleanName);

        // Return all the file data we can
        return res.json({
          verified: true,
          user: hashInfo.user ? 
                (hashInfo.user.__principal__ ? hashInfo.user.__principal__ : hashInfo.user.toString()) 
                : 'Unknown',
          timestamp: timestamp,
          message: 'File is verified',
          hash,
          filename: req.file.originalname,
          name: cleanName, // Use clean filename
          content_type: hashInfo.content_type,
          // Return content if available
          fileContent: hashInfo.content ? [...hashInfo.content] : undefined
        });
      }
    } catch (lookupError) {
      console.log('Direct lookup error:', lookupError.message);
      
      // If it's a BigInt serialization error, extract data and return a valid response anyway
      if (lookupError.message && lookupError.message.includes('serialize a BigInt')) {
        try {
          console.log('Attempting to extract name from BigInt error data');
          
          // Create a variable to store the original result BEFORE the error occurs
          let capturedResult;
          try {
            const result = await actor.get_hash_info(hash);
            capturedResult = result; // Store this result before we try to serialize it
            console.log('Original get_hash_info result:', result);
          } catch (innerLookupError) {
            // When the error happens, we already have the result
            if (innerLookupError.message && innerLookupError.message.includes('serialize a BigInt')) {
              const hashInfo = Array.isArray(capturedResult) && capturedResult.length > 0 
                ? capturedResult[0] 
                : capturedResult;
              
              // Extract the name from the captured result
              const name = hashInfo && hashInfo.name ? hashInfo.name : 'Unknown';
              console.log('Extracted name from captured result:', name);
              
              return res.json({
                verified: true,
                user: hashInfo && hashInfo.user ? 
                      (hashInfo.user.__principal__ ? hashInfo.user.__principal__ : hashInfo.user.toString()) 
                      : 'Unknown (recovered)',
                timestamp: Date.now(),
                message: 'File is verified on the blockchain',
                hash,
                filename: req.file.originalname,
                name: name, // Use the extracted name
                verificationMethod: 'file'
              });
            } else {
              throw innerLookupError; // Re-throw if it's a different error
            }
          }
        } catch (recoveryError) {
          console.log('Recovery error:', recoveryError.message);
        }
      }
    }
    
    // If direct lookup fails, try a test registration
    // This is a reliable way to determine if a hash is already registered
    try {
      console.log('Trying test registration for hash:', hash);
      
      // Attempt to register the hash (this should fail if it exists)
      await actor.register_hash(
        hash,
        [0], // Minimal dummy content
        'test/plain',
        'Test File' // Add this fourth parameter
      );
      
      // If we get here without error, the hash was NOT previously registered
      console.log('Test registration succeeded, hash not found');
      return res.status(404).json({
        verified: false,
        message: 'This file has not been registered on the blockchain.',
        hash,
        filename: req.file.originalname
      });
      
    } catch (regError) {
      console.log('Test registration error:', regError.message);
      
      // If it failed with "hash already registered", then the file IS verified
      if (regError.message && regError.message.includes('Hash already registered: hash:')) {
        // Extract the registered hash from the error message for validation
        const errorMatch = regError.message.match(/Hash already registered: hash: ([a-f0-9]+)/i);
        const registeredHash = errorMatch ? errorMatch[1] : null;
        
        // Only verify if the registered hash matches the requested hash
        if (registeredHash && registeredHash === hash) {
          console.log('Hash exists per registration test, verified hash:', registeredHash);
          
          // Use the preserved name from global variable if available
          const preservedName = global.__lastExtractedName || 'Unknown (file name not recovered)';
          // Extract just the filename without path
          const cleanName = preservedName.includes('/') || preservedName.includes('\\')
            ? preservedName.split(/[\/\\]/).pop()
            : preservedName;
          console.log('Using preserved name for verification:', cleanName);
          
          return res.json({
            verified: true,
            message: 'File content has been verified on the blockchain!',
            hash,
            filename: req.file.originalname,
            name: cleanName, // Use clean filename
            user: 'Unknown (recovered)',
            timestamp: Date.now(),
            verificationMethod: 'file'
          });
        }
      }
    }
    
    // If we reach here without returning, the file wasn't verified
    return res.status(404).json({
      verified: false,
      message: 'This file was not found on the blockchain.',
      hash,
      filename: req.file.originalname
    });
    
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
        const registrationTestResult = await agent.call(
          canisterId,
          {
            methodName: 'register_hash',
            arg: IDL.encode(
              [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text, IDL.Text], 
              [hash, [], 'text/plain', 'Debug Test'] // Four parameters
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


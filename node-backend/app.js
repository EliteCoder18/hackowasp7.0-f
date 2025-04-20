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
  
  // Update the IDL factory to include the new fields
  const idlFactory = ({ IDL }) => {
    return IDL.Service({
      'register_hash': IDL.Func([
        IDL.Text, // hash
        IDL.Vec(IDL.Nat8), // file bytes
        IDL.Text, // content type
        IDL.Text, // name
        IDL.Text, // description
        IDL.Text, // owner_name - use snake_case to match Rust
        IDL.Text, // owner_dob
        IDL.Text, // royalty_fee
        IDL.Bool, // has_royalty
        IDL.Text  // contact_details
      ], [], []),
      'get_hash_info': IDL.Func(
        [IDL.Text], 
        [IDL.Opt(IDL.Record({
          'user': IDL.Principal,
          'timestamp': IDL.Nat64,
          'content': IDL.Opt(IDL.Vec(IDL.Nat8)),
          'content_type': IDL.Text,
          'name': IDL.Text,
          'description': IDL.Text,
          'owner_name': IDL.Text, // Changed from ownerName to owner_name
          'owner_dob': IDL.Text,
          'royalty_fee': IDL.Text, // Changed from royaltyFee to royalty_fee
          'has_royalty': IDL.Bool, // Changed from hasRoyalty to has_royalty
          'contact_details': IDL.Text // Changed from contactDetails to contact_details
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
          'name': IDL.Text,
          'description': IDL.Text,
          'owner_name': IDL.Text, // Changed from ownerName to owner_name
          'owner_dob': IDL.Text,
          'royalty_fee': IDL.Text, // Changed from royaltyFee to royalty_fee
          'has_royalty': IDL.Bool, // Changed from hasRoyalty to has_royalty
          'contact_details': IDL.Text // Changed from contactDetails to contact_details
        }))], 
        ['query']
      ),
      'get_all_files': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Record({
        'user': IDL.Principal,
        'timestamp': IDL.Nat64,
        'content_type': IDL.Text,
        'name': IDL.Text,
        'description': IDL.Text,
        'owner_name': IDL.Text, // Changed from ownerName to owner_name
        'royalty_fee': IDL.Text, // Changed from royaltyFee to royalty_fee
        'has_royalty': IDL.Bool, // Changed from hasRoyalty to has_royalty
        'contact_details': IDL.Text // Changed from contactDetails to contact_details
        // Note: We don't include ownerDob for security
      })))], ['query'])
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
        
        // Extract and preserve info from the result
        if (result) {
          const hashInfo = Array.isArray(result) && result.length > 0 ? result[0] : result;
          if (hashInfo) {
            // Store all relevant info in the global variable
            global.__lastExtractedName = hashInfo.name;
            global.__lastHashInfo = {
              ...hashInfo,
              // Ensure fields exist in both formats to handle inconsistencies
              owner_name: hashInfo.owner_name || hashInfo.ownerName || '',
              ownerName: hashInfo.owner_name || hashInfo.ownerName || '',
              royalty_fee: hashInfo.royalty_fee || hashInfo.royaltyFee || '0',
              royaltyFee: hashInfo.royalty_fee || hashInfo.royaltyFee || '0',
              has_royalty: hashInfo.has_royalty || hashInfo.hasRoyalty || false,
              hasRoyalty: hashInfo.has_royalty || hashInfo.hasRoyalty || false,
              contact_details: hashInfo.contact_details || hashInfo.contactDetails || '',
              contactDetails: hashInfo.contact_details || hashInfo.contactDetails || ''
            };
            console.log('Preserved complete hash info for later use');
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
    
    // Get all parameters from request
    const principal = req.body.principal;
    const name = req.body.name || req.file.originalname;
    const description = req.body.description || '';
    const ownerName = req.body.ownerName || '';
    const ownerDob = req.body.ownerDob || '';
    const royaltyFee = req.body.royaltyFee || '0';
    const hasRoyalty = req.body.hasRoyalty === 'true';
    const contactDetails = req.body.contactDetails || '';
    
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
    console.log('Description:', description);
    console.log('Owner:', ownerName);
    console.log('Has Royalty:', hasRoyalty);
    console.log('Royalty Fee:', royaltyFee);
    console.log('Principal:', principal);
    console.log('File size:', req.file.size, 'bytes');
    
    // Register with canister
    try {
      const actor = await createActor();
      await actor.register_hash(
        hash, 
        [...new Uint8Array(req.file.buffer)], 
        req.file.mimetype,
        name,
        description,
        ownerName,
        ownerDob,
        royaltyFee,
        hasRoyalty,
        contactDetails
      );
      
      res.json({
        message: 'Hash and file registered successfully on blockchain',
        hash,
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        name,
        description,
        ownerName,
        hasRoyalty,
        royaltyFee,
        contactDetails
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

// Update the /verify endpoint

app.post('/verify', express.json(), async (req, res) => {
  try {
    const { hash } = req.body;
    
    if (!hash) {
      return res.status(400).json({ error: 'Hash is required' });
    }
    
    // Validate hash format (SHA-256 is 64 hex characters)
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
      
      // Log the result safely
      console.log('Direct lookup result type:', typeof result);
      try {
        console.log('Direct lookup result:', JSON.stringify(result, (_, value) => 
          typeof value === 'bigint' ? value.toString() : value
        ));
      } catch (logError) {
        console.log('Error logging result:', logError.message);
      }
      
      // Enhanced result checking - handle empty arrays too
      if (result && ((Array.isArray(result) && result.length > 0) || !Array.isArray(result))) {
        // Extract hash info, handling both array and direct object formats
        const hashInfo = Array.isArray(result) ? result[0] : result;
        
        if (hashInfo) {
          // Process timestamp
          let timestamp;
          try {
            timestamp = typeof hashInfo.timestamp === 'bigint'
              ? Number(hashInfo.timestamp / BigInt(1000000))
              : typeof hashInfo.timestamp === 'string'
                ? Number(hashInfo.timestamp) / 1000000
                : hashInfo.timestamp;
          } catch (timeError) {
            console.log('Error processing timestamp:', timeError.message);
            timestamp = Date.now(); // Fallback to current time
          }
          
          return res.json({
            verified: true,
            user: hashInfo.user ? 
                  (hashInfo.user.__principal__ ? hashInfo.user.__principal__ : hashInfo.user.toString()) 
                  : 'Unknown',
            timestamp: timestamp,
            hash,
            name: hashInfo.name || 'Unknown',
            description: hashInfo.description || '',
            ownerName: hashInfo.owner_name || hashInfo.ownerName || '',
            // Don't send ownerDob in response for security
            royaltyFee: hashInfo.royalty_fee || hashInfo.royaltyFee || '0',
            hasRoyalty: hashInfo.has_royalty || hashInfo.hasRoyalty || false,
            contactDetails: hashInfo.contact_details || hashInfo.contactDetails || '',
            message: 'File is verified'
          });
        }
      }
      
      // If we got here, the result was empty or not as expected
      console.log('Empty or unexpected result format. Trying metadata lookup...');
    } catch (lookupError) {
      console.log('Direct lookup error:', lookupError.message);
    }
    
    // Try metadata lookup as a fallback
    try {
      const metadataResult = await actor.get_hash_metadata(hash);
      console.log('Metadata lookup result:', metadataResult);
      
      if (metadataResult && ((Array.isArray(metadataResult) && metadataResult.length > 0) || !Array.isArray(metadataResult))) {
        const metadataInfo = Array.isArray(metadataResult) ? metadataResult[0] : metadataResult;
        
        if (metadataInfo) {
          let timestamp;
          try {
            timestamp = typeof metadataInfo.timestamp === 'bigint'
              ? Number(metadataInfo.timestamp / BigInt(1000000))
              : typeof metadataInfo.timestamp === 'string'
                ? Number(metadataInfo.timestamp) / 1000000
                : metadataInfo.timestamp;
          } catch (timeError) {
            console.log('Error processing metadata timestamp:', timeError.message);
            timestamp = Date.now();
          }
          
          return res.json({
            verified: true,
            user: metadataInfo.user ? 
                  (metadataInfo.user.__principal__ ? metadataInfo.user.__principal__ : metadataInfo.user.toString()) 
                  : 'Unknown',
            timestamp: timestamp,
            hash,
            name: metadataInfo.name || 'Unknown',
            description: metadataInfo.description || '',
            ownerName: metadataInfo.owner_name || metadataInfo.ownerName || '',
            royaltyFee: metadataInfo.royalty_fee || metadataInfo.royaltyFee || '0',
            hasRoyalty: metadataInfo.has_royalty || metadataInfo.hasRoyalty || false,
            contactDetails: metadataInfo.contact_details || metadataInfo.contactDetails || '',
            message: 'File is verified (metadata lookup)'
          });
        }
      }
    } catch (metadataError) {
      console.log('Metadata lookup error:', metadataError.message);
    }
    
    // If none of the lookups worked, try test registration
    try {
      console.log('Trying test registration for hash:', hash);
      
      // Keep track of the hash we're testing
      let registeredHash = hash;
      
      try {
        // Attempt to register the hash (this should fail if it exists)
        await actor.register_hash(
          hash,
          [0], // Minimal dummy content
          'test/plain',
          'Test File',
          '', // description
          '', // owner_name
          '', // owner_dob
          '0', // royalty_fee
          false, // has_royalty
          ''  // contact_details
        );
        
        // If we get here without error, the hash was NOT previously registered
        console.log('Test registration succeeded, hash not found');
        return res.status(404).json({
          verified: false,
          message: 'Hash not found',
          hash
        });
      } catch (regError) {
        // If error includes "Hash already registered", the hash exists!
        if (regError.message && regError.message.includes('Hash already registered: hash:')) {
          console.log('Hash verification succeeded via registration test');
          
          // Try to extract the original timestamp if available
          let originalTimestamp;
          try {
            if (global.__lastHashInfo && global.__lastHashInfo.timestamp) {
              originalTimestamp = typeof global.__lastHashInfo.timestamp === 'bigint'
                ? Number(global.__lastHashInfo.timestamp / BigInt(1000000))
                : typeof global.__lastHashInfo.timestamp === 'string'
                  ? Number(global.__lastHashInfo.timestamp) / 1000000
                  : null;
              console.log('Retrieved original timestamp:', originalTimestamp);
            }
          } catch (timeError) {
            console.log('Error extracting timestamp:', timeError.message);
          }
          
          // Get the clean name if available
          const preservedName = global.__lastExtractedName || 'Unknown (file name not recovered)';
          const cleanName = preservedName.includes('/') || preservedName.includes('\\')
            ? preservedName.split(/[\/\\]/).pop()
            : preservedName;
          
          return res.json({
            verified: true,
            message: 'File content has been verified on the blockchain!',
            hash,
            name: cleanName,
            ownerName: global.__lastHashInfo?.owner_name || global.__lastHashInfo?.ownerName || '',
            description: global.__lastHashInfo?.description || '',
            royaltyFee: global.__lastHashInfo?.royalty_fee || global.__lastHashInfo?.royaltyFee || '0',
            hasRoyalty: global.__lastHashInfo?.has_royalty || global.__lastHashInfo?.hasRoyalty || false, 
            contactDetails: global.__lastHashInfo?.contact_details || global.__lastHashInfo?.contactDetails || '',
            user: 'Unknown (recovered)',
            timestamp: originalTimestamp || Date.now(),
            verificationMethod: 'file' // This should be 'file', not registration-test
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
      console.error('Error in verify process:', error);
      return res.status(500).json({
        verified: false,
        error: error.message,
        hash
      });
    }
  } catch (error) {
    console.error('Error in verify endpoint:', error);
    return res.status(500).json({
      verified: false,
      error: error.message,
      hash: req.body?.hash || 'unknown'
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
          description: hashInfo.description || '',
          ownerName: hashInfo.owner_name || hashInfo.ownerName || '',
          royaltyFee: hashInfo.royalty_fee || hashInfo.royaltyFee || '0',
          hasRoyalty: hashInfo.has_royalty || hashInfo.hasRoyalty || false,
          contactDetails: hashInfo.contact_details || hashInfo.contactDetails || '',
          content_type: hashInfo.content_type,
          // Return content if available
          fileContent: hashInfo.content ? [...hashInfo.content] : undefined,
          verificationMethod: 'file'
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
        'Test File',
        '', // description
        '', // owner_name
        '', // owner_dob
        '0', // royalty_fee
        false, // has_royalty
        ''  // contact_details
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
          
          // Try to extract timestamp from original result if available in global variable
          let originalTimestamp;
          try {
            // Check if we can access the timestamp from the original get_hash_info call
            if (global.__lastHashInfo && global.__lastHashInfo.timestamp) {
              // Convert from nanoseconds to milliseconds
              originalTimestamp = typeof global.__lastHashInfo.timestamp === 'bigint'
                ? Number(global.__lastHashInfo.timestamp / BigInt(1000000))
                : typeof global.__lastHashInfo.timestamp === 'string'
                  ? Number(global.__lastHashInfo.timestamp) / 1000000
                  : null;
              console.log('Retrieved original timestamp for verify-file:', originalTimestamp);
            }
          } catch (timeError) {
            console.log('Error extracting timestamp in verify-file:', timeError.message);
          }

          console.log('Final timestamp being sent to frontend:', originalTimestamp);

          return res.json({
            verified: true,
            message: 'File content has been verified on the blockchain!',
            hash,
            filename: req.file.originalname,
            name: cleanName, // Use clean filename
            description: global.__lastHashInfo?.description || '',
            ownerName: global.__lastHashInfo?.owner_name || '',
            royaltyFee: global.__lastHashInfo?.royalty_fee || '0',
            hasRoyalty: global.__lastHashInfo?.has_royalty || false,
            contactDetails: global.__lastHashInfo?.contact_details || '',
            user: 'Unknown (recovered)',
            timestamp: originalTimestamp || Date.now(),
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

// Add before the get-all-files endpoint
app.post('/verify-download-access', express.json(), async (req, res) => {
  try {
    const { hash, dob } = req.body;
    
    if (!hash || !dob) {
      return res.status(400).json({ error: 'Hash and date of birth are required' });
    }
    
    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      return res.status(400).json({ error: 'Invalid hash format' });
    }
    
    const actor = await createActor();
    const result = await actor.get_hash_info(hash);
    
    if (!result) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const hashInfo = Array.isArray(result) && result.length > 0 ? result[0] : result;
    
    // Verify the DOB matches
    if (hashInfo.ownerDob !== dob) {
      return res.status(403).json({ 
        error: 'Access denied. Date of birth does not match.',
        verified: false
      });
    }
    
    // If we get here, the DOB matches
    return res.json({
      verified: true,
      message: 'Download access verified'
    });
  } catch (error) {
    console.error('Error verifying download access:', error);
    res.status(500).json({ error: 'Failed to verify download access' });
  }
});

// Get all registered files endpoint
app.get('/get-all-files', async (req, res) => {
  try {
    const agent = new HttpAgent({
      host: 'http://localhost:4943',
      fetch
    });
    
    await agent.fetchRootKey().catch(console.error);
    
    const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';
    
    // Call the get_all_files method on the canister
    try {
      const actor = await createActor();
      const result = await actor.get_all_files(); // This assumes the canister has a get_all_files method
      
      // Process the result to handle BigInt serialization
      const files = result.map(item => {
        const file = item[1]; // The value part of the key-value pair
        
        // Convert timestamp from nanoseconds to milliseconds
        const timestamp = typeof file.timestamp === 'bigint'
          ? Number(file.timestamp / BigInt(1000000))
          : typeof file.timestamp === 'string'
            ? Number(file.timestamp) / 1000000
            : Date.now();
        
        // Clean the name
        const rawName = file.name || 'Unknown';
        const cleanName = rawName.includes('/') || rawName.includes('\\')
          ? rawName.split(/[\/\\]/).pop()
          : rawName;
        
        return {
          hash: item[0], // The key is the hash
          name: cleanName,
          timestamp,
          user: file.user ? 
                (file.user.__principal__ ? file.user.__principal__ : file.user.toString()) 
                : 'Unknown',
          content_type: file.content_type || 'application/octet-stream'
        };
      });
      
      res.json(files);
    } catch (error) {
      console.error('Error getting all files:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to retrieve files' 
      });
    }
  } catch (error) {
    console.error('Server error in get-all-files:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// File download endpoint
app.get('/download-file/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) {
      return res.status(400).json({ error: 'Invalid hash format' });
    }
    
    const actor = await createActor();
    const result = await actor.get_hash_info(hash);
    
    if (!result) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const hashInfo = Array.isArray(result) && result.length > 0 ? result[0] : result;
    
    if (!hashInfo.content) {
      return res.status(404).json({ error: 'File content not available' });
    }
    
    // Properly extract content based on its structure
    let fileBuffer;
    if (Array.isArray(hashInfo.content)) {
      if (hashInfo.content.length > 0 && hashInfo.content[0] instanceof Uint8Array) {
        // Case: content is [Uint8Array]
        fileBuffer = Buffer.from(hashInfo.content[0]);
      } else {
        // Case: content is already a flat array of numbers
        fileBuffer = Buffer.from(hashInfo.content);
      }
    } else if (hashInfo.content instanceof Uint8Array) {
      // Case: content is directly a Uint8Array
      fileBuffer = Buffer.from(hashInfo.content);
    } else {
      console.error('Unknown content format:', typeof hashInfo.content);
      return res.status(500).json({ error: 'Unable to process file content' });
    }
    
    // Set the appropriate content type
    res.setHeader('Content-Type', hashInfo.content_type || 'application/octet-stream');
    
    // Set filename for download
    const filename = hashInfo.name || 'downloaded-file';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the file
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


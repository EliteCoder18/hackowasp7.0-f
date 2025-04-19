// app.js
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { HttpAgent, Actor } = require('@dfinity/agent');
const { IDL } = require('@dfinity/candid');
const fetch = require('node-fetch');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = 8000;


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Create the agent and interface
const createActor = async () => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943',
    fetch
  });
  
  // Local development needs this
  await agent.fetchRootKey();
  
  // Based on your Candid interface
  const idlFactory = ({ IDL }) => {
    return IDL.Service({
      'register_hash': IDL.Func([IDL.Text], [], []),
      'get_hash_info': IDL.Func(
        [IDL.Text], 
        [IDL.Opt(IDL.Record({
          'user': IDL.Principal,
          'timestamp': IDL.Nat64
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



// Handle verification
app.post('/verify', express.json(), async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) {
      return res.status(400).json({ error: 'Hash is required' });
    }
    
    console.log('Verifying hash:', hash);
    
    // Verify with canister
    const actor = await createActor();
    const result = await actor.get_hash_info(hash);
    
    console.log('Verification result:', result);
    
    // Handle opt type - check if we got an array with [null] (nothing) or actual data
    if (Array.isArray(result) && result.length > 0 && result[0] !== null) {
      const info = result[0];
      res.json({
        user: info.user.toString(),
        timestamp: Number(info.timestamp)
      });
    } else {
      res.status(404).json({ error: 'Hash not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify file handler
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
    
    // Verify with canister
    const actor = await createActor();
    const result = await actor.get_hash_info(hash);
    
    console.log('File verification result:', result);
    
    if (Array.isArray(result) && result.length > 0 && result[0] !== null) {
      res.json({
        verified: true,
        message: 'File is verified',
        hash
      });
    } else {
      res.status(404).json({
        verified: false,
        message: 'File not verified',
        hash
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      verified: false,
      error: error.message,
      hash
    });
  }
});


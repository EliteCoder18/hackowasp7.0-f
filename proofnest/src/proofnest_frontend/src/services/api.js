import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/proofnest_backend/proofnest_backend.did.js';

// Use environment variable or fallback
const CANISTER_ID =
  process.env.DFX_NETWORK === 'ic'
    ? process.env.CANISTER_ID_PROOFNEST_BACKEND
    : process.env.CANISTER_ID_PROOFNEST_BACKEND || 'local-canister-id-here'; // fallback for local

// Detect if running on mainnet (production)
const isProduction = process.env.NODE_ENV === 'production';

// Use the correct host for mainnet or local
const MAINNET_HOST = 'https://icp0.io'; // or use a specific boundary node if needed
const LOCAL_HOST = 'http://localhost:4943';

const createAgent = async () => {
  const agent = new HttpAgent({
    host: isProduction ? MAINNET_HOST : LOCAL_HOST,
    // Do NOT set verifyQuerySignatures or fetchRootKey in production
  });

  // Only fetch root key in local development
  if (!isProduction) {
    try {
      await agent.fetchRootKey();
      console.log("Fetched root key for local replica.");
    } catch (err) {
      console.warn("Could not fetch root key:", err);
    }
  }

  return agent;
};

export const getBackendActor = async () => {
  try {
    const agent = await createAgent();

    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_ID,
    });

    // Optional: Remove test queries in production
    if (!isProduction) {
      try {
        const greeting = await actor.greet?.("test");
        if (greeting) console.log("Actor test successful:", greeting);
      } catch (testError) {
        console.warn("Actor test failed:", testError);
      }
    }

    return actor;
  } catch (error) {
    console.error("Actor creation error:", error);
    throw error;
  }
};

export const registerProof = async (hash, fileName, description, royaltyFee, contactInfo, ownerName, ownerDob, file) => {
  try {
    const actor = await getBackendActor();

    // Read file content as Uint8Array
    let content = new Uint8Array();
    let contentType = "application/octet-stream";
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      content = new Uint8Array(arrayBuffer); // <-- Use Uint8Array, not Array.from!
      contentType = file.type || "application/octet-stream";
    }

    console.log("Content length sent to backend:", content.length);

    const hasRoyalty = Number(royaltyFee) > 0;

    return await actor.register_hash(
      hash,
      content, // <-- Pass Uint8Array directly!
      contentType,
      fileName,
      description,
      ownerName,
      ownerDob,
      royaltyFee.toString(),
      hasRoyalty,
      contactInfo
    );
  } catch (error) {
    console.error("Register proof error:", error);
    throw error;
  }
};

export const verifyProof = async (hash) => {
  try {
    console.log("Calling backend verify_hash with:", hash);
    const actor = await getBackendActor();
    let result = await actor.verify_hash(hash);
    console.log("Backend raw verify_hash result:", result);

    // DFINITY agent returns [value] or [] for opt types
    if (Array.isArray(result)) {
      result = result[0]; // undefined if not found
    }

    if (result) {
      return {
        exists: true,
        fileName: result.name,
        ownerName: result.owner_name,
        timestamp: Number(result.timestamp),
        royaltyFee: result.royalty_fee,
        contactInfo: result.contact_details,
        hasRoyalty: result.has_royalty,
        description: result.description,
        ownerDob: result.owner_dob
      };
    } else {
      return { exists: false };
    }
  } catch (error) {
    console.error("Verify proof error:", error);
    throw error;
  }
};

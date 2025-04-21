import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../declarations/proofnest_backend/proofnest_backend.did.js';

async function testCanister() {
  try {
    // Create agent with verification disabled
    const agent = new HttpAgent({
      host: 'http://127.0.0.1:4943',
      verifyQuerySignatures: false
    });
    
    // Override fetchRootKey
    agent.fetchRootKey = async () => {
      console.log("Root key fetch bypassed");
      return new Uint8Array(Array(32).fill(0));
    };
    
    // Create actor
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: 'uxrrr-q7777-77774-qaaaq-cai',
    });
    
    // Test with the simple greet function
    console.log("Testing greet function...");
    const result = await actor.greet("test");
    console.log("Greet result:", result);
    
    return "Success!";
  } catch (error) {
    console.error("Test failed:", error);
    return `Failed: ${error.message}`;
  }
}

// Run the test
testCanister().then(console.log);

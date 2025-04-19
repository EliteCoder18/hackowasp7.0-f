use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;

// Updated HashInfo to include file content and name
#[derive(CandidType, Deserialize, Clone)]
struct HashInfo {
    user: Principal,
    timestamp: u64,
    content: Option<Vec<u8>>,
    content_type: String,
    name: String, // Add this field
}

thread_local! {
    static HASH_MAP: RefCell<HashMap<String, HashInfo>> = RefCell::new(HashMap::new());
}

// Updated register_hash function to handle file content and name
#[update]
fn register_hash(hash: String, content: Vec<u8>, content_type: String, name: String) -> () {
    let caller = ic_cdk::caller();
    let timestamp = time();
    
    // Check file size - limit to 2MB to stay within canister limits
    if content.len() > 2 * 1024 * 1024 {
        ic_cdk::trap("File too large - maximum size is 2MB");
    }
    
    HASH_MAP.with(|map| {
        let mut map = map.borrow_mut();
        // Ensure the hash is unique
        if map.contains_key(&hash) {
            ic_cdk::trap(&format!("Hash already registered: hash: {}", hash));
        }
        
        // Store the hash info with content and name
        map.insert(
            hash.clone(), 
            HashInfo { 
                user: caller, 
                timestamp,
                content: Some(content),
                content_type,
                name, // Add the name
            }
        );
    });
}

// Updated query function to return content when requested
#[query]
fn get_hash_info(hash: String) -> Option<HashInfo> {
    HASH_MAP.with(|map| {
        let map = map.borrow();
        map.get(&hash).cloned()
    })
}

// Add a function to get hash info without the file content
// This is useful for verification without loading large files
#[query]
fn get_hash_metadata(hash: String) -> Option<HashInfo> {
    HASH_MAP.with(|map| {
        let map = map.borrow();
        map.get(&hash).map(|info| HashInfo {
            user: info.user,
            timestamp: info.timestamp,
            content: None, // Don't return the content
            content_type: info.content_type.clone(),
            name: info.name.clone(), // Return the name
        })
    })
}

ic_cdk::export_candid!();

use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;

// HashInfo struct to store file metadata
#[derive(CandidType, Deserialize, Clone)]
pub struct HashInfo {
    pub user: Principal,
    pub timestamp: u64,
    pub content: Option<Vec<u8>>, // Optional to avoid returning content in listings
    pub content_type: String,
    pub name: String,
    pub description: String,
    pub owner_name: String,
    pub owner_dob: String,
    pub royalty_fee: String,
    pub has_royalty: bool,
    pub contact_details: String,
}

// Thread-local storage for our hash map
thread_local! {
    static HASH_MAP: RefCell<HashMap<String, HashInfo>> = RefCell::new(HashMap::new());
}

// Register a new hash with file content and metadata
#[update]
fn register_hash(
    hash: String, 
    content: Vec<u8>, 
    content_type: String, 
    name: String,
    description: String,
    owner_name: String,
    owner_dob: String,
    royalty_fee: String,
    has_royalty: bool,
    contact_details: String
) -> () {
    let caller = ic_cdk::caller();
    let timestamp = time();
    
    // Check file size - limit to 2MB
    if content.len() > 2 * 1024 * 1024 {
        ic_cdk::trap("File too large - maximum size is 2MB");
    }
    
    ic_cdk::println!("Received content length: {}", content.len());
    
    HASH_MAP.with(|map| {
        let mut map = map.borrow_mut();
        // Ensure the hash is unique
        if map.contains_key(&hash) {
            ic_cdk::trap(&format!("Hash already registered: hash: {}", hash));
        }
        
        // Store the hash info with all metadata
        map.insert(
            hash.clone(), 
            HashInfo { 
                user: caller, 
                timestamp,
                content: Some(content),
                content_type,
                name,
                description,
                owner_name,
                owner_dob,
                royalty_fee,
                has_royalty,
                contact_details
            }
        );
    });
}

// Retrieve information for a specific hash
#[query]
fn get_hash_info(hash: String) -> Option<HashInfo> {
    HASH_MAP.with(|map| {
        let map = map.borrow();
        map.get(&hash).cloned()
    })
}

// List all registered files (without content to save bandwidth)
#[query]
fn get_all_files() -> Vec<(String, HashInfo)> {
    HASH_MAP.with(|map| {
        let map = map.borrow();
        map.iter()
            .map(|(k, v)| {
                // Create a copy with content removed to save bandwidth
                let hash_info = HashInfo {
                    user: v.user,
                    timestamp: v.timestamp,
                    content: None, // Don't return content in the listing
                    content_type: v.content_type.clone(),
                    name: v.name.clone(),
                    description: v.description.clone(),
                    owner_name: v.owner_name.clone(),
                    owner_dob: v.owner_dob.clone(),
                    royalty_fee: v.royalty_fee.clone(),
                    has_royalty: v.has_royalty,
                    contact_details: v.contact_details.clone(),
                };
                (k.clone(), hash_info)
            })
            .collect()
    })
}

// Verify if a hash exists and return its info
#[query]
fn verify_hash(hash: String) -> Option<HashInfo> {
    get_hash_info(hash)
}

// Simple metadata retrieval method
#[query]
fn get_hash_metadata(hash: String) -> Option<HashInfo> {
    get_hash_info(hash)
}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[query]
fn get_file_chunk(hash: String, offset: u32, chunk_size: u32) -> Vec<u8> {
    HASH_MAP.with(|map| {
        let map = map.borrow();
        match map.get(&hash) {
            Some(info) => {
                if let Some(content) = &info.content {
                    let start = offset as usize;
                    let end = std::cmp::min(start + (chunk_size as usize), content.len());
                    
                    if start >= content.len() {
                        return vec![];
                    }
                    
                    ic_cdk::println!("Sending chunk: offset={}, size={}", start, end - start);
                    return content[start..end].to_vec();
                }
                vec![]
            }
            None => vec![]
        }
    })
}

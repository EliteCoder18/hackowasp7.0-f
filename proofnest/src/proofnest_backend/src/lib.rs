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
    description: String,
    owner_name: String,
    owner_dob: String,
    royalty_fee: String,
    has_royalty: bool,
    contact_details: String,
}

thread_local! {
    static HASH_MAP: RefCell<HashMap<String, HashInfo>> = RefCell::new(HashMap::new());
}

// Updated register_hash function to handle file content and name
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
    
    HASH_MAP.with(|map| {
        let mut map = map.borrow_mut();
        // Ensure the hash is unique
        if map.contains_key(&hash) {
            ic_cdk::trap(&format!("Hash already registered: hash: {}", hash));
        }
        
        // Store the hash info with all the new fields
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
            description: info.description.clone(),
            owner_name: info.owner_name.clone(),
            owner_dob: info.owner_dob.clone(),
            royalty_fee: info.royalty_fee.clone(),
            has_royalty: info.has_royalty,
            contact_details: info.contact_details.clone(),
        })
    })
}

// Add a function to get all files without their content
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

ic_cdk::export_candid!();

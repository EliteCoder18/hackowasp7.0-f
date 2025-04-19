use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;

// Define the structure for hash information
#[derive(CandidType, Deserialize, Clone)]
struct HashInfo {
    user: Principal,
    timestamp: u64,
}

// Use thread-local storage for the hash map
thread_local! {
    static HASH_MAP: RefCell<HashMap<String, HashInfo>> = RefCell::new(HashMap::new());
}

// Function to register a hash
#[update]
fn register_hash(hash: String) -> () {
    let caller = ic_cdk::caller();
    let timestamp = time();
    HASH_MAP.with(|map| {
        let mut map = map.borrow_mut();
        // Ensure the hash is unique
        if map.contains_key(&hash) {
            ic_cdk::trap("Hash already registered");
        }
        map.insert(hash.clone(), HashInfo { user: caller, timestamp });
    });
}

// Function to retrieve hash information
#[query]
fn get_hash_info(hash: String) -> Option<HashInfo> {
    HASH_MAP.with(|map| {
        let map = map.borrow();
        map.get(&hash).cloned()
    })
}

// Define the canister's Candid interface
ic_cdk::export_candid!();
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Updated cn utility to match client
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

// Format timestamp for display
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Unknown';
  
  let timestampMs = timestamp;
  if (timestamp > 1000000000000000) {
    // Convert from nanoseconds to milliseconds
    timestampMs = Number(timestamp) / 1000000;
  }
  
  // Create and format the date
  const date = new Date(timestampMs);
  if (isNaN(date.getTime())) {
    return 'Invalid timestamp';
  }
  
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculate SHA-256 hash
export async function calculateSHA256(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

// Get file type icon based on file extension
export function getFileTypeIcon(fileName) {
  if (!fileName) return 'FILE';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch(extension) {
    case 'pdf': 
      return 'PDF';
    case 'docx':
    case 'doc': 
      return 'DOC';
    case 'xlsx':
    case 'xls': 
      return 'XLS';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': 
      return 'IMG';
    case 'mp4':
    case 'mov':
    case 'avi': 
      return 'VID';
    default: 
      return 'FILE';
  }
}

/**
 * Video Storage & Source Service (Prototype Abstraction)
 * 
 * Provides an isolated service abstraction for video upload and playback.
 * In this browser prototype, videos are processed and stored locally using
 * browser-supported storage (In-Memory Blob Registry and IndexedDB for persistence).
 * 
 * In production, this service can easily be swapped to point to:
 * React -> Cloudflare Worker -> Cloudflare R2 / Supabase Storage.
 */

// In-memory cache of object URLs for immediate playback
const memoryBlobUrlMap = new Map<string, string>();

// Simple IndexedDB wrapper to persist video files across page refreshes
const DB_NAME = 'adoracion_video_storage_db';
const STORE_NAME = 'video_blobs';
const DB_VERSION = 1;

function openVideoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save video Blob/File to local IndexedDB
 */
async function saveVideoBlobToDb(videoId: string, blob: Blob): Promise<void> {
  try {
    const db = await openVideoDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, videoId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not persist video to IndexedDB, fallback to memory-only:', err);
  }
}

/**
 * Read video Blob from local IndexedDB
 */
async function getVideoBlobFromDb(videoId: string): Promise<Blob | null> {
  try {
    const db = await openVideoDatabase();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(videoId);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error reading from IndexedDB:', err);
    return null;
  }
}

export interface VideoMetadata {
  title: string;
  artist?: string;
  category?: string;
  description?: string;
  recommendedUse?: string;
  musicalKey?: string;
  tempoBpm?: number;
  durationSeconds?: number;
  durationFormatted?: string;
  fileName?: string;
  fileSizeBytes?: number;
}

export interface VideoExtractionResult {
  durationSeconds: number;
  durationFormatted: string;
  width: number;
  height: number;
  thumbnailDataUrl?: string;
}

/**
 * Extracts metadata (duration, width, height, canvas thumbnail) from a real File
 */
export function extractVideoMetadata(file: File): Promise<VideoExtractionResult> {
  return new Promise((resolve) => {
    const tempUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = tempUrl;
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      URL.revokeObjectURL(tempUrl);
    };

    video.onloadedmetadata = () => {
      const durationSeconds = Math.max(1, Math.round(video.duration || 0));
      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      const durationFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      // Seek slightly to capture frame for thumbnail
      video.currentTime = Math.min(1, durationSeconds / 2);
    };

    video.onseeked = () => {
      let thumbnailDataUrl: string | undefined;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(640, video.videoWidth || 640);
        canvas.height = Math.min(360, video.videoHeight || 360);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        }
      } catch (e) {
        console.warn('Could not generate thumbnail frame:', e);
      }

      cleanup();
      const durationSeconds = Math.max(1, Math.round(video.duration || 0));
      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      const durationFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      resolve({
        durationSeconds,
        durationFormatted,
        width: video.videoWidth || 1280,
        height: video.videoHeight || 720,
        thumbnailDataUrl,
      });
    };

    video.onerror = () => {
      cleanup();
      resolve({
        durationSeconds: 180,
        durationFormatted: '03:00',
        width: 1280,
        height: 720,
      });
    };
  });
}

/**
 * Service Abstraction: uploadVideo
 * 
 * In this prototype, registers the video file in browser storage and returns
 * the playable URI / blob reference identifier.
 */
export async function uploadVideo(
  file: File,
  videoId: string
): Promise<{ videoId: string; blobUrl: string }> {
  // 1. Create immediate object URL for live playback
  const blobUrl = URL.createObjectURL(file);
  memoryBlobUrlMap.set(videoId, blobUrl);

  // 2. Persist blob in IndexedDB so playback works across page refreshes
  await saveVideoBlobToDb(videoId, file);

  return { videoId, blobUrl };
}

/**
 * Service Abstraction: getVideoSource
 * 
 * Returns the playable URL for the videoId.
 * Checks the in-memory cache first, then IndexedDB.
 */
export async function getVideoSource(videoId: string): Promise<string | null> {
  // Check in-memory map
  if (memoryBlobUrlMap.has(videoId)) {
    return memoryBlobUrlMap.get(videoId)!;
  }

  // Check persistent IndexedDB
  const storedBlob = await getVideoBlobFromDb(videoId);
  if (storedBlob) {
    const url = URL.createObjectURL(storedBlob);
    memoryBlobUrlMap.set(videoId, url);
    return url;
  }

  return null;
}

/**
 * Check synchronously if a video has an immediate in-memory blob URL
 */
export function getSyncVideoSource(videoId: string): string | null {
  return memoryBlobUrlMap.get(videoId) || null;
}

/**
 * Helper to register a default demo video or stream for existing mock songs
 */
export function registerMockVideoSource(videoId: string, url: string) {
  memoryBlobUrlMap.set(videoId, url);
}

/**
 * Formats bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

import { Competition, Submission } from '../types';
import { fetchFromCloudKV, saveToCloudKV } from './cloudStore';

const COMPETITIONS_KEY = 'tro_ly_nop_tai_lieu_competitions_v1';
const SUBMISSIONS_KEY = 'tro_ly_nop_tai_lieu_submissions_v1';

// Initial defaults are empty so user deleted state is respected
const DEFAULT_COMPETITIONS: Competition[] = [];
const DEFAULT_SUBMISSIONS: Submission[] = [];

// IndexedDB database setup for large file storage
const DB_NAME = 'TroLyNopTaiLieuDB_v2';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('competitions')) {
        db.createObjectStore('competitions', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });

  return dbPromise;
}

export async function getCompetitions(): Promise<Competition[]> {
  const localComps = await getCompetitionsFromLocal();
  
  // 1. Try server endpoint
  try {
    const res = await fetch('/api/competitions');
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        const json = JSON.parse(text);
        if (json.success && Array.isArray(json.data)) {
          const serverComps: Competition[] = json.data;
          
          // Merge server data with local cache (keep whichever is richer)
          if (serverComps.length >= localComps.length || localComps.length === 0) {
            saveAllCompetitionsLocally(serverComps).catch(() => {});
            return serverComps;
          } else {
            // Local has extra unsynced items -> sync local items to server
            localComps.forEach((comp) => {
              if (!serverComps.some((s) => s.id === comp.id)) {
                fetch('/api/competitions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(comp),
                }).catch(() => {});
              }
            });
            return localComps;
          }
        }
      }
    }
  } catch (err) {
    console.warn('API /api/competitions unavailable:', err);
  }

  return localComps;
}

async function getCompetitionsFromLocal(): Promise<Competition[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('competitions', 'readonly');
      const store = tx.objectStore('competitions');
      const request = store.getAll();

      request.onsuccess = () => {
        let list: Competition[] = request.result;
        if (!list || !Array.isArray(list)) {
          list = getCompetitionsFromLocalStorage();
        }
        resolve(list);
      };

      request.onerror = () => {
        resolve(getCompetitionsFromLocalStorage());
      };
    });
  } catch {
    return getCompetitionsFromLocalStorage();
  }
}

function getCompetitionsFromLocalStorage(): Competition[] {
  try {
    const stored = localStorage.getItem(COMPETITIONS_KEY);
    if (stored === null) {
      return [];
    }
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export async function saveCompetition(comp: Competition): Promise<void> {
  // 1. Immediately update local storage & IndexedDB so data is instantly secure
  const currentLocal = await getCompetitionsFromLocal();
  const index = currentLocal.findIndex((c) => c.id === comp.id);
  if (index >= 0) {
    currentLocal[index] = comp;
  } else {
    currentLocal.unshift(comp);
  }
  await saveAllCompetitionsLocally(currentLocal);

  // 2. Persist to server API
  try {
    await fetch('/api/competitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comp),
    });
  } catch (err) {
    console.warn('Failed to save competition to server API:', err);
  }
}

export async function deleteCompetition(id: string): Promise<void> {
  // 1. Delete from local state immediately
  const currentLocal = await getCompetitionsFromLocal();
  const updated = currentLocal.filter((c) => c.id !== id);
  await saveAllCompetitionsLocally(updated);

  // 2. Send DELETE to server API
  try {
    await fetch(`/api/competitions/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete competition from server API:', err);
  }
}

async function saveAllCompetitionsLocally(competitions: Competition[]): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('competitions', 'readwrite');
      const store = tx.objectStore('competitions');
      store.clear();
      competitions.forEach((c) => store.put(c));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback to LocalStorage
  }
  try {
    localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(competitions));
  } catch (e) {
    console.warn('LocalStorage quota exceeded for competitions', e);
  }
}

export async function getSubmissions(): Promise<Submission[]> {
  const localSubs = await getSubmissionsFromLocal();

  // 1. Try server endpoint
  try {
    const res = await fetch('/api/submissions');
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        const json = JSON.parse(text);
        if (json.success && Array.isArray(json.data)) {
          const serverSubs: Submission[] = json.data;

          if (serverSubs.length >= localSubs.length || localSubs.length === 0) {
            saveAllSubmissionsLocally(serverSubs).catch(() => {});
            return serverSubs;
          } else {
            // Sync missing local submissions to server
            localSubs.forEach((sub) => {
              if (!serverSubs.some((s) => s.id === sub.id)) {
                fetch('/api/submissions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(sub),
                }).catch(() => {});
              }
            });
            return localSubs;
          }
        }
      }
    }
  } catch (err) {
    console.warn('API /api/submissions unavailable:', err);
  }

  return localSubs;
}

async function getSubmissionsFromLocal(): Promise<Submission[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('submissions', 'readonly');
      const store = tx.objectStore('submissions');
      const request = store.getAll();

      request.onsuccess = () => {
        let list: Submission[] = request.result;
        if (!list || !Array.isArray(list)) {
          list = getSubmissionsFromLocalStorage();
        }
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        resolve(list);
      };

      request.onerror = () => {
        resolve(getSubmissionsFromLocalStorage());
      };
    });
  } catch {
    return getSubmissionsFromLocalStorage();
  }
}

function getSubmissionsFromLocalStorage(): Submission[] {
  try {
    const stored = localStorage.getItem(SUBMISSIONS_KEY);
    if (stored === null) {
      return [];
    }
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export async function addSubmission(submission: Submission): Promise<void> {
  // 1. Save locally immediately
  const currentLocal = await getSubmissionsFromLocal();
  const idx = currentLocal.findIndex((s) => s.id === submission.id);
  if (idx >= 0) {
    currentLocal[idx] = submission;
  } else {
    currentLocal.unshift(submission);
  }
  await saveAllSubmissionsLocally(currentLocal);

  // 2. Post to server API
  try {
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
  } catch (err: any) {
    console.warn('Failed to post submission to server API:', err);
  }
}

export async function deleteSubmission(id: string): Promise<void> {
  // 1. Delete from local state immediately
  const currentLocal = await getSubmissionsFromLocal();
  const updated = currentLocal.filter(s => s.id !== id);
  await saveAllSubmissionsLocally(updated);

  // 2. Send DELETE to server API
  try {
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete submission on server API:', err);
  }
}

async function saveAllSubmissionsLocally(submissions: Submission[]): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('submissions', 'readwrite');
      const store = tx.objectStore('submissions');
      store.clear();
      submissions.forEach((s) => store.put(s));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.warn('Failed to save all submissions to localStorage', e);
    }
  }
}

// Utility function to determine competition status dynamically
export function getCompetitionStatus(comp: Competition): 'active' | 'upcoming' | 'ended' {
  if (!comp.startDate || !comp.endDate) return 'active';

  const now = new Date().getTime();
  const start = new Date(comp.startDate).getTime();
  const end = new Date(comp.endDate).getTime();

  if (isNaN(start) || isNaN(end)) return 'active';

  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
}

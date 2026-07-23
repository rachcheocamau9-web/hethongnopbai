import { Competition, Submission } from '../types';
import { fetchFromCloudKV, saveToCloudKV } from './cloudStore';

const COMPETITIONS_KEY = 'tro_ly_nop_tai_lieu_competitions_v1';
const SUBMISSIONS_KEY = 'tro_ly_nop_tai_lieu_submissions_v1';

// Initial default competitions to show on first load
const DEFAULT_COMPETITIONS: Competition[] = [
  {
    id: 'comp-1',
    title: 'Cuộc Thi Sáng Tạo Thiết Kế & Ý Tưởng 2026',
    description: 'Nộp bài thi sáng tạo, đồ án hoặc báo cáo ý tưởng thiết kế dạng PDF hoặc Hình ảnh chất lượng cao.',
    startDate: '2026-07-01T08:00',
    endDate: '2026-12-31T23:59',
    allowedTypes: ['pdf', 'image'],
    maxFileSizeMb: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp-2',
    title: 'Cuộc Thi Nghiên Cứu Khoa Học Sinh Viên',
    description: 'Nộp tóm tắt báo cáo khoa học, sơ đồ minh họa và kết quả nghiên cứu. Yêu cầu định dạng PDF.',
    startDate: '2026-06-15T00:00',
    endDate: '2026-08-30T17:00',
    allowedTypes: ['pdf', 'image'],
    maxFileSizeMb: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp-3',
    title: 'Hội Thi Nhếp Ảnh & Truyền Thông Thương Hiệu',
    description: 'Nộp tác phẩm dự thi gồm hình ảnh chụp thực tế hoặc poster thiết kế (PNG, JPG, WEBP).',
    startDate: '2026-07-10T08:00',
    endDate: '2026-11-20T23:59',
    allowedTypes: ['image'],
    maxFileSizeMb: 15,
    createdAt: new Date().toISOString(),
  }
];

// Initial default sample submission so admin and excel export are testable immediately
const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'SUB-2026-8812',
    competitionId: 'comp-1',
    competitionTitle: 'Cuộc Thi Sáng Tạo Thiết Kế & Ý Tưởng 2026',
    fullName: 'Nguyễn Văn An',
    phoneNumber: '0901234567',
    email: 'nguyenvanan@gmail.com',
    studentCode: 'SV202601',
    notes: 'Bài dự thi thiết kế giao diện ứng dụng di động thông minh.',
    fileName: 'Thiet_Ke_Giao_Dien_NguyenVanAn.pdf',
    fileSize: 2458000,
    fileType: 'application/pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJ...', // mock placeholder sample
    submittedAt: '2026-07-20T14:30:00.000Z',
    status: 'approved',
  },
  {
    id: 'SUB-2026-9041',
    competitionId: 'comp-1',
    competitionTitle: 'Cuộc Thi Sáng Tạo Thiết Kế & Ý Tưởng 2026',
    fullName: 'Trần Thị Mai',
    phoneNumber: '0987654321',
    email: 'tranmai@gmail.com',
    studentCode: 'SV202609',
    notes: 'File thiết kế poster truyền thông cuộc thi.',
    fileName: 'Poster_Duan_TranThiMai.png',
    fileSize: 1840000,
    fileType: 'image/png',
    fileData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    submittedAt: '2026-07-21T09:15:00.000Z',
    status: 'pending',
  }
];

// IndexedDB database setup for large file storage
const DB_NAME = 'TroLyNopTaiLieuDB';
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
  // 1. Try server endpoint
  try {
    const res = await fetch('/api/competitions');
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        const json = JSON.parse(text);
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          saveAllCompetitionsLocally(json.data).catch(() => {});
          return json.data;
        }
      }
    }
  } catch (err) {
    console.warn('API /api/competitions unavailable:', err);
  }

  // 2. Try global Cloud KV fallback
  try {
    const cloudComps = await fetchFromCloudKV<Competition[]>('competitions');
    if (Array.isArray(cloudComps) && cloudComps.length > 0) {
      saveAllCompetitionsLocally(cloudComps).catch(() => {});
      return cloudComps;
    }
  } catch (err) {
    console.warn('Cloud KV fetch for competitions failed:', err);
  }

  // 3. Fallback to local DB cache
  return getCompetitionsFromLocal();
}

async function getCompetitionsFromLocal(): Promise<Competition[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('competitions', 'readonly');
      const store = tx.objectStore('competitions');
      const request = store.getAll();

      request.onsuccess = () => {
        let list: Competition[] = request.result || [];
        if (list.length === 0) {
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
    if (!stored) {
      localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(DEFAULT_COMPETITIONS));
      return DEFAULT_COMPETITIONS;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_COMPETITIONS;
  }
}

export async function saveCompetition(comp: Competition): Promise<void> {
  // Try server API first
  try {
    await fetch('/api/competitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comp),
    });
  } catch (err) {
    console.warn('Failed to save competition to server API:', err);
  }

  // Get current list, update comp, save locally & push to Cloud KV
  const current = await getCompetitions();
  const index = current.findIndex((c) => c.id === comp.id);
  if (index >= 0) {
    current[index] = comp;
  } else {
    current.unshift(comp);
  }

  await Promise.all([
    saveAllCompetitionsLocally(current),
    saveToCloudKV('competitions', current)
  ]).catch(() => {});
}

export async function deleteCompetition(id: string): Promise<void> {
  try {
    await fetch(`/api/competitions/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete competition from server API:', err);
  }

  const current = await getCompetitions();
  const updated = current.filter((c) => c.id !== id);

  await Promise.all([
    saveAllCompetitionsLocally(updated),
    saveToCloudKV('competitions', updated)
  ]).catch(() => {});
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
    try {
      localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(competitions));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for competitions', e);
    }
  }
}

export async function getSubmissions(): Promise<Submission[]> {
  // 1. Try server endpoint
  try {
    const res = await fetch('/api/submissions');
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        const json = JSON.parse(text);
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          saveAllSubmissionsLocally(json.data).catch(() => {});
          return json.data;
        }
      }
    }
  } catch (err) {
    console.warn('API /api/submissions unavailable:', err);
  }

  // 2. Try global Cloud KV fallback
  try {
    const cloudSubs = await fetchFromCloudKV<Submission[]>('submissions');
    if (Array.isArray(cloudSubs) && cloudSubs.length > 0) {
      saveAllSubmissionsLocally(cloudSubs).catch(() => {});
      return cloudSubs;
    }
  } catch (err) {
    console.warn('Cloud KV fetch for submissions failed:', err);
  }

  // 3. Local fallback
  return getSubmissionsFromLocal();
}

async function getSubmissionsFromLocal(): Promise<Submission[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('submissions', 'readonly');
      const store = tx.objectStore('submissions');
      const request = store.getAll();

      request.onsuccess = () => {
        let list: Submission[] = request.result || [];
        if (list.length === 0) {
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
    if (!stored) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(DEFAULT_SUBMISSIONS));
      return DEFAULT_SUBMISSIONS;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_SUBMISSIONS;
  }
}

export async function addSubmission(submission: Submission): Promise<void> {
  try {
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
  } catch (err: any) {
    console.warn('Failed to post submission to server API:', err);
  }

  const current = await getSubmissions();
  const idx = current.findIndex(s => s.id === submission.id);
  if (idx >= 0) {
    current[idx] = submission;
  } else {
    current.unshift(submission);
  }

  await Promise.all([
    saveSubmissionLocally(submission),
    saveToCloudKV('submissions', current)
  ]).catch(() => {});
}

async function saveSubmissionLocally(submission: Submission): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('submissions', 'readwrite');
      const store = tx.objectStore('submissions');
      const req = store.put(submission);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || tx.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB put failed, falling back to localStorage safely', err);
    try {
      const list = getSubmissionsFromLocalStorage();
      list.unshift(submission);
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
    } catch (quotaErr) {
      console.warn('LocalStorage quota exceeded, storing submission metadata without large fileData', quotaErr);
      try {
        const lightweightSub = {
          ...submission,
          fileData: submission.fileData.substring(0, 100) + '... (Tệp đã được ghi nhận)'
        };
        const list = getSubmissionsFromLocalStorage();
        list.unshift(lightweightSub);
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to write to localStorage altogether', e);
      }
    }
  }
}

export async function deleteSubmission(id: string): Promise<void> {
  try {
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete submission on server API:', err);
  }

  const current = await getSubmissions();
  const updated = current.filter(s => s.id !== id);

  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('submissions', 'readwrite');
      const store = tx.objectStore('submissions');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
    } catch {}
  }

  saveToCloudKV('submissions', updated).catch(() => {});
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

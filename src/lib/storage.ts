import { Competition, Submission } from '../types';

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

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('competitions')) {
        db.createObjectStore('competitions', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCompetitions(): Promise<Competition[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('competitions', 'readonly');
    const store = tx.objectStore('competitions');
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => {
        let list: Competition[] = request.result;
        if (!list || list.length === 0) {
          // Seed defaults
          saveAllCompetitions(DEFAULT_COMPETITIONS);
          list = DEFAULT_COMPETITIONS;
        }
        resolve(list);
      };
      request.onerror = () => {
        resolve(DEFAULT_COMPETITIONS);
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, fallback to localStorage', err);
    const stored = localStorage.getItem(COMPETITIONS_KEY);
    if (!stored) {
      localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(DEFAULT_COMPETITIONS));
      return DEFAULT_COMPETITIONS;
    }
    return JSON.parse(stored);
  }
}

export async function saveCompetition(comp: Competition): Promise<void> {
  const current = await getCompetitions();
  const index = current.findIndex((c) => c.id === comp.id);
  if (index >= 0) {
    current[index] = comp;
  } else {
    current.unshift(comp);
  }
  await saveAllCompetitions(current);
}

export async function deleteCompetition(id: string): Promise<void> {
  const current = await getCompetitions();
  const updated = current.filter((c) => c.id !== id);
  await saveAllCompetitions(updated);
}

async function saveAllCompetitions(competitions: Competition[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('competitions', 'readwrite');
    const store = tx.objectStore('competitions');
    store.clear();
    competitions.forEach((c) => store.put(c));
  } catch {
    localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(competitions));
  }
}

export async function getSubmissions(): Promise<Submission[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('submissions', 'readonly');
    const store = tx.objectStore('submissions');
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => {
        let list: Submission[] = request.result;
        if (!list || list.length === 0) {
          // Seed defaults
          saveAllSubmissions(DEFAULT_SUBMISSIONS);
          list = DEFAULT_SUBMISSIONS;
        }
        // Sort descending by date
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        resolve(list);
      };
      request.onerror = () => resolve(DEFAULT_SUBMISSIONS);
    });
  } catch {
    const stored = localStorage.getItem(SUBMISSIONS_KEY);
    if (!stored) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(DEFAULT_SUBMISSIONS));
      return DEFAULT_SUBMISSIONS;
    }
    return JSON.parse(stored);
  }
}

export async function addSubmission(submission: Submission): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('submissions', 'readwrite');
    const store = tx.objectStore('submissions');
    store.put(submission);
  } catch {
    const list = await getSubmissions();
    list.unshift(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
  }
}

export async function deleteSubmission(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('submissions', 'readwrite');
    const store = tx.objectStore('submissions');
    store.delete(id);
  } catch {
    const list = await getSubmissions();
    const updated = list.filter((s) => s.id !== id);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  }
}

export async function saveAllSubmissions(submissions: Submission[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('submissions', 'readwrite');
    const store = tx.objectStore('submissions');
    store.clear();
    submissions.forEach((s) => store.put(s));
  } catch {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  }
}

// Utility function to determine competition status dynamically
export function getCompetitionStatus(comp: Competition): 'active' | 'upcoming' | 'ended' {
  const now = new Date().getTime();
  const start = new Date(comp.startDate).getTime();
  const end = new Date(comp.endDate).getTime();

  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
}

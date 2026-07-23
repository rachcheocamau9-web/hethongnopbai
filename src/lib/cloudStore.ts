// Centralized Cloud Storage & Synchronization Helper

const KV_BUCKET = "TroLyNopTaiLieu2026_v2";
const KV_BASE_URL = `https://kvdb.io/6P7aX9mK1bQv3L0z8W9n`;

export async function fetchFromCloudKV<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${KV_BASE_URL}/${key}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().startsWith('[')) {
        return JSON.parse(text) as T;
      }
    }
  } catch (err) {
    console.warn(`Cloud KV fetch failed for ${key}:`, err);
  }
  return null;
}

export async function saveToCloudKV<T>(key: string, data: T): Promise<boolean> {
  try {
    const res = await fetch(`${KV_BASE_URL}/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (err) {
    console.warn(`Cloud KV save failed for ${key}:`, err);
    return false;
  }
}

import JSZip from 'jszip';
import { Submission } from '../types';

/**
 * Extract clean file extension from filename or mime type
 */
export function getFileExtension(fileName: string, fileType: string): string {
  if (fileName && fileName.includes('.')) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext && ext.length <= 5) return ext;
  }
  if (fileType) {
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('png')) return 'png';
    if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'jpg';
    if (fileType.includes('webp')) return 'webp';
    if (fileType.includes('gif')) return 'gif';
  }
  return 'bin';
}

/**
 * Clean full name for valid OS filename
 */
export function sanitizeFileName(name: string): string {
  if (!name || !name.trim()) return 'Thi_Sinh_Chua_Dat_Ten';
  // Remove dangerous OS filename characters: / \ : * ? " < > |
  return name.trim().replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, ' ');
}

/**
 * Get formatted filename for a submission: "<Họ và tên>.<ext>"
 */
export function getSubmissionFileName(sub: Submission): string {
  const ext = getFileExtension(sub.fileName, sub.fileType);
  const safeName = sanitizeFileName(sub.fullName);
  return `${safeName}.${ext}`;
}

/**
 * Download a single submission file named after the participant's full name
 */
export function downloadSingleSubmissionFile(sub: Submission) {
  if (!sub.fileData) {
    alert('Không tìm thấy dữ liệu file!');
    return;
  }

  const filename = getSubmissionFileName(sub);

  // Trigger browser download
  const a = document.createElement('a');
  a.href = sub.fileData;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Helper to convert base64 string safely to Uint8Array
 */
function base64ToUint8Array(base64Str: string): Uint8Array {
  // Clean base64 string from whitespace and illegal characters
  const cleanBase64 = base64Str.replace(/[^A-Za-z0-9+/=]/g, '');
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Export all selected/filtered submissions as a ZIP file.
 * Every file in the ZIP is named as "<Họ_và_tên>.<ext>" (e.g. Nguyễn Văn An.pdf, Trần Thị Mai.png).
 */
export async function exportSubmissionsZip(
  submissions: Submission[],
  zipTitle = 'Danh_Sach_Bai_Nop'
): Promise<void> {
  if (submissions.length === 0) {
    alert('Không có bài nộp nào để xuất file!');
    return;
  }

  const zip = new JSZip();
  const nameCounts: Record<string, number> = {};
  let addedCount = 0;

  for (let i = 0; i < submissions.length; i++) {
    const sub = submissions[i];
    if (!sub.fileData) continue;

    const ext = getFileExtension(sub.fileName, sub.fileType);
    const baseName = sanitizeFileName(sub.fullName || `Thi_Sinh_${i + 1}`);

    // Track duplicate full names to avoid overwriting files in ZIP
    nameCounts[baseName] = (nameCounts[baseName] || 0) + 1;
    let filename = `${baseName}.${ext}`;
    if (nameCounts[baseName] > 1) {
      const extraId = sub.studentCode || sub.id.replace('SUB-', '') || `${nameCounts[baseName]}`;
      filename = `${baseName}_(${sanitizeFileName(extraId)}).${ext}`;
    }

    try {
      if (sub.fileData.startsWith('data:')) {
        // Base64 Data URL
        const commaIdx = sub.fileData.indexOf(',');
        if (commaIdx !== -1) {
          const base64Data = sub.fileData.substring(commaIdx + 1);
          const bytes = base64ToUint8Array(base64Data);
          zip.file(filename, bytes);
          addedCount++;
        }
      } else if (sub.fileData.startsWith('http://') || sub.fileData.startsWith('https://') || sub.fileData.startsWith('/')) {
        // Remote/Local File URL
        const response = await fetch(sub.fileData);
        if (response.ok) {
          const blob = await response.blob();
          zip.file(filename, blob);
          addedCount++;
        }
      } else {
        // Plain text fallback
        zip.file(filename, sub.fileData);
        addedCount++;
      }
    } catch (err) {
      console.warn(`Could not add file ${filename} to ZIP:`, err);
      // Fallback: create a dummy note text file so the entry isn't lost
      zip.file(`${baseName}_Error.txt`, `Lỗi đọc file của thí sinh ${sub.fullName}: ${sub.fileName}`);
      addedCount++;
    }
  }

  if (addedCount === 0) {
    alert('Không tìm thấy dữ liệu file hợp lệ để đóng gói ZIP.');
    return;
  }

  const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(content);
  const safeZipTitle = sanitizeFileName(zipTitle).replace(/\s+/g, '_');

  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeZipTitle}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

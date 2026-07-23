import * as XLSX from 'xlsx';
import { Submission } from '../types';

export function exportSubmissionsToExcel(submissions: Submission[], competitionNameFilter?: string) {
  // Title matching user's exact template sample
  const topicTitle = competitionNameFilter
    ? `TÌM HIỂU PHÁP LUẬT VỀ: ${competitionNameFilter.toUpperCase()}`
    : 'TÌM HIỂU PHÁP LUẬT VỀ:';

  // Build 2D array matching the exact structure from the template image
  const aoa: any[][] = [
    ['ỦY BND XÃ NGUYỄN VIỆT KHÁI', '', '', ''],
    ['TRƯỜNG TIỂU HỌC RẠCH CHÈO', '', '', ''],
    ['', '', '', ''],
    ['', topicTitle, '', ''],
    ['', '', '', ''],
    ['STT', 'HỌ VÀ TÊN', 'LINK BÀI DỰ THI', 'GHI CHÚ'],
  ];

  submissions.forEach((sub, index) => {
    // Show submission link / file name
    const linkOrFile = sub.fileData && sub.fileData.startsWith('http') 
      ? sub.fileData 
      : sub.fileName;

    aoa.push([
      index + 1,
      sub.fullName,
      linkOrFile,
      sub.notes || ''
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 8 },  // STT
    { wch: 32 }, // HỌ VÀ TÊN
    { wch: 45 }, // LINK BÀI DỰ THI
    { wch: 25 }, // GHI CHÚ
  ];

  // Merge title row across columns
  worksheet['!merges'] = [
    { s: { r: 3, c: 1 }, e: { r: 3, c: 3 } }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tim Hieu Phap Luat');

  const fileNameSuffix = competitionNameFilter
    ? competitionNameFilter.replace(/[^a-zA-Z0-9_ -]/g, '').substring(0, 20)
    : 'DanhSach';

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  XLSX.writeFile(workbook, `Bao_Cao_Bai_Nop_${fileNameSuffix}_${dateStr}.xlsx`);
}


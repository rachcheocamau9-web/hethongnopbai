import React, { useState } from 'react';
import { Download, X, FileCode, FileText, Printer, Copy, Check, FileCheck } from 'lucide-react';
import { DocumentItem } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const sanitizeFilename = (name: string) => {
    return (name || 'tai_lieu').toLowerCase().replace(/[^a-z0-9_À-ỹ]/g, '_');
  };

  const handleDownloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    handleDownloadFile(`${sanitizeFilename(document.title)}.md`, document.content, 'text/markdown;charset=utf-8');
  };

  const handleExportText = () => {
    const plainText = document.content.replace(/[#*`~-]/g, '');
    handleDownloadFile(`${sanitizeFilename(document.title)}.txt`, plainText, 'text/plain;charset=utf-8');
  };

  const handleExportHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${document.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-w: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1e293b; }
    h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 16px; color: #475569; font-style: italic; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${document.title}</h1>
  <pre>${document.content}</pre>
</body>
</html>`;
    handleDownloadFile(`${sanitizeFilename(document.title)}.html`, htmlContent, 'text/html;charset=utf-8');
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-850 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download size={18} />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Xuất & Tải Xuống Tài Liệu</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Markdown Download */}
          <button
            onClick={handleExportMarkdown}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileCode size={20} className="text-indigo-600 dark:text-indigo-400" />
              <div className="text-left">
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Tải tệp Markdown (.md)</h4>
                <p className="text-[11px] text-slate-400">Giữ nguyên định dạng chuẩn Markdown</p>
              </div>
            </div>
            <Download size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>

          {/* HTML Download */}
          <button
            onClick={handleExportHtml}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
              <div className="text-left">
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Tải trang HTML (.html)</h4>
                <p className="text-[11px] text-slate-400">Xem ngay trên trình duyệt web</p>
              </div>
            </div>
            <Download size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>

          {/* TXT Download */}
          <button
            onClick={handleExportText}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-amber-600 dark:text-amber-400" />
              <div className="text-left">
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Tải tệp Văn bản thuần (.txt)</h4>
                <p className="text-[11px] text-slate-400">Văn bản không định dạng</p>
              </div>
            </div>
            <Download size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={handlePrintPdf}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Printer size={20} className="text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">In hoặc Lưu dưới dạng PDF</h4>
                <p className="text-[11px] text-slate-400">Mở hộp thoại in hệ thống</p>
              </div>
            </div>
            <Printer size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Copy size={20} className="text-slate-600 dark:text-slate-300" />
              <div className="text-left">
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  {copied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép mã Markdown'}
                </h4>
                <p className="text-[11px] text-slate-400">Copy toàn bộ mã nguồn bài viết</p>
              </div>
            </div>
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-slate-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Submission } from '../../types';
import { X, Download, FileText, Image as ImageIcon, Calendar, User, Phone, Mail, Award } from 'lucide-react';

interface FilePreviewModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ submission, onClose }) => {
  if (!submission) return null;

  const isPdf = submission.fileType.includes('pdf') || submission.fileName.toLowerCase().endsWith('.pdf');
  const isImage = submission.fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(submission.fileName);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = submission.fileData;
    a.download = submission.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden pr-2">
            <div className="p-2 rounded-xl bg-slate-800 text-blue-400 shrink-0">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5 text-rose-400" />}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm sm:text-base truncate text-slate-100" title={submission.fileName}>
                {submission.fileName}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                Thí sinh: <strong className="text-white">{submission.fullName}</strong> • {submission.competitionTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col items-center justify-center min-h-[350px]">
          {isImage ? (
            <div className="max-w-full max-h-[60vh] rounded-xl overflow-hidden shadow-lg border border-slate-300 bg-slate-900 flex items-center justify-center p-2">
              <img
                src={submission.fileData}
                alt={submission.fileName}
                className="max-h-[58vh] max-w-full object-contain rounded-lg"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={submission.fileData}
              title={submission.fileName}
              className="w-full h-[60vh] rounded-xl border border-slate-300 shadow-md bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-sm">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
              <p className="font-bold text-slate-800">Không thể xem trực tiếp định dạng này</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Vui lòng tải file về máy để xem nội dung chi tiết.</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                Tải file ngay
              </button>
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="bg-white p-4 border-t border-slate-200 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>SĐT/Email: <strong>{submission.phoneNumber || '-'} / {submission.email || '-'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>Mã nộp bài: <strong className="font-mono text-blue-600">{submission.id}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Thời gian: <strong>{new Date(submission.submittedAt).toLocaleString('vi-VN')}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};

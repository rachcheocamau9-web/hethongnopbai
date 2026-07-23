import React from 'react';
import { Submission } from '../types';
import { CheckCircle2, Award, Calendar, FileText, User, Sparkles, Download, ArrowRight } from 'lucide-react';

interface SuccessModalProps {
  submission: Submission;
  onClose: () => void;
  onReset: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ submission, onClose, onReset }) => {
  const submitDate = new Date(submission.submittedAt);
  const formattedDate = isNaN(submitDate.getTime())
    ? submission.submittedAt
    : submitDate.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden transform transition-all animate-scaleUp">
        
        {/* Festive Header */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 p-8 text-center text-white relative overflow-hidden">
          {/* Background sparkles decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white text-emerald-600 flex items-center justify-center shadow-2xl mb-4 relative z-10 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Hệ Thống Ghi Nhận Thành Công
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            CHÚC MỪNG BẠN ĐÃ NỘP THÀNH CÔNG!
          </h3>
          <p className="text-emerald-100 text-sm mt-1">
            Tài liệu bài thi của bạn đã được chuyển đến hội đồng giám khảo.
          </p>
        </div>

        {/* Receipt Card Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Mã xác nhận nộp bài
              </span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-sm">
                {submission.id}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start justify-between">
                <span className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Họ & tên:
                </span>
                <span className="font-bold text-slate-900 text-right">{submission.fullName}</span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Cuộc thi:
                </span>
                <span className="font-semibold text-slate-800 text-right max-w-[220px]">
                  {submission.competitionTitle}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> File đính kèm:
                </span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[200px]" title={submission.fileName}>
                  {submission.fileName}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Thời gian nộp:
                </span>
                <span className="font-medium text-slate-700 text-right">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              id="btn-print-receipt"
              onClick={handlePrintReceipt}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>In / Lưu Phiếu Xác Nhận Nộp Bài</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-submit-another"
                onClick={onReset}
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <span>Nộp bài mới</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-close-success-modal"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

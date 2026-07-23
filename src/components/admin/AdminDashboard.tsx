import React, { useState } from 'react';
import { Submission, Competition, AdminTab } from '../../types';
import { SubmissionsTable } from './SubmissionsTable';
import { CompetitionsManager } from './CompetitionsManager';
import { AnalyticsView } from './AnalyticsView';
import { FilePreviewModal } from './FilePreviewModal';
import { Inbox, Calendar, BarChart3, ShieldCheck } from 'lucide-react';

interface AdminDashboardProps {
  submissions: Submission[];
  competitions: Competition[];
  onSaveCompetition: (comp: Competition) => void;
  onDeleteCompetition: (id: string) => void;
  onDeleteSubmission: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  submissions,
  competitions,
  onSaveCompetition,
  onDeleteCompetition,
  onDeleteSubmission,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');
  const [previewSubmission, setPreviewSubmission] = useState<Submission | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Admin Panel Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Giao diện Admin Quản Lý
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bảng Điều Khiển Quản Trị Viên
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Quản lý danh sách bài nộp, cấu hình các cuộc thi và xuất dữ liệu báo cáo Excel
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 self-start sm:self-auto text-xs font-medium">
            <div>
              <p className="text-slate-400">Tổng bài nộp</p>
              <p className="text-lg font-bold text-white">{submissions.length}</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <p className="text-slate-400">Cuộc thi</p>
              <p className="text-lg font-bold text-indigo-300">{competitions.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto pb-1">
          <button
            id="tab-submissions"
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'submissions'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Danh sách bài nộp ({submissions.length})</span>
          </button>

          <button
            id="tab-competitions"
            onClick={() => setActiveTab('competitions')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'competitions'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Quản lý cuộc thi ({competitions.length})</span>
          </button>

          <button
            id="tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Thống kê & Excel</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'submissions' && (
        <SubmissionsTable
          submissions={submissions}
          competitions={competitions}
          onDeleteSubmission={onDeleteSubmission}
          onPreviewFile={(s) => setPreviewSubmission(s)}
        />
      )}

      {activeTab === 'competitions' && (
        <CompetitionsManager
          competitions={competitions}
          onSaveCompetition={onSaveCompetition}
          onDeleteCompetition={onDeleteCompetition}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView
          submissions={submissions}
          competitions={competitions}
        />
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        submission={previewSubmission}
        onClose={() => setPreviewSubmission(null)}
      />

    </div>
  );
};

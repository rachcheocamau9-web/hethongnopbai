import React from 'react';
import { Submission, Competition } from '../../types';
import { getCompetitionStatus } from '../../lib/storage';
import { exportSubmissionsToExcel } from '../../lib/excel';
import { BarChart3, FileText, Calendar, HardDrive, Award, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface AnalyticsViewProps {
  submissions: Submission[];
  competitions: Competition[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ submissions, competitions }) => {
  const activeCompsCount = competitions.filter((c) => getCompetitionStatus(c) === 'active').length;
  const upcomingCompsCount = competitions.filter((c) => getCompetitionStatus(c) === 'upcoming').length;
  const endedCompsCount = competitions.filter((c) => getCompetitionStatus(c) === 'ended').length;

  const totalBytes = submissions.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

  // Count submissions per competition
  const countsByComp = competitions.map((comp) => {
    const count = submissions.filter((s) => s.competitionId === comp.id).length;
    const percentage = submissions.length > 0 ? Math.round((count / submissions.length) * 100) : 0;
    return {
      comp,
      count,
      percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng số bài nộp
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">
              {submissions.length} <span className="text-xs text-slate-500 font-normal">hồ sơ</span>
            </h4>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cuộc thi đang mở
            </p>
            <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {activeCompsCount} <span className="text-xs text-slate-500 font-normal">/ {competitions.length} tổng</span>
            </h4>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dung lượng lưu trữ
            </p>
            <h4 className="text-2xl font-extrabold text-indigo-600 mt-1">
              {totalMb} <span className="text-xs text-slate-500 font-normal">MB</span>
            </h4>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trạng thái cuộc thi
            </p>
            <div className="text-xs text-slate-600 mt-1 font-medium space-y-0.5">
              <span className="text-amber-600">🟡 {upcomingCompsCount} Sắp diễn ra</span>
              <br />
              <span className="text-slate-500">🔴 {endedCompsCount} Đã kết thúc</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Distribution Chart / Progress Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Thống Kê Bài Nộp Theo Cuộc Thi
            </h3>
            <p className="text-xs text-slate-500">
              Phân bổ số lượng hồ sơ nhận được giữa các cuộc thi
            </p>
          </div>

          <button
            onClick={() => exportSubmissionsToExcel(submissions)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất báo cáo tổng hợp (Excel)</span>
          </button>
        </div>

        <div className="space-y-4">
          {countsByComp.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Chưa có dữ liệu cuộc thi</p>
          ) : (
            countsByComp.map(({ comp, count, percentage }) => (
              <div key={comp.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 line-clamp-1 max-w-md">
                    {comp.title}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {count} bài nộp ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

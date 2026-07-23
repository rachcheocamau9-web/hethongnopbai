import React, { useState } from 'react';
import { Submission, Competition } from '../../types';
import { exportSubmissionsToExcel } from '../../lib/excel';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  User, 
  Calendar, 
  CheckCircle2,
  Inbox
} from 'lucide-react';

interface SubmissionsTableProps {
  submissions: Submission[];
  competitions: Competition[];
  onDeleteSubmission: (id: string) => void;
  onPreviewFile: (submission: Submission) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  competitions,
  onDeleteSubmission,
  onPreviewFile,
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter logic
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesComp = selectedCompId === 'ALL' || sub.competitionId === selectedCompId;
    const matchesSearch =
      searchQuery.trim() === '' ||
      sub.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.phoneNumber && sub.phoneNumber.includes(searchQuery)) ||
      (sub.studentCode && sub.studentCode.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesComp && matchesSearch;
  });

  const handleExportExcel = () => {
    const compFilter = selectedCompId !== 'ALL' 
      ? competitions.find(c => c.id === selectedCompId)?.title
      : undefined;
    
    exportSubmissionsToExcel(filteredSubmissions, compFilter);
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? isoStr : d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-600" />
            Danh Sách Bài Nộp ({filteredSubmissions.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hồ sơ, xem file PDF/hình ảnh đính kèm và xuất báo cáo Excel
          </p>
        </div>

        {/* Excel Export Button */}
        <button
          id="btn-export-excel-main"
          onClick={handleExportExcel}
          disabled={filteredSubmissions.length === 0}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
            filteredSubmissions.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.01]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất File Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Search Box */}
        <div className="relative md:col-span-2">
          <input
            id="input-search-submissions"
            type="text"
            placeholder="Tìm theo Họ & tên, Tên file, Số điện thoại, Mã SV..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Competition Filter */}
        <div className="relative">
          <select
            id="select-filter-competition"
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 font-medium bg-slate-50/50"
          >
            <option value="ALL">-- Tất cả cuộc thi --</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 text-center w-12">STT</th>
              <th className="py-3 px-4">Mã / Thí Sinh</th>
              <th className="py-3 px-4">Cuộc Thi</th>
              <th className="py-3 px-4">File Đã Nộp</th>
              <th className="py-3 px-4">Thời Gian Nộp</th>
              <th className="py-3 px-4 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">Không tìm thấy bài nộp nào</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc cuộc thi</p>
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub, index) => {
                const isPdf = sub.fileType.includes('pdf') || sub.fileName.endsWith('.pdf');
                return (
                  <tr key={sub.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-bold">{index + 1}</td>
                    
                    {/* Participant Details */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          {sub.fullName}
                        </span>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {sub.id}
                          </span>
                          {sub.phoneNumber && <span>📞 {sub.phoneNumber}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Competition Title */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <span className="line-clamp-2 font-semibold text-slate-800" title={sub.competitionTitle}>
                        {sub.competitionTitle}
                      </span>
                    </td>

                    {/* File Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isPdf ? (
                          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <div className="truncate max-w-[180px]">
                          <p className="font-semibold text-slate-900 truncate text-xs" title={sub.fileName}>
                            {sub.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(sub.fileSize / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Submitted At */}
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(sub.submittedAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onPreviewFile(sub)}
                          title="Xem / Tải file"
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem file</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa bài nộp của "${sub.fullName}"?`)) {
                              onDeleteSubmission(sub.id);
                            }
                          }}
                          title="Xóa bài nộp"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

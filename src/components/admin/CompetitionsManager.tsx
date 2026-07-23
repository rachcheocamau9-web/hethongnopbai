import React, { useState } from 'react';
import { Competition } from '../../types';
import { getCompetitionStatus } from '../../lib/storage';
import { 
  Plus, 
  Calendar, 
  Clock, 
  FileText, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface CompetitionsManagerProps {
  competitions: Competition[];
  onSaveCompetition: (comp: Competition) => void;
  onDeleteCompetition: (id: string) => void;
}

export const CompetitionsManager: React.FC<CompetitionsManagerProps> = ({
  competitions,
  onSaveCompetition,
  onDeleteCompetition,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(25);
  const [allowedPdf, setAllowedPdf] = useState(true);
  const [allowedImage, setAllowedImage] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);

  // Helper for formatting local datetime for input[type="datetime-local"]
  const toLocalDatetimeString = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Open modal for adding new competition
  const handleOpenAdd = () => {
    setEditingComp(null);
    setTitle('');
    setDescription('');
    
    // Default start date = today local time, default end date = +30 days local time
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    setStartDate(toLocalDatetimeString(now));
    setEndDate(toLocalDatetimeString(future));
    
    setMaxFileSizeMb(25);
    setAllowedPdf(true);
    setAllowedImage(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (comp: Competition) => {
    setEditingComp(comp);
    setTitle(comp.title);
    setDescription(comp.description);
    setStartDate(comp.startDate);
    setEndDate(comp.endDate);
    setMaxFileSizeMb(comp.maxFileSizeMb || 25);
    setAllowedPdf(comp.allowedTypes.includes('pdf'));
    setAllowedImage(comp.allowedTypes.includes('image'));
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save competition
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Vui lòng nhập tên cuộc thi.');
      return;
    }

    if (!startDate || !endDate) {
      setFormError('Vui lòng chọn ngày bắt đầu và ngày kết thúc.');
      return;
    }

    if (new Date(startDate).getTime() >= new Date(endDate).getTime()) {
      setFormError('Ngày kết thúc phải diễn ra sau ngày bắt đầu.');
      return;
    }

    if (!allowedPdf && !allowedImage) {
      setFormError('Vui lòng chọn ít nhất một định dạng tệp được phép (PDF hoặc Hình ảnh).');
      return;
    }

    const allowedTypes: ('pdf' | 'image')[] = [];
    if (allowedPdf) allowedTypes.push('pdf');
    if (allowedImage) allowedTypes.push('image');

    const compToSave: Competition = {
      id: editingComp ? editingComp.id : `comp-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      allowedTypes,
      maxFileSizeMb: Number(maxFileSizeMb) || 25,
      createdAt: editingComp ? editingComp.createdAt : new Date().toISOString(),
    };

    onSaveCompetition(compToSave);
    setIsModalOpen(false);
  };

  const formatDateVi = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Danh Sách Cuộc Thi
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý ngày bắt đầu, ngày kết thúc và cấu hình nhận tài liệu bài thi
          </p>
        </div>

        <button
          id="btn-add-competition"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Cuộc Thi Mới</span>
        </button>
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Chưa có cuộc thi nào được tạo</p>
            <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Cuộc Thi Mới" để bắt đầu thiết lập</p>
          </div>
        ) : (
          competitions.map((comp) => {
            const status = getCompetitionStatus(comp);
            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Status Indicator Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  status === 'active' ? 'bg-emerald-500' : status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-400'
                }`} />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : status === 'upcoming'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {status === 'active' ? '🟢 Đang mở nộp' : status === 'upcoming' ? '🟡 Sắp diễn ra' : '🔴 Đã kết thúc'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(comp)}
                        title="Sửa cuộc thi"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa cuộc thi "${comp.title}"?`)) {
                            onDeleteCompetition(comp.id);
                          }
                        }}
                        title="Xóa cuộc thi"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base line-clamp-2">
                    {comp.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-3">
                    {comp.description || 'Chưa có mô tả thêm.'}
                  </p>
                </div>

                {/* Dates & Constraints */}
                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Bắt đầu:
                    </span>
                    <strong className="text-slate-800">{formatDateVi(comp.startDate)}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600" /> Kết thúc:
                    </span>
                    <strong className="text-slate-800">{formatDateVi(comp.endDate)}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Định dạng tệp:</span>
                    <span className="font-semibold text-slate-700">
                      {comp.allowedTypes.map(t => t.toUpperCase()).join(' & ')} (Max {comp.maxFileSizeMb}MB)
                    </span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden relative">
            
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  {editingComp ? 'Chỉnh Sửa Cuộc Thi' : 'Thêm Cuộc Thi Mới'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Thiết lập ngày bắt đầu và kết thúc nhận bài nộp
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Tên cuộc thi <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-comp-title"
                  type="text"
                  required
                  placeholder="Ví dụ: Cuộc Thi Ý Tưởng Sáng Tạo 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">Mô tả cuộc thi</label>
                <textarea
                  id="input-comp-desc"
                  rows={2}
                  placeholder="Mô tả thể lệ, quy định nộp bài..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm"
                ></textarea>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Ngày & giờ bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-comp-start-date"
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    Ngày & giờ kết thúc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-comp-end-date"
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Constraint settings */}
              <div className="pt-2 border-t border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Định dạng tệp hỗ trợ:
                </label>
                <div className="flex items-center gap-6 text-xs font-medium text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowedPdf}
                      onChange={(e) => setAllowedPdf(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>File PDF (.pdf)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowedImage}
                      onChange={(e) => setAllowedImage(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Hình ảnh (PNG, JPG, WEBP)</span>
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="font-semibold text-slate-700">Dung lượng tối đa (MB):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={maxFileSizeMb}
                    onChange={(e) => setMaxFileSizeMb(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-center font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Submit Modal Button */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  id="btn-save-comp-submit"
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingComp ? 'Lưu thay đổi' : 'Tạo cuộc thi'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

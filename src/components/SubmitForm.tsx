import React, { useState, useRef, useEffect } from 'react';
import { Competition, Submission } from '../types';
import { getCompetitionStatus } from '../lib/storage';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  X, 
  User, 
  Info,
  Sparkles
} from 'lucide-react';

interface SubmitFormProps {
  competitions: Competition[];
  onSubmissionSuccess: (submission: Submission) => void;
}

export const SubmitForm: React.FC<SubmitFormProps> = ({ competitions, onSubmissionSuccess }) => {
  const activeCompetitions = competitions.filter(c => getCompetitionStatus(c) === 'active');
  const [selectedCompId, setSelectedCompId] = useState<string>(
    activeCompetitions.length > 0 ? activeCompetitions[0].id : (competitions[0]?.id || '')
  );

  useEffect(() => {
    if (competitions.length > 0) {
      const exists = competitions.some(c => c.id === selectedCompId);
      if (!selectedCompId || !exists) {
        const activeComps = competitions.filter(c => getCompetitionStatus(c) === 'active');
        if (activeComps.length > 0) {
          setSelectedCompId(activeComps[0].id);
        } else {
          setSelectedCompId(competitions[0].id);
        }
      }
    }
  }, [competitions, selectedCompId]);

  const [fullName, setFullName] = useState('');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // General form errors
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedComp = competitions.find(c => c.id === selectedCompId);
  const compStatus = selectedComp ? getCompetitionStatus(selectedComp) : 'ended';

  // Format dates for display
  const formatDateVi = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Clean up object URLs when file changes
  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    setFileError(null);
    if (!selectedFile) {
      setFile(null);
      setFilePreviewUrl(null);
      return;
    }

    // Validate type: PDF or Images
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    const isImage = selectedFile.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(selectedFile.name);

    if (!isPdf && !isImage) {
      setFileError('Định dạng file không hỗ trợ. Vui lòng chỉ nộp file PDF hoặc Hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    // Validate size limit (max filesize in selected competition or 25MB default)
    const maxMb = selectedComp?.maxFileSizeMb || 25;
    if (selectedFile.size > maxMb * 1024 * 1024) {
      setFileError(`Dung lượng file vượt quá giới hạn tối đa ${maxMb}MB.`);
      return;
    }

    setFile(selectedFile);

    // Create preview for image or blob url for PDF
    if (isImage) {
      const preview = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(preview);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Convert File to Base64
  const fileToBase64 = (fileToConvert: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileToConvert);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedComp) {
      setFormError('Vui lòng chọn cuộc thi.');
      return;
    }

    if (compStatus !== 'active') {
      setFormError('Cuộc thi này hiện không trong thời gian nhận bài nộp.');
      return;
    }

    if (!fullName.trim()) {
      setFormError('Vui lòng điền Họ và tên người nộp.');
      return;
    }

    if (!file) {
      setFormError('Vui lòng tải lên file tài liệu (PDF hoặc Hình ảnh).');
      return;
    }

    try {
      setIsSubmitting(true);

      const base64Data = await fileToBase64(file);
      const submissionId = `SUB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newSubmission: Submission = {
        id: submissionId,
        competitionId: selectedComp.id,
        competitionTitle: selectedComp.title,
        fullName: fullName.trim(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
        fileData: base64Data,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };

      await onSubmissionSuccess(newSubmission);

      // Reset form
      setFullName('');
      setFile(null);
      setFilePreviewUrl(null);

    } catch (err: any) {
      console.error('Submission error:', err);
      setFormError(err?.message || 'Có lỗi xảy ra khi xử lý file tài liệu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Cổng Nộp Bài Trực Tuyến
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Nộp Tài Liệu Cuộc Thi
            </h2>
            <p className="text-blue-100/80 text-sm mt-1 max-w-xl">
              Điền họ tên, chọn cuộc thi tương ứng và đính kèm tệp bài thi dạng PDF hoặc hình ảnh để hệ thống ghi nhận.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {formError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lỗi gửi dữ liệu</p>
              <p>{formError}</p>
            </div>
          </div>
        )}

        {/* Competition Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Chọn Cuộc Thi Phù Hợp <span className="text-rose-500">*</span>
          </label>
          <select
            id="select-competition"
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 font-medium bg-slate-50/50 shadow-sm transition-all"
          >
            {competitions.length === 0 ? (
              <option value="">Chưa có cuộc thi nào</option>
            ) : (
              competitions.map((comp) => {
                const status = getCompetitionStatus(comp);
                const statusTag = status === 'active' ? '🟢 Đang mở' : status === 'upcoming' ? '🟡 Sắp mở' : '🔴 Đã kết thúc';
                return (
                  <option key={comp.id} value={comp.id}>
                    {comp.title} ({statusTag})
                  </option>
                );
              })
            )}
          </select>

          {/* Selected Competition Info Card */}
          {selectedComp && (
            <div className={`p-4 rounded-xl border text-sm mt-3 ${
              compStatus === 'active'
                ? 'bg-blue-50/80 border-blue-200 text-slate-700'
                : compStatus === 'upcoming'
                ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                : 'bg-rose-50/80 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center justify-between font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  {selectedComp.title}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  compStatus === 'active'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : compStatus === 'upcoming'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {compStatus === 'active' ? 'Đang nhận bài nộp' : compStatus === 'upcoming' ? 'Chưa mở nộp' : 'Đã hết hạn'}
                </span>
              </div>
              <p className="text-slate-600 text-xs mb-2.5">{selectedComp.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-200/60 pt-2 font-medium">
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bắt đầu: <strong>{formatDateVi(selectedComp.startDate)}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Kết thúc: <strong>{formatDateVi(selectedComp.endDate)}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Box ghi Họ và tên (Crucial requirement) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Box ghi Họ và Tên <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-full-name"
            type="text"
            required
            placeholder="Nhập đầy đủ Họ và tên (Ví dụ: Nguyễn Văn An)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium placeholder-slate-400 bg-slate-50/30 transition-all"
          />
        </div>

        {/* Box Nộp File (PDF + Hình ảnh) */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Box Nộp File Tài Liệu (PDF / Hình ảnh) <span className="text-rose-500">*</span>
            </span>
            <span className="text-xs text-slate-500 font-normal">
              Tối đa {selectedComp?.maxFileSizeMb || 25}MB
            </span>
          </label>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                : file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
            />

            {!file ? (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Kéo thả file vào đây, hoặc <span className="text-blue-600 underline">bấm để chọn file</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ file tài liệu <strong className="text-slate-700">PDF</strong> hoặc file hình ảnh <strong className="text-slate-700">PNG, JPG, WEBP</strong>
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-rose-500" /> PDF Document
                  </span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Hình ảnh (Image)
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <FileText className="w-8 h-8 text-rose-600" />
                  )}
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Tài liệu'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileChange(null);
                    }}
                    className="p-1 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-600 transition-colors ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* File Image Preview if Image */}
                {filePreviewUrl && (
                  <div className="mt-3 relative max-w-xs mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-md">
                    <img 
                      src={filePreviewUrl} 
                      alt="File preview" 
                      className="max-h-48 w-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-medium backdrop-blur-sm">
                      Xem trước hình ảnh
                    </div>
                  </div>
                )}

                {/* File PDF Indicator */}
                {!filePreviewUrl && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200">
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                    Đã chọn file PDF sẵn sàng nộp
                  </div>
                )}
              </div>
            )}
          </div>

          {fileError && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            id="btn-submit-document"
            type="submit"
            disabled={isSubmitting || compStatus !== 'active'}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              compStatus !== 'active'
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : isSubmitting
                ? 'bg-blue-500 text-white cursor-wait opacity-90'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.005]'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang tải tệp & ghi nhận hệ thống...</span>
              </>
            ) : compStatus === 'active' ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>NỘP TÀI LIỆU CUỘC THI</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>CUỘC THI KHÔNG MỞ NỘP BÀI</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Competition, Submission } from './types';
import { 
  getCompetitions, 
  saveCompetition, 
  deleteCompetition as removeCompFromDb,
  getSubmissions, 
  addSubmission, 
  deleteSubmission as removeSubFromDb,
  getCompetitionStatus 
} from './lib/storage';
import { Header } from './components/Header';
import { SubmitForm } from './components/SubmitForm';
import { SuccessModal } from './components/SuccessModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  FileCheck, 
  Shield, 
  Award, 
  Sparkles, 
  Clock, 
  FileText, 
  CheckCircle2, 
  FileSpreadsheet,
  Info
} from 'lucide-react';

export default function App() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View state
  const [activeView, setActiveView] = useState<'user' | 'admin'>('user');
  
  // Admin login session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('tro_ly_admin_logged_in') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Submission result modal
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);

  // Real-time Data Fetching & Sync Polling
  useEffect(() => {
    let isMounted = true;

    async function syncData(silent = false) {
      try {
        if (!silent) setIsLoading(true);
        const [compList, subList] = await Promise.all([
          getCompetitions(),
          getSubmissions()
        ]);
        if (isMounted) {
          setCompetitions(compList);
          setSubmissions(subList);
        }
      } catch (err) {
        console.error('Failed to sync data from server:', err);
      } finally {
        if (isMounted && !silent) {
          setIsLoading(false);
        }
      }
    }

    // Initial load
    syncData(false);

    // Continuous background sync polling every 3 seconds for real-time multi-device updates
    const intervalId = setInterval(() => {
      syncData(true);
    }, 3000);

    // Sync immediately when browser window regains focus
    const handleFocus = () => {
      syncData(true);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Admin login handler
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('tro_ly_admin_logged_in', 'true');
    setActiveView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('tro_ly_admin_logged_in');
    setActiveView('user');
  };

  // Open admin interface (prompts password if not logged in)
  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setActiveView('admin');
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  // Handle new submission from user
  const handleSubmissionSuccess = async (newSub: Submission) => {
    await addSubmission(newSub);
    setSubmissions((prev) => [newSub, ...prev]);
    setLastSubmission(newSub); // Triggers success modal
  };

  // Competition CRUD handlers
  const handleSaveCompetition = async (comp: Competition) => {
    await saveCompetition(comp);
    const updatedComps = await getCompetitions();
    setCompetitions(updatedComps);
  };

  const handleDeleteCompetition = async (id: string) => {
    await removeCompFromDb(id);
    const updatedComps = await getCompetitions();
    setCompetitions(updatedComps);
  };

  // Submission Delete handler
  const handleDeleteSubmission = async (id: string) => {
    await removeSubFromDb(id);
    const updatedSubs = await getSubmissions();
    setSubmissions(updatedSubs);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 font-sans flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Header */}
      <Header
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={handleOpenAdmin}
        onAdminLogout={handleAdminLogout}
        activeView={activeView}
        setActiveView={(view) => {
          if (view === 'admin' && !isAdminLoggedIn) {
            setIsAdminLoginModalOpen(true);
          } else {
            setActiveView(view);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">Đang khởi tạo hệ thống trợ lý nộp tài liệu...</p>
          </div>
        ) : activeView === 'admin' && isAdminLoggedIn ? (
          /* Admin View */
          <AdminDashboard
            submissions={submissions}
            competitions={competitions}
            onSaveCompetition={handleSaveCompetition}
            onDeleteCompetition={handleDeleteCompetition}
            onDeleteSubmission={handleDeleteSubmission}
          />
        ) : (
          /* User / Participant Submission View */
          <div className="space-y-8 animate-fadeIn">
            
            {/* Main Form Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Submission Form (8 cols) */}
              <div className="lg:col-span-8">
                <SubmitForm
                  competitions={competitions}
                  onSubmissionSuccess={handleSubmissionSuccess}
                />
              </div>

              {/* Right Column: Info & Active Competitions Side Widget (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Admin Prompt Widget */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Giao diện Quản trị viên</h4>
                      <p className="text-[11px] text-slate-400">Trang quản trị nội bộ dành cho Ban Tổ Chức</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Dành cho ban tổ chức: Thêm cuộc thi mới, cài đặt ngày bắt đầu / kết thúc, duyệt hồ sơ và xuất danh sách file Excel.
                  </p>
                  <button
                    onClick={handleOpenAdmin}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Truy cập quản lý Admin</span>
                  </button>
                </div>

                {/* Active Competitions Quick Info */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Award className="w-4 h-4 text-blue-600" />
                    Cuộc Thi Đang Mở Nộp Bài ({competitions.filter(c => getCompetitionStatus(c) === 'active').length})
                  </h4>

                  <div className="space-y-3">
                    {competitions.length === 0 ? (
                      <p className="text-xs text-slate-400">Chưa có cuộc thi nào</p>
                    ) : (
                      competitions.map((c) => {
                        const status = getCompetitionStatus(c);
                        return (
                          <div
                            key={c.id}
                            className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                              status === 'active'
                                ? 'bg-blue-50/50 border-blue-200/80'
                                : 'bg-slate-50 border-slate-200 opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="font-bold text-slate-800 line-clamp-1">{c.title}</h5>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'upcoming'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {status === 'active' ? 'Đang mở' : status === 'upcoming' ? 'Sắp mở' : 'Đã hết hạn'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Hạn nộp: <strong>{new Date(c.endDate).toLocaleDateString('vi-VN')}</strong>
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Help / Guidance Card */}
                <div className="bg-blue-50/80 border border-blue-200/70 rounded-2xl p-5 text-xs text-blue-950 space-y-2">
                  <h5 className="font-bold flex items-center gap-1.5 text-blue-900">
                    <Info className="w-4 h-4 text-blue-600" />
                    Hướng dẫn nộp tài liệu
                  </h5>
                  <ul className="space-y-1.5 list-disc list-inside text-blue-900/80 leading-relaxed">
                    <li>Điền đầy đủ <strong>Họ và tên</strong> người nộp bài.</li>
                    <li>Định dạng file được hỗ trợ: <strong>PDF</strong> hoặc <strong>Hình ảnh (PNG, JPG, WEBP)</strong>.</li>
                    <li>Sau khi nộp thành công, hệ thống sẽ tự động cấp <strong>Mã xác nhận nộp bài</strong>.</li>
                  </ul>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Trợ Lý Nộp Tài Liệu Cuộc Thi. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center space-x-4 text-slate-500">
            <span className="flex items-center gap-1"><FileCheck className="w-3.5 h-3.5 text-blue-400" /> Hỗ trợ PDF & Hình ảnh</span>
            <span className="flex items-center gap-1"><FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Xuất Excel</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-indigo-400" /> Trang Admin</span>
          </div>
        </div>
      </footer>

      {/* Success Modal Popup */}
      {lastSubmission && (
        <SuccessModal
          submission={lastSubmission}
          onClose={() => setLastSubmission(null)}
          onReset={() => setLastSubmission(null)}
        />
      )}

      {/* Admin Password Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

    </div>
  );
}

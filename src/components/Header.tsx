import React from 'react';
import { FileCheck, Shield, LogOut, Award } from 'lucide-react';

interface HeaderProps {
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  activeView: 'user' | 'admin';
  setActiveView: (view: 'user' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdminLoggedIn,
  onOpenAdminLogin,
  onAdminLogout,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveView('user')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
              Trợ Lý Nộp Tài Liệu
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Award className="w-3 h-3 mr-1" /> Cuộc Thi
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Cổng nộp tệp PDF & Hình ảnh chính thức
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {isAdminLoggedIn ? (
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Quyền Admin
              </div>

              <button
                id="btn-admin-view-toggle"
                onClick={() => setActiveView(activeView === 'admin' ? 'user' : 'admin')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeView === 'admin'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {activeView === 'admin' ? 'Trở về trang nộp bài' : 'Giao diện Quản trị'}
              </button>

              <button
                id="btn-admin-logout"
                onClick={onAdminLogout}
                title="Đăng xuất Admin"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-admin-login"
              onClick={onOpenAdminLogin}
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-all shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Đăng nhập Admin</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

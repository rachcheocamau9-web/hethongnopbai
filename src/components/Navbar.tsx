import React from 'react';
import { Menu, Moon, Sun, Sparkles, Search, FileText } from 'lucide-react';

interface NavbarProps {
  documentTitle?: string;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  onOpenMobileSidebar: () => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  documentTitle,
  isDarkMode,
  setIsDarkMode,
  onOpenMobileSidebar,
  onOpenAiAssistant
}) => {
  return (
    <header className="h-14 px-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 select-none z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Menu size={20} />
        </button>

        {/* Current Document Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
            {documentTitle || 'SmartDoc Workspace'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Quick AI Trigger */}
        <button
          onClick={onOpenAiAssistant}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Sparkles size={14} />
          <span className="hidden sm:inline">Trợ lý AI</span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
        >
          {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

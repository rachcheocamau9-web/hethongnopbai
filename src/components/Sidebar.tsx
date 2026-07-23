import React, { useState } from 'react';
import { 
  FileText, 
  Star, 
  Folder as FolderIcon, 
  LayoutTemplate, 
  Archive, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Tag, 
  FolderPlus, 
  Briefcase, 
  Users, 
  BookOpen, 
  ChevronDown
} from 'lucide-react';
import { Folder, ViewTab } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  activeFolderId: string | null;
  activeTag: string | null;
  folders: Folder[];
  docCounts: {
    all: number;
    favorites: number;
    archive: number;
    trash: number;
    folders: Record<string, number>;
  };
  allTags: string[];
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onSelectTab: (tab: ViewTab, folderId?: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  onCreateNewDoc: (templateId?: string) => void;
  onOpenAiDraft: () => void;
  onOpenTemplatesModal: () => void;
  onCreateFolder: (name: string, icon: string, color: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeFolderId,
  activeTag,
  folders,
  docCounts,
  allTags,
  isCollapsed,
  setIsCollapsed,
  onSelectTab,
  onSelectTag,
  onCreateNewDoc,
  onOpenAiDraft,
  onOpenTemplatesModal,
  onCreateFolder
}) => {
  const [showNewDocDropdown, setShowNewDocDropdown] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200');

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), 'Folder', newFolderColor);
    setNewFolderName('');
    setShowFolderModal(false);
  };

  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase size={16} />;
      case 'Users': return <Users size={16} />;
      case 'BookOpen': return <BookOpen size={16} />;
      default: return <FolderIcon size={16} />;
    }
  };

  return (
    <aside
      className={`relative h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-all duration-300 select-none z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                SmartDoc
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  AI
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Soạn thảo & Quản lý</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <FileText size={20} />
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            isCollapsed ? 'absolute -right-3 top-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs' : ''
          }`}
          title={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Document Button */}
      <div className="p-3 relative">
        {!isCollapsed ? (
          <div>
            <button
              onClick={() => setShowNewDocDropdown(!showNewDocDropdown)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-between shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plus size={18} />
                <span>Tạo tài liệu mới</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showNewDocDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showNewDocDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNewDocDropdown(false)} />
                <div className="absolute left-3 right-3 top-14 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 z-40 space-y-1">
                  <button
                    onClick={() => {
                      setShowNewDocDropdown(false);
                      onCreateNewDoc();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                  >
                    <FileText size={16} className="text-indigo-500" />
                    <span>Tài liệu trống</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowNewDocDropdown(false);
                      onOpenAiDraft();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Soạn bằng Trợ lý AI</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowNewDocDropdown(false);
                      onOpenTemplatesModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LayoutTemplate size={16} className="text-amber-500" />
                    <span>Thư viện mẫu...</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => onCreateNewDoc()}
            className="w-10 h-10 mx-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-sm cursor-pointer"
            title="Tạo tài liệu mới"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-6 custom-scrollbar">
        {/* Core Navigation */}
        <div className="space-y-1">
          {/* All Docs */}
          <button
            onClick={() => {
              onSelectTab('all');
              onSelectTag(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'all' && !activeTag
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Tất cả tài liệu"
          >
            <div className="flex items-center gap-2.5">
              <FileText size={18} />
              {!isCollapsed && <span>Tất cả tài liệu</span>}
            </div>
            {!isCollapsed && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                {docCounts.all}
              </span>
            )}
          </button>

          {/* Favorites */}
          <button
            onClick={() => {
              onSelectTab('favorites');
              onSelectTag(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'favorites'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Yêu thích"
          >
            <div className="flex items-center gap-2.5">
              <Star size={18} className="text-amber-500 fill-amber-500/20" />
              {!isCollapsed && <span>Tài liệu yêu thích</span>}
            </div>
            {!isCollapsed && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                {docCounts.favorites}
              </span>
            )}
          </button>

          {/* Templates */}
          <button
            onClick={onOpenTemplatesModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Tài liệu mẫu"
          >
            <div className="flex items-center gap-2.5">
              <LayoutTemplate size={18} className="text-emerald-500" />
              {!isCollapsed && <span>Mẫu tài liệu</span>}
            </div>
          </button>
        </div>

        {/* Folders Section */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Thư mục</span>
              <button
                onClick={() => setShowFolderModal(true)}
                className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tạo thư mục mới"
              >
                <FolderPlus size={15} />
              </button>
            </div>
          )}

          <div className="space-y-1">
            {folders.map((folder) => {
              const isSelected = currentTab === 'folder' && activeFolderId === folder.id;
              const count = docCounts.folders[folder.id] || 0;

              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    onSelectTab('folder', folder.id);
                    onSelectTag(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title={folder.name}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`p-1 rounded-md ${folder.color}`}>
                      {getFolderIcon(folder.icon)}
                    </span>
                    {!isCollapsed && <span className="truncate">{folder.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-xs text-slate-400 font-normal">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags Section */}
        {!isCollapsed && allTags.length > 0 && (
          <div>
            <div className="px-3 mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Tag size={13} />
              <span>Thẻ đánh dấu</span>
            </div>
            <div className="flex flex-wrap gap-1 px-2">
              {allTags.map((tag) => {
                const isSelected = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => onSelectTag(isSelected ? null : tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Archives & Trash */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
          <button
            onClick={() => {
              onSelectTab('archive');
              onSelectTag(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'archive'
                ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Lưu trữ"
          >
            <div className="flex items-center gap-2.5">
              <Archive size={18} />
              {!isCollapsed && <span>Lưu trữ</span>}
            </div>
            {!isCollapsed && (
              <span className="text-xs text-slate-400">{docCounts.archive}</span>
            )}
          </button>

          <button
            onClick={() => {
              onSelectTab('trash');
              onSelectTag(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'trash'
                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Thùng rác"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 size={18} className="text-red-500" />
              {!isCollapsed && <span>Thùng rác</span>}
            </div>
            {!isCollapsed && (
              <span className="text-xs text-slate-400">{docCounts.trash}</span>
            )}
          </button>
        </div>
      </div>

      {/* Modal create folder */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Tạo Thư Mục Mới</h3>
            <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Tên thư mục
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ví dụ: Kế hoạch 2026..."
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer"
                >
                  Tạo thư mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

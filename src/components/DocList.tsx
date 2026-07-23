import React, { useState } from 'react';
import { 
  Search, 
  Grid, 
  List as ListIcon, 
  Star, 
  Folder as FolderIcon, 
  Tag, 
  MoreVertical, 
  Trash2, 
  Archive, 
  RotateCcw, 
  FileText, 
  Plus, 
  Clock, 
  Calendar, 
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { DocumentItem, Folder, ViewTab } from '../types';

interface DocListProps {
  documents: DocumentItem[];
  folders: Folder[];
  currentTab: ViewTab;
  activeFolderId: string | null;
  activeTag: string | null;
  selectedDocId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectDoc: (id: string) => void;
  onCreateNewDoc: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onMoveToTrash: (id: string, e: React.MouseEvent) => void;
  onRestoreFromTrash: (id: string, e: React.MouseEvent) => void;
  onArchiveDoc: (id: string, e: React.MouseEvent) => void;
  onUnarchiveDoc: (id: string, e: React.MouseEvent) => void;
  onOpenAiDraft: () => void;
}

export const DocList: React.FC<DocListProps> = ({
  documents,
  folders,
  currentTab,
  activeFolderId,
  activeTag,
  selectedDocId,
  searchQuery,
  setSearchQuery,
  onSelectDoc,
  onCreateNewDoc,
  onToggleFavorite,
  onMoveToTrash,
  onRestoreFromTrash,
  onArchiveDoc,
  onUnarchiveDoc,
  onOpenAiDraft
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'created'>('updated');
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);

  // Get current section heading name
  const getSectionTitle = () => {
    if (activeTag) return `Thẻ #${activeTag}`;
    if (currentTab === 'favorites') return 'Tài liệu Yêu thích';
    if (currentTab === 'archive') return 'Kho Lưu trữ';
    if (currentTab === 'trash') return 'Thùng rác';
    if (currentTab === 'folder' && activeFolderId) {
      const folder = folders.find(f => f.id === activeFolderId);
      return folder ? folder.name : 'Thư mục';
    }
    return 'Tất cả tài liệu';
  };

  // Format relative time in Vietnamese
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Calculate word count & reading time
  const getStats = (content: string) => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readMins = Math.max(1, Math.ceil(words / 200));
    return { words, readMins };
  };

  // Sorted documents
  const sortedDocs = [...documents].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'vi');
    if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden border-r border-slate-200/80 dark:border-slate-800">
      {/* Search and Section Header Bar */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{getSectionTitle()}</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {sortedDocs.length}
            </span>
          </h2>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAiDraft}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-medium flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
              title="Soạn thảo nhanh bằng AI"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">AI Soạn bài</span>
            </button>

            <button
              onClick={onCreateNewDoc}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Tạo mới</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tài liệu, thẻ hoặc nội dung..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <ArrowUpDown size={13} className="text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="updated" className="dark:bg-slate-800">Sửa đổi gần đây</option>
                <option value="created" className="dark:bg-slate-800">Ngày tạo mới</option>
                <option value="title" className="dark:bg-slate-800">Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* Grid / List Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Chế độ Lưới"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Chế độ Danh sách"
            >
              <ListIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Document List Container */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {sortedDocs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 border border-indigo-100 dark:border-indigo-900">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Không tìm thấy tài liệu</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                {searchQuery
                  ? `Không có kết quả nào khớp với "${searchQuery}"`
                  : 'Chưa có tài liệu nào trong danh mục này. Hãy bắt đầu tạo tài liệu mới ngay!'}
              </p>
            </div>
            <button
              onClick={onCreateNewDoc}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>Tạo tài liệu mới</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
            {sortedDocs.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              const folder = folders.find((f) => f.id === doc.folderId);
              const { words, readMins } = getStats(doc.content);

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  {/* Top Cover or Icon */}
                  <div>
                    {doc.coverImage && (
                      <div className="h-20 -mx-4 -mt-4 mb-3 rounded-t-2xl overflow-hidden relative">
                        <img src={doc.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{doc.icon || '📄'}</span>
                        {folder && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${folder.color}`}>
                            {folder.name}
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      {!doc.isTrash && (
                        <button
                          onClick={(e) => onToggleFavorite(doc.id, e)}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            doc.isFavorite
                              ? 'text-amber-500'
                              : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'
                          }`}
                          title={doc.isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                        >
                          <Star size={16} fill={doc.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-2.5 line-clamp-2 leading-snug">
                      {doc.title || 'Tài liệu chưa đặt tên'}
                    </h3>

                    {/* Snippet */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {doc.content.replace(/[#*`~-]/g, '').slice(0, 100) || 'Chưa có nội dung...'}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(doc.updatedAt)}
                      </span>
                      <span>{words} từ • {readMins} phút</span>
                    </div>

                    {/* Action dropdown or quick trash */}
                    <div className="flex items-center gap-1">
                      {doc.isTrash ? (
                        <button
                          onClick={(e) => onRestoreFromTrash(doc.id, e)}
                          className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                          title="Khôi phục tài liệu"
                        >
                          <RotateCcw size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => onMoveToTrash(doc.id, e)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Chuyển vào thùng rác"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-1.5">
            {sortedDocs.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              const folder = folders.find((f) => f.id === doc.folderId);
              const { words } = getStats(doc.content);

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className={`group p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xl shrink-0">{doc.icon || '📄'}</span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {doc.title || 'Tài liệu chưa đặt tên'}
                        </h3>
                        {folder && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${folder.color}`}>
                            {folder.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {doc.content.replace(/[#*`~-]/g, '').slice(0, 80) || 'Chưa có nội dung'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400">
                    <span className="hidden md:inline">{words} từ</span>
                    <span className="hidden sm:inline">{formatTime(doc.updatedAt)}</span>

                    {!doc.isTrash && (
                      <button
                        onClick={(e) => onToggleFavorite(doc.id, e)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          doc.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                        }`}
                      >
                        <Star size={16} fill={doc.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    )}

                    {doc.isTrash ? (
                      <button
                        onClick={(e) => onRestoreFromTrash(doc.id, e)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950 cursor-pointer"
                      >
                        <RotateCcw size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => onMoveToTrash(doc.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

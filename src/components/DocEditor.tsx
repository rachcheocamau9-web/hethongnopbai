import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Table, 
  Minus, 
  Sparkles, 
  Eye, 
  Columns, 
  Edit3, 
  Maximize2, 
  History, 
  Download, 
  Share2, 
  Tag as TagIcon, 
  Folder as FolderIcon, 
  Image as ImageIcon, 
  Clock, 
  Save, 
  Check, 
  X, 
  Plus, 
  AlertCircle,
  Lightbulb,
  FileText
} from 'lucide-react';
import { DocumentItem, Folder, EditorMode } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DocEditorProps {
  document: DocumentItem | null;
  folders: Folder[];
  onUpdateDocument: (updated: DocumentItem) => void;
  onOpenAiAssistant: (task?: string) => void;
  onOpenVersionHistory: () => void;
  onOpenExportModal: () => void;
}

const EMOJI_OPTIONS = ['🚀', '📄', '📊', '📝', '📚', '💡', '📌', '🎯', '⚙️', '🌟', '💻', '🎨', '💼', '🏆', '🔒'];

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
];

export const DocEditor: React.FC<DocEditorProps> = ({
  document,
  folders,
  onUpdateDocument,
  onOpenAiAssistant,
  onOpenVersionHistory,
  onOpenExportModal
}) => {
  const [editorMode, setEditorMode] = useState<EditorMode>('split');
  const [newTagInput, setNewTagInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 mb-4 border border-indigo-100 dark:border-indigo-900">
          <FileText size={40} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Chưa chọn tài liệu nào</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Chọn một tài liệu từ danh sách ở bên trái hoặc bấm tạo tài liệu mới để bắt đầu soạn thảo.
        </p>
      </div>
    );
  }

  // Handle document fields change
  const handleChange = (field: keyof DocumentItem, value: any) => {
    setIsSaved(false);
    onUpdateDocument({
      ...document,
      [field]: value,
      updatedAt: new Date().toISOString()
    });
    setTimeout(() => setIsSaved(true), 600);
  };

  // Helper formatting insert into textarea
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = document.content.substring(start, end) || defaultText;

    const newContent =
      document.content.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      document.content.substring(end);

    handleChange('content', newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  // Toggle checklist line
  const handleToggleChecklist = (lineIndex: number) => {
    const lines = document.content.split('\n');
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      if (line.trim().startsWith('- [ ]')) {
        lines[lineIndex] = line.replace('- [ ]', '- [x]');
      } else if (line.trim().startsWith('- [x]') || line.trim().startsWith('- [X]')) {
        lines[lineIndex] = line.replace(/- \[x\]|- \[X\]/, '- [ ]');
      }
      handleChange('content', lines.join('\n'));
    }
  };

  // Add tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim().replace(/^#/, '');
    if (!document.tags.includes(tag)) {
      handleChange('tags', [...document.tags, tag]);
    }
    setNewTagInput('');
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    handleChange('tags', document.tags.filter(t => t !== tagToRemove));
  };

  // Save manual snapshot
  const handleSaveSnapshot = () => {
    const newVersion = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: document.title,
      content: document.content,
      note: 'Lưu thủ công'
    };
    onUpdateDocument({
      ...document,
      versionHistory: [newVersion, ...document.versionHistory],
      updatedAt: new Date().toISOString()
    });
    alert('Đã lưu phiên bản lịch sử thành công!');
  };

  // Stats
  const wordsCount = document.content.trim() ? document.content.trim().split(/\s+/).length : 0;
  const charsCount = document.content.length;
  const readMins = Math.max(1, Math.ceil(wordsCount / 200));

  return (
    <div className={`flex-1 flex flex-col h-full bg-white dark:bg-slate-900 ${editorMode === 'zen' ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
      {/* Top Editor Control Toolbar */}
      <div className="px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Formatting tools */}
        <div className="flex items-center gap-1 flex-wrap">
          <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 dark:border-slate-800">
            <button
              onClick={() => insertFormatting('**', '**', 'in đậm')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="In đậm (Ctrl+B)"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => insertFormatting('*', '*', 'in nghiêng')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="In nghiêng (Ctrl+I)"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => insertFormatting('~~', '~~', 'gạch ngang')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Gạch ngang"
            >
              <Strikethrough size={16} />
            </button>
            <button
              onClick={() => insertFormatting('`', '`', 'mã_ngắn')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Mã nguồn ngắn"
            >
              <Code size={16} />
            </button>
          </div>

          <div className="flex items-center gap-0.5 px-2 border-r border-slate-200 dark:border-slate-800">
            <button
              onClick={() => insertFormatting('# ', '', 'Tiêu đề 1')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Tiêu đề H1"
            >
              <Heading1 size={16} />
            </button>
            <button
              onClick={() => insertFormatting('## ', '', 'Tiêu đề 2')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Tiêu đề H2"
            >
              <Heading2 size={16} />
            </button>
            <button
              onClick={() => insertFormatting('### ', '', 'Tiêu đề 3')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Tiêu đề H3"
            >
              <Heading3 size={16} />
            </button>
          </div>

          <div className="flex items-center gap-0.5 px-2 border-r border-slate-200 dark:border-slate-800">
            <button
              onClick={() => insertFormatting('- ', '', 'Mục danh sách')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Danh sách gạch đầu dòng"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => insertFormatting('1. ', '', 'Mục số 1')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Danh sách đánh số"
            >
              <ListOrdered size={16} />
            </button>
            <button
              onClick={() => insertFormatting('- [ ] ', '', 'Công việc cần làm')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Danh sách việc cần làm (Checklist)"
            >
              <CheckSquare size={16} />
            </button>
          </div>

          <div className="flex items-center gap-0.5 pl-2">
            <button
              onClick={() => insertFormatting('> ', '', 'Trích dẫn quan trọng...')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Trích dẫn"
            >
              <Quote size={16} />
            </button>
            <button
              onClick={() => insertFormatting('\n| Cột 1 | Cột 2 | Cột 3 |\n| --- | --- | --- |\n| Dữ liệu 1 | Dữ liệu 2 | Dữ liệu 3 |\n')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Thêm bảng biểu"
            >
              <Table size={16} />
            </button>
            <button
              onClick={() => insertFormatting('\n---\n')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              title="Thêm đường phân cách"
            >
              <Minus size={16} />
            </button>
          </div>
        </div>

        {/* Right: AI Tools, View Mode Switcher, Actions */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Button */}
          <button
            onClick={() => onOpenAiAssistant()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Trợ lý AI</span>
          </button>

          {/* Editor Mode Selector */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setEditorMode('edit')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                editorMode === 'edit'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Chỉ chỉnh sửa"
            >
              <Edit3 size={14} />
              <span className="hidden lg:inline">Soạn thảo</span>
            </button>

            <button
              onClick={() => setEditorMode('split')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                editorMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Song song (Split View)"
            >
              <Columns size={14} />
              <span className="hidden lg:inline">Song song</span>
            </button>

            <button
              onClick={() => setEditorMode('preview')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                editorMode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Chỉ xem trước"
            >
              <Eye size={14} />
              <span className="hidden lg:inline">Xem trước</span>
            </button>

            <button
              onClick={() => setEditorMode(editorMode === 'zen' ? 'split' : 'zen')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                editorMode === 'zen'
                  ? 'bg-indigo-600 text-white shadow-2xs font-medium'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Góc tập trung Zen Mode"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          {/* Version History Button */}
          <button
            onClick={onOpenVersionHistory}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Lịch sử phiên bản"
          >
            <History size={16} />
          </button>

          {/* Export Button */}
          <button
            onClick={onOpenExportModal}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Xuất / Tải xuống"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Main Document Body Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Cover Header Image if exists */}
        {document.coverImage && (
          <div className="relative h-48 sm:h-56 w-full overflow-hidden shrink-0 group">
            <img src={document.coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-900" />
            <button
              onClick={() => handleChange('coverImage', undefined)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/60 text-white hover:bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Xóa ảnh bìa"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Metadata Header (Emoji, Title, Folder, Tags) */}
        <div className="max-w-4xl w-full mx-auto px-6 sm:px-12 pt-6 pb-4 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Emoji Icon Picker */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-3xl p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Thay đổi Biểu tượng"
              >
                {document.icon || '📄'}
              </button>

              {showEmojiPicker && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowEmojiPicker(false)} />
                  <div className="absolute left-0 top-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-xl z-40 grid grid-cols-5 gap-2 w-52">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          handleChange('icon', e);
                          setShowEmojiPicker(false);
                        }}
                        className="text-2xl p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Folder & Cover Add Button */}
            <div className="flex items-center gap-2">
              {!document.coverImage && (
                <button
                  onClick={() => setShowCoverPicker(!showCoverPicker)}
                  className="px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ImageIcon size={14} />
                  <span>Thêm ảnh bìa</span>
                </button>
              )}

              {/* Cover Picker Dropdown */}
              {showCoverPicker && (
                <div className="absolute top-28 right-12 z-40 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl flex gap-2">
                  {COVER_PRESETS.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Preset"
                      onClick={() => {
                        handleChange('coverImage', src);
                        setShowCoverPicker(false);
                      }}
                      className="w-16 h-12 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-indigo-500"
                    />
                  ))}
                  <button
                    onClick={() => setShowCoverPicker(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Folder Selector */}
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <FolderIcon size={14} className="text-slate-400" />
                <select
                  value={document.folderId}
                  onChange={(e) => handleChange('folderId', e.target.value)}
                  className="bg-transparent focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="none" className="dark:bg-slate-800">Không có thư mục</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id} className="dark:bg-slate-800">
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Document Title Input */}
          <input
            type="text"
            value={document.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Tên tài liệu..."
            className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white bg-transparent border-none focus:outline-hidden placeholder-slate-300 dark:placeholder-slate-600 tracking-tight"
          />

          {/* Tags List & Add Input */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <TagIcon size={14} className="text-slate-400" />
            {document.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 border border-slate-200 dark:border-slate-700 font-medium"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            <form onSubmit={handleAddTag} className="inline-flex items-center">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="+ Thẻ mới..."
                className="px-2 py-1 rounded-lg bg-transparent text-xs text-slate-600 dark:text-slate-300 placeholder-slate-400 focus:outline-hidden"
              />
            </form>
          </div>
        </div>

        {/* Editor Workspace View Modes */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pb-8 flex flex-col min-h-[400px]">
          {editorMode === 'edit' && (
            <textarea
              ref={textareaRef}
              value={document.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Bắt đầu viết nội dung tài liệu bằng Markdown..."
              className="w-full flex-1 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 font-mono text-sm sm:text-base text-slate-800 dark:text-slate-200 focus:outline-hidden leading-relaxed resize-none custom-scrollbar"
            />
          )}

          {editorMode === 'preview' && (
            <div className="w-full flex-1 p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 overflow-y-auto custom-scrollbar">
              <MarkdownRenderer content={document.content} onToggleChecklist={handleToggleChecklist} />
            </div>
          )}

          {(editorMode === 'split' || editorMode === 'zen') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 h-full min-h-[500px]">
              {/* Left Input Textarea */}
              <div className="flex flex-col h-full">
                <div className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Mã Soạn Thảo (Markdown)</span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={document.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="Viết nội dung ở đây..."
                  className="w-full flex-1 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 font-mono text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden leading-relaxed resize-none custom-scrollbar shadow-inner"
                />
              </div>

              {/* Right Live Rendered Preview */}
              <div className="flex flex-col h-full">
                <div className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  <span>Hiển Thị Xem Trước</span>
                </div>
                <div className="w-full flex-1 p-5 sm:p-8 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 overflow-y-auto custom-scrollbar">
                  <MarkdownRenderer content={document.content} onToggleChecklist={handleToggleChecklist} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-6 py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            Ước tính {readMins} phút đọc
          </span>
          <span>{wordsCount} từ</span>
          <span>{charsCount} ký tự</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveSnapshot}
            className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
            title="Lưu phiên bản Lịch sử"
          >
            <Save size={13} />
            <span>Tạo bản lưu</span>
          </button>

          <div className="flex items-center gap-1">
            {isSaved ? (
              <>
                <Check size={13} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Đã tự động lưu</span>
              </>
            ) : (
              <span className="text-amber-500 animate-pulse">Đang lưu thay đổi...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  LayoutTemplate, 
  X, 
  Search, 
  Users, 
  Rocket, 
  Calendar, 
  FileText, 
  Lightbulb, 
  Plus, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { DocumentTemplate } from '../types';
import { INITIAL_TEMPLATES } from '../data/initialData';
import { MarkdownRenderer } from './MarkdownRenderer';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocumentTemplate) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(INITIAL_TEMPLATES[0]);

  if (!isOpen) return null;

  const filteredTemplates = INITIAL_TEMPLATES.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users size={18} />;
      case 'Rocket': return <Rocket size={18} />;
      case 'Calendar': return <Calendar size={18} />;
      case 'Lightbulb': return <Lightbulb size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-850 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <LayoutTemplate size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Thư Viện Mẫu Tài Liệu</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Khởi tạo nhanh văn bản chuẩn mực với mẫu có sẵn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mẫu tài liệu..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-medium cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedCategory('CongViec')}
              className={`px-3 py-1.5 rounded-xl font-medium cursor-pointer ${
                selectedCategory === 'CongViec'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Công việc
            </button>
            <button
              onClick={() => setSelectedCategory('DuAn')}
              className={`px-3 py-1.5 rounded-xl font-medium cursor-pointer ${
                selectedCategory === 'DuAn'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Dự án
            </button>
            <button
              onClick={() => setSelectedCategory('YTuong')}
              className={`px-3 py-1.5 rounded-xl font-medium cursor-pointer ${
                selectedCategory === 'YTuong'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Ý tưởng
            </button>
          </div>
        </div>

        {/* Content Body Grid + Preview Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
          {/* Template List Left */}
          <div className="p-4 overflow-y-auto space-y-2.5 border-r border-slate-200 dark:border-slate-800 custom-scrollbar">
            {filteredTemplates.map((tmpl) => {
              const isSelected = previewTemplate?.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setPreviewTemplate(tmpl)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-2xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                      {getCategoryIcon(tmpl.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {tmpl.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {tmpl.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tmpl.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Template Live Preview Right */}
          <div className="p-6 overflow-y-auto flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
            {previewTemplate ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    {previewTemplate.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {previewTemplate.description}
                  </p>
                </div>

                <div className="flex-1 p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs overflow-y-auto max-h-[300px]">
                  <MarkdownRenderer content={previewTemplate.content} />
                </div>

                <button
                  onClick={() => {
                    onSelectTemplate(previewTemplate);
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Sử dụng mẫu này ngay</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Chọn một mẫu bên trái để xem trước nội dung
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

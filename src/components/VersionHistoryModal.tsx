import React, { useState } from 'react';
import { History, X, Clock, RotateCcw, FileText } from 'lucide-react';
import { DocumentItem, DocumentVersion } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onRestoreVersion: (version: DocumentVersion) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  document,
  onRestoreVersion
}) => {
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(
    document?.versionHistory?.[0] || null
  );

  if (!isOpen || !document) return null;

  const versions = document.versionHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-850 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <History size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Lịch Sử Phiên Bản Tài Liệu</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xem lại các bản sao đã lưu và khôi phục nội dung cũ
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

        {/* Content */}
        {versions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Chưa có lịch sử phiên bản nào được lưu cho tài liệu này. Hãy bấm nút "Tạo bản lưu" ở góc dưới màn hình soạn thảo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
            {/* Version Timeline List */}
            <div className="p-4 border-r border-slate-200 dark:border-slate-800 space-y-2 overflow-y-auto custom-scrollbar">
              {versions.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;
                const formattedDate = new Date(ver.timestamp).toLocaleString('vi-VN');

                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-2xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Clock size={13} className="text-indigo-500 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                    {ver.note && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {ver.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Version Preview & Restore Action */}
            <div className="md:col-span-2 p-6 flex flex-col justify-between overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
              {selectedVersion ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      Xem trước bản lưu: {new Date(selectedVersion.timestamp).toLocaleString('vi-VN')}
                    </h4>
                  </div>

                  <div className="flex-1 p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs overflow-y-auto max-h-[300px]">
                    <MarkdownRenderer content={selectedVersion.content} />
                  </div>

                  <button
                    onClick={() => {
                      onRestoreVersion(selectedVersion);
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RotateCcw size={15} />
                    <span>Khôi phục về phiên bản này</span>
                  </button>
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs py-12">
                  Chọn một bản lưu ở danh sách bên trái để xem trước
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

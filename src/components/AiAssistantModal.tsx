import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  Languages, 
  ListChecks, 
  MessageSquare, 
  PenTool, 
  Wand2, 
  Loader2,
  Send
} from 'lucide-react';
import { AiTaskType, DocumentItem } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onInsertContent: (newText: string, mode: 'replace' | 'append') => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  document,
  onInsertContent
}) => {
  const [activeTask, setActiveTask] = useState<AiTaskType>('draft');
  const [promptInput, setPromptInput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Tiếng Anh');
  const [tone, setTone] = useState<'professional' | 'creative' | 'concise' | 'formal'>('professional');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Chat message history for Q&A
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);

  if (!isOpen) return null;

  const handleRunAi = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || promptInput;
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: activeTask,
          prompt: promptToUse,
          content: document?.content || '',
          targetLanguage: targetLanguage,
          tone: tone
        })
      });

      const data = await response.json();

      if (data.success && data.result) {
        if (activeTask === 'chat') {
          setChatMessages(prev => [
            ...prev,
            { sender: 'user', text: promptToUse },
            { sender: 'ai', text: data.result }
          ]);
          setPromptInput('');
        } else {
          setAiResult(data.result);
        }
      } else {
        setErrorMessage(data.error || 'Đã xảy ra lỗi khi tạo nội dung với AI.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể kết nối với máy chủ AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (aiResult) {
      navigator.clipboard.writeText(aiResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-850 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                Trợ Lý AI SmartDoc
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">
                  Gemini 3.6 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Soạn bài, tóm tắt, sửa lỗi chính tả và hỏi đáp tài liệu thông minh
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

        {/* Task Selection Navigation Tabs */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => { setActiveTask('draft'); setAiResult(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTask === 'draft'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <PenTool size={14} />
            <span>Viết dự thảo</span>
          </button>

          <button
            onClick={() => { setActiveTask('summarize'); setAiResult(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTask === 'summarize'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FileText size={14} />
            <span>Tóm tắt</span>
          </button>

          <button
            onClick={() => { setActiveTask('polish'); setAiResult(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTask === 'polish'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Wand2 size={14} />
            <span>Sửa lỗi & Văn phong</span>
          </button>

          <button
            onClick={() => { setActiveTask('translate'); setAiResult(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTask === 'translate'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Languages size={14} />
            <span>Dịch thuật</span>
          </button>

          <button
            onClick={() => { setActiveTask('extract_tasks'); setAiResult(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTask === 'extract_tasks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <ListChecks size={14} />
            <span>Tách công việc</span>
          </button>

          <button
            onClick={() => { setActiveTask('chat'); setAiResult(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTask === 'chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare size={14} />
            <span>Hỏi đáp Q&A</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Controls per task */}
          {activeTask === 'draft' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mô tả ý tưởng hoặc yêu cầu tài liệu bạn muốn AI viết:
              </label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ví dụ: Lập hợp đồng nguyên tắc cung cấp dịch vụ phần mềm giữa công ty A và công ty B..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {activeTask === 'translate' && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dịch sang ngôn ngữ:</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="Tiếng Anh">Tiếng Anh (English)</option>
                <option value="Tiếng Nhật">Tiếng Nhật (Japanese)</option>
                <option value="Tiếng Trung">Tiếng Trung (Chinese)</option>
                <option value="Tiếng Hàn">Tiếng Hàn (Korean)</option>
                <option value="Tiếng Pháp">Tiếng Pháp (French)</option>
                <option value="Tiếng Việt">Tiếng Việt (Vietnamese)</option>
              </select>
            </div>
          )}

          {activeTask === 'chat' && (
            <div className="space-y-3">
              <div className="min-h-[180px] max-h-[250px] overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    Đặt câu hỏi bất kỳ về nội dung tài liệu này...
                  </p>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'ml-auto bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunAi()}
                  placeholder="Hỏi AI về tài liệu này..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
                <button
                  onClick={() => handleRunAi()}
                  disabled={loading || !promptInput.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-50 cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Trigger Button if not chat */}
          {activeTask !== 'chat' && (
            <div className="flex justify-end">
              <button
                onClick={() => handleRunAi()}
                disabled={loading || (activeTask === 'draft' && !promptInput.trim())}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>
                  {activeTask === 'draft' && 'Tạo dự thảo ngay'}
                  {activeTask === 'summarize' && 'Tóm tắt tài liệu'}
                  {activeTask === 'polish' && 'Tối ưu văn phong'}
                  {activeTask === 'translate' && `Dịch sang ${targetLanguage}`}
                  {activeTask === 'extract_tasks' && 'Trích xuất công việc'}
                </span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Result Output Preview */}
          {aiResult && activeTask !== 'chat' && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  Kết quả tạo bởi AI:
                </span>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto p-2 text-xs leading-relaxed custom-scrollbar">
                <MarkdownRenderer content={aiResult} />
              </div>

              {/* Action Buttons to apply to doc */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    onInsertContent(aiResult, 'append');
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                >
                  + Chèn vào cuối tài liệu
                </button>

                <button
                  onClick={() => {
                    onInsertContent(aiResult, 'replace');
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 cursor-pointer shadow-2xs"
                >
                  Thay thế toàn bộ tài liệu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

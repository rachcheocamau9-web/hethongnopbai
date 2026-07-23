import React from 'react';
import { CheckSquare, Square, Info, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onToggleChecklist?: (lineIndex: number) => void;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onToggleChecklist, className = '' }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = React.useState<number | null>(null);

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Helper to parse line by line
  const lines = content.split('\n');

  let codeBlockActive = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];
  let codeBlockCounter = 0;

  let tableActive = false;
  let tableRows: string[][] = [];

  const renderElements: React.ReactNode[] = [];

  const processInlineFormatting = (text: string): React.ReactNode[] => {
    // Basic inline parser: **bold**, *italic*, `code`, ~~strike~~
    const parts: React.ReactNode[] = [];
    let keyCounter = 0;

    // Regex for bold, italic, code, strikethrough
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const raw = match[0];
      if (raw.startsWith('**') && raw.endsWith('**')) {
        parts.push(<strong key={keyCounter++} className="font-semibold text-slate-900 dark:text-slate-100">{raw.slice(2, -2)}</strong>);
      } else if (raw.startsWith('*') && raw.endsWith('*')) {
        parts.push(<em key={keyCounter++} className="italic text-slate-800 dark:text-slate-200">{raw.slice(1, -1)}</em>);
      } else if (raw.startsWith('`') && raw.endsWith('`')) {
        parts.push(
          <code key={keyCounter++} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-mono text-xs border border-slate-200 dark:border-slate-700">
            {raw.slice(1, -1)}
          </code>
        );
      } else if (raw.startsWith('~~') && raw.endsWith('~~')) {
        parts.push(<del key={keyCounter++} className="line-through text-slate-400 dark:text-slate-500">{raw.slice(2, -2)}</del>);
      } else if (raw.startsWith('[') && raw.includes('](')) {
        const linkMatch = raw.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          parts.push(
            <a key={keyCounter++} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              {linkMatch[1]}
            </a>
          );
        } else {
          parts.push(raw);
        }
      } else {
        parts.push(raw);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  const flushTable = (key: string) => {
    if (!tableActive || tableRows.length === 0) return;

    const headers = tableRows[0];
    const dataRows = tableRows.slice(1).filter(r => !r.every(c => c.trim().match(/^:?-+:?$/)));

    renderElements.push(
      <div key={key} className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                  {processInlineFormatting(h.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} className="border-b last:border-b-0 border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2 text-slate-700 dark:text-slate-300 border-r last:border-r-0 border-slate-200 dark:border-slate-800">
                    {processInlineFormatting(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableActive = false;
    tableRows = [];
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // Check Code Block ```
    if (line.trim().startsWith('```')) {
      if (codeBlockActive) {
        // End code block
        const codeText = codeBlockContent.join('\n');
        const currentCounter = codeBlockCounter++;
        renderElements.push(
          <div key={`code-${idx}`} className="my-4 rounded-xl overflow-hidden bg-slate-900 text-slate-100 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 text-xs text-slate-400 font-mono border-b border-slate-700">
              <span>{codeBlockLang || 'code'}</span>
              <button
                onClick={() => handleCopyCode(codeText, currentCounter)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {copiedCodeIndex === currentCounter ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-slate-200">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBlockActive = false;
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        flushTable(`table-before-code-${idx}`);
        codeBlockActive = true;
        codeBlockLang = line.trim().replace(/^```/, '');
      }
      continue;
    }

    if (codeBlockActive) {
      codeBlockContent.push(line);
      continue;
    }

    // Check Table | col | col |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      tableActive = true;
      const cells = line.trim().slice(1, -1).split('|');
      tableRows.push(cells);
      continue;
    } else if (tableActive) {
      flushTable(`table-${idx}`);
    }

    // Callout Box (> [!NOTE], > [!WARNING], > [!TIP], > 💡, > ⚠️)
    if (line.trim().startsWith('>')) {
      const calloutText = line.trim().replace(/^>\s*/, '');

      let calloutType: 'info' | 'warning' | 'success' | 'quote' = 'quote';
      let cleanText = calloutText;

      if (calloutText.includes('[!WARNING]') || calloutText.startsWith('⚠️')) {
        calloutType = 'warning';
        cleanText = calloutText.replace(/\[!WARNING\]|⚠️/, '').trim();
      } else if (calloutText.includes('[!NOTE]') || calloutText.includes('[!TIP]') || calloutText.startsWith('💡') || calloutText.startsWith('✨')) {
        calloutType = 'info';
        cleanText = calloutText.replace(/\[!NOTE\]|\[!TIP\]|💡|✨/, '').trim();
      } else if (calloutText.startsWith('✅') || calloutText.includes('[!SUCCESS]')) {
        calloutType = 'success';
        cleanText = calloutText.replace(/\[!SUCCESS\]|✅/, '').trim();
      }

      if (calloutType === 'warning') {
        renderElements.push(
          <div key={`callout-${idx}`} className="my-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
            <div className="text-sm leading-relaxed">{processInlineFormatting(cleanText)}</div>
          </div>
        );
      } else if (calloutType === 'info') {
        renderElements.push(
          <div key={`callout-${idx}`} className="my-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <Info className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
            <div className="text-sm leading-relaxed">{processInlineFormatting(cleanText)}</div>
          </div>
        );
      } else if (calloutType === 'success') {
        renderElements.push(
          <div key={`callout-${idx}`} className="my-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <CheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
            <div className="text-sm leading-relaxed">{processInlineFormatting(cleanText)}</div>
          </div>
        );
      } else {
        renderElements.push(
          <blockquote key={`quote-${idx}`} className="my-3 pl-4 border-l-4 border-indigo-500 dark:border-indigo-400 italic text-slate-600 dark:text-slate-400 text-sm py-1">
            {processInlineFormatting(cleanText)}
          </blockquote>
        );
      }
      continue;
    }

    // Headings #, ##, ###, ####
    if (line.startsWith('# ')) {
      renderElements.push(
        <h1 key={`h1-${idx}`} className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-6 mb-3 tracking-tight pb-2 border-b border-slate-200 dark:border-slate-800">
          {processInlineFormatting(line.slice(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderElements.push(
        <h2 key={`h2-${idx}`} className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-5 mb-2.5 tracking-tight">
          {processInlineFormatting(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      renderElements.push(
        <h3 key={`h3-${idx}`} className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">
          {processInlineFormatting(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      renderElements.push(
        <h4 key={`h4-${idx}`} className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-3 mb-1.5">
          {processInlineFormatting(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Horizontal Rule --- or ***
    if (line.trim() === '---' || line.trim() === '***') {
      renderElements.push(
        <hr key={`hr-${idx}`} className="my-6 border-slate-200 dark:border-slate-800" />
      );
      continue;
    }

    // Checklist / Task list: - [ ] or - [x]
    if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]') || line.trim().startsWith('- [X]')) {
      const isChecked = line.trim().startsWith('- [x]') || line.trim().startsWith('- [X]');
      const text = line.trim().slice(5).trim();
      const currentIdx = idx;

      renderElements.push(
        <div
          key={`task-${idx}`}
          onClick={() => onToggleChecklist && onToggleChecklist(currentIdx)}
          className={`flex items-start gap-2.5 my-1.5 px-2 py-1 rounded-lg transition-colors ${
            onToggleChecklist ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60' : ''
          }`}
        >
          {isChecked ? (
            <CheckSquare className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" size={18} />
          ) : (
            <Square className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" size={18} />
          )}
          <span className={`text-sm ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
            {processInlineFormatting(text)}
          </span>
        </div>
      );
      continue;
    }

    // Bullet List: - or *
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().slice(2);
      renderElements.push(
        <li key={`bullet-${idx}`} className="ml-5 list-disc my-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {processInlineFormatting(text)}
        </li>
      );
      continue;
    }

    // Numbered list: 1., 2.
    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)/);
      if (match) {
        renderElements.push(
          <div key={`num-${idx}`} className="flex items-start gap-2 my-1 text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">{match[1]}.</span>
            <div className="leading-relaxed">{processInlineFormatting(match[2])}</div>
          </div>
        );
        continue;
      }
    }

    // Empty line
    if (!line.trim()) {
      renderElements.push(<div key={`empty-${idx}`} className="h-3" />);
      continue;
    }

    // Default Paragraph
    renderElements.push(
      <p key={`p-${idx}`} className="my-2 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        {processInlineFormatting(line)}
      </p>
    );
  }

  // Flush table if leftover at end
  flushTable('table-end');

  return <div className={`prose dark:prose-invert max-w-none ${className}`}>{renderElements}</div>;
};

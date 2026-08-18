import React, { useState, memo, useRef, useCallback, useMemo, useEffect } from 'react';
import { NodeProps, useReactFlow, NodeResizer, useNodesData } from '@xyflow/react';
import {
  FileText,
  ArrowsOut,
  ArrowsIn,
  PencilSimple,
  Eye,
  TextB,
  TextItalic,
  TextStrikethrough,
  TextHOne,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  CheckSquare,
  Quotes,
  Code,
  Function as MathIcon,
  Minus,
  Link as LinkIcon,
  Check,
  Copy,
} from '@phosphor-icons/react';
import { DocumentNodeData, CanvasEdge } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';
import { syncAutoEdges, autoLinkNodesForTitle } from '../../utils/edgeUtils';
import { WikilinkText } from '../WikilinkText';
import { getGroupTheme } from './GroupNode';

// Helper to compute word count, char count, read time
function getDocStats(text: string) {
  const clean = text.trim();
  if (!clean) return { words: 0, chars: 0, readTime: '< 1 min' };
  const words = clean.split(/\s+/).filter(Boolean).length;
  const chars = clean.length;
  const minutes = Math.ceil(words / 200);
  const readTime = minutes <= 1 ? '1 min read' : `${minutes} min read`;
  return { words, chars, readTime };
}

interface InlineFormattedTextProps {
  text: string;
  sourceNodeId: string;
}

// Render markdown line elements with bold, italic, inline code, wikilinks, and math
const InlineFormattedText: React.FC<InlineFormattedTextProps> = ({ text, sourceNodeId }) => {
  // Regex to split by bold, italic, strikethrough, inline code
  // Note: Wikilinks and KaTeX are parsed inside WikilinkText
  const parts = useMemo(() => {
    // Regex for bold **text**, italic *text*, strikethrough ~~text~~, code `text`
    const regex = /(\*\*[^*]+\*\*|(?<!\*)\*[^*]+\*(?!\*)|~~[^~]+~~|`[^`]+`)/g;
    const tokens = text.split(regex);
    return tokens.filter(Boolean);
  }, [text]);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <strong key={idx} className="font-bold text-[var(--text-hover)]">
              <WikilinkText text={part.slice(2, -2)} sourceNodeId={sourceNodeId} />
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return (
            <em key={idx} className="italic text-[var(--text-normal)]">
              <WikilinkText text={part.slice(1, -1)} sourceNodeId={sourceNodeId} />
            </em>
          );
        }
        if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
          return (
            <s key={idx} className="line-through opacity-70">
              <WikilinkText text={part.slice(2, -2)} sourceNodeId={sourceNodeId} />
            </s>
          );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <code
              key={idx}
              className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[11px] text-[#FF4B4B] dark:text-[#FF9600]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <WikilinkText key={idx} text={part} sourceNodeId={sourceNodeId} />;
      })}
    </>
  );
};

export const DocumentNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable, parentId }) => {
  const { setNodes, setEdges } = useReactFlow();
  const docData = data as unknown as DocumentNodeData;

  const parentNode = useNodesData(parentId || '');
  const parentColor = (parentNode?.data as Record<string, any>)?.color;
  const parentTheme = parentId && parentNode ? getGroupTheme(parentColor) : null;
  const borderStyleClass = parentTheme
    ? `border-2 ${parentTheme.border}`
    : 'border border-[var(--border-color)] dark:border-[#243740]';

  const titleText = docData.title || '';
  const contentText = docData.content || '';
  const fontFamily = docData.fontFamily || 'sans';

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const zenTextareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => getDocStats(contentText), [contentText]);

  const updateDocData = useCallback(
    (updates: Partial<DocumentNodeData>) => {
      setNodes((nds) => {
        const updatedNodes = nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            };
          }
          return node;
        });

        setEdges((eds) => syncAutoEdges(updatedNodes, eds) as CanvasEdge[]);
        return updatedNodes;
      });
    },
    [id, setNodes, setEdges]
  );

  const commitTitle = useCallback(
    (finalTitle: string) => {
      setIsEditingTitle(false);
      const trimmed = finalTitle.trim();
      if (trimmed.length >= 3) {
        setNodes((nds) => {
          const { updatedNodes, modified } = autoLinkNodesForTitle(nds, id, trimmed);
          if (modified) {
            setEdges((eds) => syncAutoEdges(updatedNodes, eds) as CanvasEdge[]);
            return updatedNodes as any;
          }
          return nds;
        });
      }
    },
    [id, setNodes, setEdges]
  );

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Insert markdown formatting helpers
  const insertFormatting = useCallback(
    (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
      const activeTextarea = isZenMode ? zenTextareaRef.current : textareaRef.current;
      if (!activeTextarea) return;

      const start = activeTextarea.selectionStart;
      const end = activeTextarea.selectionEnd;
      const currentVal = activeTextarea.value;
      const selectedText = currentVal.substring(start, end) || defaultPlaceholder;

      const replacement = `${prefix}${selectedText}${suffix}`;
      const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);

      updateDocData({ content: newVal });

      setTimeout(() => {
        if (activeTextarea) {
          activeTextarea.focus();
          activeTextarea.setSelectionRange(
            start + prefix.length,
            start + prefix.length + selectedText.length
          );
        }
      }, 0);
    },
    [isZenMode, updateDocData]
  );

  // Insert line prefix (e.g. for headings or lists)
  const insertLinePrefix = useCallback(
    (prefix: string) => {
      const activeTextarea = isZenMode ? zenTextareaRef.current : textareaRef.current;
      if (!activeTextarea) return;

      const start = activeTextarea.selectionStart;
      const currentVal = activeTextarea.value;

      // Find start of current line
      const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
      const newVal = currentVal.substring(0, lineStart) + prefix + currentVal.substring(lineStart);

      updateDocData({ content: newVal });

      setTimeout(() => {
        if (activeTextarea) {
          activeTextarea.focus();
          activeTextarea.setSelectionRange(start + prefix.length, start + prefix.length);
        }
      }, 0);
    },
    [isZenMode, updateDocData]
  );

  // Toggle interactive checklist line
  const handleToggleChecklist = useCallback(
    (lineIndex: number) => {
      const lines = contentText.split('\n');
      if (lineIndex < 0 || lineIndex >= lines.length) return;

      const targetLine = lines[lineIndex];
      if (targetLine.startsWith('- [ ] ')) {
        lines[lineIndex] = targetLine.replace('- [ ] ', '- [x] ');
      } else if (targetLine.startsWith('- [x] ') || targetLine.startsWith('- [X] ')) {
        lines[lineIndex] = targetLine.replace(/- \[[xX]\] /, '- [ ] ');
      }

      updateDocData({ content: lines.join('\n') });
    },
    [contentText, updateDocData]
  );

  // Handle textarea keyboard events (e.g. smart list continuation, tab indent)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const value = target.value;
        const updated = value.substring(0, start) + '  ' + value.substring(end);
        updateDocData({ content: updated });
        setTimeout(() => {
          target.setSelectionRange(start + 2, start + 2);
        }, 0);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.currentTarget;
        const start = target.selectionStart;
        const value = target.value;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);

        let continuation = '';
        if (currentLine.startsWith('- [ ] ') || currentLine.startsWith('- [x] ')) {
          continuation = currentLine.trim() === '- [ ]' || currentLine.trim() === '- [x]' ? '' : '- [ ] ';
        } else if (currentLine.startsWith('- ') || currentLine.startsWith('* ')) {
          continuation = currentLine.trim() === '-' || currentLine.trim() === '*' ? '' : '- ';
        } else if (/^\d+\.\s/.test(currentLine)) {
          const match = currentLine.match(/^(\d+)\.\s/);
          if (match) {
            const num = parseInt(match[1], 10);
            continuation = currentLine.trim() === `${num}.` ? '' : `${num + 1}. `;
          }
        }

        if (continuation !== '') {
          e.preventDefault();
          const updated = value.substring(0, start) + '\n' + continuation + value.substring(start);
          updateDocData({ content: updated });
          setTimeout(() => {
            target.setSelectionRange(start + 1 + continuation.length, start + 1 + continuation.length);
          }, 0);
        }
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [updateDocData]
  );

  const fontClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Render markdown lines for Google Doc view mode
  const renderedContent = useMemo(() => {
    if (!contentText.trim()) {
      return (
        <div className="text-[var(--text-light)] italic select-none py-8 text-center">
          Empty document. Click here to start writing...
        </div>
      );
    }

    const lines = contentText.split('\n');
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      // Code block handling
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          const codeText = codeBuffer.join('\n');
          elements.push(
            <pre
              key={`code-${idx}`}
              className="my-3 p-3.5 rounded-xl bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10 font-mono text-xs overflow-x-auto text-[var(--text-normal)] leading-relaxed select-text"
            >
              <code>{codeText}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        elements.push(<hr key={idx} className="my-4 border-t border-[var(--border-color)] opacity-60" />);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={idx}
            className="text-2xl font-bold text-[var(--text-hover)] mt-4 mb-2 pb-1 border-b border-[var(--border-color)] leading-snug"
          >
            <InlineFormattedText text={line.slice(2)} sourceNodeId={id} />
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={idx}
            className="text-xl font-bold text-[var(--text-hover)] mt-3 mb-1.5 leading-snug"
          >
            <InlineFormattedText text={line.slice(3)} sourceNodeId={id} />
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={idx}
            className="text-base font-semibold text-[var(--text-hover)] mt-2.5 mb-1 leading-snug"
          >
            <InlineFormattedText text={line.slice(4)} sourceNodeId={id} />
          </h3>
        );
        return;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={idx}
            className="my-2 pl-3.5 py-1 border-l-3 border-[#1CB0F6] bg-[#1CB0F6]/5 rounded-r-lg text-xs italic text-[var(--text-normal)] leading-relaxed"
          >
            <InlineFormattedText text={line.slice(2)} sourceNodeId={id} />
          </blockquote>
        );
        return;
      }

      // Checklist / Task item
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
        const isChecked = line.startsWith('- [x] ') || line.startsWith('- [X] ');
        const itemText = line.slice(6);
        elements.push(
          <div
            key={idx}
            className="nodrag nopan flex items-start gap-2.5 my-1 group/task cursor-pointer select-none"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleChecklist(idx);
            }}
          >
            <div
              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors border ${
                isChecked
                  ? 'bg-[#58CC02] border-[#58CC02] text-white'
                  : 'border-[var(--text-light)] hover:border-[#58CC02] bg-transparent'
              }`}
            >
              {isChecked && <Check size={12} weight="bold" />}
            </div>
            <span
              className={`flex-1 text-xs leading-relaxed ${
                isChecked
                  ? 'line-through text-[var(--text-light)] opacity-70'
                  : 'text-[var(--text-normal)]'
              }`}
            >
              <InlineFormattedText text={itemText} sourceNodeId={id} />
            </span>
          </div>
        );
        return;
      }

      // Bullet List
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-[#58CC02] font-bold text-xs mt-0.5">•</span>
            <span className="flex-1 text-xs leading-relaxed text-[var(--text-normal)]">
              <InlineFormattedText text={line.slice(2)} sourceNodeId={id} />
            </span>
          </div>
        );
        return;
      }

      // Numbered List
      const numMatch = line.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-[var(--text-light)] font-semibold text-xs min-w-[16px] mt-0.5">
              {numMatch[1]}.
            </span>
            <span className="flex-1 text-xs leading-relaxed text-[var(--text-normal)]">
              <InlineFormattedText text={numMatch[2]} sourceNodeId={id} />
            </span>
          </div>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={idx} className="h-2.5" />);
        return;
      }

      // Standard Paragraph
      elements.push(
        <p key={idx} className="my-1.5 text-xs leading-relaxed text-[var(--text-normal)]">
          <InlineFormattedText text={line} sourceNodeId={id} />
        </p>
      );
    });

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <pre
          key="code-end"
          className="my-3 p-3.5 rounded-xl bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10 font-mono text-xs overflow-x-auto text-[var(--text-normal)] leading-relaxed select-text"
        >
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  }, [contentText, id, handleToggleChecklist]);

  // Copy document markdown text
  const handleCopyMarkdown = useCallback(() => {
    const fullDoc = `# ${titleText || 'Untitled document'}\n\n${contentText}`;
    navigator.clipboard.writeText(fullDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [titleText, contentText]);

  // Toolbar action buttons
  const renderToolbar = (_inZen: boolean = false) => (
    <div className="flex items-center gap-1 flex-wrap px-3 py-1.5 bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)] select-none text-[var(--text-normal)] text-xs">
      {/* Text styles */}
      <button
        onClick={() => insertFormatting('**', '**', 'bold text')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Bold (**text**)"
      >
        <TextB size={14} weight="bold" />
      </button>
      <button
        onClick={() => insertFormatting('*', '*', 'italic text')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Italic (*text*)"
      >
        <TextItalic size={14} />
      </button>
      <button
        onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Strikethrough (~~text~~)"
      >
        <TextStrikethrough size={14} />
      </button>
      <button
        onClick={() => insertFormatting('`', '`', 'code')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Inline Code (`code`)"
      >
        <Code size={14} />
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-color)] mx-1" />

      {/* Headings */}
      <button
        onClick={() => insertLinePrefix('# ')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Heading 1 (# )"
      >
        <TextHOne size={14} weight="bold" />
      </button>
      <button
        onClick={() => insertLinePrefix('## ')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Heading 2 (## )"
      >
        <TextHTwo size={14} weight="bold" />
      </button>
      <button
        onClick={() => insertLinePrefix('### ')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Heading 3 (### )"
      >
        <TextHThree size={14} weight="bold" />
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-color)] mx-1" />

      {/* Lists */}
      <button
        onClick={() => insertLinePrefix('- ')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Bullet List (- )"
      >
        <ListBullets size={14} />
      </button>
      <button
        onClick={() => insertLinePrefix('1. ')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Numbered List (1. )"
      >
        <ListNumbers size={14} />
      </button>
      <button
        onClick={() => insertLinePrefix('- [ ] ')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Checklist / Task (- [ ] )"
      >
        <CheckSquare size={14} />
      </button>

      <div className="w-[1px] h-4 bg-[var(--border-color)] mx-1" />

      {/* Blocks & Links */}
      <button
        onClick={() => insertLinePrefix('> ')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Blockquote (> )"
      >
        <Quotes size={14} />
      </button>
      <button
        onClick={() => insertFormatting('\n```\n', '\n```\n', 'code block')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer font-mono text-[11px]"
        title="Code Block (```)"
      >
        {'{ }'}
      </button>
      <button
        onClick={() => insertFormatting('$', '$', 'E=mc^2')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="KaTeX Math ($math$)"
      >
        <MathIcon size={14} />
      </button>
      <button
        onClick={() => insertFormatting('[[', ']]', 'Note Title')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Wikilink ([[Note Title]])"
      >
        <LinkIcon size={14} />
      </button>
      <button
        onClick={() => insertLinePrefix('---\n')}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
        title="Divider (---)"
      >
        <Minus size={14} />
      </button>

      {/* Right-aligned actions */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Font Family selector */}
        <select
          value={fontFamily}
          onChange={(e) => updateDocData({ fontFamily: e.target.value as any })}
          className="bg-transparent border border-[var(--border-color)] rounded px-1.5 py-0.5 text-[11px] text-[var(--text-light)] hover:text-[var(--text-hover)] focus:outline-none cursor-pointer"
          title="Change Font Family"
        >
          <option value="sans">Sans-serif</option>
          <option value="serif">Serif (Editorial)</option>
          <option value="mono">Monospace</option>
        </select>

        {/* Copy Doc */}
        <button
          onClick={handleCopyMarkdown}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-light)] hover:text-[var(--text-hover)] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
          title="Copy Document Markdown"
        >
          {copied ? <Check size={13} className="text-[#58CC02]" /> : <Copy size={13} />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`relative w-full h-full min-w-[420px] min-h-[320px] rounded-2xl ${borderStyleClass} bg-white dark:bg-[#132228] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          selected
            ? 'ring-2 ring-[var(--node-selected-ring)] shadow-3xl'
            : 'hover:ring-1 hover:ring-[var(--node-hover-ring)]'
        }`}
      >
        {/* Subtle Connectable Handles on Hover */}
        <FourWayHandles isConnectable={isConnectable} />

        {/* Node Resizer */}
        <NodeResizer
          minWidth={420}
          minHeight={320}
          isVisible={selected}
          lineClassName="!border-[#1CB0F6] !border-dashed"
          handleClassName="!w-3 !h-3 !bg-[#1CB0F6] !border-2 !border-white !rounded-full"
        />

        {/* Google Doc Style Header Bar - Draggable like a node */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02] select-none shrink-0 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Document Pill Icon */}
            <div className="w-8 h-8 rounded-lg bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center shrink-0">
              <FileText size={18} weight="fill" />
            </div>

            {/* Document Title (Google Doc Editable Title) */}
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <input
                  autoFocus
                  type="text"
                  value={titleText}
                  onChange={(e) => updateDocData({ title: e.target.value })}
                  onBlur={() => commitTitle(titleText)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      commitTitle(titleText);
                    } else if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                    }
                  }}
                  placeholder="Untitled document"
                  className="nodrag nopan w-full bg-transparent text-lg font-bold text-[var(--text-hover)] placeholder-[var(--text-light)] focus:outline-none font-sans leading-tight border-b border-[#1CB0F6]"
                />
              ) : (
                <div
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                  }}
                  className="text-lg font-bold text-[var(--text-hover)] leading-tight truncate font-sans hover:text-[#1CB0F6] transition-colors cursor-text"
                  title="Double-click to edit document title"
                >
                  {titleText.trim() || <span className="text-[var(--text-light)]">Untitled document</span>}
                </div>
              )}

              {/* Status info bar */}
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-light)] mt-0.5 pointer-events-none">
                <span className="flex items-center gap-1 text-[#58CC02]">
                  <Check size={11} weight="bold" />
                  <span>Saved</span>
                </span>
                <span>•</span>
                <span>{stats.words} {stats.words === 1 ? 'word' : 'words'}</span>
                <span>•</span>
                <span>{stats.readTime}</span>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="nodrag nopan flex items-center gap-1.5 shrink-0">
            {/* Edit / View Toggle Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                isEditing
                  ? 'bg-[#1CB0F6] text-white border-[#1CB0F6]'
                  : 'bg-[var(--sidebar-bg)] text-[var(--text-normal)] hover:text-[var(--text-hover)] border-[var(--border-color)]'
              }`}
              title={isEditing ? 'View formatted document' : 'Edit document text'}
            >
              {isEditing ? (
                <>
                  <Eye size={14} weight="bold" />
                  <span>Preview</span>
                </>
              ) : (
                <>
                  <PencilSimple size={14} weight="bold" />
                  <span>Edit</span>
                </>
              )}
            </button>

            {/* Zen / Expand Button */}
            <button
              onClick={() => setIsZenMode(true)}
              className="p-1.5 rounded-lg bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-normal)] hover:text-[var(--text-hover)] border border-[var(--border-color)] transition-colors cursor-pointer"
              title="Expand to Fullscreen Document View"
            >
              <ArrowsOut size={15} />
            </button>
          </div>
        </div>

        {/* Formatting Toolbar (visible when editing) */}
        {isEditing && renderToolbar(false)}

        {/* Document Body Area (Paper Margins & Typography) - Draggable in Preview mode */}
        <div
          className={`flex-1 overflow-y-auto px-7 py-6 ${fontClass} ${
            isEditing ? 'cursor-text' : 'cursor-default'
          }`}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (!isEditing) setIsEditing(true);
          }}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={contentText}
              onChange={(e) => updateDocData({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Start typing your document... Use Markdown, [[Wikilinks]], or Math $E=mc^2$."
              className="nodrag nopan w-full h-full min-h-[180px] bg-transparent text-xs text-[var(--text-normal)] placeholder-[var(--text-light)] focus:outline-none resize-none leading-relaxed font-inherit"
            />
          ) : (
            <div className="w-full min-h-[180px] select-text">{renderedContent}</div>
          )}
        </div>
      </div>

      {/* Zen / Distraction-Free Fullscreen Modal View */}
      {isZenMode && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setIsZenMode(false)}
        >
          <div
            className="w-full max-w-4xl h-[90vh] bg-white dark:bg-[#132228] text-[var(--text-normal)] rounded-2xl shadow-2xl border border-[var(--border-color)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-[var(--border-color)] bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center shrink-0">
                  <FileText size={20} weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => updateDocData({ title: e.target.value })}
                    placeholder="Untitled document"
                    className="w-full bg-transparent text-xl font-bold text-[var(--text-hover)] placeholder-[var(--text-light)] focus:outline-none font-sans leading-tight"
                  />
                  <div className="flex items-center gap-2 text-xs text-[var(--text-light)] mt-0.5">
                    <span className="flex items-center gap-1 text-[#58CC02]">
                      <Check size={12} weight="bold" />
                      <span>Saved to canvas</span>
                    </span>
                    <span>•</span>
                    <span>{stats.words} words</span>
                    <span>•</span>
                    <span>{stats.chars} characters</span>
                    <span>•</span>
                    <span>{stats.readTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                    isEditing
                      ? 'bg-[#1CB0F6] text-white border-[#1CB0F6]'
                      : 'bg-[var(--sidebar-bg)] text-[var(--text-normal)] hover:text-[var(--text-hover)] border-[var(--border-color)]'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Eye size={15} weight="bold" />
                      <span>Preview</span>
                    </>
                  ) : (
                    <>
                      <PencilSimple size={15} weight="bold" />
                      <span>Edit</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsZenMode(false)}
                  className="p-2 rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-normal)] hover:text-[var(--text-hover)] border border-[var(--border-color)] transition-colors cursor-pointer"
                  title="Close Zen View (Return to canvas)"
                >
                  <ArrowsIn size={18} />
                </button>
              </div>
            </div>

            {/* Modal Toolbar */}
            {renderToolbar(true)}

            {/* Modal Body */}
            <div
              className={`flex-1 overflow-y-auto px-12 py-8 cursor-text max-w-3xl w-full mx-auto ${fontClass}`}
              onClick={() => {
                if (!isEditing) setIsEditing(true);
              }}
            >
              {isEditing ? (
                <textarea
                  ref={zenTextareaRef}
                  value={contentText}
                  onChange={(e) => updateDocData({ content: e.target.value })}
                  onKeyDown={handleKeyDown}
                  placeholder="Start typing your document... Use Markdown, [[Wikilinks]], or Math $E=mc^2$."
                  className="w-full h-full min-h-[400px] bg-transparent text-sm text-[var(--text-normal)] placeholder-[var(--text-light)] focus:outline-none resize-none leading-relaxed font-inherit"
                />
              ) : (
                <div className="w-full min-h-[400px] select-text">{renderedContent}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

DocumentNode.displayName = 'DocumentNode';

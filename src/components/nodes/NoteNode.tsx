import React, { useState, memo, useCallback } from 'react';
import { NodeProps, useReactFlow, NodeResizer, useNodesData } from '@xyflow/react';
import { Check } from '@phosphor-icons/react';
import { NoteNodeData, CanvasEdge } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';
import { WikilinkText } from '../WikilinkText';
import { syncAutoEdges, autoLinkNodesForTitle } from '../../utils/edgeUtils';
import { getGroupTheme } from './GroupNode';

export const NoteNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable, parentId }) => {
  const { setNodes, setEdges } = useReactFlow();
  const nodeData = data as unknown as NoteNodeData;

  const parentNode = useNodesData(parentId || '');
  const parentColor = (parentNode?.data as Record<string, any>)?.color;
  const parentTheme = parentId && parentNode ? getGroupTheme(parentColor) : null;
  const borderStyleClass = parentTheme ? `border-2 ${parentTheme.border}` : 'border border-[var(--node-border)]';

  const titleText = nodeData.title || '';
  const contentText = nodeData.content || '';

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);

  const updateNodeData = useCallback(
    (updates: Partial<NoteNodeData>) => {
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

  const handleToggleChecklist = useCallback(
    (lineIdx: number) => {
      const lines = contentText.split('\n');
      if (lineIdx < 0 || lineIdx >= lines.length) return;
      const targetLine = lines[lineIdx];
      if (targetLine.includes('- [ ] ')) {
        lines[lineIdx] = targetLine.replace('- [ ] ', '- [x] ');
      } else if (targetLine.includes('- [x] ') || targetLine.includes('- [X] ')) {
        lines[lineIdx] = targetLine.replace(/- \[[xX]\] /, '- [ ] ');
      }
      updateNodeData({ content: lines.join('\n') });
    },
    [contentText, updateNodeData]
  );

  // Render formatted lines for note cards
  const renderNoteContent = () => {
    if (!contentText.trim()) {
      return <span className="text-[var(--text-light)] select-none">Type your notes here...</span>;
    }

    const lines = contentText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Checklist item
      const taskMatch = line.match(/^(\s*)(?:[-*+]|\d+\.)\s+\[([ xX])\]\s+(.*)$/);
      if (taskMatch) {
        const isChecked = taskMatch[2].toLowerCase() === 'x';
        const itemText = taskMatch[3];
        const indentLevel = Math.min(3, Math.floor(taskMatch[1].length / 2));

        return (
          <div
            key={idx}
            style={{ paddingLeft: `${indentLevel * 12}px` }}
            className="flex items-start gap-1.5 my-0.5 group/task cursor-pointer select-none"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleChecklist(idx);
            }}
          >
            <div
              className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center transition-colors border shrink-0 ${
                isChecked
                  ? 'bg-[#58CC02] border-[#58CC02] text-white'
                  : 'border-[var(--text-light)] hover:border-[#58CC02] bg-transparent'
              }`}
            >
              {isChecked && <Check size={10} weight="bold" />}
            </div>
            <span
              className={`flex-1 text-xs leading-relaxed ${
                isChecked
                  ? 'line-through text-[var(--text-light)] opacity-70'
                  : 'text-[var(--text-normal)]'
              }`}
            >
              <WikilinkText text={itemText} sourceNodeId={id} />
            </span>
          </div>
        );
      }

      // Bullets
      const bulletMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
      if (bulletMatch) {
        const indentLevel = Math.min(3, Math.floor(bulletMatch[1].length / 2));
        const bulletIcon = indentLevel === 0 ? '•' : '◦';
        return (
          <div
            key={idx}
            style={{ paddingLeft: `${indentLevel * 12}px` }}
            className="flex items-start gap-1.5 my-0.5"
          >
            <span className="text-[#58CC02] font-bold text-xs shrink-0 select-none">{bulletIcon}</span>
            <span className="flex-1 text-xs leading-relaxed text-[var(--text-normal)]">
              <WikilinkText text={bulletMatch[3]} sourceNodeId={id} />
            </span>
          </div>
        );
      }

      // Numbered list
      const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (numMatch) {
        const indentLevel = Math.min(3, Math.floor(numMatch[1].length / 2));
        return (
          <div
            key={idx}
            style={{ paddingLeft: `${indentLevel * 12}px` }}
            className="flex items-start gap-1.5 my-0.5"
          >
            <span className="text-[var(--text-light)] font-semibold text-xs min-w-[14px] shrink-0 select-none">
              {numMatch[2]}.
            </span>
            <span className="flex-1 text-xs leading-relaxed text-[var(--text-normal)]">
              <WikilinkText text={numMatch[3]} sourceNodeId={id} />
            </span>
          </div>
        );
      }

      // Headings
      if (line.startsWith('# ')) {
        return (
          <div key={idx} className="font-bold text-sm text-[var(--text-hover)] mt-1.5 mb-0.5">
            <WikilinkText text={line.slice(2)} sourceNodeId={id} />
          </div>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <div key={idx} className="font-bold text-xs text-[var(--text-hover)] mt-1 mb-0.5">
            <WikilinkText text={line.slice(3)} sourceNodeId={id} />
          </div>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <div key={idx} className="font-semibold text-xs text-[var(--text-hover)] mt-1 mb-0.5">
            <WikilinkText text={line.slice(4)} sourceNodeId={id} />
          </div>
        );
      }

      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <div
            key={idx}
            className="my-1 pl-2 py-0.5 border-l-2 border-[#1CB0F6] bg-[#1CB0F6]/5 text-xs italic text-[var(--text-normal)] rounded-r"
          >
            <WikilinkText text={line.slice(2)} sourceNodeId={id} />
          </div>
        );
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        return <hr key={idx} className="my-1.5 border-t border-[var(--border-color)] opacity-50" />;
      }

      // Empty line
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      // Normal paragraph line
      return (
        <div key={idx} className="text-xs leading-relaxed text-[var(--text-normal)]">
          <WikilinkText text={line} sourceNodeId={id} />
        </div>
      );
    });
  };

  return (
    <div
      className={`relative w-full h-full min-w-[180px] min-h-[90px] rounded-xl ${borderStyleClass} bg-[var(--node-bg)] flex flex-col p-3.5 transition-all duration-150 ${
        selected
          ? 'ring-2 ring-[var(--node-selected-ring)]'
          : 'hover:ring-2 hover:ring-[var(--node-hover-ring)]'
      }`}
    >
      {/* Handles & Resizer */}
      <FourWayHandles isConnectable={isConnectable} />
      <NodeResizer
        minWidth={180}
        minHeight={90}
        isVisible={selected}
        lineClassName="!border-[#58CC02] !border-dashed"
        handleClassName="!w-3 !h-3 !bg-[#58CC02] !border-2 !border-white !rounded-full"
      />

      {/* Title Field */}
      {isEditingTitle ? (
        <textarea
          autoFocus
          rows={1}
          value={titleText}
          onChange={(e) => updateNodeData({ title: e.target.value })}
          onBlur={() => commitTitle(titleText)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commitTitle(titleText);
              setIsEditingContent(true);
            } else if (e.key === 'Escape') {
              setIsEditingTitle(false);
            }
          }}
          placeholder="Node name"
          className="nodrag nopan w-full bg-transparent text-2xl font-bold text-[var(--text-normal)] placeholder-[var(--text-light)] focus:outline-none mb-1.5 font-sans leading-tight resize-none overflow-hidden"
        />
      ) : (
        <div
          onClick={() => setIsEditingTitle(true)}
          className="nodrag nopan w-full bg-transparent text-2xl font-bold text-[var(--text-normal)] mb-1.5 font-sans leading-tight cursor-text min-h-[32px] break-words whitespace-pre-wrap"
        >
          {titleText.trim() ? (
            <WikilinkText text={titleText} sourceNodeId={id} />
          ) : (
            <span className="text-[var(--text-light)] select-none">Node name</span>
          )}
        </div>
      )}

      {/* Content Field */}
      {isEditingContent ? (
        <textarea
          autoFocus
          rows={1}
          value={contentText}
          onChange={(e) => updateNodeData({ content: e.target.value })}
          onBlur={() => setIsEditingContent(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsEditingContent(false);
          }}
          placeholder="Type your notes here..."
          className="nodrag nopan w-full flex-1 bg-transparent text-xs font-medium text-[var(--text-normal)] placeholder-[var(--text-light)] focus:outline-none resize-none leading-relaxed font-sans cursor-text overflow-hidden antialiased subpixel-antialiased"
        />
      ) : (
        <div
          onClick={() => setIsEditingContent(true)}
          className="nodrag nopan w-full flex-1 bg-transparent text-xs font-medium text-[var(--text-normal)] leading-relaxed font-sans cursor-text min-h-[20px] break-words whitespace-pre-wrap antialiased subpixel-antialiased"
        >
          {renderNoteContent()}
        </div>
      )}
    </div>
  );
});

NoteNode.displayName = 'NoteNode';

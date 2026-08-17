import React, { useState, memo } from 'react';
import { NodeProps, useReactFlow, NodeResizer, useNodesData } from '@xyflow/react';
import { NoteNodeData, CanvasEdge } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';
import { WikilinkText } from '../WikilinkText';
import { syncAutoEdges } from '../../utils/edgeUtils';
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

  const updateNodeData = (updates: Partial<NoteNodeData>) => {
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
          onBlur={() => setIsEditingTitle(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setIsEditingTitle(false);
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
          {contentText.trim() ? (
            <WikilinkText text={contentText} sourceNodeId={id} />
          ) : (
            <span className="text-[var(--text-light)] select-none">Type your notes here...</span>
          )}
        </div>
      )}
    </div>
  );
});

NoteNode.displayName = 'NoteNode';



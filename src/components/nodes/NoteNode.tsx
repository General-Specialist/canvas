import React, { useState, useEffect, useLayoutEffect, useRef, memo } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { NoteNodeData } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';

import { syncAutoEdges } from '../../utils/edgeUtils';
import { CanvasEdge } from '../../types/canvas';

export const NoteNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable }) => {
  const { setNodes, setEdges } = useReactFlow();
  const nodeData = data as unknown as NoteNodeData;

  const [localTitle, setLocalTitle] = useState(nodeData.title || '');
  const [localContent, setLocalContent] = useState(nodeData.content || '');

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if ((nodeData.title || '') !== localTitle) {
      setLocalTitle(nodeData.title || '');
    }
  }, [nodeData.title]);

  useEffect(() => {
    if ((nodeData.content || '') !== localContent) {
      setLocalContent(nodeData.content || '');
    }
  }, [nodeData.content]);

  // Dynamically adjust title textarea height to fit text content
  useLayoutEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [localTitle]);

  // Dynamically adjust content textarea height to fit text content
  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [localContent]);

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalTitle(val);
    updateNodeData({ title: val });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalContent(val);
    updateNodeData({ content: val });
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-[260px] min-h-[100px] rounded-xl border border-[var(--node-border)] bg-[var(--node-bg)] flex flex-col p-3.5 transition-shadow duration-150 ${
        selected
          ? 'ring-2 ring-[var(--node-selected-ring)]'
          : isHovered
          ? 'ring-2 ring-[var(--node-hover-ring)]'
          : ''
      }`}
    >
      {/* Handles */}
      <FourWayHandles isConnectable={isConnectable} />

      {/* Auto-growing Title (2x bigger than content text: 24px vs 12px) */}
      <textarea
        ref={titleRef}
        rows={1}
        value={localTitle}
        onChange={handleTitleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            contentRef.current?.focus();
          }
        }}
        placeholder="Node name"
        className="nodrag nopan w-full bg-transparent text-2xl font-bold text-[var(--text-normal)] placeholder-[var(--text-light)] focus:outline-none mb-1.5 font-sans leading-tight resize-none overflow-hidden"
      />

      {/* Auto-growing Content */}
      <textarea
        ref={contentRef}
        rows={1}
        value={localContent}
        onChange={handleContentChange}
        placeholder="Type your notes here..."
        className="nodrag nopan w-full bg-transparent text-xs font-medium text-[var(--text-normal)] placeholder-[var(--text-light)] focus:outline-none resize-none leading-relaxed font-sans cursor-text overflow-hidden antialiased subpixel-antialiased"
      />
    </div>
  );
});

NoteNode.displayName = 'NoteNode';

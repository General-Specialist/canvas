import React, { useState, useEffect, useLayoutEffect, useRef, memo } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { NoteNodeData } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';
import { WikilinkText } from '../WikilinkText';

import { syncAutoEdges } from '../../utils/edgeUtils';
import { CanvasEdge } from '../../types/canvas';

export const NoteNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable }) => {
  const { setNodes, setEdges } = useReactFlow();
  const nodeData = data as unknown as NoteNodeData;

  const titleText = nodeData.title || '';
  const contentText = nodeData.content || '';

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingContent && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isEditingContent]);

  // Dynamically adjust title textarea height to fit text content
  useLayoutEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [titleText, isEditingTitle]);

  // Dynamically adjust content textarea height to fit text content
  useLayoutEffect(() => {
    if (isEditingContent && contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [contentText, isEditingContent]);

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
    updateNodeData({ title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData({ content: e.target.value });
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

      {/* Title Field (Renders [[wikilinks]] as purple text when not editing) */}
      {isEditingTitle ? (
        <textarea
          ref={titleRef}
          rows={1}
          value={titleText}
          onChange={handleTitleChange}
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

      {/* Content Field (Renders [[wikilinks]] as purple text when not editing) */}
      {isEditingContent ? (
        <textarea
          ref={contentRef}
          rows={1}
          value={contentText}
          onChange={handleContentChange}
          onBlur={() => setIsEditingContent(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsEditingContent(false);
            }
          }}
          placeholder="Type your notes here..."
          className="nodrag nopan w-full bg-transparent text-xs font-medium text-[var(--text-normal)] placeholder-[var(--text-light)] focus:outline-none resize-none leading-relaxed font-sans cursor-text overflow-hidden antialiased subpixel-antialiased"
        />
      ) : (
        <div
          onClick={() => setIsEditingContent(true)}
          className="nodrag nopan w-full bg-transparent text-xs font-medium text-[var(--text-normal)] leading-relaxed font-sans cursor-text min-h-[20px] break-words whitespace-pre-wrap antialiased subpixel-antialiased"
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

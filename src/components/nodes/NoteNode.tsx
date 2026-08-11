import React, { useState, useEffect, useRef, memo } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { NoteNodeData } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';

export const NoteNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable }) => {
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as NoteNodeData;

  const getInitialText = (title?: string, content?: string) => {
    const t = title ?? '';
    const c = content ?? '';
    if (!t && !c) return '';
    if (!c) return t;
    if (!t) return c;
    if (c.startsWith(t)) return c;
    return `${t}\n${c}`;
  };

  const [localText, setLocalText] = useState(() =>
    getInitialText(nodeData.title, nodeData.content)
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const lines = localText.split('\n');
    const currentFirst = lines[0].trim();
    const currentRest = lines.slice(1).join('\n');

    const incomingFirst = (nodeData.title || '').trim();
    const incomingRest = nodeData.content || '';

    if (incomingFirst !== currentFirst || incomingRest !== currentRest) {
      setLocalText(getInitialText(nodeData.title, nodeData.content));
    }
  }, [nodeData.title, nodeData.content]);

  const updateNodeData = (updates: Partial<NoteNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
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
      })
    );
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalText(val);

    const lines = val.split('\n');
    const firstLine = lines[0];
    const restOfText = lines.slice(1).join('\n');

    updateNodeData({
      title: firstLine || 'Untitled Note',
      content: restOfText,
    });
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full min-w-[200px] min-h-[120px] rounded-xl border border-[var(--node-border)] bg-[var(--node-bg)] flex flex-col p-3.5 transition-shadow duration-150 ${
        selected
          ? 'ring-2 ring-[var(--node-selected-ring)]'
          : isHovered
          ? 'ring-2 ring-[var(--node-hover-ring)]'
          : ''
      }`}
    >
      <NodeResizer
        minWidth={200}
        minHeight={120}
        isVisible={selected}
        color="var(--node-selected-ring)"
      />

      {/* Handles */}
      <FourWayHandles isConnectable={isConnectable} />

      {/* Single Continuous Note Editor */}
      <textarea
        ref={textareaRef}
        value={localText}
        onChange={handleTextChange}
        placeholder={"Untitled Note\nType your notes here..."}
        className="nodrag nopan w-full h-full bg-transparent text-xs font-medium text-[var(--text-normal)] placeholder-[var(--text-light)] focus:outline-none resize-none leading-relaxed font-sans cursor-text overflow-auto"
      />
    </div>
  );
});

NoteNode.displayName = 'NoteNode';

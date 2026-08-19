import React, { useState, memo, useCallback } from 'react';
import { NodeProps, useReactFlow, NodeResizer } from '@xyflow/react';
import { GroupNodeData, CanvasEdge } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';
import { syncAutoEdges, autoLinkNodesForTitle } from '../../utils/edgeUtils';
import { WikilinkText } from '../WikilinkText';

export const GroupNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable }) => {
  const { setNodes, setEdges } = useReactFlow();
  const groupData = data as unknown as GroupNodeData;

  const titleText = groupData.title || '';
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const updateGroupData = useCallback(
    (updates: Partial<GroupNodeData>) => {
      setNodes((nds) => {
        const updatedNodes = nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...updates } } : n));
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

  return (
    <div
      className={`relative w-full h-full rounded-2xl border border-[var(--border-color)] bg-[var(--sidebar-bg)]/40 backdrop-blur-[2px] flex flex-col overflow-hidden transition-all duration-200 ${
        selected ? 'ring-2 ring-[var(--node-selected-ring)] shadow-lg' : 'hover:border-[var(--text-light)]/40'
      }`}
    >
      <FourWayHandles isConnectable={isConnectable} />
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName="!border-[var(--primary-accent)] !border-dashed"
        handleClassName="!w-3 !h-3 !bg-[var(--primary-accent)] !border-2 !border-white dark:!border-[#16161e] !rounded-full"
      />

      {/* Header */}
      <div className="flex items-start justify-between px-5 py-3.5 select-none">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingTitle ? (
            <textarea
              autoFocus
              rows={1}
              value={titleText}
              onChange={(e) => updateGroupData({ title: e.target.value })}
              onBlur={() => commitTitle(titleText)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  commitTitle(titleText);
                } else if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                }
              }}
              placeholder="Group Title"
              className="nodrag nopan bg-transparent text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-hover)] placeholder:text-[var(--text-light)]/40 focus:outline-none w-full resize-none overflow-hidden"
            />
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="nodrag nopan bg-transparent text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-hover)] w-full cursor-text min-h-[36px] break-words whitespace-pre-wrap"
            >
              {titleText.trim() ? (
                <WikilinkText text={titleText} sourceNodeId={id} />
              ) : (
                <span className="opacity-40 select-none">Group Title</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
});

GroupNode.displayName = 'GroupNode';


import React, { useState, memo, useCallback } from 'react';
import { NodeProps, useReactFlow, NodeResizer } from '@xyflow/react';
import { GroupNodeData, CanvasEdge } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';
import { syncAutoEdges, autoLinkNodesForTitle } from '../../utils/edgeUtils';
import { WikilinkText } from '../WikilinkText';

export const COLOR_THEMES: Record<string, { name: string; bg: string; border: string; text: string; dot: string }> = {
  featherGreen: {
    name: 'Feather Green',
    bg: 'bg-transparent',
    border: 'border-[#58CC02]',
    text: 'text-[#58CC02] dark:text-[#89E219]',
    dot: 'bg-[#58CC02]',
  },
  maskGreen: {
    name: 'Mask Green',
    bg: 'bg-transparent',
    border: 'border-[#89E219]',
    text: 'text-[#58CC02] dark:text-[#89E219]',
    dot: 'bg-[#89E219]',
  },
  macaw: {
    name: 'Macaw',
    bg: 'bg-transparent',
    border: 'border-[#1CB0F6]',
    text: 'text-[#1CB0F6] dark:text-[#1CB0F6]',
    dot: 'bg-[#1CB0F6]',
  },
  cardinal: {
    name: 'Cardinal',
    bg: 'bg-transparent',
    border: 'border-[#FF4B4B]',
    text: 'text-[#FF4B4B] dark:text-[#FF4B4B]',
    dot: 'bg-[#FF4B4B]',
  },
  bee: {
    name: 'Bee',
    bg: 'bg-transparent',
    border: 'border-[#FFC800]',
    text: 'text-[#D4A000] dark:text-[#FFC800]',
    dot: 'bg-[#FFC800]',
  },
  fox: {
    name: 'Fox',
    bg: 'bg-transparent',
    border: 'border-[#FF9600]',
    text: 'text-[#FF9600] dark:text-[#FF9600]',
    dot: 'bg-[#FF9600]',
  },
  beetle: {
    name: 'Beetle',
    bg: 'bg-transparent',
    border: 'border-[#CE82FF]',
    text: 'text-[#B255FF] dark:text-[#CE82FF]',
    dot: 'bg-[#CE82FF]',
  },
  humpback: {
    name: 'Humpback',
    bg: 'bg-transparent',
    border: 'border-[#2B70C9]',
    text: 'text-[#2B70C9] dark:text-[#4A92ED]',
    dot: 'bg-[#2B70C9]',
  },
};

const COLOR_ALIAS: Record<string, string> = {
  blue: 'macaw',
  emerald: 'featherGreen',
  purple: 'beetle',
  amber: 'fox',
  rose: 'cardinal',
};

export function getGroupTheme(colorName?: string) {
  const rawColor = colorName || 'featherGreen';
  const currentColor = COLOR_THEMES[rawColor] ? rawColor : COLOR_ALIAS[rawColor] || 'featherGreen';
  return COLOR_THEMES[currentColor];
}

export const GroupNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable }) => {
  const { setNodes, setEdges } = useReactFlow();
  const groupData = data as unknown as GroupNodeData;

  const titleText = groupData.title || '';
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const themeStyles = getGroupTheme(groupData.color);

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
      className={`relative w-full h-full rounded-2xl border-2 flex flex-col overflow-hidden transition-colors duration-200 ${
        themeStyles.bg
      } ${themeStyles.border} ${
        selected ? 'ring-2 ring-[var(--node-selected-ring)] shadow-lg' : ''
      }`}
    >
      <FourWayHandles isConnectable={isConnectable} />
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName="!border-[#58CC02] !border-dashed"
        handleClassName="!w-3 !h-3 !bg-[#58CC02] !border-2 !border-white !rounded-full"
      />

      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 select-none">
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
              className={`nodrag nopan bg-transparent text-5xl font-bold tracking-tight leading-tight focus:outline-none w-full resize-none overflow-hidden ${themeStyles.text}`}
            />
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className={`nodrag nopan bg-transparent text-5xl font-bold tracking-tight leading-tight w-full cursor-text min-h-[50px] break-words whitespace-pre-wrap ${themeStyles.text}`}
            >
              {titleText.trim() ? (
                <WikilinkText text={titleText} sourceNodeId={id} />
              ) : (
                <span className="opacity-50 select-none">Group Title</span>
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


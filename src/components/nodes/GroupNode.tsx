import React, { useState, memo, useCallback, useRef, useLayoutEffect } from 'react';
import { NodeProps, useReactFlow, NodeResizer } from '@xyflow/react';
import { Trash, Palette } from '@phosphor-icons/react';
import { GroupNodeData, CanvasEdge } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';
import { expandGroupEdges, syncAutoEdges } from '../../utils/edgeUtils';
import { WikilinkText } from '../WikilinkText';

const COLOR_THEMES: Record<string, { name: string; bg: string; border: string; text: string; dot: string }> = {
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

export const GroupNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable }) => {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const groupData = data as unknown as GroupNodeData;

  const titleText = groupData.title || '';
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const rawColor = groupData.color || 'featherGreen';
  const currentColor = COLOR_THEMES[rawColor] ? rawColor : COLOR_ALIAS[rawColor] || 'featherGreen';
  const themeStyles = COLOR_THEMES[currentColor];

  useLayoutEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [titleText, isEditingTitle]);

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

  const handleUngroup = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEdges((eds) => expandGroupEdges(new Set([id]), getNodes(), eds) as CanvasEdge[]);
      setNodes((nds) => {
        const groupNode = nds.find((n) => n.id === id);
        if (!groupNode) return nds;

        const { x: groupX, y: groupY } = groupNode.position;

        return nds
          .filter((n) => n.id !== id)
          .map((n) => {
            if (n.parentId === id) {
              return {
                ...n,
                parentId: undefined,
                position: { x: groupX + n.position.x, y: groupY + n.position.y },
                selected: true,
              };
            }
            return n;
          });
      });
    },
    [getNodes, id, setEdges, setNodes]
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
              ref={titleRef}
              rows={1}
              value={titleText}
              onChange={(e) => updateGroupData({ title: e.target.value })}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setIsEditingTitle(false);
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

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="nodrag nopan p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-xs text-[var(--text-light)] hover:text-[var(--text-normal)] transition-colors cursor-pointer"
              title="Change Color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {showColorPicker && (
              <div className="nodrag nopan absolute right-0 top-full mt-1 z-50 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl p-1.5 shadow-xl flex gap-1.5">
                {Object.entries(COLOR_THEMES).map(([cKey, t]) => (
                  <button
                    key={cKey}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateGroupData({ color: cKey });
                      setShowColorPicker(false);
                    }}
                    className={`w-4 h-4 rounded-full border border-black/20 capitalize ${t.dot}`}
                    title={t.name}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleUngroup}
            className="nodrag nopan p-1 rounded-md hover:bg-[#FF4B4B]/10 text-[#FF4B4B] hover:text-[#FF4B4B] transition-colors cursor-pointer"
            title="Ungroup (Cmd+Shift+G)"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
});

GroupNode.displayName = 'GroupNode';


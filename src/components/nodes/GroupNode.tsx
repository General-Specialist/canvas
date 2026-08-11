import React, { useState, memo, useCallback, useRef, useLayoutEffect } from 'react';
import { NodeProps, useReactFlow, NodeResizer } from '@xyflow/react';
import { Trash, Palette } from '@phosphor-icons/react';
import { GroupNodeData, CanvasEdge } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';
import { expandGroupEdges } from '../../utils/edgeUtils';

const COLOR_THEMES: Record<string, { bg: string; border: string; text: string }> = {
  blue: {
    bg: 'bg-blue-500/5 dark:bg-blue-500/10',
    border: 'border-blue-500/30 dark:border-blue-400/40',
    text: 'text-blue-600 dark:text-blue-300',
  },
  emerald: {
    bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
    border: 'border-emerald-500/30 dark:border-emerald-400/40',
    text: 'text-emerald-600 dark:text-emerald-300',
  },
  purple: {
    bg: 'bg-purple-500/5 dark:bg-purple-500/10',
    border: 'border-purple-500/30 dark:border-purple-400/40',
    text: 'text-purple-600 dark:text-purple-300',
  },
  amber: {
    bg: 'bg-amber-500/5 dark:bg-amber-500/10',
    border: 'border-amber-500/30 dark:border-amber-400/40',
    text: 'text-amber-600 dark:text-amber-300',
  },
  rose: {
    bg: 'bg-rose-500/5 dark:bg-rose-500/10',
    border: 'border-rose-500/30 dark:border-rose-400/40',
    text: 'text-rose-600 dark:text-rose-300',
  },
};

export const GroupNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable }) => {
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const groupData = data as unknown as GroupNodeData;

  const [title, setTitle] = useState(groupData.title || 'Group');
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const currentColor = groupData.color && COLOR_THEMES[groupData.color] ? groupData.color : 'blue';
  const themeStyles = COLOR_THEMES[currentColor];

  const [showColorPicker, setShowColorPicker] = useState(false);

  useLayoutEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  const updateGroupData = useCallback(
    (updates: Partial<GroupNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                ...updates,
              },
            };
          }
          return n;
        })
      );
    },
    [id, setNodes]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTitle(val);
    updateGroupData({ title: val });
  };

  const handleUngroup = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEdges((eds) => expandGroupEdges(new Set([id]), getNodes(), eds) as CanvasEdge[]);
      setNodes((nds) => {
        const groupNode = nds.find((n) => n.id === id);
        if (!groupNode) return nds;

        const groupX = groupNode.position.x;
        const groupY = groupNode.position.y;

        return nds
          .filter((n) => n.id !== id)
          .map((n) => {
            if (n.parentId === id) {
              return {
                ...n,
                parentId: undefined,
                position: {
                  x: groupX + n.position.x,
                  y: groupY + n.position.y,
                },
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
        selected ? 'ring-2 ring-blue-500/50 dark:ring-blue-400/50 shadow-lg' : ''
      }`}
    >
      <FourWayHandles isConnectable={isConnectable} />
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName="!border-blue-500 !border-dashed"
        handleClassName="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !rounded-full"
      />

      {/* Group Header Bar (Seamless transparent background with multi-line textarea title) */}
      <div className="flex items-start justify-between px-4 py-3 select-none">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <textarea
            ref={titleRef}
            rows={1}
            value={title}
            onChange={handleTitleChange}
            placeholder="Group Title"
            className={`nodrag nopan bg-transparent text-5xl font-bold tracking-tight leading-tight focus:outline-none w-full resize-none overflow-hidden ${themeStyles.text}`}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Color Picker Toggle */}
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
                {Object.keys(COLOR_THEMES).map((cKey) => (
                  <button
                    key={cKey}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateGroupData({ color: cKey });
                      setShowColorPicker(false);
                    }}
                    className={`w-4 h-4 rounded-full border border-black/20 capitalize ${
                      cKey === 'blue'
                        ? 'bg-blue-500'
                        : cKey === 'emerald'
                        ? 'bg-emerald-500'
                        : cKey === 'purple'
                        ? 'bg-purple-500'
                        : cKey === 'amber'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    title={cKey}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Ungroup (Red Trash Can Icon) */}
          <button
            onClick={handleUngroup}
            className="nodrag nopan p-1 rounded-md hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            title="Ungroup (Cmd+Shift+G)"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Group Interior Container (allows click-through to child nodes inside) */}
      <div className="flex-1 pointer-events-none" />
    </div>
  );
});

GroupNode.displayName = 'GroupNode';

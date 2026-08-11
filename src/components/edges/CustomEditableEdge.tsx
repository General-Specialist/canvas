import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { Plus, GitCommit, X } from '@phosphor-icons/react';
import { CustomEdgeData } from '../../types/canvas';

export const CustomEditableEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const { setEdges, setNodes } = useReactFlow();
  const edgeData = (data as CustomEdgeData) || {};

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState(edgeData.label || '');

  const updateLabel = (text: string) => {
    setLabelText(text);
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            data: {
              ...e.data,
              label: text,
            },
          };
        }
        return e;
      })
    );
  };

  const addJunctionOnEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    const junctionId = `junction-${Date.now()}`;
    const newJunctionNode = {
      id: junctionId,
      type: 'edgeJunction',
      position: {
        x: labelX - 8,
        y: labelY - 8,
      },
      data: { parentEdgeId: id },
    };

    setNodes((nds) => [...nds, newJunctionNode]);
  };

  const deleteEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? 'var(--edge-stroke-selected)' : 'var(--edge-stroke)',
          strokeWidth: selected ? 3.5 : 2.5,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex items-center space-x-1 group z-20"
        >
          {isEditingLabel ? (
            <div className="flex items-center space-x-1 bg-[var(--sidebar-bg)] border border-[var(--border-color)] px-2 py-1 rounded-lg shadow-md">
              <input
                type="text"
                value={labelText}
                onChange={(e) => updateLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingLabel(false)}
                onBlur={() => setIsEditingLabel(false)}
                placeholder="Connection note..."
                autoFocus
                className="bg-transparent text-xs text-[var(--text-hover)] placeholder-[var(--text-light)] focus:outline-none w-32"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              {edgeData.label ? (
                <div
                  onClick={() => setIsEditingLabel(true)}
                  className="bg-[var(--sidebar-bg)] border border-[var(--border-color)] text-[11px] font-medium text-[var(--text-hover)] px-2 py-0.5 rounded-md hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
                >
                  <span>{edgeData.label}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingLabel(true)}
                  className="opacity-0 group-hover:opacity-100 bg-[var(--sidebar-bg)] border border-[var(--border-color)] text-[10px] text-[var(--text-normal)] hover:text-[var(--text-hover)] px-1.5 py-0.5 rounded-md hover:bg-[var(--sidebar-hover-bg)] transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[var(--text-normal)]" />
                  <span>Label</span>
                </button>
              )}

              <button
                onClick={addJunctionOnEdge}
                className="opacity-0 group-hover:opacity-100 bg-[var(--sidebar-bg)] border border-[var(--border-color)] text-[var(--text-normal)] hover:text-[var(--text-hover)] p-1 rounded-full hover:bg-[var(--sidebar-hover-bg)] transition-all cursor-pointer"
                title="Add junction point"
              >
                <GitCommit className="w-3 h-3" />
              </button>

              {selected && (
                <button
                  onClick={deleteEdge}
                  className="bg-[var(--sidebar-hover-bg)] border border-[var(--border-color)] text-[var(--text-hover)] p-1 rounded-full hover:bg-[var(--icon-hover-bg)] transition-all cursor-pointer"
                  title="Delete Edge"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

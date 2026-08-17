import React, { useState, useEffect, useRef } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
  useInternalNode,
} from '@xyflow/react';
import { X } from '@phosphor-icons/react';

import { expandGroupEdges, getFloatingEdgeParams } from '../../utils/edgeUtils';
import { CanvasEdge } from '../../types/canvas';

export const CustomEditableEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  label,
  data,
}) => {
  const { setEdges, getNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const floatingParams = getFloatingEdgeParams(sourceNode, targetNode);

  const currentLabel = (data?.label as string) || (typeof label === 'string' ? label : '') || '';
  const [labelText, setLabelText] = useState(currentLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabelText(currentLabel);
  }, [currentLabel]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const [edgePath, labelX, labelY] = getBezierPath(
    floatingParams || {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    }
  );

  const saveLabel = () => {
    setIsEditing(false);
    const trimmed = labelText.trim();
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            label: trimmed,
            data: { ...e.data, label: trimmed },
          };
        }
        return e;
      })
    );
  };

  const deleteEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentNodes = getNodes();
    const sourceNode = currentNodes.find((n) => n.id === source);
    const targetNode = currentNodes.find((n) => n.id === target);
    const isGroup = sourceNode?.type === 'groupNode' || targetNode?.type === 'groupNode';

    setEdges((eds) => {
      const remaining = eds.filter((edge) => edge.id !== id);
      if (!isGroup) return remaining;

      const groupIds = new Set<string>();
      if (sourceNode?.type === 'groupNode') groupIds.add(sourceNode.id);
      if (targetNode?.type === 'groupNode') groupIds.add(targetNode.id);
      return expandGroupEdges(groupIds, currentNodes, remaining) as CanvasEdge[];
    });
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
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          className="nodrag nopan absolute pointer-events-auto flex items-center gap-1.5 z-20 select-none"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={saveLabel}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  e.preventDefault();
                  saveLabel();
                }
              }}
              placeholder="Edge label..."
              className="bg-[var(--sidebar-bg)] border border-[#58CC02] text-[var(--text-normal)] text-xs px-2.5 py-1 rounded-lg shadow-lg focus:outline-none min-w-[80px] max-w-[200px] text-center font-medium"
            />
          ) : (
            <>
              {currentLabel.trim() ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--sidebar-bg)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-normal)] shadow-sm hover:border-[var(--wikilink-color)] hover:text-[var(--text-hover)] transition-all cursor-pointer"
                  title="Click to edit edge label"
                >
                  {currentLabel}
                </div>
              ) : selected ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="px-2 py-0.5 rounded-md bg-[var(--sidebar-bg)] border border-[var(--border-color)] text-[11px] font-medium text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-all cursor-pointer shadow-sm"
                  title="Add label to edge"
                >
                  + Label
                </button>
              ) : null}

              {selected && (
                <button
                  onClick={deleteEdge}
                  className="bg-[var(--sidebar-hover-bg)] border border-[var(--border-color)] text-[var(--text-hover)] p-1 rounded-full hover:bg-[#FF4B4B]/10 hover:text-[#FF4B4B] transition-all cursor-pointer shadow-sm"
                  title="Delete Edge"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

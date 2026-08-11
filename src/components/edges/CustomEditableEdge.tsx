import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { GitCommit, X } from '@phosphor-icons/react';

import { expandGroupEdges } from '../../utils/edgeUtils';
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
}) => {
  const { setEdges, setNodes, getNodes } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const addJunctionOnEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => [
      ...nds,
      {
        id: `junction-${Date.now()}`,
        type: 'edgeJunction',
        position: { x: labelX - 8, y: labelY - 8 },
        data: { parentEdgeId: id },
      },
    ]);
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
          className="nodrag nopan absolute pointer-events-auto flex items-center space-x-1 group z-20"
        >
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
      </EdgeLabelRenderer>
    </>
  );
};


import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { GitCommit, X } from '@phosphor-icons/react';

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
  selected,
}) => {
  const { setEdges, setNodes } = useReactFlow();

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
          <div className="flex items-center space-x-1">
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
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

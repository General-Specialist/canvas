import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export const EdgeJunctionNode: React.FC<NodeProps> = memo(({ selected, isConnectable }) => {
  return (
    <div
      className={`relative w-4 h-4 rounded-full bg-[var(--text-hover)] border-2 border-[var(--canvas-bg)] cursor-pointer transition-shadow ${
        selected ? 'ring-2 ring-[var(--node-selected-ring)]' : ''
      }`}
    >
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', top: 0, left: 0 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', top: 0, left: 0 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', top: 0, left: 0 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', top: 0, left: 0 }}
        isConnectable={isConnectable}
      />
    </div>
  );
});

EdgeJunctionNode.displayName = 'EdgeJunctionNode';

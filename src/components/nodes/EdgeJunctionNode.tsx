import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

const POSITIONS = [
  { id: 'top', pos: Position.Top },
  { id: 'right', pos: Position.Right },
  { id: 'bottom', pos: Position.Bottom },
  { id: 'left', pos: Position.Left },
];

const HANDLE_STYLE: React.CSSProperties = { width: '100%', height: '100%', background: 'transparent', border: 'none', top: 0, left: 0 };

export const EdgeJunctionNode: React.FC<NodeProps> = memo(({ selected, isConnectable }) => (
  <div
    className={`relative w-4 h-4 rounded-full bg-[var(--text-hover)] border-2 border-[var(--canvas-bg)] cursor-pointer transition-shadow ${
      selected ? 'ring-2 ring-[var(--node-selected-ring)]' : ''
    }`}
  >
    {POSITIONS.map(({ id, pos }) => (
      <React.Fragment key={id}>
        <Handle type="target" position={pos} id={id} style={HANDLE_STYLE} isConnectable={isConnectable} />
        <Handle type="source" position={pos} id={id} style={HANDLE_STYLE} isConnectable={isConnectable} />
      </React.Fragment>
    ))}
  </div>
));

EdgeJunctionNode.displayName = 'EdgeJunctionNode';


import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const POSITIONS = [
  { id: 'top', pos: Position.Top, style: { top: 0, left: '50%', transform: 'translate(-50%, -50%)' } },
  { id: 'right', pos: Position.Right, style: { top: '50%', right: 0, transform: 'translate(50%, -50%)' } },
  { id: 'bottom', pos: Position.Bottom, style: { bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' } },
  { id: 'left', pos: Position.Left, style: { top: '50%', left: 0, transform: 'translate(-50%, -50%)' } },
];

export const FourWayHandles: React.FC<{ isConnectable?: boolean }> = memo(({ isConnectable }) => (
  <>
    {POSITIONS.map(({ id, pos, style }) => (
      <React.Fragment key={id}>
        <Handle type="source" position={pos} id={id} style={style} isConnectable={isConnectable} />
        <Handle type="target" position={pos} id={id} style={style} isConnectable={isConnectable} />
      </React.Fragment>
    ))}
  </>
));

FourWayHandles.displayName = 'FourWayHandles';

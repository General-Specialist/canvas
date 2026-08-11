import { Node, Edge, Position } from '@xyflow/react';

interface HandlePosition {
  x: number;
  y: number;
  position: Position;
  id: string;
}

const NODE_DEFAULT_WIDTH = 300;
const NODE_DEFAULT_HEIGHT = 200;

function getNodeSideMidpoints(node: Node): Record<string, HandlePosition> {
  const defaultW = node.type === 'edgeJunction' ? 16 : NODE_DEFAULT_WIDTH;
  const defaultH = node.type === 'edgeJunction' ? 16 : NODE_DEFAULT_HEIGHT;
  const width = node.measured?.width || node.width || defaultW;
  const height = node.measured?.height || node.height || defaultH;
  const x = node.position.x;
  const y = node.position.y;

  return {
    top: {
      x: x + width / 2,
      y: y,
      position: Position.Top,
      id: 'top',
    },
    right: {
      x: x + width,
      y: y + height / 2,
      position: Position.Right,
      id: 'right',
    },
    bottom: {
      x: x + width / 2,
      y: y + height,
      position: Position.Bottom,
      id: 'bottom',
    },
    left: {
      x: x,
      y: y + height / 2,
      position: Position.Left,
      id: 'left',
    },
  };
}

function getOptimalHandles(
  sourceNode: Node,
  targetNode: Node
): { sourceHandle: string; targetHandle: string } {
  // If target is an EdgeJunctionNode or small node, allow handles to default
  const sourceSides = getNodeSideMidpoints(sourceNode);
  const targetSides = getNodeSideMidpoints(targetNode);

  let minDistance = Infinity;
  let bestSourceHandle = 'right';
  let bestTargetHandle = 'left';

  const sideKeys = ['top', 'right', 'bottom', 'left'];

  for (const sKey of sideKeys) {
    const sPt = sourceSides[sKey];
    for (const tKey of sideKeys) {
      const tPt = targetSides[tKey];
      const dist = Math.hypot(sPt.x - tPt.x, sPt.y - tPt.y);

      if (dist < minDistance) {
        minDistance = dist;
        bestSourceHandle = sKey;
        bestTargetHandle = tKey;
      }
    }
  }

  return {
    sourceHandle: bestSourceHandle,
    targetHandle: bestTargetHandle,
  };
}

export function optimizeAllEdges(nodes: Node[], edges: Edge[]): Edge[] {
  const nodeMap = new Map<string, Node>(nodes.map((n) => [n.id, n]));

  return edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) return edge;

    const { sourceHandle, targetHandle } = getOptimalHandles(sourceNode, targetNode);

    if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) {
      return edge;
    }

    return {
      ...edge,
      sourceHandle,
      targetHandle,
    };
  });
}

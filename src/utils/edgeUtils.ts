import { Node, Edge, Position, MarkerType } from '@xyflow/react';

interface HandlePosition {
  x: number;
  y: number;
  position: Position;
  id: string;
}

const NODE_DEFAULT_WIDTH = 300;
const NODE_DEFAULT_HEIGHT = 200;

export function getNodeAbsolutePos(
  node: Node,
  nodeMap?: Map<string, Node>
): { x: number; y: number } {
  if (node.parentId && nodeMap && nodeMap.has(node.parentId)) {
    const parentNode = nodeMap.get(node.parentId)!;
    const parentPos = getNodeAbsolutePos(parentNode, nodeMap);
    return {
      x: parentPos.x + node.position.x,
      y: parentPos.y + node.position.y,
    };
  }
  return {
    x: node.position.x,
    y: node.position.y,
  };
}

function getNodeSideMidpoints(
  node: Node,
  nodeMap?: Map<string, Node>
): Record<string, HandlePosition> {
  const defaultW = node.type === 'edgeJunction' ? 16 : NODE_DEFAULT_WIDTH;
  const defaultH = node.type === 'edgeJunction' ? 16 : NODE_DEFAULT_HEIGHT;
  const width = node.measured?.width || node.width || defaultW;
  const height = node.measured?.height || node.height || defaultH;
  const { x, y } = getNodeAbsolutePos(node, nodeMap);

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
  targetNode: Node,
  nodeMap?: Map<string, Node>
): { sourceHandle: string; targetHandle: string } {
  // If target is an EdgeJunctionNode or small node, allow handles to default
  const sourceSides = getNodeSideMidpoints(sourceNode, nodeMap);
  const targetSides = getNodeSideMidpoints(targetNode, nodeMap);

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

    const { sourceHandle, targetHandle } = getOptimalHandles(sourceNode, targetNode, nodeMap);

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

export function consolidateGroupEdges(nodes: Node[], edges: Edge[]): Edge[] {
  const groups = nodes.filter((n) => n.type === 'groupNode');
  if (groups.length === 0) return edges;

  let currentEdges = [...edges];

  groups.forEach((group) => {
    const childIds = nodes.filter((n) => n.parentId === group.id).map((n) => n.id);
    if (childIds.length === 0) return;

    const childSet = new Set(childIds);

    // 1. Outgoing: Check external targets where EVERY child in the group has an edge to that target
    const targetCounts = new Map<string, number>();
    currentEdges.forEach((edge) => {
      if (childSet.has(edge.source) && !childSet.has(edge.target) && edge.target !== group.id) {
        targetCounts.set(edge.target, (targetCounts.get(edge.target) || 0) + 1);
      }
    });

    targetCounts.forEach((count, targetId) => {
      if (count >= childIds.length) {
        currentEdges = currentEdges.filter(
          (e) => !(childSet.has(e.source) && e.target === targetId)
        );

        const hasGroupEdge = currentEdges.some(
          (e) => e.source === group.id && e.target === targetId
        );

        if (!hasGroupEdge) {
          currentEdges.push({
            id: `e-group-${group.id}-${targetId}`,
            source: group.id,
            target: targetId,
            sourceHandle: 'right',
            targetHandle: 'left',
            type: 'customEdge',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { animated: false },
          });
        }
      }
    });

    // 2. Incoming: Check external sources where EVERY child in the group receives an edge from that source
    const sourceCounts = new Map<string, number>();
    currentEdges.forEach((edge) => {
      if (childSet.has(edge.target) && !childSet.has(edge.source) && edge.source !== group.id) {
        sourceCounts.set(edge.source, (sourceCounts.get(edge.source) || 0) + 1);
      }
    });

    sourceCounts.forEach((count, sourceId) => {
      if (count >= childIds.length) {
        currentEdges = currentEdges.filter(
          (e) => !(e.source === sourceId && childSet.has(e.target))
        );

        const hasGroupEdge = currentEdges.some(
          (e) => e.source === sourceId && e.target === group.id
        );

        if (!hasGroupEdge) {
          currentEdges.push({
            id: `e-group-${sourceId}-${group.id}`,
            source: sourceId,
            target: group.id,
            sourceHandle: 'right',
            targetHandle: 'left',
            type: 'customEdge',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { animated: false },
          });
        }
      }
    });
  });

  return currentEdges;
}

export function expandGroupEdges(groupIds: Set<string>, nodes: Node[], edges: Edge[]): Edge[] {
  let newEdges = [...edges];

  groupIds.forEach((groupId) => {
    const childIds = nodes.filter((n) => n.parentId === groupId).map((n) => n.id);
    if (childIds.length === 0) return;

    const edgesToRemove = new Set<string>();
    const edgesToAdd: Edge[] = [];

    newEdges.forEach((edge) => {
      if (edge.source === groupId) {
        edgesToRemove.add(edge.id);
        childIds.forEach((childId) => {
          edgesToAdd.push({
            id: `e-${childId}-${edge.target}-${Date.now()}`,
            source: childId,
            target: edge.target,
            type: edge.type || 'customEdge',
            markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed },
            data: { ...edge.data },
          });
        });
      } else if (edge.target === groupId) {
        edgesToRemove.add(edge.id);
        childIds.forEach((childId) => {
          edgesToAdd.push({
            id: `e-${edge.source}-${childId}-${Date.now()}`,
            source: edge.source,
            target: childId,
            type: edge.type || 'customEdge',
            markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed },
            data: { ...edge.data },
          });
        });
      }
    });

    newEdges = newEdges.filter((e) => !edgesToRemove.has(e.id)).concat(edgesToAdd);
  });

  return newEdges;
}

export function ensureGroupTitleClearance<T extends Node>(nodes: T[]): T[] {
  const REQUIRED_TOP_CLEARANCE = 140;
  const groupNodes = nodes.filter((n) => n.type === 'groupNode');
  if (groupNodes.length === 0) return nodes;

  let modified = false;
  const nodeMap = new Map<string, T>(nodes.map((n) => [n.id, JSON.parse(JSON.stringify(n))]));

  for (const group of groupNodes) {
    const children = Array.from(nodeMap.values()).filter((n) => n.parentId === group.id);
    if (children.length === 0) continue;

    const minChildY = Math.min(...children.map((c) => c.position.y));
    if (minChildY < REQUIRED_TOP_CLEARANCE) {
      const diff = REQUIRED_TOP_CLEARANCE - minChildY;
      modified = true;

      const updatedGroup = nodeMap.get(group.id)!;
      updatedGroup.position = {
        ...updatedGroup.position,
        y: Math.round(updatedGroup.position.y - diff),
      };
      const currentHeight = (updatedGroup.style?.height as number) || (updatedGroup.measured?.height as number) || 220;
      updatedGroup.style = {
        ...updatedGroup.style,
        height: Math.round(currentHeight + diff),
      };

      for (const child of children) {
        const updatedChild = nodeMap.get(child.id)!;
        updatedChild.position = {
          ...updatedChild.position,
          y: Math.round(updatedChild.position.y + diff),
        };
      }
    }
  }

  return modified ? (Array.from(nodeMap.values()) as T[]) : nodes;
}

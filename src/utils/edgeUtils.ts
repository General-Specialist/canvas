import { Node, Edge, Position, MarkerType } from '@xyflow/react';

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function autoWrapTitleInText(text: string, titleToWrap: string): string {
  if (!text || !titleToWrap || !titleToWrap.trim()) return text;
  const trimmedTitle = titleToWrap.trim();
  if (trimmedTitle.length < 2) return text;

  const escaped = escapeRegExp(trimmedTitle);
  const regex = new RegExp(`(\\[\\[[^\\]]*\\]\\])|(\\b${escaped}\\b)`, 'gi');

  return text.replace(regex, (match, bracketed, unbracketed) => {
    if (bracketed) return bracketed;
    if (unbracketed) return `[[${unbracketed}]]`;
    return match;
  });
}

export function autoWrapConnectedNodeTitles(
  nodes: Node[],
  edges: Edge[]
): { updatedNodes: Node[]; modified: boolean } {
  if (nodes.length === 0 || edges.length === 0) {
    return { updatedNodes: nodes, modified: false };
  }

  const nodeMap = new Map<string, Node>(nodes.map((n) => [n.id, n]));
  const groupChildrenMap = new Map<string, string[]>();

  nodes.forEach((n) => {
    if (n.type === 'groupNode') {
      const childIds = nodes.filter((c) => c.parentId === n.id).map((c) => c.id);
      groupChildrenMap.set(n.id, childIds);
    }
  });

  const getNodesForId = (id: string): Node[] => {
    const list: Node[] = [];
    const directNode = nodeMap.get(id);
    if (directNode) list.push(directNode);

    if (groupChildrenMap.has(id)) {
      const childIds = groupChildrenMap.get(id)!;
      childIds.forEach((cid) => {
        const cNode = nodeMap.get(cid);
        if (cNode) list.push(cNode);
      });
    }
    return list;
  };

  let modified = false;
  const newNodesMap = new Map<string, Node>();
  nodes.forEach((n) => newNodesMap.set(n.id, JSON.parse(JSON.stringify(n))));

  edges.forEach((edge) => {
    const sources = getNodesForId(edge.source);
    const targets = getNodesForId(edge.target);

    sources.forEach((src) => {
      const srcTitle = (src.data as any)?.title;
      if (typeof srcTitle === 'string' && srcTitle.trim().length >= 2) {
        targets.forEach((tgt) => {
          if (tgt.id === src.id) return;
          const currentTgt = newNodesMap.get(tgt.id)!;
          const content = (currentTgt.data as any)?.content || '';
          const newContent = autoWrapTitleInText(content, srcTitle);

          if (newContent !== content) {
            modified = true;
            newNodesMap.set(tgt.id, {
              ...currentTgt,
              data: {
                ...currentTgt.data,
                content: newContent,
                updatedAt: new Date().toISOString(),
              },
            });
          }
        });
      }
    });

    targets.forEach((tgt) => {
      const tgtTitle = (tgt.data as any)?.title;
      if (typeof tgtTitle === 'string' && tgtTitle.trim().length >= 2) {
        sources.forEach((src) => {
          if (src.id === tgt.id) return;
          const currentSrc = newNodesMap.get(src.id)!;
          const content = (currentSrc.data as any)?.content || '';
          const newContent = autoWrapTitleInText(content, tgtTitle);

          if (newContent !== content) {
            modified = true;
            newNodesMap.set(src.id, {
              ...currentSrc,
              data: {
                ...currentSrc.data,
                content: newContent,
                updatedAt: new Date().toISOString(),
              },
            });
          }
        });
      }
    });
  });

  return {
    updatedNodes: modified ? Array.from(newNodesMap.values()) : nodes,
    modified,
  };
}

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

export function syncAutoEdges(nodes: Node[], edges: Edge[]): Edge[] {
  // 1. Map each groupNode to its set of child node IDs
  const groupChildrenMap = new Map<string, Set<string>>();
  nodes.forEach((n) => {
    if (n.type === 'groupNode') {
      const childIds = nodes.filter((child) => child.parentId === n.id).map((c) => c.id);
      groupChildrenMap.set(n.id, new Set(childIds));
    }
  });

  // 2. Collect base edges
  const baseEdges: Edge[] = [];
  const baseEdgeKeySet = new Set<string>();

  const addBaseEdge = (e: Edge) => {
    const key = `${e.source}->${e.target}`;
    if (!baseEdgeKeySet.has(key)) {
      baseEdgeKeySet.add(key);
      baseEdges.push(e);
    }
  };

  edges.forEach((edge) => {
    addBaseEdge(edge);
  });

  // 3. Scan for Wiki-Links
  const titleToNodeIdsMap = new Map<string, string[]>();
  nodes.forEach((n) => {
    const title = (n.data as any)?.title;
    if (typeof title === 'string' && title.trim()) {
      const lowerTitle = title.trim().toLowerCase();
      const existing = titleToNodeIdsMap.get(lowerTitle) || [];
      if (!existing.includes(n.id)) existing.push(n.id);
      titleToNodeIdsMap.set(lowerTitle, existing);
    }
    const lowerId = n.id.trim().toLowerCase();
    const existing = titleToNodeIdsMap.get(lowerId) || [];
    if (!existing.includes(n.id)) existing.push(n.id);
    titleToNodeIdsMap.set(lowerId, existing);
  });

  const requiredWikiEdgeKeys = new Set<string>();
  const wikiLinkRegex = /\[\[(.*?)\]\]/g;

  nodes.forEach((sourceNode) => {
    const titleText = (sourceNode.data as any)?.title || '';
    const contentText = (sourceNode.data as any)?.content || '';
    const fullText = `${titleText}\n${contentText}`;

    if (!fullText.includes('[[')) return;

    let match: RegExpExecArray | null;
    wikiLinkRegex.lastIndex = 0;
    while ((match = wikiLinkRegex.exec(fullText)) !== null) {
      let rawTarget = match[1]?.trim();
      if (!rawTarget) continue;
      if (rawTarget.includes('|')) {
        rawTarget = rawTarget.split('|')[0].trim();
      }
      if (!rawTarget) continue;

      const lowerTarget = rawTarget.toLowerCase();
      const matchingTargetIds = titleToNodeIdsMap.get(lowerTarget);

      if (matchingTargetIds) {
        matchingTargetIds.forEach((targetId) => {
          if (targetId !== sourceNode.id) {
            const pairKey = `${targetId}->${sourceNode.id}`;
            requiredWikiEdgeKeys.add(pairKey);
            addBaseEdge({
              id: `wiki-${targetId}-${sourceNode.id}`,
              source: targetId,
              target: sourceNode.id,
              type: 'customEdge',
              markerEnd: { type: MarkerType.ArrowClosed },
              data: { isWikiLink: true },
            });
          }
        });
      }
    }
  });

  // 4. Calculate Group Auto-Edges
  const groupNodes = nodes.filter((n) => n.type === 'groupNode');
  const requiredGroupEdgeMap = new Map<string, { source: string; target: string; childEdges: Edge[] }>();

  groupNodes.forEach((group) => {
    const childSet = groupChildrenMap.get(group.id);
    if (!childSet || childSet.size === 0) return;
    const childIds = Array.from(childSet);

    nodes.forEach((xNode) => {
      if (xNode.id === group.id) return;

      const targetId = xNode.id;
      const relevantChildren = childIds.filter((cid) => cid !== targetId);
      if (relevantChildren.length === 0) return;

      // Outgoing check: Group G -> Node X
      const outgoingEdges: Edge[] = [];
      const outgoingChildren = new Set<string>();
      baseEdges.forEach((e) => {
        if (childSet.has(e.source) && e.source !== targetId && e.target === targetId) {
          outgoingChildren.add(e.source);
          outgoingEdges.push(e);
        }
      });

      if (relevantChildren.every((cid) => outgoingChildren.has(cid))) {
        const key = `${group.id}->${targetId}`;
        requiredGroupEdgeMap.set(key, {
          source: group.id,
          target: targetId,
          childEdges: outgoingEdges,
        });
      }

      // Incoming check: Node X -> Group G
      const incomingEdges: Edge[] = [];
      const incomingChildren = new Set<string>();
      baseEdges.forEach((e) => {
        if (e.source === targetId && childSet.has(e.target) && e.target !== targetId) {
          incomingChildren.add(e.target);
          incomingEdges.push(e);
        }
      });

      if (relevantChildren.every((cid) => incomingChildren.has(cid))) {
        const key = `${targetId}->${group.id}`;
        requiredGroupEdgeMap.set(key, {
          source: targetId,
          target: group.id,
          childEdges: incomingEdges,
        });
      }
    });
  });

  // Helper to check if a group edge is active (either auto-required or manual in edges)
  const isGroupEdgeActive = (sourceId: string, targetId: string) => {
    const pairKey = `${sourceId}->${targetId}`;
    if (requiredGroupEdgeMap.has(pairKey)) return true;
    return edges.some((e) => e.source === sourceId && e.target === targetId);
  };

  // 5. Reconcile and filter edges
  const nextEdges: Edge[] = [];

  baseEdges.forEach((edge) => {
    // Check if this base edge is an individual child edge covered by an active group edge
    const sourceParent = nodes.find((n) => n.id === edge.source)?.parentId;
    const targetParent = nodes.find((n) => n.id === edge.target)?.parentId;

    const coveredByGroupOut = sourceParent && isGroupEdgeActive(sourceParent, edge.target);
    const coveredByGroupIn = targetParent && isGroupEdgeActive(edge.source, targetParent);
    const coveredByGroupGroup = sourceParent && targetParent && isGroupEdgeActive(sourceParent, targetParent);

    if (!coveredByGroupOut && !coveredByGroupIn && !coveredByGroupGroup) {
      nextEdges.push(edge);
    }
  });

  // Add all required Group Auto-Edges
  requiredGroupEdgeMap.forEach((info, key) => {
    const existingGroupEdge = edges.find((e) => `${e.source}->${e.target}` === key);
    const edgeId = existingGroupEdge?.id || `group-auto-${info.source}-${info.target}`;

    nextEdges.push({
      id: edgeId,
      source: info.source,
      target: info.target,
      type: 'customEdge',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        isGroupAutoEdge: true,
      },
    });
  });

  return optimizeAllEdges(nodes, nextEdges);
}

export const consolidateGroupEdges = syncAutoEdges;

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

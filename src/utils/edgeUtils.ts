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
      groupChildrenMap.get(id)!.forEach((cid) => {
        const cNode = nodeMap.get(cid);
        if (cNode) list.push(cNode);
      });
    }
    return list;
  };

  let modified = false;
  const newNodesMap = new Map<string, Node>();
  nodes.forEach((n) => newNodesMap.set(n.id, { ...n, data: { ...n.data } }));

  edges.forEach((edge) => {
    const sources = getNodesForId(edge.source);
    const targets = getNodesForId(edge.target);

    [[sources, targets]].forEach(([fromList, toList]) => {
      fromList.forEach((src) => {
        const srcTitle = (src.data as any)?.title;
        if (typeof srcTitle === 'string' && srcTitle.trim().length >= 2) {
          toList.forEach((tgt) => {
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
    });
  });

  return {
    updatedNodes: modified ? Array.from(newNodesMap.values()) : nodes,
    modified,
  };
}

export function getNodeDimensions(node: Node): { width: number; height: number } {
  const isJunction = node.type === 'edgeJunction';
  const styleWidth = typeof node.style?.width === 'number' ? node.style.width : parseFloat(String(node.style?.width || ''));
  const styleHeight = typeof node.style?.height === 'number' ? node.style.height : parseFloat(String(node.style?.height || ''));

  const width =
    node.measured?.width ||
    node.width ||
    (!isNaN(styleWidth) && styleWidth > 0 ? styleWidth : 0) ||
    (isJunction ? 16 : node.type === 'noteNode' ? 260 : 300);
  const height =
    node.measured?.height ||
    node.height ||
    (!isNaN(styleHeight) && styleHeight > 0 ? styleHeight : 0) ||
    (isJunction ? 16 : node.type === 'noteNode' ? 100 : 200);

  return { width, height };
}

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

export function getFloatingEdgeParams(sourceNode?: any, targetNode?: any) {
  if (!sourceNode || !targetNode) return null;

  const srcPos = sourceNode.internals?.positionAbsolute || sourceNode.position;
  const tgtPos = targetNode.internals?.positionAbsolute || targetNode.position;
  if (!srcPos || !tgtPos) return null;

  const srcDim = getNodeDimensions(sourceNode);
  const tgtDim = getNodeDimensions(targetNode);

  const srcPoints = {
    top: { x: srcPos.x + srcDim.width / 2, y: srcPos.y, position: Position.Top },
    right: { x: srcPos.x + srcDim.width, y: srcPos.y + srcDim.height / 2, position: Position.Right },
    bottom: { x: srcPos.x + srcDim.width / 2, y: srcPos.y + srcDim.height, position: Position.Bottom },
    left: { x: srcPos.x, y: srcPos.y + srcDim.height / 2, position: Position.Left },
  };

  const tgtPoints = {
    top: { x: tgtPos.x + tgtDim.width / 2, y: tgtPos.y, position: Position.Top },
    right: { x: tgtPos.x + tgtDim.width, y: tgtPos.y + tgtDim.height / 2, position: Position.Right },
    bottom: { x: tgtPos.x + tgtDim.width / 2, y: tgtPos.y + tgtDim.height, position: Position.Bottom },
    left: { x: tgtPos.x, y: tgtPos.y + tgtDim.height / 2, position: Position.Left },
  };

  let minDistance = Infinity;
  let bestSrc = srcPoints.right;
  let bestTgt = tgtPoints.left;

  for (const sKey of Object.keys(srcPoints) as (keyof typeof srcPoints)[]) {
    const s = srcPoints[sKey];
    for (const tKey of Object.keys(tgtPoints) as (keyof typeof tgtPoints)[]) {
      const t = tgtPoints[tKey];
      const dist = Math.hypot(s.x - t.x, s.y - t.y);
      if (dist < minDistance) {
        minDistance = dist;
        bestSrc = s;
        bestTgt = t;
      }
    }
  }

  return {
    sourceX: bestSrc.x,
    sourceY: bestSrc.y,
    sourcePosition: bestSrc.position,
    targetX: bestTgt.x,
    targetY: bestTgt.y,
    targetPosition: bestTgt.position,
  };
}

export function syncAutoEdges(nodes: Node[], edges: Edge[]): Edge[] {
  const nodeMap = new Map<string, Node>(nodes.map((n) => [n.id, n]));
  const groupChildrenMap = new Map<string, Set<string>>();
  nodes.forEach((n) => {
    if (n.type === 'groupNode') {
      const childIds = nodes.filter((child) => child.parentId === n.id).map((c) => c.id);
      groupChildrenMap.set(n.id, new Set(childIds));
    }
  });

  const baseEdges: Edge[] = [];
  const baseEdgeKeySet = new Set<string>();

  const addBaseEdge = (e: Edge) => {
    const key = `${e.source}->${e.target}`;
    if (!baseEdgeKeySet.has(key)) {
      baseEdgeKeySet.add(key);
      baseEdges.push(e);
    }
  };

  const isParentChildEdge = (srcId: string, tgtId: string) => {
    const srcNode = nodeMap.get(srcId);
    const tgtNode = nodeMap.get(tgtId);
    return srcNode?.parentId === tgtId || tgtNode?.parentId === srcId;
  };

  edges.forEach((edge) => {
    if (!edge.data?.isWikiLink && !edge.data?.isGroupAutoEdge && !isParentChildEdge(edge.source, edge.target)) {
      addBaseEdge(edge);
    }
  });

  // Scan for Wiki-Links
  const titleToNodeIdsMap = new Map<string, string[]>();
  nodes.forEach((n) => {
    const addKey = (k?: string) => {
      if (typeof k === 'string' && k.trim()) {
        const lower = k.trim().toLowerCase();
        const existing = titleToNodeIdsMap.get(lower) || [];
        if (!existing.includes(n.id)) existing.push(n.id);
        titleToNodeIdsMap.set(lower, existing);
      }
    };
    addKey((n.data as any)?.title);
    addKey(n.id);
  });

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

  // Calculate Group Auto-Edges
  const groupNodes = nodes.filter((n) => n.type === 'groupNode');
  const requiredGroupEdgeMap = new Map<string, { source: string; target: string; childEdges: Edge[] }>();

  groupNodes.forEach((group) => {
    const childSet = groupChildrenMap.get(group.id);
    if (!childSet || childSet.size === 0) return;
    const childIds = Array.from(childSet);

    nodes.forEach((xNode) => {
      if (xNode.id === group.id || childSet.has(xNode.id)) return;

      const targetId = xNode.id;
      const relevantChildren = childIds.filter((cid) => cid !== targetId);
      if (relevantChildren.length === 0) return;

      const outgoingEdges: Edge[] = [];
      const outgoingChildren = new Set<string>();
      baseEdges.forEach((e) => {
        if (childSet.has(e.source) && e.source !== targetId && e.target === targetId) {
          outgoingChildren.add(e.source);
          outgoingEdges.push(e);
        }
      });

      if (relevantChildren.every((cid) => outgoingChildren.has(cid))) {
        requiredGroupEdgeMap.set(`${group.id}->${targetId}`, {
          source: group.id,
          target: targetId,
          childEdges: outgoingEdges,
        });
      }

      const incomingEdges: Edge[] = [];
      const incomingChildren = new Set<string>();
      baseEdges.forEach((e) => {
        if (e.source === targetId && childSet.has(e.target) && e.target !== targetId) {
          incomingChildren.add(e.target);
          incomingEdges.push(e);
        }
      });

      if (relevantChildren.every((cid) => incomingChildren.has(cid))) {
        requiredGroupEdgeMap.set(`${targetId}->${group.id}`, {
          source: targetId,
          target: group.id,
          childEdges: incomingEdges,
        });
      }
    });
  });

  const isGroupEdgeActive = (sourceId: string, targetId: string) => {
    const pairKey = `${sourceId}->${targetId}`;
    return requiredGroupEdgeMap.has(pairKey) || edges.some((e) => e.source === sourceId && e.target === targetId);
  };

  const nextEdges: Edge[] = [];

  baseEdges.forEach((edge) => {
    const sourceParent = nodes.find((n) => n.id === edge.source)?.parentId;
    const targetParent = nodes.find((n) => n.id === edge.target)?.parentId;

    const coveredByOut = sourceParent && isGroupEdgeActive(sourceParent, edge.target);
    const coveredByIn = targetParent && isGroupEdgeActive(edge.source, targetParent);
    const coveredByBoth = sourceParent && targetParent && isGroupEdgeActive(sourceParent, targetParent);

    if (!coveredByOut && !coveredByIn && !coveredByBoth) {
      nextEdges.push(edge);
    }
  });

  requiredGroupEdgeMap.forEach((info, key) => {
    const existingGroupEdge = edges.find((e) => `${e.source}->${e.target}` === key);
    nextEdges.push({
      id: existingGroupEdge?.id || `group-auto-${info.source}-${info.target}`,
      source: info.source,
      target: info.target,
      type: 'customEdge',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { isGroupAutoEdge: true },
    });
  });

  return nextEdges;
}

export function expandGroupEdges(groupIds: Set<string>, nodes: Node[], edges: Edge[]): Edge[] {
  let newEdges = [...edges];

  groupIds.forEach((groupId) => {
    const childIds = nodes.filter((n) => n.parentId === groupId).map((n) => n.id);
    if (childIds.length === 0) return;

    const edgesToRemove = new Set<string>();
    const edgesToAdd: Edge[] = [];

    newEdges.forEach((edge) => {
      const isSourceGroup = edge.source === groupId;
      const isTargetGroup = edge.target === groupId;

      if (isSourceGroup || isTargetGroup) {
        edgesToRemove.add(edge.id);
        childIds.forEach((childId) => {
          edgesToAdd.push({
            id: `e-${isSourceGroup ? childId : edge.source}-${isTargetGroup ? childId : edge.target}-${Date.now()}`,
            source: isSourceGroup ? childId : edge.source,
            target: isTargetGroup ? childId : edge.target,
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

export function getGroupDepth(nodeId: string, nodeMap: Map<string, Node>): number {
  const node = nodeMap.get(nodeId);
  if (!node || !node.parentId || !nodeMap.has(node.parentId)) return 0;
  return 1 + getGroupDepth(node.parentId, nodeMap);
}

export function sortNodesByDepth<T extends Node>(nodes: T[]): T[] {
  const nodeMap = new Map<string, T>(nodes.map((n) => [n.id, n]));

  const validNodes = nodes.map((n) => {
    if (n.parentId && !nodeMap.has(n.parentId)) {
      return { ...n, parentId: undefined };
    }
    return n;
  });

  const validMap = new Map<string, T>(validNodes.map((n) => [n.id, n]));

  return [...validNodes].sort((a, b) => {
    const isAGroup = a.type === 'groupNode';
    const isBGroup = b.type === 'groupNode';

    if (isAGroup && !isBGroup) return -1;
    if (!isAGroup && isBGroup) return 1;

    if (isAGroup && isBGroup) {
      const depthA = getGroupDepth(a.id, validMap as Map<string, Node>);
      const depthB = getGroupDepth(b.id, validMap as Map<string, Node>);
      return depthA - depthB;
    }

    return 0;
  });
}

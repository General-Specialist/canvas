import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { CanvasNode } from '../types/canvas';

interface WikilinkTextProps {
  text: string;
  sourceNodeId?: string;
  className?: string;
  onTextClick?: (e: React.MouseEvent) => void;
}

export interface WikilinkSegment {
  type: 'text' | 'wikilink';
  content: string;
  target?: string;
}

export function parseWikilinks(text: string): WikilinkSegment[] {
  if (!text) return [];
  const regex = /\[\[(.*?)\]\]/g;
  const result: WikilinkSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const rawInner = match[1];
    let target = rawInner.trim();
    let display = target;

    if (target.includes('|')) {
      const parts = target.split('|');
      target = parts[0].trim();
      display = parts.slice(1).join('|').trim();
    }

    if (target) {
      result.push({
        type: 'wikilink',
        content: display || target,
        target: target,
      });
    } else {
      result.push({
        type: 'text',
        content: '[[]]',
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return result;
}

export const WikilinkText: React.FC<WikilinkTextProps> = ({
  text,
  sourceNodeId,
  className = '',
  onTextClick,
}) => {
  const { getNodes, setNodes, fitView } = useReactFlow();

  const handleLinkClick = useCallback(
    (targetTitle: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!targetTitle) return;

      const allNodes = getNodes() as CanvasNode[];
      const lowerTarget = targetTitle.trim().toLowerCase();

      const existingNode = allNodes.find((n) => {
        const title = (n.data as any)?.title;
        return (
          (typeof title === 'string' && title.trim().toLowerCase() === lowerTarget) ||
          n.id.trim().toLowerCase() === lowerTarget
        );
      });

      if (existingNode) {
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: n.id === existingNode.id,
          }))
        );
        fitView({
          nodes: [{ id: existingNode.id }],
          duration: 500,
          padding: 0.4,
        });
      } else {
        // Create new node if target node does not exist yet (Obsidian style)
        const sourceNode = sourceNodeId ? allNodes.find((n) => n.id === sourceNodeId) : undefined;
        const basePos = sourceNode ? sourceNode.position : { x: 300, y: 200 };
        const newId = `note-${Date.now()}`;
        const newNode: CanvasNode = {
          id: newId,
          type: 'noteNode',
          position: {
            x: basePos.x + 320,
            y: basePos.y + (Math.floor(Math.random() * 60) - 30),
          },
          data: {
            title: targetTitle,
            content: '',
            updatedAt: new Date().toISOString(),
          },
          selected: true,
        };

        setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
        setTimeout(() => {
          fitView({
            nodes: [{ id: newId }],
            duration: 500,
            padding: 0.4,
          });
        }, 50);
      }
    },
    [getNodes, setNodes, fitView, sourceNodeId]
  );

  const segments = parseWikilinks(text);

  return (
    <span className={className} onClick={onTextClick}>
      {segments.map((seg, idx) => {
        if (seg.type === 'wikilink' && seg.target) {
          return (
            <span
              key={idx}
              onClick={(e) => handleLinkClick(seg.target!, e)}
              className="text-[var(--wikilink-color)] hover:text-[var(--wikilink-hover)] font-semibold hover:underline cursor-pointer transition-colors"
              title={`Jump to [[${seg.target}]]`}
            >
              {seg.content}
            </span>
          );
        }
        return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
      })}
    </span>
  );
};

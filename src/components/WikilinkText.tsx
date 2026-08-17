import React, { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import katex from 'katex';
import { CanvasNode } from '../types/canvas';

interface WikilinkTextProps {
  text: string;
  sourceNodeId?: string;
  className?: string;
  onTextClick?: (e: React.MouseEvent) => void;
}

export interface WikilinkSegment {
  type: 'text' | 'wikilink' | 'math-inline' | 'math-display';
  content: string;
  target?: string;
}

const KaTeXRenderer: React.FC<{ math: string; displayMode: boolean }> = React.memo(
  ({ math, displayMode }) => {
    const html = useMemo(() => {
      try {
        return katex.renderToString(math, {
          displayMode,
          throwOnError: false,
        });
      } catch (e) {
        console.error('KaTeX rendering error:', e);
        return null;
      }
    }, [math, displayMode]);

    if (html === null) {
      return <span className="text-[#FF4B4B] font-mono">{math}</span>;
    }

    return (
      <span
        className={
          displayMode
            ? 'block my-1.5 text-center overflow-x-auto overflow-y-hidden max-w-full'
            : 'inline-block my-0 max-w-full align-middle'
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
);

KaTeXRenderer.displayName = 'KaTeXRenderer';

const TOKEN_REGEX = /(\$\$(?:[\s\S]+?)\$\$|\\\[(?:[\s\S]+?)\\\]|\\\((?:[\s\S]+?)\\\)|\$(?:[^\s\$]|(?:[^\s\$](?:\\\$|[^\$\n])*?[^\s\$]))\$|\[\[(?:.*?)\]\])/g;

export function parseWikilinks(text: string): WikilinkSegment[] {
  if (!text) return [];

  return text
    .split(TOKEN_REGEX)
    .filter(Boolean)
    .map((token) => {
      if (token.startsWith('$$') || token.startsWith('\\[')) {
        return { type: 'math-display', content: token.slice(2, -2).trim() };
      }
      if (token.startsWith('$') || token.startsWith('\\(')) {
        const content = token.startsWith('\\(') ? token.slice(2, -2) : token.slice(1, -1);
        return { type: 'math-inline', content: content.trim() };
      }
      if (token.startsWith('[[')) {
        const inner = token.slice(2, -2).trim();
        const [target, ...display] = inner.split('|');
        const targetTrimmed = target.trim();
        const displayTrimmed = display.join('|').trim();
        return {
          type: 'wikilink',
          content: displayTrimmed || targetTrimmed || '[[]]',
          target: targetTrimmed || undefined,
        };
      }
      return { type: 'text', content: token };
    });
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
        setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === existingNode.id })));
        fitView({ nodes: [{ id: existingNode.id }], duration: 500, padding: 0.4 });
      } else {
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
          data: { title: targetTitle, content: '', updatedAt: new Date().toISOString() },
          selected: true,
        };

        setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
        setTimeout(() => fitView({ nodes: [{ id: newId }], duration: 500, padding: 0.4 }), 50);
      }
    },
    [getNodes, setNodes, fitView, sourceNodeId]
  );

  return (
    <span className={className} onClick={onTextClick}>
      {parseWikilinks(text).map((seg, idx) => {
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
        if (seg.type === 'math-inline') {
          return <KaTeXRenderer key={idx} math={seg.content} displayMode={false} />;
        }
        if (seg.type === 'math-display') {
          return <KaTeXRenderer key={idx} math={seg.content} displayMode={true} />;
        }
        return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
      })}
    </span>
  );
};

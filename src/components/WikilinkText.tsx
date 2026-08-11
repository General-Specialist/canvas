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
      return <span className="text-red-500 font-mono">{math}</span>;
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

export function parseWikilinks(text: string): WikilinkSegment[] {
  if (!text) return [];

  const patterns = [
    // Double line LaTeX (Display math $$ ... $$)
    { type: 'math-display', regex: /\$\$([\s\S]+?)\$\$/g },
    // Double line LaTeX (Display math \[ ... \])
    { type: 'math-display', regex: /\\\[([\s\S]+?)\\\]/g },
    // Single line LaTeX (Inline math \( ... \))
    { type: 'math-inline', regex: /\\\(([\s\S]+?)\\\)/g },
    // Wikilinks [[ ... ]]
    { type: 'wikilink', regex: /\[\[(.*?)\]\]/g },
    // Single line LaTeX (Inline math $ ... $)
    { type: 'math-inline', regex: /\$([^\s\$]|(?:[^\s\$](?:\\\$|[^\$\n])*?[^\s\$]))\$/g },
  ];

  const result: WikilinkSegment[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    let earliestMatch: {
      type: 'wikilink' | 'math-inline' | 'math-display';
      index: number;
      length: number;
      content: string;
      raw: string;
      target?: string;
    } | null = null;

    for (const p of patterns) {
      p.regex.lastIndex = currentIndex;
      const match = p.regex.exec(text);
      if (match && match.index >= currentIndex) {
        if (
          !earliestMatch ||
          match.index < earliestMatch.index ||
          (match.index === earliestMatch.index && match[0].length > earliestMatch.length)
        ) {
          if (p.type === 'wikilink') {
            const rawInner = match[1];
            let target = rawInner.trim();
            let display = target;
            if (target.includes('|')) {
              const parts = target.split('|');
              target = parts[0].trim();
              display = parts.slice(1).join('|').trim();
            }
            earliestMatch = {
              type: p.type as 'wikilink',
              index: match.index,
              length: match[0].length,
              content: display || target || '[[]]',
              raw: match[0],
              target: target || undefined,
            };
          } else {
            earliestMatch = {
              type: p.type as 'math-inline' | 'math-display',
              index: match.index,
              length: match[0].length,
              content: match[1],
              raw: match[0],
            };
          }
        }
      }
    }

    if (!earliestMatch) {
      result.push({ type: 'text', content: text.slice(currentIndex) });
      break;
    }

    if (earliestMatch.index > currentIndex) {
      result.push({ type: 'text', content: text.slice(currentIndex, earliestMatch.index) });
    }

    if (earliestMatch.type === 'wikilink' && !earliestMatch.target) {
      result.push({ type: 'text', content: '[[]]' });
    } else {
      result.push({
        type: earliestMatch.type,
        content: earliestMatch.content,
        target: earliestMatch.target,
      });
    }

    currentIndex = earliestMatch.index + earliestMatch.length;
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

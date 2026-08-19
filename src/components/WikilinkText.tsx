import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { CanvasNode, CanvasEdge } from '../types/canvas';
import { extractTitleAliases, autoLinkNodesForTitle, syncAutoEdges } from '../utils/edgeUtils';
import { MathRenderer } from './MathRenderer';

export interface WikilinkTextProps {
  text: string;
  sourceNodeId?: string;
  className?: string;
  onTextClick?: (e: React.MouseEvent) => void;
}

export interface WikilinkSegment {
  type:
    | 'text'
    | 'wikilink'
    | 'math-inline'
    | 'math-display'
    | 'image'
    | 'link'
    | 'bold-italic'
    | 'bold'
    | 'italic'
    | 'strikethrough'
    | 'highlight'
    | 'code'
    | 'tag';
  content: string;
  target?: string;
  alt?: string;
  url?: string;
}

// Universal Robust Tokenizer Regex:
// 1. $$...$$ display math
// 2. \[...\] display math
// 3. \(...\) inline math
// 4. ![alt](url) markdown image
// 5. [[target|alias]] wikilinks
// 6. [label](url) markdown link
// 7. $math$ inline math
// 8. ***bold italic*** / ___bold italic___
// 9. **bold** / __bold__
// 10. ~~strikethrough~~
// 11. ==highlight==
// 12. `inline code`
// 13. *italic*
// 14. #tag
export const TOKEN_REGEX =
  /(\$\$(?:[\s\S]+?)\$\$|\\\[(?:[\s\S]+?)\\\]|\\\(.+?\\\)|!\[(?:[^\]]*)\]\((?:[^)]+)\)|\[\[(?:[^\]]+)\]\]|\[(?:[^\]]+)\]\((?:[^)]+)\)|\$(?!\s)(?:\\\$|[^\$\n])+?(?<!\s)\$|\*\*\*[^*]+\*\*\*|___[^_]+___|\*\*[^*]+\*\*|(?<!\w)__[^\n_]+__(?!\w)|~~[^~]+~~|==[^=]+==|`[^`\n]+`|(?<!\*)\*[^*\n\s](?:[^*\n]*[^*\n\s])?\*(?!\*)|(?<=^|\s)#[a-zA-Z][\w\-]*(?=\s|$|[.,;:!?]))/g;

export function parseWikilinks(text: string): WikilinkSegment[] {
  if (!text) return [];

  return text
    .split(TOKEN_REGEX)
    .filter(Boolean)
    .map((token) => {
      // 1. Display math: $$...$$ or \[...\]
      if (token.startsWith('$$') && token.endsWith('$$') && token.length >= 4) {
        return { type: 'math-display', content: token.slice(2, -2).trim() };
      }
      if (token.startsWith('\\[') && token.endsWith('\\]') && token.length >= 4) {
        return { type: 'math-display', content: token.slice(2, -2).trim() };
      }

      // 2. Inline math: \(...\)
      if (token.startsWith('\\(') && token.endsWith('\\)') && token.length >= 4) {
        return { type: 'math-inline', content: token.slice(2, -2).trim() };
      }

      // 3. Markdown image: ![alt](url)
      const imgMatch = token.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        return { type: 'image', content: imgMatch[1], alt: imgMatch[1], url: imgMatch[2] };
      }

      // 4. Wikilink: [[target|alias]]
      if (token.startsWith('[[') && token.endsWith(']]') && token.length >= 4) {
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

      // 5. Markdown link: [text](url)
      const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return { type: 'link', content: linkMatch[1], url: linkMatch[2] };
      }

      // 6. Dollar math: $...$
      if (token.startsWith('$') && token.endsWith('$') && token.length >= 2) {
        const inner = token.slice(1, -1).trim();
        // Disregard standalone currency numbers like $5 or $10.99
        if (/^\d+(\.\d{1,2})?$/.test(inner)) {
          return { type: 'text', content: token };
        }
        return {
          type: 'math-inline',
          content: inner,
        };
      }

      // 7. Bold + Italic: ***text*** or ___text___
      if (
        (token.startsWith('***') && token.endsWith('***') && token.length >= 6) ||
        (token.startsWith('___') && token.endsWith('___') && token.length >= 6)
      ) {
        return { type: 'bold-italic', content: token.slice(3, -3) };
      }

      // 8. Bold: **text** or __text__
      if (
        (token.startsWith('**') && token.endsWith('**') && token.length >= 4) ||
        (token.startsWith('__') && token.endsWith('__') && token.length >= 4)
      ) {
        return { type: 'bold', content: token.slice(2, -2) };
      }

      // 9. Highlight: ==text==
      if (token.startsWith('==') && token.endsWith('==') && token.length >= 4) {
        return { type: 'highlight', content: token.slice(2, -2) };
      }

      // 10. Strikethrough: ~~text~~
      if (token.startsWith('~~') && token.endsWith('~~') && token.length >= 4) {
        return { type: 'strikethrough', content: token.slice(2, -2) };
      }

      // 11. Inline code: `code`
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        return { type: 'code', content: token.slice(1, -1) };
      }

      // 12. Italic: *text*
      if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
        return { type: 'italic', content: token.slice(1, -1) };
      }

      // 13. Hashtag: #tag
      if (token.startsWith('#') && token.length >= 2) {
        return { type: 'tag', content: token };
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
  const { getNodes, setNodes, setEdges, fitView } = useReactFlow();

  const handleLinkClick = useCallback(
    (targetTitle: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!targetTitle) return;

      const allNodes = getNodes() as CanvasNode[];
      const lowerTarget = targetTitle.trim().toLowerCase();

      const existingNode = allNodes.find((n) => {
        const title = (n.data as any)?.title;
        if (typeof title === 'string') {
          const aliases = extractTitleAliases(title);
          if (aliases.some((a) => a.toLowerCase() === lowerTarget)) return true;
        }
        return n.id.trim().toLowerCase() === lowerTarget;
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

        setNodes((nds) => {
          const current = [...nds.map((n) => ({ ...n, selected: false })), newNode];
          const { updatedNodes, modified } = autoLinkNodesForTitle(current, newId, targetTitle);
          const finalNodes = modified ? (updatedNodes as CanvasNode[]) : current;
          setEdges((eds) => syncAutoEdges(finalNodes, eds) as CanvasEdge[]);
          return finalNodes;
        });

        setTimeout(() => fitView({ nodes: [{ id: newId }], duration: 500, padding: 0.4 }), 50);
      }
    },
    [getNodes, setNodes, setEdges, fitView, sourceNodeId]
  );

  return (
    <span className={className} onClick={onTextClick}>
      {parseWikilinks(text).map((seg, idx) => {
        if (seg.type === 'wikilink' && seg.target) {
          return (
            <span
              key={idx}
              onClick={(e) => handleLinkClick(seg.target!, e)}
              className="text-[var(--wikilink-color)] hover:text-[var(--wikilink-hover)] font-semibold hover:underline cursor-pointer transition-colors inline-flex items-center gap-0.5"
              title={`Jump to [[${seg.target}]]`}
            >
              <WikilinkText text={seg.content} sourceNodeId={sourceNodeId} />
            </span>
          );
        }

        if (seg.type === 'image' && seg.url) {
          return (
            <img
              key={idx}
              src={seg.url}
              alt={seg.alt || ''}
              className="max-w-full max-h-72 rounded-lg border border-[var(--border-color)] my-1 shadow-sm object-contain inline-block"
              loading="lazy"
            />
          );
        }

        if (seg.type === 'link' && seg.url) {
          return (
            <a
              key={idx}
              href={seg.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[var(--wikilink-color)] hover:underline font-medium transition-colors inline-flex items-center gap-0.5 cursor-pointer"
            >
              {seg.content || seg.url}
            </a>
          );
        }

        if (seg.type === 'bold-italic') {
          return (
            <strong key={idx} className="font-bold italic text-[var(--text-hover)]">
              <WikilinkText text={seg.content} sourceNodeId={sourceNodeId} />
            </strong>
          );
        }

        if (seg.type === 'bold') {
          return (
            <strong key={idx} className="font-bold text-[var(--text-hover)]">
              <WikilinkText text={seg.content} sourceNodeId={sourceNodeId} />
            </strong>
          );
        }

        if (seg.type === 'italic') {
          return (
            <em key={idx} className="italic text-[var(--text-normal)]">
              <WikilinkText text={seg.content} sourceNodeId={sourceNodeId} />
            </em>
          );
        }

        if (seg.type === 'highlight') {
          return (
            <mark
              key={idx}
              className="bg-amber-300/35 dark:bg-amber-400/30 text-[var(--text-normal)] px-1 py-0.5 rounded font-medium"
            >
              <WikilinkText text={seg.content} sourceNodeId={sourceNodeId} />
            </mark>
          );
        }

        if (seg.type === 'strikethrough') {
          return (
            <s key={idx} className="line-through opacity-70">
              <WikilinkText text={seg.content} sourceNodeId={sourceNodeId} />
            </s>
          );
        }

        if (seg.type === 'code') {
          return (
            <code
              key={idx}
              className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[11px] text-[#f7768e] dark:text-[#ff9e64]"
            >
              {seg.content}
            </code>
          );
        }

        if (seg.type === 'tag') {
          return (
            <span
              key={idx}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--primary-accent)]/15 text-[var(--primary-accent)] border border-[var(--primary-accent)]/30 font-mono select-none"
            >
              {seg.content}
            </span>
          );
        }

        if (seg.type === 'math-inline') {
          return <MathRenderer key={idx} math={seg.content} displayMode={false} />;
        }

        if (seg.type === 'math-display') {
          return <MathRenderer key={idx} math={seg.content} displayMode={true} />;
        }

        return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
      })}
    </span>
  );
};

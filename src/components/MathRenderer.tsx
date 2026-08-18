import React, { useMemo } from 'react';
import katex from 'katex';
import { TypstRenderer } from './TypstRenderer';

interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = React.memo(
  ({ math, displayMode = false, className = '' }) => {
    const trimmed = (math || '').trim();
    if (!trimmed) return null;

    // 1. Try KaTeX synchronous rendering first (ultra-fast, instant 0ms, supports standard LaTeX)
    const katexHtml = useMemo(() => {
      try {
        return katex.renderToString(trimmed, {
          displayMode,
          throwOnError: true,
        });
      } catch {
        return null;
      }
    }, [trimmed, displayMode]);

    if (katexHtml !== null) {
      if (displayMode) {
        return (
          <div
            className={`katex-display my-2 flex justify-center items-center overflow-x-auto overflow-y-hidden max-w-full select-text ${className}`}
            dangerouslySetInnerHTML={{ __html: katexHtml }}
          />
        );
      }
      return (
        <span
          className={`katex-inline inline-flex items-center align-middle select-text ${className}`}
          dangerouslySetInnerHTML={{ __html: katexHtml }}
        />
      );
    }

    // 2. If KaTeX threw an error (e.g. Typst specific math syntax like sum_(k=1)^n), render with Typst
    return <TypstRenderer content={trimmed} isMath={true} displayMode={displayMode} className={className} />;
  }
);

MathRenderer.displayName = 'MathRenderer';

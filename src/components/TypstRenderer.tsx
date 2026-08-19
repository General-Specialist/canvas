import React, { useEffect, useState } from 'react';
import { renderTypstToSvg, getCachedTypstSvg } from '../utils/typst';

interface TypstRendererProps {
  content: string;
  isMath?: boolean;
  displayMode?: boolean;
  className?: string;
}

export const TypstRenderer: React.FC<TypstRendererProps> = React.memo(
  ({ content, isMath = true, displayMode = false, className = '' }) => {
    const trimmed = (content || '').trim();

    // Check synchronous memory & localStorage cache first for 0ms initial frame render
    const initialSvg = getCachedTypstSvg(trimmed, isMath, displayMode);
    const [svg, setSvg] = useState<string | null>(initialSvg ?? null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let isMounted = true;
      if (!trimmed) {
        setSvg(null);
        setError(null);
        return;
      }

      const cached = getCachedTypstSvg(trimmed, isMath, displayMode);
      if (cached) {
        setSvg(cached);
        setError(null);
        return;
      }

      setError(null);

      renderTypstToSvg(trimmed, isMath, displayMode)
        .then((resultSvg) => {
          if (isMounted) {
            setSvg(resultSvg);
            setError(null);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err?.message || 'Typst syntax error');
            setSvg(null);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [trimmed, isMath, displayMode]);

    if (!trimmed) return null;

    // Render SVG if available
    if (svg) {
      if (displayMode) {
        return (
          <div
            className={`typst-render-output typst-math-display my-2.5 flex justify-center items-center overflow-x-auto overflow-y-hidden max-w-full select-text ${className}`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        );
      }

      return (
        <span
          className={`typst-render-output typst-math-inline inline-flex items-center align-middle select-text ${className}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    }

    // Graceful error fallback
    if (error) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-red-500/10 text-[#f7768e] border border-red-500/20 select-text ${className}`}
          title={`Typst Error: ${error}`}
        >
          <span className="text-[9px] uppercase font-bold opacity-70">Typst</span>
          <span>{trimmed}</span>
        </span>
      );
    }

    // Safe loading placeholder (formula is always visible, never null or blank)
    return (
      <span
        className={`typst-render-output ${
          displayMode ? 'typst-math-display block text-center my-2' : 'typst-math-inline inline-flex'
        } font-mono text-[12px] opacity-80 select-text ${className}`}
      >
        {trimmed}
      </span>
    );
  }
);

TypstRenderer.displayName = 'TypstRenderer';

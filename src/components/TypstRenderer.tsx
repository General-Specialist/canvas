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
    const trimmed = content.trim();

    // Check synchronous cache first to prevent any flicker
    const initialSvg = getCachedTypstSvg(trimmed, isMath, displayMode);
    const [svg, setSvg] = useState<string | null>(initialSvg ?? null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(!initialSvg && Boolean(trimmed));

    useEffect(() => {
      let isMounted = true;
      if (!trimmed) {
        setSvg(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      const cached = getCachedTypstSvg(trimmed, isMath, displayMode);
      if (cached) {
        setSvg(cached);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      renderTypstToSvg(trimmed, isMath, displayMode)
        .then((resultSvg) => {
          if (isMounted) {
            setSvg(resultSvg);
            setError(null);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err?.message || 'Typst syntax error');
            setSvg(null);
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [trimmed, isMath, displayMode]);

    if (!trimmed) return null;

    if (error) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-red-500/10 text-[#FF4B4B] border border-red-500/20 ${className}`}
          title={`Typst Error: ${error}`}
        >
          <span className="text-[9px] uppercase font-bold opacity-70">Typst</span>
          <span>{trimmed}</span>
        </span>
      );
    }

    if (isLoading && !svg) {
      return (
        <span
          className={`inline-block opacity-60 italic font-mono text-[12px] animate-pulse ${
            displayMode ? 'block text-center my-2' : 'inline'
          } ${className}`}
        >
          {trimmed}
        </span>
      );
    }

    if (!svg) return null;

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
);

TypstRenderer.displayName = 'TypstRenderer';

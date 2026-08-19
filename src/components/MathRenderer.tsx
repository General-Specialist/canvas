import React from 'react';
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
    return <TypstRenderer content={trimmed} isMath={true} displayMode={displayMode} className={className} />;
  }
);

MathRenderer.displayName = 'MathRenderer';

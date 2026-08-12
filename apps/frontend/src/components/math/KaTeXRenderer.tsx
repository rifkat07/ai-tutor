'use client';

import React from 'react';
import { renderLatexInText } from '@/lib/katex';

interface KaTeXRendererProps {
  content: string;
  className?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ content, className = '' }) => {
  const htmlContent = renderLatexInText(content);

  return (
    <div
      className={`katex-rendered-text ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
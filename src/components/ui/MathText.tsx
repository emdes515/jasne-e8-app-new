'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  block?: boolean;
  className?: string;
}

/**
 * Renders text mixed with inline $...$ or block $$...$$ LaTeX formulas using KaTeX offline.
 * Never leaks raw `$` delimiters to the student (Self-check #2, AC-V6).
 */
export function MathText({ text, block = false, className = '' }: MathTextProps) {
  const htmlContent = useMemo(() => {
    if (!text) return '';

    // If block mode and the whole string is pure LaTeX (without $ delimiters), render directly
    if (block && !text.includes('$')) {
      try {
        return katex.renderToString(text, {
          displayMode: true,
          throwOnError: false,
          output: 'html',
        });
      } catch {
        return text;
      }
    }

    // Split on $$...$$ or $...$
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);
    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          const expr = part.slice(2, -2);
          try {
            return katex.renderToString(expr, {
              displayMode: true,
              throwOnError: false,
              output: 'html',
            });
          } catch {
            return expr;
          }
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const expr = part.slice(1, -1);
          try {
            return katex.renderToString(expr, {
              displayMode: false,
              throwOnError: false,
              output: 'html',
            });
          } catch {
            return expr;
          }
        }
        // Escape raw HTML in regular text segments
        return part
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      })
      .join('');
  }, [text, block]);

  return (
    <span
      className={`${
        block
          ? 'block overflow-x-auto max-w-full py-1'
          : 'inline leading-relaxed'
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

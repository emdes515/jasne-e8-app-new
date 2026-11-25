'use client';

import React from 'react';
import type { TaskVisualAsset } from '../../types/contentPacks';

interface TaskVisualBoxProps {
  visual?: TaskVisualAsset;
}

function sanitizeInlineSvg(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('<svg')) return null;
  return trimmed
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '');
}

/**
 * Bezpieczny kontener wizualizacji zadania (SVG inline lub obraz z Storage).
 */
export function TaskVisualBox({ visual }: TaskVisualBoxProps) {
  if (!visual) return null;

  if (visual.kind === 'svg_inline') {
    const safeSvg = sanitizeInlineSvg(visual.ref);
    if (!safeSvg) return null;
    return (
      <figure className="my-2 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[#0B1220] p-2">
        <div
          role="img"
          aria-label={visual.alt}
          className="mx-auto w-full max-w-[520px]"
          dangerouslySetInnerHTML={{ __html: safeSvg }}
        />
      </figure>
    );
  }

  if (visual.kind === 'storage_image' && visual.ref) {
    return (
      <figure className="my-2 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[#0B1220] p-2">
        <img
          src={visual.ref}
          alt={visual.alt}
          className="mx-auto max-h-72 w-auto rounded-lg object-contain"
          loading="lazy"
        />
      </figure>
    );
  }

  return null;
}

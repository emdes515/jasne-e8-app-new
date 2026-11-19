
'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { Eraser, Undo2 } from 'lucide-react';
import { TactileButton } from '../ui/TactileButton';

const PAD_WIDTH = 600;
const PAD_HEIGHT = 420;

function point(event: PointerEvent<SVGSVGElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const positionX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  const positionY = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
  return `${Math.round(positionX * PAD_WIDTH)} ${Math.round(positionY * PAD_HEIGHT)}`;
}

export function OpenWorkPad({ strokes, disabled, onChange }: {
  strokes: string[];
  disabled: boolean;
  onChange: (strokes: string[]) => void;
}) {
  const current = useRef<{ pointer: number; path: string; lastPoint: string } | null>(null);
  const [preview, setPreview] = useState('');

  const finishStroke = (event: PointerEvent<SVGSVGElement>) => {
    const stroke = current.current;
    if (stroke?.pointer !== event.pointerId) return;
    current.current = null;
    setPreview('');
    onChange([...strokes, stroke.path]);
  };

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        {!strokes.length && !preview && (
          <p className="pointer-events-none absolute inset-x-4 top-4 text-sm text-[var(--text-secondary)]">
            Zapisz obliczenia palcem, rysikiem lub myszą.
          </p>
        )}
        <svg
          role="img"
          aria-label="Pole do pisania odręcznego"
          viewBox={`0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`}
          preserveAspectRatio="none"
          className={`answer-grid block aspect-[10/7] max-h-96 w-full ${disabled ? '' : 'touch-none cursor-crosshair'}`}
          onPointerDown={(event) => {
            if (disabled || current.current || !event.isPrimary || event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            const at = point(event);
            const path = `M ${at} L ${at}`;
            current.current = { pointer: event.pointerId, path, lastPoint: at };
            setPreview(path);
          }}
          onPointerMove={(event) => {
            const stroke = current.current;
            if (stroke?.pointer !== event.pointerId) return;
            const at = point(event);
            if (at === stroke.lastPoint) return;
            stroke.lastPoint = at;
            stroke.path += ` L ${at}`;
            setPreview(stroke.path);
          }}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          onLostPointerCapture={finishStroke}
        >
          <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {strokes.map((stroke, index) => <path key={index} d={stroke} />)}
            {preview && <path d={preview} />}
          </g>
        </svg>
      </div>
      {!disabled && (
        <div className="flex justify-end gap-2">
          <TactileButton variant="secondary" size="sm" disabled={!strokes.length} onClick={() => onChange(strokes.slice(0, -1))}>
            <Undo2 size={16} /> Cofnij
          </TactileButton>
          <TactileButton variant="secondary" size="sm" disabled={!strokes.length} onClick={() => onChange([])}>
            <Eraser size={16} /> Wyczyść
          </TactileButton>
        </div>
      )}
    </div>
  );
}

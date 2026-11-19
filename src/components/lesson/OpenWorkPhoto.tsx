'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { TactileButton } from '../ui/TactileButton';

const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

function PhotoPreview({ file }: { file: File }) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const url = URL.createObjectURL(file);
    image.src = url;
    return () => {
      image.removeAttribute('src');
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // The preview is a local object URL created in the browser.
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img ref={imageRef} alt="Zdjęcie rozwiązania" className="mx-auto max-h-96 w-full rounded-xl object-contain" />;
}

export function OpenWorkPhoto({ photo, disabled, onChange, savesDraft = false }: {
  photo: File | null;
  disabled: boolean;
  onChange: (file: File | null) => void;
  savesDraft?: boolean;
}) {
  const chooser = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const attempt = useRef(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => () => { attempt.current += 1; }, []);

  async function selectImage(file?: File) {
    if (!file || disabled) return;
    const version = ++attempt.current;
    setError('');
    setBusy(false);
    if ((!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name)) || file.type === 'image/svg+xml') {
      setError('Wybierz zdjęcie w formacie JPG, PNG lub WebP.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Zdjęcie jest za duże. Wybierz plik do 12 MB.');
      return;
    }
    setBusy(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (version === attempt.current) onChange(file);
    } catch {
      if (version === attempt.current) setError('Przeglądarka nie otworzyła zdjęcia. Spróbuj z JPG lub PNG.');
    } finally {
      URL.revokeObjectURL(url);
      if (version === attempt.current) setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={`rounded-xl border border-dashed p-3 ${dragOver ? 'border-[var(--accent-text)] bg-[var(--accent-primary)]/10' : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void selectImage(event.dataTransfer.files[0]);
        }}
      >
        {photo ? <PhotoPreview file={photo} /> : (
          <div className="flex min-h-28 flex-col items-center justify-center gap-2 px-2 text-center text-sm text-[var(--text-secondary)]">
            <ImagePlus size={26} aria-hidden="true" />
            <span>Zrób zdjęcie obliczeń lub przeciągnij je tutaj.</span>
          </div>
        )}
      </div>
      {!disabled && (
        <div className="flex flex-wrap gap-2">
          <input ref={chooser} type="file" accept="image/*" aria-label="Plik ze zdjęciem rozwiązania" className="sr-only" tabIndex={-1} onChange={(event) => { void selectImage(event.target.files?.[0]); event.target.value = ''; }} />
          <input ref={camera} type="file" accept="image/*" capture="environment" aria-label="Aparat do zdjęcia rozwiązania" className="sr-only" tabIndex={-1} onChange={(event) => { void selectImage(event.target.files?.[0]); event.target.value = ''; }} />
          <TactileButton variant="secondary" size="sm" onClick={() => camera.current?.click()}><Camera size={16} /> Zrób zdjęcie</TactileButton>
          <TactileButton variant="secondary" size="sm" onClick={() => chooser.current?.click()}><ImagePlus size={16} /> {photo ? 'Zmień zdjęcie' : 'Wybierz plik'}</TactileButton>
          {photo && (
            <TactileButton variant="secondary" size="sm" onClick={() => { attempt.current += 1; setBusy(false); setError(''); onChange(null); }}>
              <Trash2 size={16} /> Usuń zdjęcie
            </TactileButton>
          )}
        </div>
      )}
      {busy && <p role="status" className="text-sm text-[var(--text-secondary)]">Otwieram zdjęcie…</p>}
      {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}
      <p className="text-xs text-[var(--text-secondary)]">{savesDraft ? 'Zdjęcie zostaje na tym urządzeniu do sprawdzenia lub usunięcia.' : 'Zdjęcie zostaje na urządzeniu do zamknięcia zadania.'}</p>
    </div>
  );
}

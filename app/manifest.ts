import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JASNE E8 — Egzamin Ósmoklasisty',
    short_name: 'JASNE E8',
    description:
      'Krótkie lekcje Bento, zadania CKE, powtórki i próbny miniarkusz z matematyki do egzaminu ósmoklasisty.',
    lang: 'pl',
    start_url: '/',
    display: 'standalone',
    background_color: '#080C16',
    theme_color: '#080C16',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

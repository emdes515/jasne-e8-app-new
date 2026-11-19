import type { Metadata } from 'next';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import 'katex/dist/katex.min.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'JASNE E8 — Grywalizowane przygotowanie do Egzaminu Ósmoklasisty',
  description:
    'Mobile-first aplikacja edukacyjno-gamingowa przygotowująca uczniów do Egzaminu Ósmoklasisty z Matematyki, Polskiego i Angielskiego z maskotką Lumi i AI Tutorem.',
  openGraph: {
    title: 'JASNE E8 — Grywalizowane przygotowanie do Egzaminu Ósmoklasisty',
    description:
      'Mobile-first aplikacja edukacyjno-gamingowa przygotowująca uczniów do Egzaminu Ósmoklasisty z Matematyki, Polskiego i Angielskiego z maskotką Lumi i AI Tutorem.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JASNE E8 — Grywalizowane przygotowanie do Egzaminu Ósmoklasisty',
    description:
      'Mobile-first aplikacja edukacyjno-gamingowa przygotowująca uczniów do Egzaminu Ósmoklasisty z Matematyki, Polskiego i Angielskiego z maskotką Lumi i AI Tutorem.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

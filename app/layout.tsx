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
  title: 'JASNE E8 | Przygotowanie do egzaminu ósmoklasisty',
  description:
    'Krótkie lekcje, powtórki i próbny miniarkusz z matematyki do egzaminu ósmoklasisty.',
  openGraph: {
    title: 'JASNE E8 | Przygotowanie do egzaminu ósmoklasisty',
    description:
      'Krótkie lekcje, powtórki i próbny miniarkusz z matematyki do egzaminu ósmoklasisty.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JASNE E8 | Przygotowanie do egzaminu ósmoklasisty',
    description:
      'Krótkie lekcje, powtórki i próbny miniarkusz z matematyki do egzaminu ósmoklasisty.',
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

'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { TactileButton } from '../../src/components/ui/TactileButton';

export function ShareGuardianInfoButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/prywatnosc#wiek`;
    const shareData = {
      title: 'JASNE E8 — zasady dla uczniów i opiekunów',
      text: 'Zasady korzystania z JASNE E8 dla uczniów i opiekunów: matematyka jest gotowa teraz, język polski i angielski w przygotowaniu. Bez ukrytych opłat, reklam i nakłaniania do zakupów.',
      url: shareUrl,
    };

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // Anulowanie udostępniania przez użytkownika lub brak wsparcia
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Brak dostępu do schowka
    }
  };

  return (
    <TactileButton variant="secondary" size="md" onClick={handleShare}>
      {copied ? <Check size={17} aria-hidden="true" /> : <Share2 size={17} aria-hidden="true" />}
      <span>{copied ? 'Skopiowano link dla opiekuna' : 'Udostępnij informacje o JASNE E8'}</span>
    </TactileButton>
  );
}

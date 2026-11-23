'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { TactileButton } from '../../src/components/ui/TactileButton';

export function ShareGuardianInfoButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/pro#opiekunowie`;
    const shareData = {
      title: 'JASNE E8 — Informacje dla opiekunów',
      text: 'Informacje o bezpłatnej nauce do egzaminu ósmoklasisty z matematyki w aplikacji JASNE E8.',
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

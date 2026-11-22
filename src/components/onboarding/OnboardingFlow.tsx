'use client';

import { useState } from 'react';
import { Bookmark, Bot, Heart } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { BottomSheet } from '../ui/BottomSheet';
import { TactileButton } from '../ui/TactileButton';

export { FamilyOnboarding as OnboardingFlow } from './FamilyOnboarding';

const TOUR_SLIDES = [
  {
    id: 'bento',
    title: 'Lekcja i powtórki',
    description:
      'Przejrzyj teorię i rozwiąż 5 zadań. Trudniejsze zadania możesz zapisać w Powtórkach.',
    icon: Bookmark,
  },
  {
    id: 'aitutor',
    title: 'Zadania otwarte i wzory',
    description:
      'W trakcie nauki możesz odsłonić podpowiedzi lub zajrzeć do Wzorów E8. Ocena zadań otwartych jest symulowana w skali 0–2 pkt.',
    icon: Bot,
  },
  {
    id: 'hearts',
    title: 'Serca i monety',
    description:
      'Zaczynasz z 5 sercami i 120 monetami. Serca odzyskasz w misji ratunkowej. Za monety możesz kupić akcesoria Lumi lub tarczę serii.',
    icon: Heart,
  },
];

export function ProductTourModal() {
  const { productTourOpen, setProductTourOpen, playSound } = useAppState();
  const [slideIdx, setSlideIdx] = useState(0);

  return (
    <BottomSheet
      open={productTourOpen}
      onClose={() => setProductTourOpen(false)}
      title="Przewodnik po JASNE E8"
    >
      <div className="space-y-4">
        {TOUR_SLIDES.map((s, idx) => {
          const IconComp = s.icon;
          const active = slideIdx === idx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                playSound('tap');
                setSlideIdx(idx);
              }}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                active
                  ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)]'
                  : 'bg-[var(--bg-canvas)]/40 border-[var(--border-subtle)]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] text-[var(--on-accent)] flex items-center justify-center shrink-0">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-display text-[var(--text-primary)] mt-0.5">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}

        <div className="pt-2">
          <TactileButton
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              playSound('tap');
              setProductTourOpen(false);
            }}
          >
            Wszystko jasne!
          </TactileButton>
        </div>
      </div>
    </BottomSheet>
  );
}

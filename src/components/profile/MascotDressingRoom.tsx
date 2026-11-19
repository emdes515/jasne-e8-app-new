'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Eye,
  Coins,
  Check,
  Shield,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  ItemRarity,
  LumiLoadout,
  ShopCategory,
  ShopItemDefinition,
} from '../../types/domain';
import {
  LUMI_COLOR_LABELS,
  PLAYER_TITLE_LABELS,
  PROFILE_FRAME_LABELS,
  SHOP_CATALOG,
} from '../../data/shopCatalog';
import {
  MAX_HEARTS,
  MAX_STREAK_SHIELDS,
} from '../../lib/gamification';
import { SPRING_SNAPPY } from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { CountUpNumber } from '../ui/CountUpNumber';
import { TactileButton } from '../ui/TactileButton';
import { TactileHeartIcon } from '../ui/TactileHeartIcon';

const SHOP_CATEGORIES: Array<{ id: ShopCategory; label: string }> = [
  { id: 'mascot', label: 'Maskotka Lumi' },
  { id: 'profile', label: 'Ramki i tytuły' },
  { id: 'boosters', label: 'Wspomagacze' },
  { id: 'premium', label: 'Pakiety Pro' },
];

const FRAME_PREVIEW_CLASSES: Record<string, string> = {
  emerald_impulse_frame: 'border-[#10B981] bg-[#10B981]/15 text-[#10B981]',
  gold_ring_frame: 'border-[#FFB800] bg-[#FFB800]/15 text-[#FFB800]',
  cyber_plasma_frame: 'border-[#38BDF8] bg-[#38BDF8]/15 text-[#38BDF8]',
};

function ShopItemVisualThumbnail({
  item,
  baseLoadout,
}: {
  item: ShopItemDefinition;
  baseLoadout: LumiLoadout;
}) {
  if (
    item.slot &&
    item.slotValue &&
    (item.slot === 'colorScheme' ||
      item.slot === 'headgear' ||
      item.slot === 'eyewear' ||
      item.slot === 'aura')
  ) {
    const previewLoadout: Partial<LumiLoadout> = {
      colorScheme:
        item.slot === 'colorScheme'
          ? (item.slotValue as LumiLoadout['colorScheme'])
          : baseLoadout.colorScheme,
      headgear:
        item.slot === 'headgear'
          ? (item.slotValue as LumiLoadout['headgear'])
          : 'none',
      eyewear:
        item.slot === 'eyewear'
          ? (item.slotValue as LumiLoadout['eyewear'])
          : 'none',
      aura:
        item.slot === 'aura'
          ? (item.slotValue as LumiLoadout['aura'])
          : 'none',
    };

    return (
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex items-center justify-center shrink-0 overflow-hidden">
        <LumiMascot mood="cool" loadout={previewLoadout} size="xs" />
      </div>
    );
  }

  if (item.slot === 'profileFrame' && item.slotValue) {
    const frameClass =
      FRAME_PREVIEW_CLASSES[item.slotValue] ??
      'border-[var(--accent-primary)] bg-[var(--accent-primary)]/12 text-[var(--accent-text)]';
    return (
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
        <div
          className={`w-11 h-11 rounded-full border-[3px] flex items-center justify-center text-xs font-extrabold font-display ${frameClass}`}
        >
          E8
        </div>
      </div>
    );
  }

  if (item.slot === 'playerTitle') {
    return (
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 px-1.5 text-center">
        <span className="rounded-lg bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/40 px-1.5 py-1 text-[10px] font-extrabold font-display leading-tight text-[var(--accent-text)]">
          TYTUŁ
        </span>
      </div>
    );
  }

  if (item.boosterKind === 'streak_shield') {
    return (
      <div className="w-16 h-16 rounded-2xl bg-[var(--info)]/12 border-2 border-[var(--info)]/45 flex items-center justify-center shrink-0">
        <Shield className="w-8 h-8 text-[var(--info)] fill-[var(--info)]/20" />
      </div>
    );
  }

  if (item.boosterKind === 'heart_refill') {
    return (
      <div className="w-16 h-16 rounded-2xl bg-[var(--danger)]/12 border-2 border-[var(--danger)]/45 flex items-center justify-center shrink-0">
        <TactileHeartIcon size={34} variant="full" />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/12 border-2 border-[var(--accent-primary)]/45 flex items-center justify-center shrink-0">
      <Coins className="w-8 h-8 text-[var(--accent-text)]" />
    </div>
  );
}

const RARITY_LABELS: Record<
  ItemRarity,
  { label: string; colorClass: string }
> = {
  common: {
    label: 'Zwykłe',
    colorClass: 'text-[var(--text-secondary)]',
  },
  rare: {
    label: 'Rzadkie',
    colorClass: 'text-[var(--info)]',
  },
  epic: {
    label: 'Epickie',
    colorClass: 'text-[var(--rarity-epic)]',
  },
  legendary: {
    label: 'Legendarne',
    colorClass: 'text-[var(--accent-text)]',
  },
};

export function MascotDressingRoom() {
  const { state, purchaseOrEquipShopItem, playSound } = useAppState();
  const prefersReduced = useReducedMotion();

  const [activeCategory, setActiveCategory] = useState<ShopCategory>('mascot');
  const [previewOverride, setPreviewOverride] = useState<
    Partial<LumiLoadout>
  >({});
  const [previewItemName, setPreviewItemName] = useState<string | null>(null);
  const [justPurchasedItemId, setJustPurchasedItemId] = useState<string | null>(
    null
  );
  const [celebrateTick, setCelebrateTick] = useState<number>(0);

  const effectiveLoadout: LumiLoadout = {
    ...state.loadout,
    ...previewOverride,
  };

  const hasPreview = Object.keys(previewOverride).length > 0;

  const handlePreviewItem = (item: ShopItemDefinition) => {
    if (!item.slot || !item.slotValue) return;
    playSound('tap');
    setPreviewOverride((prev) => ({
      ...prev,
      [item.slot!]: item.slotValue,
    }));
    setPreviewItemName(item.name);
  };

  const resetPreview = () => {
    playSound('tap');
    setPreviewOverride({});
    setPreviewItemName(null);
  };

  const handleBuyOrEquip = (item: ShopItemDefinition) => {
    const res = purchaseOrEquipShopItem(item);
    if (res.ok && res.action === 'purchased') {
      setJustPurchasedItemId(item.id);
      setCelebrateTick(Date.now());
      setPreviewOverride({});
      setPreviewItemName(null);

      if (!prefersReduced) {
        try {
          confetti({
            particleCount: 32,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#FFB800', '#10B981', '#38BDF8'],
          });
        } catch {
          // Ignore
        }
      }

      setTimeout(() => {
        setJustPurchasedItemId((cur) => (cur === item.id ? null : cur));
      }, 900);
    } else if (res.ok && res.action === 'equipped') {
      setPreviewOverride({});
      setPreviewItemName(null);
    }
  };

  const categoryItems = SHOP_CATALOG.filter(
    (item) => item.category === activeCategory
  );

  const getFrameBorderClass = (frame: LumiLoadout['profileFrame']) => {
    switch (frame) {
      case 'emerald_impulse_frame':
        return 'border-[#10B981] shadow-[0_5px_0_0_#047857]';
      case 'gold_ring_frame':
        return 'border-[#FFB800] shadow-[0_5px_0_0_#B45309]';
      case 'cyber_plasma_frame':
        return 'border-[#38BDF8] shadow-[0_5px_0_0_#0284C7]';
      default:
        return 'border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)]';
    }
  };

  return (
    <div className="space-y-5">
      {/* Live Interactive Dressing Room Stage */}
      <section
        aria-label="Przymierzalnia maskotki Lumi"
        className={`rounded-3xl bg-[var(--bg-surface)] border-2 p-5 sm:p-6 transition-all ${getFrameBorderClass(
          effectiveLoadout.profileFrame
        )}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <motion.div
              key={celebrateTick}
              animate={
                celebrateTick > 0 && !prefersReduced
                  ? { y: [0, -14, 0], scale: [1, 1.06, 1] }
                  : {}
              }
              transition={{ duration: 0.42, ease: 'easeOut' }}
              className="relative p-3 rounded-3xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)]"
            >
              <LumiMascot
                mood={celebrateTick > 0 ? 'celebrate' : 'cool'}
                loadout={effectiveLoadout}
                size="lg"
              />
            </motion.div>

            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold font-display text-[var(--accent-text)] mb-1">
                <span>
                  {hasPreview
                    ? `Przymierzasz: ${previewItemName}`
                    : 'Przymierzalnia'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-[var(--text-primary)]">
                {state.nickname}
              </h2>
              <div className="text-xs font-bold text-[var(--info)] mt-0.5">
                {PLAYER_TITLE_LABELS[effectiveLoadout.playerTitle]} ·{' '}
                {LUMI_COLOR_LABELS[effectiveLoadout.colorScheme]} ·{' '}
                {PROFILE_FRAME_LABELS[effectiveLoadout.profileFrame]}
              </div>

              <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-md">
                Wybierz „Podgląd”, żeby przymierzyć akcesorium.
              </p>

              {hasPreview && (
                <div className="mt-3">
                  <TactileButton
                    variant="secondary"
                    size="sm"
                    onClick={resetPreview}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Przywróć założony strój</span>
                  </TactileButton>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center shrink-0 min-w-[130px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-1">
              <Coins className="w-4 h-4 text-[var(--accent-text)]" />
              <span>Twój portfel</span>
            </div>
            <div className="text-2xl font-extrabold font-display text-[var(--accent-text)] tabular-nums">
              <CountUpNumber value={state.coins} durationMs={500} />
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">
              monet
            </span>
          </div>
        </div>
      </section>

      {/* Shop Category Tabs with Shared layoutId Capsule */}
      <div
        role="tablist"
        aria-label="Kategorie Sklepu Lumi"
        className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)]"
      >
        {SHOP_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const count = SHOP_CATALOG.filter((it) => it.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                playSound('tabSwitch');
                setActiveCategory(cat.id);
              }}
              className="relative min-h-[44px] px-2.5 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-extrabold font-display cursor-pointer select-none"
            >
              {isSelected && (
                <motion.span
                  layoutId="shop-category-capsule"
                  transition={SPRING_SNAPPY}
                  className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]"
                />
              )}
              <span
                className={`relative z-10 whitespace-nowrap ${
                  isSelected
                    ? 'text-[var(--on-accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat.label}
              </span>
              <span
                className={`relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums ${
                  isSelected
                    ? 'bg-black/15 text-[var(--on-accent)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Notice for Premium Phase 2 */}
      {activeCategory === 'premium' && (
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--info)] text-xs text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-[var(--info)] font-display">
            Pakiety w przygotowaniu. Płatności są niedostępne.
          </strong>
        </div>
      )}

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {categoryItems.map((item) => {
          const rarityMeta = RARITY_LABELS[item.rarity];
          const isOwned = state.ownedItemIds.includes(item.id);
          const isEquipped =
            item.slot &&
            item.slotValue &&
            state.loadout[item.slot] === item.slotValue;
          const isPreviewed =
            item.slot &&
            item.slotValue &&
            effectiveLoadout[item.slot] === item.slotValue &&
            !isEquipped;

          const isStreakShield = item.boosterKind === 'streak_shield';
          const isHeartRefill = item.boosterKind === 'heart_refill';
          const shieldLimitReached =
            isStreakShield && state.streakShields >= MAX_STREAK_SHIELDS;
          const heartsFull = isHeartRefill && state.hearts >= MAX_HEARTS;

          const missingCoins = Math.max(0, item.price - state.coins);
          const cannotAfford = !isOwned && !item.comingSoon && missingCoins > 0;
          const showShine = justPurchasedItemId === item.id;

          return (
            <div
              key={item.id}
              className="relative overflow-hidden study-panel p-5 flex flex-col justify-between gap-4"
            >
              {/* Diagonal Shine Sweep on Purchase (Choreography #9) */}
              {showShine && !prefersReduced && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20"
                >
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shine-sweep" />
                </div>
              )}

              <div className="flex items-start gap-3.5">
                <ShopItemVisualThumbnail item={item} baseLoadout={state.loadout} />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span
                      className={`text-[11px] font-extrabold uppercase tracking-wider font-display ${rarityMeta.colorClass}`}
                    >
                      {rarityMeta.label}
                    </span>

                    {item.comingSoon ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--text-secondary)]">
                        <Lock className="w-3 h-3" />
                        Wkrótce
                      </span>
                    ) : isOwned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/15 border border-[var(--success)]/40 px-2 py-0.5 text-[11px] font-extrabold text-[var(--success)]">
                        <Check className="w-3 h-3" />
                        Posiadane
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/45 px-2.5 py-0.5 text-xs font-extrabold font-display text-[var(--accent-text)] tabular-nums">
                        <Coins className="w-3.5 h-3.5" />
                        {item.price}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold font-display text-[var(--text-primary)] leading-snug">
                    {item.name}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>

                  {isStreakShield && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold font-display text-[var(--info)] tabular-nums pt-0.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Zapas: {state.streakShields}/2</span>
                    </span>
                  )}

                  {isHeartRefill && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold font-display text-[var(--danger)] tabular-nums pt-0.5">
                      <TactileHeartIcon
                        size={14}
                        variant={state.hearts > 0 ? 'full' : 'cracked'}
                      />
                      <span>Serca: {state.hearts}/5</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row: Preview (if cosmetic) + Buy / Equip / Disabled State */}
              <div className="flex items-center gap-2 pt-1">
                {item.slot && !isEquipped && (
                  <TactileButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePreviewItem(item)}
                  >
                    <Eye className="w-4 h-4 text-[var(--accent-text)]" />
                    <span>{isPreviewed ? 'W podglądzie' : 'Podgląd'}</span>
                  </TactileButton>
                )}

                {item.comingSoon ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                    <Lock className="w-3.5 h-3.5" />
                    W przygotowaniu
                  </span>
                ) : isEquipped ? (
                  <div className="w-full min-h-[44px] px-4 rounded-xl bg-[var(--success)]/15 border-2 border-[var(--success)] text-[var(--success)] text-xs font-extrabold font-display flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Założone</span>
                  </div>
                ) : isOwned ? (
                  <TactileButton
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleBuyOrEquip(item)}
                  >
                    <span>Załóż</span>
                  </TactileButton>
                ) : shieldLimitReached ? (
                  <TactileButton
                    variant="secondary"
                    size="sm"
                    fullWidth
                    disabled
                  >
                    <span>Osiągnięto limit 2/2</span>
                  </TactileButton>
                ) : heartsFull ? (
                  <TactileButton
                    variant="secondary"
                    size="sm"
                    fullWidth
                    disabled
                  >
                    <span>Serca pełne (5/5)</span>
                  </TactileButton>
                ) : cannotAfford ? (
                  /* Per Section 6.9 Part B Rule 1 & AC-E8: visually disabled with 'Brakuje X monet' label, click shows toast */
                  <button
                    type="button"
                    aria-disabled="true"
                    onClick={() => handleBuyOrEquip(item)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs font-extrabold font-display opacity-50 cursor-pointer tabular-nums"
                  >
                    Brakuje {missingCoins} monet
                  </button>
                ) : (
                  <TactileButton
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleBuyOrEquip(item)}
                  >
                    <Coins className="w-4 h-4" />
                    <span className="tabular-nums">Kup ({item.price})</span>
                  </TactileButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

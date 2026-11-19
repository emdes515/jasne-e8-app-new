'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  ShoppingBag,
  Shield,
  Crown,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Compass,
  Trash2,
  Check,
  Flame,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  DailyGoalMinutes,
  LumiColorSchemeId,
  LumiLoadout,
} from '../../types/domain';
import {
  LUMI_COLOR_LABELS,
  PLAYER_TITLE_LABELS,
  PROFILE_FRAME_LABELS,
  SHOP_CATALOG,
} from '../../data/shopCatalog';
import {
  getRankForXp,
  RANKS_E8,
  validateNickname,
} from '../../lib/gamification';
import {
  SPRING_SNAPPY,
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';
import { BottomSheet } from '../ui/BottomSheet';
import { MascotDressingRoom } from './MascotDressingRoom';

export function ProfileShopView() {
  const {
    state,
    setTheme,
    setSfxEnabled,
    updateProfileSettings,
    purchaseOrEquipShopItem,
    setProductTourOpen,
    resetAllLocalProgress,
    playSound,
  } = useAppState();

  const [sectionTab, setSectionTab] = useState<'profile' | 'shop'>('profile');
  const [nickInput, setNickInput] = useState(state.nickname);
  const [nickError, setNickError] = useState<string | null>(null);

  // Two-step Reset Local Progress modals (Master Spec Section 6.9 Part A & AC-V7)
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [resetConfirmWord, setResetConfirmWord] = useState('');

  const rankInfo = getRankForXp(state.xp);

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateNickname(nickInput);
    if (!v.valid) {
      setNickError(v.error ?? 'Nieprawidłowa ksywka');
      return;
    }
    setNickError(null);
    updateProfileSettings({ nickname: v.trimmed });
  };

  const getFrameBorderClass = (frame: LumiLoadout['profileFrame']) => {
    switch (frame) {
      case 'emerald_impulse_frame':
        return 'border-[#10B981] shadow-[0_6px_0_0_#047857]';
      case 'gold_ring_frame':
        return 'border-[#FFB800] shadow-[0_6px_0_0_#B45309]';
      case 'cyber_plasma_frame':
        return 'border-[#38BDF8] shadow-[0_6px_0_0_#0284C7]';
      default:
        return 'border-[var(--border-subtle)] shadow-[0_6px_0_0_var(--border-3d-edge)]';
    }
  };

  return (
    <>
      <motion.div
        variants={STAGGER_CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Top Segmented Switcher: Profil & Ustawienia | Sklep Lumi */}
        <motion.div
          variants={STAGGER_ITEM_VARIANTS}
          role="tablist"
          aria-label="Sekcje Profilu i Sklepu"
          className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={sectionTab === 'profile'}
            onClick={() => {
              playSound('tabSwitch');
              setSectionTab('profile');
            }}
            className="relative min-h-[46px] px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold font-display cursor-pointer select-none"
          >
            {sectionTab === 'profile' && (
              <motion.span
                layoutId="profile-shop-main-capsule"
                transition={SPRING_SNAPPY}
                className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]"
              />
            )}
            <User
              className={`relative z-10 w-4 h-4 ${
                sectionTab === 'profile'
                  ? 'text-[var(--on-accent)]'
                  : 'text-[var(--accent-text)]'
              }`}
            />
            <span
              className={`relative z-10 ${
                sectionTab === 'profile'
                  ? 'text-[var(--on-accent)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Profil & Ustawienia
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={sectionTab === 'shop'}
            onClick={() => {
              playSound('tabSwitch');
              setSectionTab('shop');
            }}
            className="relative min-h-[46px] px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold font-display cursor-pointer select-none"
          >
            {sectionTab === 'shop' && (
              <motion.span
                layoutId="profile-shop-main-capsule"
                transition={SPRING_SNAPPY}
                className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]"
              />
            )}
            <ShoppingBag
              className={`relative z-10 w-4 h-4 ${
                sectionTab === 'shop'
                  ? 'text-[var(--on-accent)]'
                  : 'text-[var(--accent-text)]'
              }`}
            />
            <span
              className={`relative z-10 ${
                sectionTab === 'shop'
                  ? 'text-[var(--on-accent)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Sklep Lumi ({state.coins})
            </span>
          </button>
        </motion.div>

        {sectionTab === 'shop' ? (
          <MascotDressingRoom />
        ) : (
          <div className="space-y-5">
            {/* Hero Player Card */}
            <motion.section
              variants={STAGGER_ITEM_VARIANTS}
              aria-label="Karta Gracza"
              className={`rounded-3xl bg-[var(--bg-surface)] border-2 p-5 sm:p-6 ${getFrameBorderClass(
                state.loadout.profileFrame
              )}`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="p-3 rounded-3xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] shrink-0">
                  <LumiMascot
                    mood="happy"
                    loadout={state.loadout}
                    size="md"
                  />
                </div>

                <div className="flex-1 w-full text-center sm:text-left space-y-2">
                  <div>
                    <div className="text-xs font-extrabold font-display text-[var(--accent-text)]">
                      {PLAYER_TITLE_LABELS[state.loadout.playerTitle]}
                    </div>
                    <h1 className="text-2xl font-extrabold font-display text-[var(--text-primary)]">
                      {state.nickname}
                    </h1>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Ramka: {PROFILE_FRAME_LABELS[state.loadout.profileFrame]}{' '}
                      · Kolor Lumi:{' '}
                      {LUMI_COLOR_LABELS[state.loadout.colorScheme]}
                    </div>
                  </div>

                  {/* Rank E8 Progress */}
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-left">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-1.5 font-extrabold font-display text-[var(--text-primary)]">
                        <Crown className="w-4 h-4 text-[var(--accent-text)]" />
                        <span>Ranga: {rankInfo.currentRank.name}</span>
                      </span>
                      <span className="tabular-nums font-extrabold text-[var(--accent-text)]">
                        {state.xp} XP
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[var(--bg-canvas)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
                        style={{ width: `${rankInfo.progressPercent}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-1 tabular-nums">
                      {rankInfo.nextRank
                        ? `Do rangi ${rankInfo.nextRank.name} (${rankInfo.nextRank.minXp} XP) brakuje ${rankInfo.xpToNext} XP`
                        : 'Osiągnięto najwyższą rangę Legenda E8 (7000+ XP)!'}
                    </div>
                  </div>

                  {/* Streak Shields & Quick Shop CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--info)] tabular-nums">
                      <Shield className="w-4 h-4" />
                      <span>Tarcze Serii: {state.streakShields}/2</span>
                    </div>

                    <TactileButton
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        playSound('tap');
                        setSectionTab('shop');
                      }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Przejdź do Sklepu Lumi</span>
                    </TactileButton>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Quick Starter Color Switcher */}
            <motion.section
              variants={STAGGER_ITEM_VARIANTS}
              className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)] p-5 space-y-3"
            >
              <h2 className="text-base font-extrabold font-display text-[var(--text-primary)]">
                Szybka zmiana koloru korpusu Lumi
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(
                  [
                    {
                      id: 'gold_spark',
                      itemId: 'skin_gold_spark',
                      swatch: '#FFCA28',
                    },
                    {
                      id: 'blue_wave',
                      itemId: 'skin_blue_wave',
                      swatch: '#38BDF8',
                    },
                    {
                      id: 'emerald_pulse',
                      itemId: 'skin_emerald_pulse',
                      swatch: '#34D399',
                    },
                    {
                      id: 'ice_crystal',
                      itemId: 'skin_ice_crystal',
                      swatch: '#7DD3FC',
                    },
                    {
                      id: 'crimson_comet',
                      itemId: 'skin_crimson_comet',
                      swatch: '#FB7185',
                    },
                  ] as Array<{
                    id: LumiColorSchemeId;
                    itemId: string;
                    swatch: string;
                  }>
                ).map((skin) => {
                  const owned = state.ownedItemIds.includes(skin.itemId);
                  const active = state.loadout.colorScheme === skin.id;

                  return (
                    <button
                      key={skin.id}
                      type="button"
                      onClick={() => {
                        if (!owned) {
                          setSectionTab('shop');
                          return;
                        }
                        const catalogItem = SHOP_CATALOG.find(
                          (it) => it.id === skin.itemId
                        );
                        if (catalogItem) {
                          purchaseOrEquipShopItem(catalogItem);
                        }
                      }}
                      disabled={!owned}
                      className={`min-h-[48px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                        active
                          ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)]'
                          : owned
                          ? 'bg-[var(--bg-canvas)]/50 border-[var(--border-subtle)] cursor-pointer'
                          : 'bg-[var(--bg-canvas)]/20 border-[var(--border-subtle)] opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/30"
                        style={{ backgroundColor: skin.swatch }}
                      />
                      <span className="text-[11px] truncate max-w-full">
                        {LUMI_COLOR_LABELS[skin.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.section>

            {/* Ranks E8 Ladder Reference */}
            <motion.section
              variants={STAGGER_ITEM_VARIANTS}
              className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)] p-5 space-y-3"
            >
              <h2 className="text-base font-extrabold font-display text-[var(--text-primary)]">
                Drabinka Rang E8 (Progi XP)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {RANKS_E8.map((r) => {
                  const unlocked = state.xp >= r.minXp;
                  return (
                    <div
                      key={r.id}
                      className={`p-3 rounded-2xl border-2 text-center ${
                        unlocked
                          ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)]'
                          : 'bg-[var(--bg-canvas)]/40 border-[var(--border-subtle)] opacity-60'
                      }`}
                    >
                      <div className="text-xs font-extrabold font-display text-[var(--text-primary)]">
                        {r.name}
                      </div>
                      <div className="text-[11px] font-bold text-[var(--accent-text)] tabular-nums mt-0.5">
                        {r.minXp} XP
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Application Settings */}
            <motion.section
              variants={STAGGER_ITEM_VARIANTS}
              aria-label="Ustawienia aplikacji"
              className="rounded-3xl bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] shadow-[0_5px_0_0_var(--border-3d-edge)] p-5 space-y-5"
            >
              <h2 className="text-base font-extrabold font-display text-[var(--text-primary)]">
                Ustawienia Aplikacji
              </h2>

              {/* 1. Theme Switcher: Nocturne Dark / Solar Light */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                <div>
                  <div className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                    Motyw wizualny (Dual-Theme)
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Przełączaj natychmiast między Nocturne Dark a Solar Light
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 shrink-0">
                  <TactileButton
                    variant={state.theme === 'dark' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Nocturne Dark</span>
                  </TactileButton>
                  <TactileButton
                    variant={state.theme === 'light' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Solar Light</span>
                  </TactileButton>
                </div>
              </div>

              {/* 2. SFX Web Audio Toggle */}
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                <div>
                  <div className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                    Dźwięki SFX (Web Audio)
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Synteza efektów kliknięć, rosnącego tonu Combo i fanfar
                  </div>
                </div>

                <TactileButton
                  variant={state.sfxEnabled ? 'success' : 'secondary'}
                  size="sm"
                  onClick={() => setSfxEnabled(!state.sfxEnabled)}
                >
                  {state.sfxEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Włączone</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Wyłączone</span>
                    </>
                  )}
                </TactileButton>
              </div>

              {/* 3. Nickname Edit (2-20 chars validation) */}
              <form
                onSubmit={handleSaveNickname}
                className="space-y-2 pb-4 border-b border-[var(--border-subtle)]"
              >
                <label
                  htmlFor="profile-nickname-input"
                  className="block text-sm font-extrabold font-display text-[var(--text-primary)]"
                >
                  Ksywka gracza (2–20 znaków)
                </label>
                <div className="flex gap-2">
                  <input
                    id="profile-nickname-input"
                    type="text"
                    maxLength={20}
                    value={nickInput}
                    onChange={(e) => {
                      setNickInput(e.target.value);
                      setNickError(null);
                    }}
                    className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none text-sm font-bold text-[var(--text-primary)]"
                  />
                  <TactileButton type="submit" variant="primary" size="sm">
                    <Check className="w-4 h-4" />
                    <span>Zapisz nick</span>
                  </TactileButton>
                </div>
                {nickError && (
                  <p className="text-xs font-bold text-[var(--danger)]">
                    {nickError}
                  </p>
                )}
              </form>

              {/* 4. Daily Goal Selector (5 / 10 / 15 min) */}
              <div className="space-y-2 pb-4 border-b border-[var(--border-subtle)]">
                <div className="text-sm font-extrabold font-display text-[var(--text-primary)]">
                  Dzienny cel nauki
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([5, 10, 15] as DailyGoalMinutes[]).map((mins) => {
                    const active = state.dailyGoalMinutes === mins;
                    return (
                      <TactileButton
                        key={mins}
                        variant={active ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() =>
                          updateProfileSettings({ dailyGoalMinutes: mins })
                        }
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{mins} min / dzień</span>
                      </TactileButton>
                    );
                  })}
                </div>
              </div>

              {/* 5. Repeat Intro / Product Tour & Two-Step Reset Local Progress */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <TactileButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    playSound('tap');
                    setProductTourOpen(true);
                  }}
                >
                  <Compass className="w-4 h-4 text-[var(--accent-text)]" />
                  <span>Powtórz intro / Product Tour</span>
                </TactileButton>

                <TactileButton
                  variant="danger"
                  size="md"
                  fullWidth
                  onClick={() => {
                    playSound('tap');
                    setResetConfirmWord('');
                    setResetStep(1);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Resetuj postępy lokalne</span>
                </TactileButton>
              </div>
            </motion.section>
          </div>
        )}
      </motion.div>

      {/* Two-Step Reset Confirmation Modals (Master Spec Section 6.9 Part A & AC-V7) */}
      <BottomSheet
        open={resetStep > 0}
        onClose={() => setResetStep(0)}
        title={
          resetStep === 1
            ? 'Usunąć wszystkie postępy?'
            : 'Potwierdź reset wpisując słowo RESET'
        }
        subtitle="Ta operacja wyczyści klucz jasne-e8-app:state i uruchomi ponownie onboarding"
      >
        {resetStep === 1 ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Stracisz wszystkie lokalne XP, monety, serię, kupione kosmetyki
              Lumi, Zapisane zadania i historię egzaminów. Motyw i dźwięki SFX
              również wrócą do wartości domyślnych.
            </p>
            <div className="flex gap-3">
              <TactileButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setResetStep(0)}
              >
                Anuluj
              </TactileButton>
              <TactileButton
                variant="danger"
                size="md"
                fullWidth
                onClick={() => {
                  playSound('tap');
                  setResetStep(2);
                }}
              >
                Dalej (Krok 2/2)
              </TactileButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="reset-confirm-input"
                className="block text-xs font-extrabold font-display text-[var(--text-secondary)] mb-1.5"
              >
                Wpisz wielkimi literami słowo{' '}
                <strong className="text-[var(--danger)]">RESET</strong>, aby
                potwierdzić:
              </label>
              <input
                id="reset-confirm-input"
                type="text"
                value={resetConfirmWord}
                onChange={(e) => setResetConfirmWord(e.target.value)}
                placeholder="RESET"
                className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] focus:border-[var(--danger)] focus:outline-none text-base font-extrabold font-display text-[var(--text-primary)]"
              />
            </div>

            <div className="flex gap-3">
              <TactileButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setResetStep(0)}
              >
                Anuluj
              </TactileButton>
              <TactileButton
                variant="danger"
                size="md"
                fullWidth
                disabled={resetConfirmWord.trim() !== 'RESET'}
                onClick={() => {
                  if (resetConfirmWord.trim() !== 'RESET') return;
                  setResetStep(0);
                  resetAllLocalProgress();
                }}
              >
                Wyczyść wszystko
              </TactileButton>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}

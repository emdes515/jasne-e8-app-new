'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Dices,
  Bookmark,
  Bot,
  BookOpen,
  Heart,
  Coins,
  Shield,
  ArrowRight,
  Check,
  Cloud,
  Flame,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import {
  DailyGoalMinutes,
  LumiColorSchemeId,
  LumiMood,
  StudyStageId,
  SubjectId,
} from '../../types/domain';
import { validateNickname } from '../../lib/gamification';
import { SPRING_BOUNCY, SPRING_SNAPPY } from '../../lib/motionPresets';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';
import { BottomSheet } from '../ui/BottomSheet';
import { CloudAccountModal, useCloudAuthUser } from '../auth/CloudAccountModal';

const RANDOM_NICKNAMES = [
  'CyberPitagoras',
  'SzybkiUłamek',
  'MistrzE8',
  'BłyskLogiki',
  'KwantowyAs',
  'ZłotyPierwiastek',
  'SniperCKE',
  'TurboPotęga',
];

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

export function OnboardingFlow() {
  const { completeOnboarding, playSound } = useAppState();
  const prefersReduced = useReducedMotion();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [nickname, setNickname] = useState('CyberPitagoras');
  const [studyStage, setStudyStage] = useState<StudyStageId>('grade8');
  const [starterColor, setStarterColor] =
    useState<LumiColorSchemeId>('gold_spark');
  const [activeSubject, setActiveSubject] = useState<SubjectId>('math');
  const [dailyGoalMinutes, setDailyGoalMinutes] =
    useState<DailyGoalMinutes>(10);
  const [tourIndex, setTourIndex] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user: cloudUser } = useCloudAuthUser();

  const nickValidation = validateNickname(nickname);

  const rollRandomNick = () => {
    playSound('tap');
    const available = RANDOM_NICKNAMES.filter((n) => n !== nickname);
    const picked =
      available[Math.floor(Math.random() * available.length)] ?? 'MistrzE8';
    setNickname(picked);
  };

  // Fire confetti on Step 5
  useEffect(() => {
    if (step === 5 && !prefersReduced) {
      try {
        confetti({
          particleCount: 55,
          spread: 68,
          origin: { y: 0.6 },
          colors: ['#FFB800', '#10B981', '#38BDF8', '#F97316'],
        });
      } catch {
        // Ignore confetti canvas errors in headless environments
      }
    }
  }, [step, prefersReduced]);

  const getStepMood = (): LumiMood => {
    if (step === 1) return 'happy';
    if (step === 2) return 'cool';
    if (step === 3) {
      if (dailyGoalMinutes === 15) return 'celebrate';
      if (dailyGoalMinutes === 10) return 'focused';
      return 'happy';
    }
    if (step === 4) return 'thinking';
    return 'celebrate';
  };

  const progressPct = (step / 5) * 100;

  return (
    <div className="min-h-dvh w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col gap-5 px-4 py-6 sm:py-10 overflow-x-hidden">
      {/* Top Progress Bar */}
      <div className="w-full max-w-xl mx-auto">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-2">
          <span className="font-display tracking-tight text-sm text-[var(--text-primary)]">
            JASNE E8
          </span>
          <span className="tabular-nums">Krok {step} z 5</span>
        </div>
        <div className="h-3 w-full rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
          <motion.div
            className="h-full bg-[var(--accent-primary)] rounded-full"
            initial={{ width: '20%' }}
            animate={{ width: `${progressPct}%` }}
            transition={SPRING_SNAPPY}
          />
        </div>
      </div>

      {/* Main Step Card */}
      <div className="w-full max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="onb-step-1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={SPRING_SNAPPY}
              className="study-panel p-6 sm:p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <LumiMascot
                  mood={getStepMood()}
                  loadout={{ colorScheme: starterColor }}
                  size="lg"
                />
              </div>

              <h1 className="page-heading mb-3">Cześć, tu Lumi.</h1>
              <p className="mx-auto mb-6 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
                Poćwicz matematykę przed egzaminem ósmoklasisty. Pierwszą lekcję przetestujesz od razu, a darmowe konto odblokuje całość.
              </p>

              <TactileButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  playSound('tap');
                  setStep(2);
                }}
              >
                <span>Zaczynamy</span>
                <ArrowRight className="w-5 h-5" />
              </TactileButton>

              {!cloudUser && (
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="mt-3 text-xs font-bold text-[var(--accent-text)] hover:underline cursor-pointer"
                >
                  Mam już konto — zaloguj się za darmo
                </button>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="onb-step-2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={SPRING_SNAPPY}
              className="study-panel p-6 sm:p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <LumiMascot
                  mood={getStepMood()}
                  loadout={{ colorScheme: starterColor }}
                  size="sm"
                />
                <div>
                  <h2 className="text-xl font-extrabold font-display">
                    Poznajmy się!
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Twoje postępy zapisują się lokalnie na tym urządzeniu.
                  </p>
                </div>
              </div>

              {/* Nickname input + randomizer */}
              <div className="mb-5">
                <label
                  htmlFor="onb-nickname"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  Twoja ksywka lub imię (2–20 znaków)
                </label>
                <div className="flex gap-2">
                  <input
                    id="onb-nickname"
                    type="text"
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Np. CyberPitagoras"
                    className="flex-1 min-h-[48px] px-4 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <TactileButton
                    variant="secondary"
                    size="md"
                    onClick={rollRandomNick}
                    aria-label="Losuj nick"
                  >
                    <Dices className="w-4 h-4" />
                    <span className="hidden sm:inline">Losuj nick</span>
                  </TactileButton>
                </div>
                {!nickValidation.valid && (
                  <p className="text-xs font-semibold text-[var(--danger)] mt-1.5">
                    {nickValidation.error}
                  </p>
                )}
              </div>

              {/* Study Stage */}
              <div className="mb-5">
                <span className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                  Na jakim etapie jesteś?
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      id: 'grade8' as StudyStageId,
                      title: 'Klasa 8 — zdaję w tym roku',
                      desc: 'Skupimy się na konkretach CKE i szybkości',
                    },
                    {
                      id: 'grade7' as StudyStageId,
                      title: 'Klasa 7 — zaczynam na spokojnie',
                      desc: 'Zbudujesz przewagę bez stresu',
                    },
                    {
                      id: 'revision' as StudyStageId,
                      title: 'Powtórka przed próbnym',
                      desc: 'Lecimy od razu w powtórki i mini-arkusze',
                    },
                  ].map((item) => {
                    const selected = studyStage === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          playSound('tap');
                          setStudyStage(item.id);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          selected
                            ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] shadow-[0_4px_0_0_var(--accent-primary-edge)]'
                            : 'bg-[var(--bg-canvas)]/40 border-[var(--border-subtle)] hover:border-[var(--text-secondary)]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-[var(--text-primary)]">
                            {item.title}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {item.desc}
                          </div>
                        </div>
                        {selected && (
                          <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-[var(--on-accent)] flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Starter Lumi Color */}
              <div className="mb-6">
                <span className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                  Wybierz startowy kolor Lumi (darmowy):
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'gold_spark' as LumiColorSchemeId,
                      label: 'Złota Iskra',
                      swatch: '#FFCA28',
                    },
                    {
                      id: 'blue_wave' as LumiColorSchemeId,
                      label: 'Błękitna Fala',
                      swatch: '#38BDF8',
                    },
                    {
                      id: 'emerald_pulse' as LumiColorSchemeId,
                      label: 'Szmaragdowy Impuls',
                      swatch: '#34D399',
                    },
                  ].map((c) => {
                    const active = starterColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          playSound('tap');
                          setStarterColor(c.id);
                        }}
                        className={`min-h-[48px] p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          active
                            ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] shadow-[0_3px_0_0_var(--accent-primary-edge)]'
                            : 'bg-[var(--bg-canvas)]/40 border-[var(--border-subtle)]'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/30"
                          style={{ backgroundColor: c.swatch }}
                        />
                        <span className="text-xs font-bold text-[var(--text-primary)] text-center">
                          {c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <TactileButton
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    playSound('tap');
                    setStep(1);
                  }}
                >
                  Wstecz
                </TactileButton>
                <TactileButton
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={!nickValidation.valid}
                  onClick={() => {
                    if (!nickValidation.valid) return;
                    playSound('tap');
                    setStep(3);
                  }}
                >
                  <span>Dalej</span>
                  <ArrowRight className="w-4 h-4" />
                </TactileButton>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="onb-step-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={SPRING_SNAPPY}
              className="study-panel p-6 sm:p-8"
            >
              <div className="flex items-center gap-4 mb-5">
                <LumiMascot
                  mood={getStepMood()}
                  loadout={{ colorScheme: starterColor }}
                  size="sm"
                />
                <div>
                  <h2 className="text-xl font-extrabold font-display">
                    Przedmiot i cel dzienny
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Cel możesz zmienić później w profilu.
                  </p>
                </div>
              </div>

              {/* Starter Subject */}
              <div className="mb-5">
                <span className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                  Od którego przedmiotu zaczynamy?
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      id: 'math' as SubjectId,
                      name: 'Matematyka E8',
                      note: 'Lekcja i miniarkusz',
                    },
                    {
                      id: 'polish' as SubjectId,
                      name: 'Język Polski E8',
                      note: 'Plan działów',
                    },
                    {
                      id: 'english' as SubjectId,
                      name: 'Język Angielski E8',
                      note: 'Plan działów',
                    },
                  ].map((sub) => {
                    const selected = activeSubject === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          playSound('tap');
                          setActiveSubject(sub.id);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          selected
                            ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] shadow-[0_4px_0_0_var(--accent-primary-edge)]'
                            : 'bg-[var(--bg-canvas)]/40 border-[var(--border-subtle)]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-[var(--text-primary)]">
                            {sub.name}
                          </div>
                          <div className="text-xs text-[var(--accent-text)] font-medium">
                            {sub.note}
                          </div>
                        </div>
                        {selected && (
                          <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-[var(--on-accent)] flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Goal */}
              <div className="mb-6">
                <span className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                  Wybierz swój dzienny cel:
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      mins: 5 as DailyGoalMinutes,
                      title: '5 minut dziennie',
                      desc: '1 lekcja lub 5 zadań dziennie',
                    },
                    {
                      mins: 10 as DailyGoalMinutes,
                      title: '10 minut dziennie',
                      desc: '2 lekcje lub 10 zadań dziennie',
                    },
                    {
                      mins: 15 as DailyGoalMinutes,
                      title: '15 minut dziennie',
                      desc: '3 lekcje lub 15 zadań dziennie',
                    },
                  ].map((g) => {
                    const selected = dailyGoalMinutes === g.mins;
                    return (
                      <button
                        key={g.mins}
                        type="button"
                        onClick={() => {
                          playSound('tap');
                          setDailyGoalMinutes(g.mins);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          selected
                            ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] shadow-[0_4px_0_0_var(--accent-primary-edge)]'
                            : 'bg-[var(--bg-canvas)]/40 border-[var(--border-subtle)]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-[var(--text-primary)]">
                            {g.title}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {g.desc}
                          </div>
                        </div>
                        {selected && (
                          <Flame className="w-5 h-5 text-[var(--combo-fire)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <TactileButton
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    playSound('tap');
                    setStep(2);
                  }}
                >
                  Wstecz
                </TactileButton>
                <TactileButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    playSound('tap');
                    setStep(4);
                  }}
                >
                  <span>Dalej</span>
                  <ArrowRight className="w-4 h-4" />
                </TactileButton>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="onb-step-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={SPRING_SNAPPY}
              className="study-panel p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[var(--accent-text)]">
                  Szybki przewodnik ({tourIndex + 1}/3)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playSound('tap');
                    setStep(5);
                  }}
                  className="min-h-[36px] px-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Pomiń
                </button>
              </div>

              <AnimatePresence mode="wait">
                {(() => {
                  const slide = TOUR_SLIDES[tourIndex];
                  const IconComp = slide.icon;
                  return (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                      className="rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] p-5 mb-6"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)] text-[var(--on-accent)] flex items-center justify-center mb-4">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-extrabold font-display mb-2">
                        {slide.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {slide.description}
                      </p>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Slide switcher buttons */}
              <div className="flex justify-center gap-2 mb-6">
                {TOUR_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Slajd ${idx + 1}`}
                    onClick={() => {
                      playSound('tap');
                      setTourIndex(idx);
                    }}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      tourIndex === idx
                        ? 'w-8 bg-[var(--accent-primary)]'
                        : 'w-2.5 bg-[var(--border-subtle)]'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <TactileButton
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    playSound('tap');
                    if (tourIndex > 0) {
                      setTourIndex(tourIndex - 1);
                    } else {
                      setStep(3);
                    }
                  }}
                >
                  Wstecz
                </TactileButton>
                <TactileButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    playSound('tap');
                    if (tourIndex < 2) {
                      setTourIndex(tourIndex + 1);
                    } else {
                      setStep(5);
                    }
                  }}
                >
                  <span>{tourIndex < 2 ? 'Następny slajd' : 'Odbierz pakiet startowy'}</span>
                  <ArrowRight className="w-4 h-4" />
                </TactileButton>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="onb-step-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={SPRING_BOUNCY}
              className="study-panel p-6 sm:p-8 text-center"
            >
              <div className="flex justify-center mb-3">
                <LumiMascot
                  mood="celebrate"
                  loadout={{ colorScheme: starterColor }}
                  size="lg"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-display mb-2">
                Wszystko gotowe, {nickValidation.trimmed || 'BłyskLogiki'}!
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Możesz zacząć od lekcji z matematyki lub przejść do Startu.
              </p>

              {/* Starter Resource Cards */}
              <div className="grid grid-cols-3 gap-3 mb-7">
                <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center">
                  <Coins className="w-6 h-6 text-[var(--accent-text)] mb-1" />
                  <span className="text-lg font-extrabold font-display tabular-nums">
                    +120
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Monet na start
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center">
                  <Heart className="w-6 h-6 text-[var(--danger)] mb-1" />
                  <span className="text-lg font-extrabold font-display tabular-nums">
                    5/5
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Pełne Serca
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border-2 border-[var(--border-subtle)] flex flex-col items-center">
                  <Shield className="w-6 h-6 text-[var(--success)] mb-1" />
                  <span className="text-sm font-extrabold font-display mt-1">
                    Nowicjusz E8
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Ranga startowa
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {!cloudUser ? (
                  <>
                    <TactileButton
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => setLoginModalOpen(true)}
                    >
                      <Cloud className="w-5 h-5" />
                      <span>Zaloguj się za darmo (odblokuj lekcje)</span>
                    </TactileButton>

                    <TactileButton
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={() =>
                        completeOnboarding({
                          nickname: nickValidation.trimmed,
                          studyStage,
                          activeSubject,
                          dailyGoalMinutes,
                          starterColor,
                          startFirstLesson: true,
                        })
                      }
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Przetestuj 1. lekcję jako Gość</span>
                    </TactileButton>
                  </>
                ) : (
                  <TactileButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() =>
                      completeOnboarding({
                        nickname: nickValidation.trimmed,
                        studyStage,
                        activeSubject,
                        dailyGoalMinutes,
                        starterColor,
                        startFirstLesson: true,
                      })
                    }
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Otwórz pierwszą lekcję</span>
                  </TactileButton>
                )}

                <TactileButton
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() =>
                    completeOnboarding({
                      nickname: nickValidation.trimmed,
                      studyStage,
                      activeSubject,
                      dailyGoalMinutes,
                      starterColor,
                      startFirstLesson: false,
                    })
                  }
                >
                  Przejdź do Startu
                </TactileButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CloudAccountModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        titleOverride="Zaloguj się za darmo i odblokuj całość"
        subtitleOverride="Pierwsza lekcja działa bez konta. Zaloguj się za darmo, aby odblokować wszystkie lekcje i zadania zamknięte E8."
        onSuccess={() => {
          completeOnboarding({
            nickname: nickValidation.trimmed,
            studyStage,
            activeSubject,
            dailyGoalMinutes,
            starterColor,
            startFirstLesson: false,
          });
        }}
      />
    </div>
  );
}

/**
 * Product Tour Modal that can be re-opened any time from Profile settings.
 */
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

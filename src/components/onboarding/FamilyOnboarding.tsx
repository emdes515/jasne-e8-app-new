'use client';

import { type KeyboardEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookType,
  Calculator,
  Check,
  ExternalLink,
  Globe,
  LogIn,
  ShieldCheck,
  Shuffle,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { validateNickname } from '../../lib/gamification';
import {
  AGE_BRACKET_OPTIONS,
  getAgeBracketRule,
  isValidAgeBracket,
  type AgeBracket,
  type ConsentPath,
} from '../../lib/legalAgeGate';
import type {
  DailyGoalMinutes,
  LumiColorSchemeId,
  LumiMood,
  NavTabId,
  OnboardingAudience,
  StudyStageId,
  SubjectId,
} from '../../types/domain';
import { CloudAccountModal } from '../auth/CloudAccountModal';
import { ONBOARDING_DRAFT_KEY } from '../auth/useCloudAuthUser';
import { JasneLogo } from '../brand/JasneLogo';
import { LumiMascot } from '../mascot/LumiMascot';
import { TactileButton } from '../ui/TactileButton';
import styles from './familyOnboarding.module.css';

const STEPS = ['Przedmiot E8', 'Twój plan i Lumi', 'Wiek i start'] as const;

type StarterColorId = Extract<LumiColorSchemeId, 'gold_spark' | 'blue_wave' | 'emerald_pulse'>;

const SUBJECT_OPTIONS: ReadonlyArray<{
  id: SubjectId;
  label: string;
  badge: string;
  description: string;
  tone: 'math' | 'polish' | 'english';
  icon: typeof Calculator;
}> = [
  {
    id: 'math',
    label: 'Matematyka',
    badge: 'Gotowe teraz',
    description: 'Lekcje Bento, zadania CKE i 1. lekcja dostępna od razu.',
    tone: 'math',
    icon: Calculator,
  },
  {
    id: 'polish',
    label: 'Język polski',
    badge: 'Plan działów',
    description: 'Lektury, gramatyka i wypracowanie — sprawdź mapę tematów.',
    tone: 'polish',
    icon: BookType,
  },
  {
    id: 'english',
    label: 'Język angielski',
    badge: 'Plan działów',
    description: 'Słownictwo, funkcje językowe i struktury E8 na jednej mapie.',
    tone: 'english',
    icon: Globe,
  },
];

const STAGE_OPTIONS: ReadonlyArray<{ id: StudyStageId; label: string; caption: string }> = [
  { id: 'grade8', label: 'Klasa 8', caption: 'Egzamin w tym roku' },
  { id: 'grade7', label: 'Klasa 7', caption: 'Spokojny start' },
  { id: 'revision', label: 'Powtórka', caption: 'Szybkie utrwalenie' },
];

const DAILY_GOAL_OPTIONS: ReadonlyArray<{ minutes: DailyGoalMinutes; label: string; caption: string }> = [
  { minutes: 5, label: '5 min', caption: '1 lekcja' },
  { minutes: 10, label: '10 min', caption: '2 lekcje' },
  { minutes: 15, label: '15 min', caption: '3 lekcje' },
];

const STARTER_COLORS: ReadonlyArray<{
  id: StarterColorId;
  label: string;
  tone: 'gold' | 'blue' | 'emerald';
}> = [
  { id: 'gold_spark', label: 'Złota Iskra', tone: 'gold' },
  { id: 'blue_wave', label: 'Błękitna Fala', tone: 'blue' },
  { id: 'emerald_pulse', label: 'Szmaragdowy Impuls', tone: 'emerald' },
];

const RANDOM_NICKNAMES = [
  'BłyskLogiki',
  'SowaE8',
  'IskraWiedzy',
  'TropicielCKE',
  'MistrzZadań',
  'KompasE8',
  'WektorMocy',
] as const;

type ModalConfig = {
  open: boolean;
  skipGuardianGate: boolean;
  initialMode: 'gate' | 'login' | 'register';
  initialAgeBracket?: AgeBracket;
  initialConsentPath?: ConsentPath;
};

function getSubjectLabel(subjectId: SubjectId): string {
  return SUBJECT_OPTIONS.find((item) => item.id === subjectId)?.label ?? 'Matematyka';
}

function getStageLabel(stageId: StudyStageId): string {
  return STAGE_OPTIONS.find((item) => item.id === stageId)?.label ?? 'Klasa 8';
}

function getAgeSummaryLabel(ageBracket: AgeBracket | null, adultConsentPath: ConsentPath): string {
  if (!ageBracket) return 'Do wyboru w kroku 3';
  if (ageBracket === 'under_13') return '< 13 lat · lokalnie / opiekun';
  if (ageBracket === 'age_13_15') return '13–15 lat · lokalnie / opiekun';
  if (ageBracket === 'age_16_17') return '16–17 lat · darmowe konto';
  return adultConsentPath === 'guardian_for_minor'
    ? 'Opiekun ucznia (< 16 lat)'
    : 'Samodzielnie (18+)';
}

function getLumiSpeech(params: {
  step: number;
  selectedSubject: SubjectId;
  starterColor: StarterColorId;
  dailyGoalMinutes: DailyGoalMinutes;
  ageBracket: AgeBracket | null;
  adultConsentPath: ConsentPath;
}): string {
  const { step, selectedSubject, starterColor, dailyGoalMinutes, ageBracket, adultConsentPath } = params;

  if (step === 0) {
    if (selectedSubject === 'polish') {
      return 'Świetny wybór! Pokażę Ci plan działów z języka polskiego, a interaktywną 1. lekcję z zadaniami możesz w każdej chwili uruchomić w matematyce.';
    }
    if (selectedSubject === 'english') {
      return 'Dobry kierunek! Pokażę Ci plan działów z języka angielskiego, a interaktywną 1. lekcję z zadaniami możesz w każdej chwili uruchomić w matematyce.';
    }
    return 'Cześć! Jestem Lumi i przeprowadzę Cię przez cały Egzamin Ósmoklasisty. W matematyce możemy od razu uruchomić 1. lekcję z zadaniami.';
  }

  if (step === 1) {
    if (starterColor === 'blue_wave') {
      return `Błękitna Fala — pełen spokój przed egzaminem! Cel ${dailyGoalMinutes} min dziennie to świetny rytm do E8.`;
    }
    if (starterColor === 'emerald_pulse') {
      return `Szmaragdowy Impuls dodaje energii do zadań! Ustaw ${dailyGoalMinutes} min dziennie i wybierz ksywkę, żebym wiedział, jak się do Ciebie zwracać.`;
    }
    return `Złota Iskra to mój klasyczny blask! Wybierz etap, cel ${dailyGoalMinutes} min dziennie i ksywkę — dopasujemy naukę pod Ciebie.`;
  }

  if (!ageBracket) {
    return 'Ostatni krok — wybierz przedział wieku. Dopasujemy zasady startu do polskich przepisów, bez pytania o datę urodzenia.';
  }
  if (ageBracket === 'under_13') {
    return 'Pierwszą lekcję możesz zrobić od razu lokalnie bez konta. Pełne konto założysz wspólnie z rodzicem lub opiekunem.';
  }
  if (ageBracket === 'age_13_15') {
    return 'Możesz od razu zacząć lokalnie bez konta. Do założenia stałego konta zaprosimy rodzica lub opiekuna — tak wymagają przepisy RODO w Polsce.';
  }
  if (ageBracket === 'age_16_17') {
    return 'Masz już 16+ lat, więc darmowe konto możesz założyć samodzielnie i odblokować kolejne lekcje. Plan Pro będzie dostępny od 18 lat lub przez opiekuna.';
  }
  if (adultConsentPath === 'guardian_for_minor') {
    return 'Dzień dobry! Jako rodzic lub opiekun założysz tu konto dla ucznia z pełną przejrzystością zasad nauki i prywatności.';
  }
  return 'Wszystko masz pod pełną kontrolą — możesz od razu założyć konto i uczyć się w swoim tempie albo najpierw sprawdzić 1. lekcję.';
}

export function FamilyOnboarding() {
  const { completeOnboarding, playSound } = useAppState();
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('math');
  const [studyStage, setStudyStage] = useState<StudyStageId>('grade8');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<DailyGoalMinutes>(10);
  const [starterColor, setStarterColor] = useState<StarterColorId>('gold_spark');
  const [lumiStyled, setLumiStyled] = useState(false);
  const [nickname, setNickname] = useState('BłyskLogiki');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [ageBracket, setAgeBracket] = useState<AgeBracket | null>(null);
  const [adultConsentPath, setAdultConsentPath] = useState<ConsentPath>('guardian_for_minor');
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    open: false,
    skipGuardianGate: false,
    initialMode: 'gate',
  });

  const nickId = useId();
  const nickHintId = useId();
  const nickErrorId = useId();

  const pendingFocusStepRef = useRef<number | null>(null);
  const nickInputRef = useRef<HTMLInputElement | null>(null);
  const ageRadioRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const setHeadingRef = useCallback(
    (node: HTMLHeadingElement | null) => {
      if (!node) return;
      const nodeStep = Number(node.dataset.step);
      if (pendingFocusStepRef.current !== nodeStep) return;
      pendingFocusStepRef.current = null;
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
      }
      node.focus({ preventScroll: true });
    },
    [reduced]
  );

  const goTo = useCallback(
    (next: number) => {
      playSound('tap');
      pendingFocusStepRef.current = next;
      setStep(next);
    },
    [playSound]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed.step === 'number' && parsed.step >= 0 && parsed.step <= 2) {
        setStep(parsed.step);
      }
      if (parsed.selectedSubject === 'math' || parsed.selectedSubject === 'polish' || parsed.selectedSubject === 'english') {
        setSelectedSubject(parsed.selectedSubject);
      }
      if (parsed.studyStage === 'grade8' || parsed.studyStage === 'grade7' || parsed.studyStage === 'revision') {
        setStudyStage(parsed.studyStage);
      }
      if (parsed.dailyGoalMinutes === 5 || parsed.dailyGoalMinutes === 10 || parsed.dailyGoalMinutes === 15) {
        setDailyGoalMinutes(parsed.dailyGoalMinutes);
      }
      if (parsed.starterColor === 'gold_spark' || parsed.starterColor === 'blue_wave' || parsed.starterColor === 'emerald_pulse') {
        setStarterColor(parsed.starterColor);
      }
      if (typeof parsed.nickname === 'string' && parsed.nickname.trim().length > 0) {
        setNickname(parsed.nickname);
      }
      if (isValidAgeBracket(parsed.ageBracket)) {
        setAgeBracket(parsed.ageBracket);
      }
      if (parsed.adultConsentPath === 'guardian_for_minor' || parsed.adultConsentPath === 'self_16_plus') {
        setAdultConsentPath(parsed.adultConsentPath);
      }
    } catch {
      // Niepoprawny szkic jest ignorowany
    }
  }, []);

  const effectiveAudience: OnboardingAudience =
    ageBracket === 'adult_or_guardian' && adultConsentPath === 'guardian_for_minor'
      ? 'guardian'
      : 'student';

  const finish = useCallback(
    (options: {
      startFirstLesson: boolean;
      subjectOverride?: SubjectId;
      audienceOverride?: OnboardingAudience;
      openTab?: NavTabId;
    }) => {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
        } catch {
          // Opcjonalne czyszczenie szkicu
        }
      }
      const targetSubject = options.subjectOverride ?? selectedSubject;
      const nickCheck = validateNickname(nickname);
      const safeNick = nickCheck.valid ? nickCheck.trimmed : 'BłyskLogiki';
      const resolvedOpenTab = options.startFirstLesson
        ? undefined
        : options.openTab ?? (targetSubject !== 'math' ? 'learn' : 'start');

      completeOnboarding({
        nickname: safeNick,
        studyStage,
        activeSubject: targetSubject,
        dailyGoalMinutes,
        starterColor,
        startFirstLesson: options.startFirstLesson,
        audience: options.audienceOverride ?? effectiveAudience,
        studyReminder: null,
        ageBracket: ageBracket ?? undefined,
        preferredSubjects: [targetSubject],
        openTab: resolvedOpenTab,
      });
    },
    [
      ageBracket,
      completeOnboarding,
      dailyGoalMinutes,
      effectiveAudience,
      nickname,
      selectedSubject,
      starterColor,
      studyStage,
    ]
  );

  const openAccountModal = useCallback(
    (config: Omit<ModalConfig, 'open'>) => {
      playSound('tap');
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(
            ONBOARDING_DRAFT_KEY,
            JSON.stringify({
              step,
              selectedSubject,
              studyStage,
              dailyGoalMinutes,
              starterColor,
              nickname,
              ageBracket,
              adultConsentPath,
            })
          );
        } catch {
          // Opcjonalny zapis szkicu
        }
      }
      setModalConfig({ ...config, open: true });
    },
    [adultConsentPath, ageBracket, dailyGoalMinutes, nickname, playSound, selectedSubject, starterColor, step, studyStage]
  );

  const handleJumpAsGuardian = () => {
    setAgeBracket('adult_or_guardian');
    setAdultConsentPath('guardian_for_minor');
    goTo(2);
  };

  const handleOpenLogin = () => {
    openAccountModal({
      initialMode: 'login',
      skipGuardianGate: true,
    });
  };

  const handleColorSelect = (color: StarterColorId) => {
    playSound('tap');
    setStarterColor(color);
    setLumiStyled(true);
    if (typeof window !== 'undefined' && window.scrollY > 120) {
      window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
    }
  };

  const handleRandomNickname = () => {
    playSound('tap');
    const candidates = RANDOM_NICKNAMES.filter((name) => name !== nickname.trim());
    const nextName =
      candidates[Math.floor(Math.random() * candidates.length)] ?? RANDOM_NICKNAMES[0];
    setNickname(nextName);
    setNicknameError(null);
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    if (nicknameError) {
      const check = validateNickname(value);
      setNicknameError(check.valid ? null : check.error ?? null);
    }
  };

  const handleStep2Next = () => {
    const check = validateNickname(nickname);
    if (!check.valid) {
      playSound('wrong');
      setNicknameError(check.error ?? 'Wpisz poprawną ksywkę (2–20 znaków).');
      nickInputRef.current?.focus();
      return;
    }
    setNickname(check.trimmed);
    setNicknameError(null);
    goTo(2);
  };

  const handleSelectAgeBracket = (bracket: AgeBracket) => {
    playSound('tap');
    setAgeBracket(bracket);
    if (bracket === 'adult_or_guardian') {
      setAdultConsentPath('guardian_for_minor');
    }
  };

  const handleAgeRadioKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = AGE_BRACKET_OPTIONS.length;
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (index + 1) % total;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + total) % total;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    const nextOption = AGE_BRACKET_OPTIONS[nextIndex];
    handleSelectAgeBracket(nextOption.id);
    ageRadioRefs.current[nextIndex]?.focus();
  };

  const lumiMood: LumiMood = useMemo(() => {
    if (step === 0) return 'happy';
    if (step === 1) return lumiStyled ? 'cool' : 'focused';
    if (ageBracket === 'age_16_17') return 'celebrate';
    return 'supportive';
  }, [ageBracket, lumiStyled, step]);

  const lumiSpeech = useMemo(
    () =>
      getLumiSpeech({
        step,
        selectedSubject,
        starterColor,
        dailyGoalMinutes,
        ageBracket,
        adultConsentPath,
      }),
    [adultConsentPath, ageBracket, dailyGoalMinutes, selectedSubject, starterColor, step]
  );

  const selectedAgeRule = ageBracket ? getAgeBracketRule(ageBracket) : null;
  const selectedSubjectLabel = getSubjectLabel(selectedSubject);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {step > 0 ? (
            <button type="button" className={styles.back} onClick={() => goTo(step - 1)}>
              <ArrowLeft size={18} aria-hidden="true" />
              <span>Wstecz</span>
            </button>
          ) : (
            <JasneLogo size="sm" animated="subtle" />
          )}
        </div>

        <div className={styles.progressGroup}>
          <span className={styles.stepCounter}>Krok {step + 1} z 3</span>
          <ol className={styles.steps} aria-label="Postęp konfiguracji">
            {STEPS.map((label, index) => (
              <li
                key={label}
                data-done={index <= step}
                aria-current={index === step ? 'step' : undefined}
              >
                <span className="sr-only">
                  Krok {index + 1}: {label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.art} data-color={starterColor} aria-label="Przewodnik Lumi i podsumowanie planu">
          <div className={styles.stageHero}>
            <div className={styles.mascotWrap} aria-hidden="true">
              <motion.div
                key={`${step}-${starterColor}`}
                className={styles.lumi}
                initial={reduced ? false : { y: 8, scale: 0.96, opacity: 0.85 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <LumiMascot
                  size="md"
                  mood={lumiMood}
                  loadout={{ colorScheme: starterColor }}
                  tutorScholarCap={step === 0}
                  className={styles.lumiMobile}
                />
                <LumiMascot
                  size="xl"
                  mood={lumiMood}
                  loadout={{ colorScheme: starterColor }}
                  tutorScholarCap={step === 0}
                  className={styles.lumiDesktop}
                />
              </motion.div>
            </div>

            <div className={styles.stageCopy}>
              <span className={styles.stamp}>
                <Sparkles size={13} aria-hidden="true" />
                <span>Lumi · Twój przewodnik E8</span>
              </span>

              <div className={styles.speechBubble} aria-live="polite">
                <p>{lumiSpeech}</p>
              </div>
            </div>
          </div>

          <dl className={styles.planSummary} aria-label="Podsumowanie wybranego planu">
            <div>
              <dt>Przedmiot</dt>
              <dd>{selectedSubjectLabel}</dd>
            </div>
            <div>
              <dt>Etap</dt>
              <dd>{getStageLabel(studyStage)}</dd>
            </div>
            <div>
              <dt>Cel dzienny</dt>
              <dd>{dailyGoalMinutes} min</dd>
            </div>
            <div>
              <dt>Wiek i tryb</dt>
              <dd>{getAgeSummaryLabel(ageBracket, adultConsentPath)}</dd>
            </div>
          </dl>
        </aside>

        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={step}
            className={styles.card}
            initial={reduced ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -8 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            aria-labelledby={`family-step-${step}`}
          >
            {step === 0 && (
              <>
                <div className={styles.headingBlock}>
                  <h1 id="family-step-0" data-step={0} tabIndex={-1} ref={setHeadingRef}>
                    Egzamin Ósmoklasisty.<em>Krok po kroku z Lumi.</em>
                  </h1>
                  <p className={styles.lead}>
                    Przygotuj się do Egzaminu Ósmoklasisty — dziś ćwiczysz matematykę z kartami
                    teorii Bento i zadaniami CKE, a dla języka polskiego i angielskiego masz już
                    pełny plan działów.
                  </p>
                </div>

                <div className={styles.sectionBlock}>
                  <span className={styles.sectionLabel}>Wybierz przedmiot na start</span>
                  <div className={styles.subjectGrid} role="group" aria-label="Przedmioty Egzaminu Ósmoklasisty">
                    {SUBJECT_OPTIONS.map((subject) => {
                      const Icon = subject.icon;
                      const active = selectedSubject === subject.id;
                      return (
                        <button
                          key={subject.id}
                          type="button"
                          className={styles.subjectCard}
                          data-tone={subject.tone}
                          aria-pressed={active}
                          onClick={() => {
                            playSound('tap');
                            setSelectedSubject(subject.id);
                          }}
                        >
                          <span className={styles.subjectIcon} aria-hidden="true">
                            <Icon size={20} />
                          </span>
                          <span className={styles.subjectBody}>
                            <span className={styles.subjectHeader}>
                              <strong>{subject.label}</strong>
                              <span className={styles.subjectBadge}>{subject.badge}</span>
                            </span>
                            <small>{subject.description}</small>
                          </span>
                          <span className={styles.subjectCheck} aria-hidden="true">
                            {active ? <Check size={16} strokeWidth={3} /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.ctaStack}>
                  <TactileButton fullWidth size="lg" onClick={() => goTo(1)}>
                    <span>Dalej — dopasuj swój plan</span>
                    <ArrowRight size={19} aria-hidden="true" />
                  </TactileButton>

                  <TactileButton
                    fullWidth
                    variant="secondary"
                    size="md"
                    onClick={() => finish({ startFirstLesson: true, subjectOverride: 'math' })}
                  >
                    <BookOpen size={18} aria-hidden="true" />
                    <span>Zacznij 1. lekcję od razu (bez konta)</span>
                  </TactileButton>
                </div>

                <div className={styles.helperRow}>
                  <button
                    type="button"
                    className={styles.helperButton}
                    onClick={handleJumpAsGuardian}
                  >
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>Jestem rodzicem / opiekunem</span>
                  </button>
                  <button
                    type="button"
                    className={styles.helperButton}
                    onClick={handleOpenLogin}
                  >
                    <LogIn size={16} aria-hidden="true" />
                    <span>Mam już konto</span>
                  </button>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className={styles.headingBlock}>
                  <h2 id="family-step-1" data-step={1} tabIndex={-1} ref={setHeadingRef}>
                    Dopasuj swój plan i Lumi
                  </h2>
                  <p className={styles.lead}>
                    Ustaw tempo nauki oraz wygląd swojego przewodnika. Wszystko zmienisz później w Profilu.
                  </p>
                </div>

                <div className={styles.sectionBlock}>
                  <span className={styles.sectionLabel}>Etap przygotowań E8</span>
                  <div className={styles.choiceGrid} role="group" aria-label="Etap przygotowań E8">
                    {STAGE_OPTIONS.map((stage) => (
                      <button
                        key={stage.id}
                        type="button"
                        className={styles.choiceButton}
                        aria-pressed={studyStage === stage.id}
                        onClick={() => {
                          playSound('tap');
                          setStudyStage(stage.id);
                        }}
                      >
                        <strong>{stage.label}</strong>
                        <small>{stage.caption}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.sectionBlock}>
                  <span className={styles.sectionLabel}>Dzienny cel nauki</span>
                  <div className={styles.choiceGrid} role="group" aria-label="Dzienny cel nauki">
                    {DAILY_GOAL_OPTIONS.map((goal) => (
                      <button
                        key={goal.minutes}
                        type="button"
                        className={styles.choiceButton}
                        aria-pressed={dailyGoalMinutes === goal.minutes}
                        onClick={() => {
                          playSound('tap');
                          setDailyGoalMinutes(goal.minutes);
                        }}
                      >
                        <strong>{goal.label}</strong>
                        <small>{goal.caption}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.sectionBlock}>
                  <span className={styles.sectionLabel}>Wygląd Twojej postaci Lumi</span>
                  <div className={styles.colorGrid} role="group" aria-label="Kolor startowy Lumi">
                    {STARTER_COLORS.map((color) => {
                      const active = starterColor === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          className={styles.colorButton}
                          data-tone={color.tone}
                          aria-pressed={active}
                          onClick={() => handleColorSelect(color.id)}
                        >
                          <span className={styles.swatch} data-tone={color.tone} aria-hidden="true">
                            {active ? <Check size={13} strokeWidth={3} /> : null}
                          </span>
                          <span>{color.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.sectionBlock}>
                  <label htmlFor={nickId} className={styles.sectionLabel}>
                    Ksywka ucznia
                  </label>
                  <div className={styles.nicknameRow}>
                    <input
                      ref={nickInputRef}
                      id={nickId}
                      type="text"
                      value={nickname}
                      maxLength={20}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="np. BłyskLogiki"
                      className={styles.nicknameInput}
                      aria-invalid={Boolean(nicknameError)}
                      aria-describedby={nicknameError ? `${nickHintId} ${nickErrorId}` : nickHintId}
                      onChange={(event) => handleNicknameChange(event.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.randomBtn}
                      onClick={handleRandomNickname}
                    >
                      <Shuffle size={16} aria-hidden="true" />
                      <span>Wylosuj</span>
                    </button>
                  </div>
                  <p id={nickHintId} className={styles.fieldHint}>
                    Nie wpisuj imienia i nazwiska — użyj ksywki.
                  </p>
                  {nicknameError && (
                    <p id={nickErrorId} role="alert" className={styles.fieldError}>
                      {nicknameError}
                    </p>
                  )}
                </div>

                <TactileButton fullWidth size="lg" onClick={handleStep2Next}>
                  <span>Dalej — wiek i zasady startu</span>
                  <ArrowRight size={19} aria-hidden="true" />
                </TactileButton>
              </>
            )}

            {step === 2 && (
              <>
                <div className={styles.headingBlock}>
                  <h2 id="family-step-2" data-step={2} tabIndex={-1} ref={setHeadingRef}>
                    Wiek i zasady startu
                  </h2>
                  <p className={styles.lead}>
                    Wybierz przedział wieku. Dopasujemy sposób rozpoczęcia nauki i zakładania konta
                    do polskich przepisów (RODO i Kodeks cywilny) — bez zbierania daty urodzenia.
                  </p>
                </div>

                <div
                  className={styles.ageGroup}
                  role="radiogroup"
                  aria-labelledby="family-step-2"
                >
                  {AGE_BRACKET_OPTIONS.map((option, index) => {
                    const checked = ageBracket === option.id;
                    const tabIndex = ageBracket
                      ? checked
                        ? 0
                        : -1
                      : index === 0
                      ? 0
                      : -1;
                    return (
                      <button
                        key={option.id}
                        ref={(el) => {
                          ageRadioRefs.current[index] = el;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        tabIndex={tabIndex}
                        className={styles.ageOption}
                        onClick={() => handleSelectAgeBracket(option.id)}
                        onKeyDown={(event) => handleAgeRadioKeyDown(event, index)}
                      >
                        <span className={styles.radioDot} aria-hidden="true">
                          <span className={styles.radioInner} />
                        </span>
                        <span className={styles.ageOptionText}>
                          <strong>{option.label}</strong>
                          <small>{option.shortHint}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!selectedAgeRule ? (
                  <div className={styles.neutralNotice} role="status">
                    <ShieldCheck size={18} aria-hidden="true" />
                    <p>
                      Wybierz jeden z powyższych przedziałów wieku, aby zobaczyć dopasowane zasady
                      startu i przejść dalej.
                    </p>
                  </div>
                ) : (
                  <div className={styles.legalPanel}>
                    <div className={styles.legalCard} aria-live="polite">
                      <div className={styles.legalHeader}>
                        <ShieldCheck size={18} aria-hidden="true" />
                        <h3>{selectedAgeRule.legalTitle}</h3>
                      </div>
                      <p>{selectedAgeRule.legalExplanation}</p>
                    </div>

                    {ageBracket === 'adult_or_guardian' && (
                      <div className={styles.sectionBlock}>
                        <span className={styles.sectionLabel}>Dla kogo zakładasz konto?</span>
                        <div
                          className={styles.adultToggle}
                          role="group"
                          aria-label="Tryb konta dla osoby pełnoletniej lub opiekuna"
                        >
                          <button
                            type="button"
                            className={styles.choiceButton}
                            aria-pressed={adultConsentPath === 'guardian_for_minor'}
                            onClick={() => {
                              playSound('tap');
                              setAdultConsentPath('guardian_for_minor');
                            }}
                          >
                            <strong>Zakładam konto dla ucznia (&lt; 16 lat)</strong>
                            <small>Konto i zgoda opiekuna prawnego</small>
                          </button>
                          <button
                            type="button"
                            className={styles.choiceButton}
                            aria-pressed={adultConsentPath === 'self_16_plus'}
                            onClick={() => {
                              playSound('tap');
                              setAdultConsentPath('self_16_plus');
                            }}
                          >
                            <strong>Uczę się samodzielnie (18+)</strong>
                            <small>Pełne konto własne</small>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className={styles.ctaStack}>
                      {(ageBracket === 'under_13' || ageBracket === 'age_13_15') && (
                        <>
                          {selectedSubject === 'math' ? (
                            <TactileButton
                              fullWidth
                              size="lg"
                              onClick={() => finish({ startFirstLesson: true })}
                            >
                              <BookOpen size={19} aria-hidden="true" />
                              <span>Zacznij 1. lekcję lokalnie (bez konta)</span>
                            </TactileButton>
                          ) : (
                            <>
                              <TactileButton
                                fullWidth
                                size="lg"
                                onClick={() =>
                                  finish({ startFirstLesson: false, openTab: 'learn' })
                                }
                              >
                                <BookOpen size={19} aria-hidden="true" />
                                <span>Zobacz plan: {selectedSubjectLabel}</span>
                              </TactileButton>
                              <TactileButton
                                fullWidth
                                variant="secondary"
                                size="md"
                                onClick={() =>
                                  finish({ startFirstLesson: true, subjectOverride: 'math' })
                                }
                              >
                                <span>Lub uruchom 1. lekcję z matematyki</span>
                              </TactileButton>
                            </>
                          )}

                          <TactileButton
                            fullWidth
                            variant="secondary"
                            size="md"
                            onClick={() =>
                              openAccountModal({
                                initialAgeBracket: ageBracket,
                                initialConsentPath: 'guardian_for_minor',
                                initialMode: 'register',
                                skipGuardianGate: false,
                              })
                            }
                          >
                            <UserCheck size={18} aria-hidden="true" />
                            <span>Jest ze mną rodzic — załóż konto opiekuna</span>
                          </TactileButton>
                        </>
                      )}

                      {ageBracket === 'age_16_17' && (
                        <>
                          <TactileButton
                            fullWidth
                            size="lg"
                            onClick={() =>
                              openAccountModal({
                                initialAgeBracket: 'age_16_17',
                                initialConsentPath: 'self_16_plus',
                                initialMode: 'register',
                                skipGuardianGate: false,
                              })
                            }
                          >
                            <UserCheck size={19} aria-hidden="true" />
                            <span>Załóż darmowe konto (16+) i zacznij</span>
                          </TactileButton>

                          <TactileButton
                            fullWidth
                            variant="secondary"
                            size="md"
                            onClick={() =>
                              selectedSubject === 'math'
                                ? finish({ startFirstLesson: true })
                                : finish({ startFirstLesson: false, openTab: 'learn' })
                            }
                          >
                            <BookOpen size={18} aria-hidden="true" />
                            <span>
                              {selectedSubject === 'math'
                                ? 'Najpierw sprawdź 1. lekcję bez konta'
                                : `Najpierw zobacz plan: ${selectedSubjectLabel}`}
                            </span>
                          </TactileButton>
                        </>
                      )}

                      {ageBracket === 'adult_or_guardian' && (
                        <>
                          <TactileButton
                            fullWidth
                            size="lg"
                            onClick={() =>
                              openAccountModal({
                                initialAgeBracket: 'adult_or_guardian',
                                initialConsentPath: adultConsentPath,
                                initialMode: 'register',
                                skipGuardianGate: false,
                              })
                            }
                          >
                            <UserCheck size={19} aria-hidden="true" />
                            <span>Załóż konto i przejdź do nauki</span>
                          </TactileButton>

                          <TactileButton
                            fullWidth
                            variant="secondary"
                            size="md"
                            onClick={() =>
                              selectedSubject === 'math'
                                ? finish({ startFirstLesson: true })
                                : finish({ startFirstLesson: false, openTab: 'learn' })
                            }
                          >
                            <BookOpen size={18} aria-hidden="true" />
                            <span>
                              {selectedSubject === 'math'
                                ? 'Sprawdź 1. lekcję bez konta'
                                : `Zobacz plan: ${selectedSubjectLabel} (bez konta)`}
                            </span>
                          </TactileButton>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <nav className={styles.legalLinks} aria-label="Dokumenty prawne i informacje dla opiekunów">
                  <a
                    href="/prywatnosc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.legalLink}
                  >
                    <span>Polityka prywatności i RODO</span>
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                  <a
                    href="/pro#opiekunowie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.legalLink}
                  >
                    <span>Informacje dla opiekunów</span>
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </nav>
              </>
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      {modalConfig.open && (
        <CloudAccountModal
          open
          onClose={() => setModalConfig((prev) => ({ ...prev, open: false }))}
          onSuccess={() =>
            finish({
              startFirstLesson: false,
              openTab: selectedSubject !== 'math' ? 'learn' : 'start',
            })
          }
          skipGuardianGate={modalConfig.skipGuardianGate}
          showPlanLink={false}
          initialAgeBracket={modalConfig.initialAgeBracket}
          initialConsentPath={modalConfig.initialConsentPath}
          initialMode={modalConfig.initialMode}
        />
      )}
    </main>
  );
}

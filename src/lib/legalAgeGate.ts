// src/lib/legalAgeGate.ts

import type {
  AgeBracket,
  ConsentPath,
  LegalConsentRecord,
} from '../types/domain';

export type { AgeBracket, ConsentPath, LegalConsentRecord };

export const CURRENT_PRIVACY_POLICY_VERSION = '2026-11-24';

export interface AgeBracketOption {
  id: AgeBracket;
  label: string;
  shortHint: string;
  requiresGuardianForAccount: boolean;
  canSelfPurchasePro: boolean;
  defaultConsentPath: ConsentPath;
  legalTitle: string;
  legalExplanation: string;
  lumiSpeech: string;
}

export const AGE_BRACKET_OPTIONS: AgeBracketOption[] = [
  {
    id: 'under_13',
    label: 'Mam mniej niż 13 lat',
    shortHint: 'Konto zawsze z rodzicem lub opiekunem',
    requiresGuardianForAccount: true,
    canSelfPurchasePro: false,
    defaultConsentPath: 'guardian_for_minor',
    legalTitle: 'Konto zakłada rodzic lub opiekun prawny',
    legalExplanation:
      'Przed ukończeniem 13 lat nie masz jeszcze zdolności do czynności prawnych (art. 12 Kodeksu cywilnego), a w Polsce próg samodzielnej zgody z art. 8 ust. 1 RODO wynosi 16 lat. Dlatego konto w aplikacji zakłada wyłącznie rodzic lub opiekun prawny. Pierwszą lekcję możesz sprawdzić lokalnie bez konta.',
    lumiSpeech:
      'Pierwszą lekcję uruchomisz od razu lokalnie bez konta. Pełne konto założysz razem z rodzicem lub opiekunem!',
  },
  {
    id: 'age_13_15',
    label: 'Mam 13–15 lat',
    shortHint: 'Konto nadal z rodzicem lub opiekunem',
    requiresGuardianForAccount: true,
    canSelfPurchasePro: false,
    defaultConsentPath: 'guardian_for_minor',
    legalTitle: 'Konto wymaga zgody lub udziału rodzica lub opiekuna',
    legalExplanation:
      'Od 13 lat masz ograniczoną zdolność do czynności prawnych w drobnych bieżących sprawach (art. 15 i 20 Kodeksu cywilnego), ale przy zawieraniu umów obowiązuje zgoda lub potwierdzenie przedstawiciela (art. 17–18 KC). Polska utrzymała też próg 16 lat z art. 8 ust. 1 RODO, więc konto zakłada rodzic lub opiekun prawny.',
    lumiSpeech:
      'Możesz od razu zacząć 1. lekcję lokalnie! Do założenia konta zaprosimy rodzica lub opiekuna — tak wymaga próg 16 lat w RODO.',
  },
  {
    id: 'age_16_17',
    label: 'Mam 16–17 lat',
    shortHint: 'Darmowe konto samodzielnie, płatny plan od 18 lat',
    requiresGuardianForAccount: false,
    canSelfPurchasePro: false,
    defaultConsentPath: 'self_16_plus',
    legalTitle: 'Samodzielna zgoda na darmowe konto (16+)',
    legalExplanation:
      'Od ukończenia 16 lat możesz samodzielnie wyrazić zgodę na przetwarzanie danych w ramach bezpłatnego konta ucznia (art. 8 ust. 1 RODO w Polsce). Jako zasadę produktu przyszłe płatne plany Pro udostępniamy wyłącznie osobom pełnoletnim (18+) lub opiekunom (art. 15–18 Kodeksu cywilnego).',
    lumiSpeech:
      'Darmowe konto możesz założyć samodzielnie! Ewentualny plan Pro będzie dostępny od 18 lat lub przez opiekuna.',
  },
  {
    id: 'adult_or_guardian',
    label: 'Mam 18 lat lub więcej (albo jestem rodzicem/opiekunem)',
    shortHint: 'Pełna samodzielność, także konto dla ucznia',
    requiresGuardianForAccount: false,
    canSelfPurchasePro: true,
    defaultConsentPath: 'self_16_plus',
    legalTitle: 'Pełnoletni użytkownik lub rodzic/opiekun',
    legalExplanation:
      'Osoba pełnoletnia ma pełną zdolność do czynności prawnych — może założyć konto do własnej nauki albo jako rodzic lub opiekun prawny utworzyć konto i wyrazić zgodę RODO dla ucznia poniżej 16 lat.',
    lumiSpeech:
      'Masz pełną kontrolę nad kontem, zasadami prywatności i tempem nauki — możemy zaczynać!',
  },
];

const AGE_BRACKET_RULES: Record<AgeBracket, AgeBracketOption> = {
  under_13: AGE_BRACKET_OPTIONS[0],
  age_13_15: AGE_BRACKET_OPTIONS[1],
  age_16_17: AGE_BRACKET_OPTIONS[2],
  adult_or_guardian: AGE_BRACKET_OPTIONS[3],
};

export function isValidAgeBracket(raw: unknown): raw is AgeBracket {
  return typeof raw === 'string' && AGE_BRACKETS.includes(raw);
}

export function getAgeBracketRule(bracket: AgeBracket): AgeBracketOption {
  return AGE_BRACKET_RULES[bracket];
}

export function requiresGuardianConsent(bracket: AgeBracket): boolean {
  return (
    bracket === 'under_13' ||
    bracket === 'age_13_15' ||
    getAgeBracketRule(bracket).defaultConsentPath === 'guardian_for_minor'
  );
}

export function validateRegistrationConsent(input: {
  consentPath: ConsentPath;
  ageOrGuardianConfirmed: boolean;
  privacyAndTermsAccepted: boolean;
}): { ok: boolean; error?: string } {
  if (!input.ageOrGuardianConfirmed) {
    return {
      ok: false,
      error:
        input.consentPath === 'guardian_for_minor'
          ? 'Potwierdź, że jesteś rodzicem lub opiekunem prawnym ucznia poniżej 16 lat i wyrażasz zgodę (art. 8 RODO).'
          : 'Potwierdź, że masz ukończone 16 lat i zakładasz bezpłatne konto samodzielnie.',
    };
  }
  if (!input.privacyAndTermsAccepted) {
    return {
      ok: false,
      error:
        'Zaakceptuj Zasady pilotażu i potwierdź zapoznanie się z Polityką prywatności, aby założyć konto.',
    };
  }
  return { ok: true };
}

export function createLegalConsentRecord(input: {
  consentPath: ConsentPath;
  ageBracket: AgeBracket;
  nowMs?: number;
  uid?: string;
}): LegalConsentRecord {
  return {
    consentPath: input.consentPath,
    ageBracket: input.ageBracket,
    policyVersion: CURRENT_PRIVACY_POLICY_VERSION,
    acceptedAt: input.nowMs ?? Date.now(),
    ageOrGuardianConfirmed: true,
    privacyAndTermsAccepted: true,
    ...(input.uid ? { uid: input.uid } : {}),
  };
}

const CONSENT_PATHS: readonly string[] = ['guardian_for_minor', 'self_16_plus'];
const AGE_BRACKETS: readonly string[] = [
  'under_13',
  'age_13_15',
  'age_16_17',
  'adult_or_guardian',
];

export function isValidLegalConsentRecord(
  raw: unknown,
): raw is LegalConsentRecord {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const obj = raw as Record<string, unknown>;
  return (
    typeof obj.consentPath === 'string' &&
    CONSENT_PATHS.includes(obj.consentPath) &&
    typeof obj.ageBracket === 'string' &&
    AGE_BRACKETS.includes(obj.ageBracket) &&
    typeof obj.policyVersion === 'string' &&
    obj.policyVersion.length > 0 &&
    typeof obj.acceptedAt === 'number' &&
    Number.isFinite(obj.acceptedAt) &&
    obj.ageOrGuardianConfirmed === true &&
    obj.privacyAndTermsAccepted === true &&
    (obj.uid === undefined || (typeof obj.uid === 'string' && obj.uid.length > 0))
  );
}

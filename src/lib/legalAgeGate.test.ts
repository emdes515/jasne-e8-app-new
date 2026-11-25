import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AGE_BRACKET_OPTIONS,
  CURRENT_PRIVACY_POLICY_VERSION,
  createLegalConsentRecord,
  getAgeBracketRule,
  isValidAgeBracket,
  isValidLegalConsentRecord,
  requiresGuardianConsent,
  validateRegistrationConsent,
} from './legalAgeGate';
import type { AgeBracket } from '../types/domain';

test('AGE_BRACKET_OPTIONS zawiera 4 przedziały w wymaganej kolejności', () => {
  assert.deepEqual(
    AGE_BRACKET_OPTIONS.map((option) => option.id),
    ['under_13', 'age_13_15', 'age_16_17', 'adult_or_guardian'],
  );
  for (const option of AGE_BRACKET_OPTIONS) {
    assert.equal(typeof option.label, 'string');
    assert.ok(option.label.length > 0);
    assert.equal(typeof option.shortHint, 'string');
    assert.equal(typeof option.legalTitle, 'string');
    assert.equal(typeof option.legalExplanation, 'string');
    assert.equal(typeof option.lumiSpeech, 'string');
  }
});

test('requiresGuardianConsent: guardian dla <16, samodzielnie od 16+', () => {
  assert.equal(requiresGuardianConsent('under_13'), true);
  assert.equal(requiresGuardianConsent('age_13_15'), true);
  assert.equal(requiresGuardianConsent('age_16_17'), false);
  assert.equal(requiresGuardianConsent('adult_or_guardian'), false);
});

test('canSelfPurchasePro tylko dla adult_or_guardian', () => {
  for (const option of AGE_BRACKET_OPTIONS) {
    assert.equal(option.canSelfPurchasePro, option.id === 'adult_or_guardian');
  }
});

test('requiresGuardianForAccount tylko dla under_13 i age_13_15', () => {
  for (const option of AGE_BRACKET_OPTIONS) {
    const expected = option.id === 'under_13' || option.id === 'age_13_15';
    assert.equal(option.requiresGuardianForAccount, expected);
  }
});

test('defaultConsentPath: guardian dla <16, self dla 16+', () => {
  for (const option of AGE_BRACKET_OPTIONS) {
    if (option.id === 'under_13' || option.id === 'age_13_15') {
      assert.equal(option.defaultConsentPath, 'guardian_for_minor');
    } else {
      assert.equal(option.defaultConsentPath, 'self_16_plus');
    }
  }
  assert.equal(getAgeBracketRule('age_13_15').defaultConsentPath, 'guardian_for_minor');
  assert.equal(getAgeBracketRule('adult_or_guardian').defaultConsentPath, 'self_16_plus');
});

test('age_13_15: legal Explanation wyjaśnia art. 15/20 KC a próg 16 lat z art. 8 RODO', () => {
  const rule = getAgeBracketRule('age_13_15');
  assert.match(rule.legalExplanation, /16/);
  assert.match(rule.legalExplanation, /RODO/);
});

test('age_16_17: legalExplanation wskazuje samodzielną zgodę RODO i płatny plan od 18 lat', () => {
  const rule = getAgeBracketRule('age_16_17');
  assert.match(rule.legalExplanation, /16/);
  assert.match(rule.legalExplanation, /18/);
});

test('validateRegistrationConsent akceptuje wyłącznie oba checkboxy na true', () => {
  assert.deepEqual(
    validateRegistrationConsent({
      consentPath: 'self_16_plus',
      ageOrGuardianConfirmed: true,
      privacyAndTermsAccepted: true,
    }),
    { ok: true },
  );

  for (const consentPath of ['guardian_for_minor', 'self_16_plus'] as const) {
    const missingAgeOrGuardian = validateRegistrationConsent({
      consentPath,
      ageOrGuardianConfirmed: false,
      privacyAndTermsAccepted: true,
    });
    assert.equal(missingAgeOrGuardian.ok, false);
    assert.ok(missingAgeOrGuardian.error);

    const missingPrivacy = validateRegistrationConsent({
      consentPath,
      ageOrGuardianConfirmed: true,
      privacyAndTermsAccepted: false,
    });
    assert.equal(missingPrivacy.ok, false);
    assert.ok(missingPrivacy.error);

    const missingBoth = validateRegistrationConsent({
      consentPath,
      ageOrGuardianConfirmed: false,
      privacyAndTermsAccepted: false,
    });
    assert.equal(missingBoth.ok, false);
    assert.ok(missingBoth.error);
  }
});

test('createLegalConsentRecord tworzy pełny rekord zgodnej wersji polityki', () => {
  const nowMs = 1_700_000_000_000;
  const record = createLegalConsentRecord({
    consentPath: 'guardian_for_minor',
    ageBracket: 'age_13_15',
    nowMs,
  });
  assert.deepEqual(record, {
    consentPath: 'guardian_for_minor',
    ageBracket: 'age_13_15',
    policyVersion: CURRENT_PRIVACY_POLICY_VERSION,
    acceptedAt: nowMs,
    ageOrGuardianConfirmed: true,
    privacyAndTermsAccepted: true,
  });
});

test('createLegalConsentRecord domyślnie używa aktualnego czasu', () => {
  const record = createLegalConsentRecord({
    consentPath: 'self_16_plus',
    ageBracket: 'adult_or_guardian',
  });
  assert.equal(typeof record.acceptedAt, 'number');
});

test('isValidLegalConsentRecord: poprawny obiekt przechodzi, uszkodzone odrzucone', () => {
  const valid = createLegalConsentRecord({
    consentPath: 'guardian_for_minor',
    ageBracket: 'under_13',
    nowMs: 1,
  });
  assert.equal(isValidLegalConsentRecord(valid), true);

  for (const broken of [
    null,
    undefined,
    42,
    'record',
    {},
    { ...valid, consentPath: 'self' },
    { ...valid, ageBracket: 'age_18_99' },
    { ...valid, policyVersion: 12 },
    { ...valid, acceptedAt: 'wcześniej' },
    { ...valid, ageOrGuardianConfirmed: 'tak' },
    { ...valid, privacyAndTermsAccepted: null },
    { ...valid, ageOrGuardianConfirmed: false },
    { ...valid, privacyAndTermsAccepted: false },
    { ...valid, policyVersion: undefined },
  ] satisfies unknown[]) {
    assert.equal(isValidLegalConsentRecord(broken), false);
  }
});

test('getAgeBracketRule zwraca regułę z id zgodnym z przedziałem', () => {
  for (const bracket of [
    'under_13',
    'age_13_15',
    'age_16_17',
    'adult_or_guardian',
  ] as AgeBracket[]) {
    assert.equal(getAgeBracketRule(bracket).id, bracket);
  }
});

test('isValidAgeBracket i opcjonalny uid w LegalConsentRecord działają poprawnie', () => {
  assert.equal(isValidAgeBracket('age_13_15'), true);
  assert.equal(isValidAgeBracket('13'), false);
  assert.equal(isValidAgeBracket(null), false);

  const withUid = createLegalConsentRecord({
    consentPath: 'guardian_for_minor',
    ageBracket: 'age_13_15',
    nowMs: 1234,
    uid: 'user-123',
  });
  assert.equal(withUid.uid, 'user-123');
  assert.equal(isValidLegalConsentRecord(withUid), true);
  assert.equal(isValidLegalConsentRecord({ ...withUid, uid: '' }), false);
  assert.equal(isValidLegalConsentRecord({ ...withUid, uid: 123 }), false);
});

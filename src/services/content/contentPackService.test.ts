import test from 'node:test';
import assert from 'node:assert/strict';
import { createContentPackService } from './contentPackService';
import { clearAllPackCache } from './packCache';
import {
  mapRemoteTaskToTaskDefinition,
  type ContentManifest,
  type RemoteChapterPack,
  type RemoteCkeSheetsPack,
  type RemoteTaskRecord,
} from '../../types/contentPacks';

const SAMPLE_TASK: RemoteTaskRecord = {
  id: 'jsn_m_ch01_l02_103',
  subjectId: 'math',
  kind: 'dual_choice',
  origin: { kind: 'jasne_original' },
  taxonomy: {
    primaryChapterId: 'math_ch01',
    lessonIds: ['lesson:1.2'],
    skillTags: ['os_liczbowa'],
  },
  difficulty: 2,
  maxPoints: 1,
  estimatedSec: 60,
  examEligible: true,
  lessonEligible: true,
  shuffleOptions: false,
  prompt: 'Na osi liczbowej zaznaczono punkty $P$ i $R$.',
  visual: {
    kind: 'svg_inline',
    ref: '<svg viewBox="0 0 100 50"></svg>',
    alt: 'Oś liczbowa',
    aspectRatio: 2,
  },
  options: [
    { id: 'A', label: '4' },
    { id: 'B', label: '3' },
  ],
  correctAnswer: 'A',
  staticHints: [{ level: 1, title: 'Krok 1', body: 'Odejmij współrzędne.' }],
  allowAiTutorHint: true,
  explanation: {
    steps: ['1,4 - (-2,6) = 4'],
    finalAnswerDisplay: '4',
  },
  status: 'active',
  version: 2,
};

const SAMPLE_PACK: RemoteChapterPack = {
  schemaVersion: 1,
  packVersion: 2,
  packId: 'math_ch01',
  subjectId: 'math',
  chapterId: 'math_ch01',
  updatedAt: '2026-11-25T16:00:00Z',
  taskCount: 1,
  tasks: [SAMPLE_TASK],
};

const SAMPLE_SHEETS: RemoteCkeSheetsPack = {
  schemaVersion: 1,
  packVersion: 2,
  packId: 'cke_sheets_math',
  subjectId: 'math',
  updatedAt: '2026-11-25T16:00:00Z',
  sheetCount: 1,
  sheets: [
    {
      id: 'cke_e8_math_2025_maj_omap-100-2505',
      sheetCode: 'OMAP-100-2505',
      subjectId: 'math',
      year: 2025,
      session: 'maj',
      title: 'Arkusz CKE Matematyka — 2025',
      durationMinutes: 125,
      maxPoints: 30,
      taskIds: ['cke_mat_2025_z01'],
      taskCount: 1,
      status: 'published',
      updatedAt: '2026-11-25T16:00:00Z',
    },
  ],
};

const SAMPLE_MANIFEST: ContentManifest = {
  schemaVersion: 1,
  contentManifestVersion: 2,
  totalTasks: 1496,
  totalSheets: 24,
  updatedAt: '2026-11-25T16:00:00Z',
  updatedBy: 'test',
  packs: {
    math_ch01: {
      path: 'packs/v2/math_ch01.json',
      url: 'https://example.test/packs/v2/math_ch01.json',
      sha256: 'hash_v2',
      sizeBytes: 1200,
      kind: 'chapter',
      subjectId: 'math',
      chapterId: 'math_ch01',
      taskCount: 1,
    },
    cke_sheets_math: {
      path: 'packs/v2/cke_sheets_math.json',
      url: 'https://example.test/packs/v2/cke_sheets_math.json',
      sha256: 'hash_sheets_v2',
      sizeBytes: 600,
      kind: 'cke_sheets',
      subjectId: 'math',
      sheetCount: 1,
    },
  },
};

test('syncContentManifest pobiera manifest z Firestore raz i omija Firestore przy tej samej wersji RC', async () => {
  await clearAllPackCache();
  let firestoreReads = 0;
  let rcVersion = 2;

  const service = createContentPackService({
    getRemoteManifestVersion: async () => rcVersion,
    fetchManifestFromFirestore: async () => {
      firestoreReads += 1;
      return SAMPLE_MANIFEST;
    },
    fetchPackJson: async () => SAMPLE_PACK as never,
  });

  const first = await service.syncContentManifest();
  const second = await service.syncContentManifest();

  assert.equal(first?.contentManifestVersion, 2);
  assert.equal(second?.contentManifestVersion, 2);
  assert.equal(firestoreReads, 1);

  rcVersion = 3;
  const third = await service.syncContentManifest();
  assert.equal(third?.contentManifestVersion, 2);
  assert.equal(firestoreReads, 2);
});

test('loadChapterPack cache’uje paczkę działu po sha256 i pobiera ponownie po zmianie hasha', async () => {
  await clearAllPackCache();
  let storageDownloads = 0;
  let currentHash = 'hash_v2';

  const service = createContentPackService({
    getRemoteManifestVersion: async () => 2,
    fetchManifestFromFirestore: async () => ({
      ...SAMPLE_MANIFEST,
      packs: {
        ...SAMPLE_MANIFEST.packs,
        math_ch01: { ...SAMPLE_MANIFEST.packs.math_ch01, sha256: currentHash },
      },
    }),
    fetchPackJson: async () => {
      storageDownloads += 1;
      return SAMPLE_PACK as never;
    },
  });

  const p1 = await service.loadChapterPack('math_ch01');
  const p2 = await service.loadChapterPack('math_ch01');
  assert.equal(p1?.taskCount, 1);
  assert.equal(p2?.tasks[0]?.id, 'jsn_m_ch01_l02_103');
  assert.equal(storageDownloads, 1);

  currentHash = 'hash_v3';
  await service.loadChapterPack('math_ch01', true);
  assert.equal(storageDownloads, 2);
});

test('loadCkeSheetsPack ładuje paczkę arkuszy CKE dla przedmiotu', async () => {
  await clearAllPackCache();
  const service = createContentPackService({
    getRemoteManifestVersion: async () => 2,
    fetchManifestFromFirestore: async () => SAMPLE_MANIFEST,
    fetchPackJson: async () => SAMPLE_SHEETS as never,
  });

  const sheetsPack = await service.loadCkeSheetsPack('math');
  assert.equal(sheetsPack?.sheetCount, 1);
  assert.equal(sheetsPack?.sheets[0]?.sheetCode, 'OMAP-100-2505');
});

test('mapRemoteTaskToTaskDefinition zachowuje visual i mapuje wskazówki oraz odpowiedź', () => {
  const mapped = mapRemoteTaskToTaskDefinition(SAMPLE_TASK);
  assert.equal(mapped.id, 'jsn_m_ch01_l02_103');
  assert.equal(mapped.visual?.kind, 'svg_inline');
  assert.equal(mapped.hints.length, 3);
  assert.deepEqual(mapped.explanationSteps, ['1,4 - (-2,6) = 4']);
});

test('mapRemoteTaskToTaskDefinition poprawnie mapuje true_false_multi, dual_choice i choice_with_reason', () => {
  const tfMulti = mapRemoteTaskToTaskDefinition({
    ...SAMPLE_TASK,
    id: 'tf_multi_1',
    kind: 'true_false_multi',
    statements: [
      { id: 'S1', text: 'Zdanie 1' },
      { id: 'S2', text: 'Zdanie 2' },
    ],
    correctAnswer: 'PF',
  });
  assert.equal(tfMulti.type, 'true_false_multi');
  assert.equal(tfMulti.statements?.length, 2);
  assert.equal(tfMulti.correctAnswer, 'PF');

  const dual = mapRemoteTaskToTaskDefinition({
    ...SAMPLE_TASK,
    id: 'dual_1',
    kind: 'dual_choice',
    options: [
      { id: 'A', label: '490' },
      { id: 'B', label: '610' },
    ],
    reasons: [
      { id: 'C', label: 'MDCL' },
      { id: 'D', label: 'MCDL' },
    ],
    correctAnswer: 'AC',
  });
  assert.equal(dual.type, 'dual_choice');
  assert.equal(dual.options?.length, 2);
  assert.equal(dual.reasons?.length, 2);
  assert.equal(dual.correctAnswer, 'AC');

  const withReason = mapRemoteTaskToTaskDefinition({
    ...SAMPLE_TASK,
    id: 'reason_1',
    kind: 'choice_with_reason',
    options: [
      { id: 'A', label: 'Tak' },
      { id: 'B', label: 'Nie' },
    ],
    reasons: [
      { id: '1', label: 'bo NWW = 36' },
      { id: '2', label: 'bo suma = 30' },
    ],
    correctAnswer: 'A1',
  });
  assert.equal(withReason.type, 'choice_with_reason');
  assert.equal(withReason.correctAnswer, 'A1');
});

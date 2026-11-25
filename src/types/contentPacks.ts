import type { SubjectId, TaskDefinition, TaskOption, TaskType } from './domain';

export type TaskOriginKind = 'cke_official' | 'jasne_cke_variant' | 'jasne_original';

export type MathTaskKind =
  | 'single_choice'
  | 'true_false_multi'
  | 'dual_choice'
  | 'choice_with_reason'
  | 'numeric_input'
  | 'open_calculation'
  | 'open_proof';

export interface TaskVisualAsset {
  kind: 'svg_inline' | 'storage_image' | 'chart_spec' | 'table';
  ref: string;
  alt: string;
  aspectRatio?: number;
}

export interface StaticHint {
  level: 1 | 2 | 3;
  title: string;
  body: string;
}

export interface RemoteTaskRecord {
  id: string;
  subjectId: SubjectId;
  kind: MathTaskKind;
  origin: {
    kind: TaskOriginKind;
    sheetId?: string;
    year?: number;
    session?: string;
    taskNumber?: string | number;
    inspiredByTaskId?: string;
  };
  taxonomy: {
    primaryChapterId: string;
    secondaryChapterIds?: string[];
    lessonIds: string[];
    skillTags: string[];
    ckeRequirementCodes?: string[];
  };
  difficulty: 1 | 2 | 3;
  maxPoints: 1 | 2 | 3;
  estimatedSec: number;
  examEligible: boolean;
  lessonEligible: boolean;
  shuffleOptions?: boolean;
  prompt: string;
  visual?: TaskVisualAsset;
  options?: Array<{ id: string; label?: string; text?: string }>;
  statements?: Array<{ id: string; text: string }>;
  reasons?: Array<{ id: string; label?: string; text?: string }>;
  correctAnswer: unknown;
  staticHints: StaticHint[];
  allowAiTutorHint: boolean;
  explanation: {
    steps: string[];
    finalAnswerDisplay: string;
    ckeTrapNote?: string;
  };
  status: 'active' | 'archived';
  version: number;
}

export interface RemoteChapterPack {
  schemaVersion: number;
  packVersion: number;
  packId: string;
  subjectId: SubjectId;
  chapterId: string;
  updatedAt: string;
  taskCount: number;
  tasks: RemoteTaskRecord[];
}

export interface RemoteCkeSheet {
  id: string;
  sheetCode: string;
  subjectId: SubjectId;
  year: number;
  session: string;
  title: string;
  durationMinutes: number;
  maxPoints: number;
  taskIds: string[];
  taskCount: number;
  status: 'published' | 'draft';
  notes?: string;
  updatedAt: string;
}

export interface RemoteCkeSheetsPack {
  schemaVersion: number;
  packVersion: number;
  packId: string;
  subjectId: SubjectId;
  updatedAt: string;
  sheetCount: number;
  sheets: RemoteCkeSheet[];
}

export interface ContentPackEntry {
  path: string;
  url: string;
  sha256: string;
  sizeBytes: number;
  kind: 'chapter' | 'cke_sheets';
  subjectId: SubjectId;
  chapterId?: string;
  taskCount?: number;
  sheetCount?: number;
}

export interface ContentManifest {
  schemaVersion: number;
  contentManifestVersion: number;
  totalTasks: number;
  totalSheets: number;
  updatedAt: string;
  updatedBy: string;
  packs: Record<string, ContentPackEntry>;
}

function mapKindToTaskType(kind: MathTaskKind): TaskType {
  if (kind === 'single_choice') return 'abcd';
  if (kind === 'true_false_multi') return 'true_false';
  if (kind === 'numeric_input') return 'numeric';
  return 'open';
}

function normalizeOptions(
  raw?: Array<{ id: string; label?: string; text?: string }>
): TaskOption[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  return raw.map((o) => ({
    id: o.id,
    label: o.label ?? o.text ?? o.id,
  }));
}

/**
 * Konwertuje zdalny rekord zadania (7 typów CKE) na bazowy typ `TaskDefinition`
 * kompatybilny z obecnym `TaskRunner` i `VaultView`.
 */
export function mapRemoteTaskToTaskDefinition(remote: RemoteTaskRecord): TaskDefinition {
  const hintsList = remote.staticHints.map((h) => h.body);
  const hints: [string, string, string] = [
    hintsList[0] ?? 'Przeczytaj uważnie polecenie i wypisz dane.',
    hintsList[1] ?? hintsList[0] ?? 'Sprawdź jednostki oraz warunki zadania.',
    hintsList[2] ?? hintsList[1] ?? hintsList[0] ?? 'Zweryfikuj wynik z treścią pytania.',
  ];

  const correctAnswerStr =
    typeof remote.correctAnswer === 'string'
      ? remote.correctAnswer
      : typeof remote.correctAnswer === 'number'
      ? String(remote.correctAnswer)
      : JSON.stringify(remote.correctAnswer ?? '');

  const isOpen =
    remote.kind === 'open_calculation' || remote.kind === 'open_proof';

  return {
    id: remote.id,
    subjectId: remote.subjectId,
    type: mapKindToTaskType(remote.kind),
    topicTag: remote.taxonomy.skillTags[0] ?? remote.taxonomy.primaryChapterId,
    prompt: remote.prompt,
    visual: remote.visual,
    options: normalizeOptions(remote.options),
    correctAnswer: correctAnswerStr,
    rubric: isOpen
      ? {
          keywords: remote.taxonomy.skillTags,
          expectedResult: remote.explanation.finalAnswerDisplay,
          resultOnly: false,
        }
      : undefined,
    explanation: remote.explanation.finalAnswerDisplay,
    explanationSteps: remote.explanation.steps,
    ckeTrapNote: remote.explanation.ckeTrapNote,
    hints,
  };
}

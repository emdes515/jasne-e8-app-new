import { useEffect, useSyncExternalStore } from 'react';
import { MATH_MINI_EXAM_TASKS, ALL_TASKS_BY_ID } from '../../data/mathExamMock';
import { findMathLesson, MATH_LESSONS } from '../../data/mathLessonMock';
import {
  mapRemoteTaskToTaskDefinition,
  type RemoteChapterPack,
  type RemoteCkeSheet,
  type RemoteTaskRecord,
} from '../../types/contentPacks';
import type {
  AppState,
  BentoTheoryCard,
  LessonDefinition,
  SubjectId,
  TaskDefinition,
} from '../../types/domain';
import { contentPackService } from './contentPackService';

export interface ChapterDescriptor {
  chapterId: string;
  chapterNumber: number;
  subjectId: SubjectId;
  title: string;
  subtitle: string;
}

export const SUBJECT_CHAPTERS: Record<SubjectId, readonly ChapterDescriptor[]> = {
  math: [
    {
      chapterId: 'math_ch01',
      chapterNumber: 1,
      subjectId: 'math',
      title: 'Liczby, potęgi i pierwiastki',
      subtitle: 'Fundament każdego arkusza CKE — pewne punkty na start',
    },
    {
      chapterId: 'math_ch02',
      chapterNumber: 2,
      subjectId: 'math',
      title: 'Wyrażenia algebraiczne i równania',
      subtitle: 'Redukcja wyrazów podobnych i budowanie równań do zadań',
    },
    {
      chapterId: 'math_ch03',
      chapterNumber: 3,
      subjectId: 'math',
      title: 'Proporcjonalność i zadania tekstowe',
      subtitle: 'Prędkość, droga, czas, skale mapy i stężenia',
    },
    {
      chapterId: 'math_ch04',
      chapterNumber: 4,
      subjectId: 'math',
      title: 'Geometria płaska — kąty, trójkąty, Pitagoras',
      subtitle: 'Twierdzenie Pitagorasa i trójkąty szczególne 30°-60°-90°',
    },
    {
      chapterId: 'math_ch05',
      chapterNumber: 5,
      subjectId: 'math',
      title: 'Pola figur i układ współrzędnych',
      subtitle: 'Czworokąty, długość odcinka i środek odcinka w układzie XY',
    },
    {
      chapterId: 'math_ch06',
      chapterNumber: 6,
      subjectId: 'math',
      title: 'Bryły — graniastosłupy i ostrosłupy',
      subtitle: 'Objętości, pola powierzchni i odcinki w bryłach',
    },
    {
      chapterId: 'math_ch07',
      chapterNumber: 7,
      subjectId: 'math',
      title: 'Statystyka, prawdopodobieństwo i wykresy',
      subtitle: 'Średnia arytmetyczna, drzewka i klasyczne zadania z kulami',
    },
  ],
  polish: [
    {
      chapterId: 'pol_ch01',
      chapterNumber: 1,
      subjectId: 'polish',
      title: 'Lektury obowiązkowe — część 1',
      subtitle: 'Kamienie na szaniec, Mały Książę, Opowieść wigilijna, Quo vadis',
    },
    {
      chapterId: 'pol_ch02',
      chapterNumber: 2,
      subjectId: 'polish',
      title: 'Lektury obowiązkowe — część 2 i epika',
      subtitle: 'Pan Tadeusz, Balladyna, Dziady cz. II, Zemsta, Syzyfowe prace',
    },
    {
      chapterId: 'pol_ch03',
      chapterNumber: 3,
      subjectId: 'polish',
      title: 'Poezja, liryka i środki stylistyczne',
      subtitle: 'Kochanowski, Mickiewicz, Szymborska oraz analiza wiersza',
    },
    {
      chapterId: 'pol_ch04',
      chapterNumber: 4,
      subjectId: 'polish',
      title: 'Czytanie ze zrozumieniem i argumentacja',
      subtitle: 'Praca z tekstem nieliterackim, teza, kontekst i wnioski CKE',
    },
    {
      chapterId: 'pol_ch05',
      chapterNumber: 5,
      subjectId: 'polish',
      title: 'Gramatyka, składnia i części mowy',
      subtitle: 'Imiesłowy, zdania złożone, funkcje składniowe i słowotwórstwo',
    },
    {
      chapterId: 'pol_ch06',
      chapterNumber: 6,
      subjectId: 'polish',
      title: 'Ortografia, interpunkcja i kultura języka',
      subtitle: 'Przecinki w zdaniach złożonych, pisownia łączna i rozdzielna',
    },
    {
      chapterId: 'pol_ch07',
      chapterNumber: 7,
      subjectId: 'polish',
      title: 'Formy wypowiedzi pisemnej E8',
      subtitle: 'Rozprawka, przemówienie, opowiadanie, ogłoszenie i zaproszenie',
    },
  ],
  english: [
    {
      chapterId: 'eng_ch01',
      chapterNumber: 1,
      subjectId: 'english',
      title: 'Czasy gramatyczne i struktury',
      subtitle: 'Present Simple/Continuous, Past, Present Perfect, Future',
    },
    {
      chapterId: 'eng_ch02',
      chapterNumber: 2,
      subjectId: 'english',
      title: 'Słownictwo i życie codzienne',
      subtitle: 'Człowiek, dom, szkoła, praca, zakupy, podróże i zdrowie',
    },
    {
      chapterId: 'eng_ch03',
      chapterNumber: 3,
      subjectId: 'english',
      title: 'Funkcje i reakcje językowe',
      subtitle: 'Dialogi, pytania, prośby, odmowy i sytuacje komunikacyjne',
    },
    {
      chapterId: 'eng_ch04',
      chapterNumber: 4,
      subjectId: 'english',
      title: 'Rozumienie tekstów pisanych',
      subtitle: 'Dobieranie nagłówków, prawda/fałsz i szczegóły w tekście',
    },
    {
      chapterId: 'eng_ch05',
      chapterNumber: 5,
      subjectId: 'english',
      title: 'Znajomość środków językowych',
      subtitle: 'Tłumaczenie fragmentów, parafrazy, minidialogi i luki',
    },
    {
      chapterId: 'eng_ch06',
      chapterNumber: 6,
      subjectId: 'english',
      title: 'Wypowiedź pisemna i e-mail E8',
      subtitle: 'Struktura e-maila, zwroty otwierające, rozwijanie punktów',
    },
  ],
};

function formatSkillTag(tag: string): string {
  const cleaned = tag.replace(/[_-]+/g, ' ').trim();
  if (!cleaned) return 'Zadania egzaminacyjne';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function formatNodeNumber(lessonId: string): string {
  return lessonId.replace(/^lesson:/, '').replace(/^[pe](?=\d)/, '');
}

function compareLessonIds(a: string, b: string): number {
  return a.localeCompare(b, 'pl', { numeric: true });
}

function buildGeneratedTheory(
  title: string,
  chapterTitle: string,
  tasks: RemoteTaskRecord[]
): BentoTheoryCard[] {
  const uniqueTags = Array.from(
    new Set(tasks.flatMap((t) => t.taxonomy.skillTags).map(formatSkillTag))
  ).slice(0, 4);

  const hintBullets = tasks
    .flatMap((t) => t.staticHints ?? [])
    .map((h) => `${h.title}: ${h.body}`)
    .filter((v, idx, arr) => arr.indexOf(v) === idx)
    .slice(0, 4);

  const sampleTask = tasks[0];
  const sampleSteps = (sampleTask?.explanation?.steps ?? []).slice(0, 3).map((step, i) => ({
    stepNumber: i + 1,
    title: `Krok ${i + 1}`,
    content: step,
  }));

  const cards: BentoTheoryCard[] = [
    {
      id: 'essence',
      title: `${title} — w pigułce`,
      subtitle: `${chapterTitle} · ${tasks.length} zadań CKE i treningowych`,
      bullets:
        uniqueTags.length > 0
          ? [
              `Zakres lekcji: ${uniqueTags.join(', ')}.`,
              ...(hintBullets.length > 0
                ? hintBullets.slice(0, 3)
                : ['Przeczytaj uważnie polecenie i zwróć uwagę na szczegóły w treści zadania.']),
            ]
          : ['Lekcja zawiera zestaw zadań przygotowujących do egzaminu ósmoklasisty.'],
    },
  ];

  if (sampleSteps.length > 0) {
    cards.push({
      id: 'example',
      title: 'Przykładowy tok rozumowania',
      subtitle: sampleTask.prompt.slice(0, 120) + (sampleTask.prompt.length > 120 ? '…' : ''),
      steps: sampleSteps,
    });
  }

  return cards;
}

class ContentRegistryStore {
  private tasksById: Record<string, TaskDefinition> = { ...ALL_TASKS_BY_ID };
  private lessonsById: Record<string, LessonDefinition> = Object.fromEntries(
    MATH_LESSONS.map((l) => [l.id, l])
  );
  private chapterLessonIds: Record<string, string[]> = {
    math_ch01: MATH_LESSONS.map((l) => l.id),
  };
  private chapterTasks: Record<string, TaskDefinition[]> = {};
  private ckeSheetsBySubject: Partial<Record<SubjectId, RemoteCkeSheet[]>> = {};
  private loadedSubjects = new Set<SubjectId>();
  private loadingSubjects = new Set<SubjectId>();
  private subjectErrors: Partial<Record<SubjectId, string>> = {};
  private version = 0;
  private listeners = new Set<() => void>();
  private inFlightBySubject: Partial<Record<SubjectId, Promise<void>>> = {};

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): number => this.version;

  private notify() {
    this.version += 1;
    for (const listener of this.listeners) {
      listener();
    }
  }

  getTaskById(taskId: string): TaskDefinition | undefined {
    return this.tasksById[taskId] ?? ALL_TASKS_BY_ID[taskId];
  }

  getLessonById(lessonId: string): LessonDefinition | undefined {
    return this.lessonsById[lessonId] ?? findMathLesson(lessonId);
  }

  getLessonsForChapter(subjectId: SubjectId, chapterId: string): LessonDefinition[] {
    const ids = this.chapterLessonIds[chapterId] ?? [];
    if (ids.length > 0) {
      return ids
        .map((id) => this.lessonsById[id])
        .filter((l): l is LessonDefinition => Boolean(l));
    }
    if (subjectId === 'math' && chapterId === 'math_ch01') {
      return MATH_LESSONS;
    }
    return [];
  }

  getLessonsForSubject(subjectId: SubjectId): LessonDefinition[] {
    const chapters = SUBJECT_CHAPTERS[subjectId];
    return chapters.flatMap((ch) => this.getLessonsForChapter(subjectId, ch.chapterId));
  }

  getChapterTaskCount(chapterId: string): number {
    return this.chapterTasks[chapterId]?.length ?? 0;
  }

  getRecommendedLesson(state: AppState, subjectId: SubjectId): LessonDefinition {
    const lessons = this.getLessonsForSubject(subjectId);
    const fallback = lessons[0] ?? MATH_LESSONS[0];
    if (lessons.length === 0) return MATH_LESSONS[0];

    const openId = state.openTheory?.lessonId;
    if (openId) {
      const openLesson = lessons.find((l) => l.id === openId);
      if (openLesson) return openLesson;
    }

    const activeId = state.activeSession?.source === 'lesson' ? state.activeSession.contentId : '';
    if (activeId) {
      const activeLesson = lessons.find((l) => l.id === activeId);
      if (activeLesson) return activeLesson;
    }

    const pausedOrTheory = lessons.find(
      (l) =>
        Boolean(state.pausedLessons?.[l.id]) ||
        state.pausedLessonSession?.contentId === l.id ||
        Boolean(state.theoryCards?.[l.id])
    );
    if (pausedOrTheory) return pausedOrTheory;

    return lessons.find((l) => !state.completedLessonIds.includes(l.id)) ?? fallback;
  }

  getCkeSheetsForSubject(subjectId: SubjectId): RemoteCkeSheet[] {
    return this.ckeSheetsBySubject[subjectId] ?? [];
  }

  getMiniExamTasksForSubject(subjectId: SubjectId): TaskDefinition[] {
    const chapters = SUBJECT_CHAPTERS[subjectId];
    const pool = chapters.flatMap((ch) => this.chapterTasks[ch.chapterId] ?? []);
    if (pool.length < 5) {
      return subjectId === 'math' ? MATH_MINI_EXAM_TASKS : pool;
    }

    const closed = pool.filter((t) => t.type !== 'open');
    const open = pool.filter((t) => t.type === 'open');
    const selected: TaskDefinition[] = [];

    const stepClosed = Math.max(1, Math.floor(closed.length / 4));
    for (let i = 0; i < closed.length && selected.length < 4; i += stepClosed) {
      selected.push(closed[i]);
    }
    if (open.length > 0) {
      selected.push(open[0]);
    }
    for (const t of pool) {
      if (selected.length >= 5) break;
      if (!selected.some((s) => s.id === t.id)) selected.push(t);
    }
    return selected.slice(0, 5);
  }

  isSubjectLoaded(subjectId: SubjectId): boolean {
    return this.loadedSubjects.has(subjectId);
  }

  isSubjectLoading(subjectId: SubjectId): boolean {
    return this.loadingSubjects.has(subjectId);
  }

  getSubjectError(subjectId: SubjectId): string | undefined {
    return this.subjectErrors[subjectId];
  }

  private ingestChapterPack(chapter: ChapterDescriptor, pack: RemoteChapterPack) {
    const mappedTasks: TaskDefinition[] = [];
    const byLesson = new Map<string, RemoteTaskRecord[]>();

    for (const remote of pack.tasks) {
      const mapped = mapRemoteTaskToTaskDefinition(remote);
      this.tasksById[mapped.id] = mapped;
      mappedTasks.push(mapped);

      if (remote.lessonEligible === false) continue;
      const lessonIds =
        remote.taxonomy.lessonIds.length > 0
          ? remote.taxonomy.lessonIds
          : [`lesson:${chapter.chapterNumber}.1`];

      for (const lid of lessonIds) {
        const list = byLesson.get(lid) ?? [];
        list.push(remote);
        byLesson.set(lid, list);
      }
    }

    this.chapterTasks[chapter.chapterId] = mappedTasks;

    const sortedLessonIds = Array.from(byLesson.keys()).sort(compareLessonIds);
    const finalLessonIds: string[] = [];

    for (const lid of sortedLessonIds) {
      const existingStatic = findMathLesson(lid);
      if (existingStatic) {
        // Zachowujemy bogate lekcje Bento 1.1–1.3 jako kanoniczne lekcje startowe
        this.lessonsById[lid] = existingStatic;
        finalLessonIds.push(lid);
        continue;
      }

      const rawTasks = byLesson.get(lid) ?? [];
      if (rawTasks.length === 0) continue;

      const lessonTasks = rawTasks.map((r) => this.tasksById[r.id]).filter(Boolean);
      const totalSec = rawTasks.reduce((sum, r) => sum + (r.estimatedSec || 60), 0);
      const estMin = Math.max(3, Math.round(totalSec / 60));
      const firstTag = rawTasks[0]?.taxonomy.skillTags[0] ?? '';
      const nodeNumber = formatNodeNumber(lid);
      const title = firstTag ? formatSkillTag(firstTag) : `Lekcja ${nodeNumber}`;

      this.lessonsById[lid] = {
        id: lid,
        nodeNumber,
        subjectId: chapter.subjectId,
        chapterNumber: chapter.chapterNumber,
        chapterTitle: chapter.title,
        title,
        subtitle: `${lessonTasks.length} zadań · ok. ${estMin} min`,
        rewardCoins: 20,
        theory: buildGeneratedTheory(title, chapter.title, rawTasks),
        tasks: lessonTasks,
      };
      finalLessonIds.push(lid);
    }

    if (finalLessonIds.length > 0) {
      this.chapterLessonIds[chapter.chapterId] = finalLessonIds;
    }
  }

  async ensureSubjectLoaded(subjectId: SubjectId): Promise<void> {
    if (this.loadedSubjects.has(subjectId)) return;
    if (this.inFlightBySubject[subjectId]) {
      return this.inFlightBySubject[subjectId];
    }

    this.loadingSubjects.add(subjectId);
    delete this.subjectErrors[subjectId];
    this.notify();

    const task = (async () => {
      try {
        const chapters = SUBJECT_CHAPTERS[subjectId];
        const [chapterPacks, sheetsPack] = await Promise.all([
          Promise.all(
            chapters.map(async (ch) => ({
              chapter: ch,
              pack: await contentPackService.loadChapterPack(ch.chapterId),
            }))
          ),
          contentPackService.loadCkeSheetsPack(subjectId),
        ]);

        for (const { chapter, pack } of chapterPacks) {
          if (pack) {
            this.ingestChapterPack(chapter, pack);
          }
        }

        if (sheetsPack) {
          this.ckeSheetsBySubject[subjectId] = sheetsPack.sheets.filter(
            (s) => s.status === 'published'
          );
        }

        this.loadedSubjects.add(subjectId);
      } catch (err) {
        this.subjectErrors[subjectId] =
          err instanceof Error ? err.message : 'Nie udało się pobrać zadań z Firebase.';
      } finally {
        this.loadingSubjects.delete(subjectId);
        delete this.inFlightBySubject[subjectId];
        this.notify();
      }
    })();

    this.inFlightBySubject[subjectId] = task;
    return task;
  }

  async ensureAllSubjectsLoaded(): Promise<void> {
    await Promise.all([
      this.ensureSubjectLoaded('math'),
      this.ensureSubjectLoaded('polish'),
      this.ensureSubjectLoaded('english'),
    ]);
  }
}

export const contentRegistry = new ContentRegistryStore();

export function useContentRegistryVersion(): number {
  return useSyncExternalStore(
    contentRegistry.subscribe,
    contentRegistry.getSnapshot,
    contentRegistry.getSnapshot
  );
}

export function useSubjectContent(subjectId: SubjectId) {
  useContentRegistryVersion();

  useEffect(() => {
    void contentRegistry.ensureSubjectLoaded(subjectId);
  }, [subjectId]);

  return {
    loaded: contentRegistry.isSubjectLoaded(subjectId),
    loading: contentRegistry.isSubjectLoading(subjectId),
    error: contentRegistry.getSubjectError(subjectId),
    chapters: SUBJECT_CHAPTERS[subjectId],
    lessons: contentRegistry.getLessonsForSubject(subjectId),
    sheets: contentRegistry.getCkeSheetsForSubject(subjectId),
  };
}

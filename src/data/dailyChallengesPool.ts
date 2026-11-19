// src/data/dailyChallengesPool.ts

import { DailyChallengeDefinition } from '../types/domain';

export const DAILY_CHALLENGES_POOL: DailyChallengeDefinition[] = [
  {
    id: 'ch_complete_lesson',
    kind: 'complete_lesson',
    title: 'Ukończ 1 lekcję Bento',
    description: 'Przejdź przez teorię i rozwiąż 5 zadań w lekcji.',
    target: 1,
    rewardCoins: 15,
  },
  {
    id: 'ch_sprint_5',
    kind: 'sprint_5_in_row',
    title: 'Codzienny Sprint: 5 poprawnych z rzędu',
    description: 'Osiągnij serię 5 poprawnych odpowiedzi bez błędu (Combo x2.0).',
    target: 5,
    rewardCoins: 15,
  },
  {
    id: 'ch_save_task',
    kind: 'save_task',
    title: 'Zapisz 1 zadanie do powtórki',
    description: 'Użyj ikony zakładki przy trudniejszym zadaniu.',
    target: 1,
    rewardCoins: 15,
  },
  {
    id: 'ch_open_task_ai',
    kind: 'open_task_ai',
    title: 'Rozwiąż 1 zadanie otwarte z AI Tutorem',
    description: 'Napisz obliczenia i odbierz ocenę CKE (co najmniej 1/2 pkt).',
    target: 1,
    rewardCoins: 15,
  },
  {
    id: 'ch_complete_exam',
    kind: 'complete_mini_exam',
    title: 'Ukończ Mini-Arkusz E8',
    description: 'Sprawdź się w 5-zadaniowym arkuszu bez utraty serc.',
    target: 1,
    rewardCoins: 15,
  },
  {
    id: 'ch_exam_80',
    kind: 'exam_80_percent',
    title: 'Osiągnij ≥ 80% w Mini-Arkuszu',
    description: 'Zdobądź co najmniej 80% punktów w arkuszu testowym.',
    target: 1,
    rewardCoins: 15,
  },
  {
    id: 'ch_practice_3',
    kind: 'practice_3_tasks',
    title: 'Sesja powtórkowa: ≥ 3 zadania',
    description: 'Rozwiąż co najmniej 3 zadania w Zapisanych lub Banku Błędów.',
    target: 3,
    rewardCoins: 15,
  },
];

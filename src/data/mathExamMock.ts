// src/data/mathExamMock.ts

import { TaskDefinition } from '../types/domain';
import { MATH_LESSON_1_1 } from './mathLessonMock';

export const MATH_MINI_EXAM_TASKS: TaskDefinition[] = [
  {
    id: 'math_exam_t1',
    subjectId: 'math',
    type: 'abcd',
    topicTag: 'Procenty i obniżki cen',
    prompt:
      'Plecak kosztował $150\\text{ zł}$. W czasie wyprzedaży jego cenę obniżono o $20\\%$. Ile kosztuje ten plecak po obniżce?',
    options: [
      { id: 'A', label: '$130\\text{ zł}$' },
      { id: 'B', label: '$120\\text{ zł}$' },
      { id: 'C', label: '$115\\text{ zł}$' },
      { id: 'D', label: '$30\\text{ zł}$' },
    ],
    correctAnswer: 'B',
    explanation: '20% ze 150 zł to 30 zł, więc 150 − 30 = 120 zł.',
    hints: [
      'Ile wynosi 20% z 150 zł?',
      'Policz 10% i pomnóż przez 2.',
      'Odejmij rabat od ceny początkowej.',
    ],
  },
  {
    id: 'math_exam_t2',
    subjectId: 'math',
    type: 'true_false',
    topicTag: 'Geometria płaska — pole trójkąta',
    prompt:
      'Oceń prawdziwość zdania: „Pole trójkąta prostokątnego o przyprostokątnych długości $6\\text{ cm}$ i $8\\text{ cm}$ wynosi $24\\text{ cm}^2$.”',
    options: [
      { id: 'TRUE', label: 'Prawda' },
      { id: 'FALSE', label: 'Fałsz' },
    ],
    correctAnswer: 'TRUE',
    explanation: 'P = ½ · 6 · 8 = 24 cm².',
    hints: [
      'Jaki jest wzór na pole trójkąta?',
      'Pomnóż długości przyprostokątnych.',
      'Podziel iloczyn przez 2.',
    ],
  },
  {
    id: 'math_exam_t3',
    subjectId: 'math',
    type: 'abcd',
    topicTag: 'Równania liniowe',
    prompt: 'Rozwiązaniem równania $3(x - 2) = 15$ jest liczba:',
    options: [
      { id: 'A', label: '$x = 3$' },
      { id: 'B', label: '$x = 5$' },
      { id: 'C', label: '$x = 7$' },
      { id: 'D', label: '$x = 9$' },
    ],
    correctAnswer: 'C',
    explanation: 'Podziel obie strony przez 3: x − 2 = 5, więc x = 7.',
    hints: [
      'Jak odwrócić kolejność działań w równaniu?',
      'Podziel obie strony przez 3.',
      'Do wyniku dzielenia dodaj 2.',
    ],
  },
  {
    id: 'math_exam_t4',
    subjectId: 'math',
    type: 'numeric',
    topicTag: 'Twierdzenie Pitagorasa',
    prompt:
      'Oblicz długość przeciwprostokątnej trójkąta prostokątnego o przyprostokątnych długości $6$ i $8$. Wpisz wynik liczbowy:',
    correctAnswer: '10',
    explanation:
      'Twierdzenie Pitagorasa: 6² + 8² = 36 + 64 = 100, więc c = √100 = 10.',
    hints: [
      'Który wzór łączy boki trójkąta prostokątnego?',
      'Policz sumę kwadratów przyprostokątnych.',
      'Wyciągnij pierwiastek z tej sumy.',
    ],
  },
  {
    id: 'math_exam_t5',
    subjectId: 'math',
    type: 'open',
    topicTag: 'Zadanie otwarte CKE (2 pkt)',
    prompt:
      'Kasia kupiła $3$ zeszyty po $4{,}50\\text{ zł}$ i długopis za $6{,}50\\text{ zł}$. Zapłaciła banknotem $50\\text{ zł}$. Ile reszty otrzymała? Zapisz obliczenia.',
    correctAnswer: '30',
    rubric: {
      keywords: ['3', '450', '1350', '650', '20', '50', '30', 'reszta', 'koszt'],
      expectedResult: '30',
      resultOnly: false,
    },
    explanation:
      '3 · 4,50 = 13,50 zł; 13,50 + 6,50 = 20 zł; 50 − 20 = 30 zł reszty.',
    hints: [
      'Najpierw policz koszt zeszytów.',
      'Dodaj do tego długopis.',
      'Odejmij łączny koszt od 50 zł.',
    ],
  },
];

export const ALL_TASKS_BY_ID: Record<string, TaskDefinition> = [...MATH_LESSON_1_1.tasks, ...MATH_MINI_EXAM_TASKS].reduce(
  (acc, task) => {
    acc[task.id] = task;
    return acc;
  },
  {} as Record<string, TaskDefinition>
);

// src/data/mathLessonMock.ts

import { LessonDefinition, SubjectId, TaskDefinition } from '../types/domain';

export interface ChapterNodeMeta {
  id: string;
  nodeNumber: string;
  title: string;
  subtitle: string;
  unlocked: boolean;
  comingSoon?: boolean;
  rewardCoins: number;
  previewTopics?: string[];
}

export interface ChapterMeta {
  chapterNumber: number;
  subjectId: SubjectId;
  title: string;
  subtitle: string;
  unlocked: boolean;
  nodes: ChapterNodeMeta[];
}

export const MATH_LESSON_1_1: LessonDefinition = {
  id: 'lesson:1.1',
  nodeNumber: '1.1',
  subjectId: 'math',
  chapterNumber: 1,
  chapterTitle: 'Liczby, Potęgi i Pierwiastki',
  title: 'Potęgi i pierwiastki w zadaniach E8',
  subtitle: '4 karty Bento • 5 zadań • +20 monet',
  rewardCoins: 20,
  theory: [
    {
      id: 'essence',
      title: 'Esencja: O co chodzi na E8?',
      subtitle: 'Sedno tematu w 4 szybkich punktach „z polskiego na nasze”',
      bullets: [
        'Potęga $a^n$ to skrócony zapis mnożenia liczby $a$ przez samą siebie $n$ razy (np. $2^4 = 2 \\cdot 2 \\cdot 2 \\cdot 2 = 16$). Uwaga: $a^0 = 1$ dla każdego $a \\neq 0$.',
        'Gdy mnożysz potęgi o tej samej podstawie, wykładniki DODAJESZ ($3^8 \\cdot 3^4 = 3^{12}$). Gdy dzielisz — wykładniki ODEJMUJESZ ($3^{12} : 3^{10} = 3^2$).',
        'Pierwiastek kwadratowy $\\sqrt{a}$ odpowiada na pytanie: „jaka liczba nieujemna podniesiona do kwadratu daje $a$?” (np. $\\sqrt{49} = 7$, bo $7^2 = 49$).',
        'Pierwiastek sześcienny $\\sqrt[3]{a}$ szuka liczby, która do potęgi trzeciej daje $a$ (np. $\\sqrt[3]{27} = 3$, bo $3^3 = 27$ — bardzo częste w zadaniach z objętością sześcianu!).',
      ],
    },
    {
      id: 'formulas',
      title: 'Wzory E8 — Potęgi i Pierwiastki',
      subtitle: 'Kluczowe prawa działań, które musisz mieć w małym palcu',
      formulas: [
        {
          name: 'Iloczyn i iloraz potęg o tej samej podstawie',
          latex: 'a^m \\cdot a^n = a^{m+n} \\quad \\text{oraz} \\quad \\frac{a^m}{a^n} = a^{m-n}',
          whenToUse: 'Gdy w wyrażeniu widzisz te same podstawy (np. same dwójki lub trójki).',
        },
        {
          name: 'Potęgowanie potęgi',
          latex: '(a^m)^n = a^{m \\cdot n}',
          whenToUse: 'Gdy potęga jest zamknięta w nawiasie i podniesiona do kolejnej potęgi.',
        },
        {
          name: 'Wyłączanie czynnika przed znak pierwiastka',
          latex: '\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b} \\quad (a \\ge 0, b \\ge 0)',
          whenToUse: 'Gdy pod pierwiastkiem jest liczba taka jak $50 = 25 \\cdot 2$ lub $75 = 25 \\cdot 3$.',
        },
      ],
    },
    {
      id: 'example',
      title: 'Przykład krok po kroku',
      subtitle: 'Oblicz wartość wyrażenia $\\frac{2^7 \\cdot 2^5}{(2^3)^3}$',
      steps: [
        {
          stepNumber: 1,
          title: 'Uprość licznik (mnożenie potęg)',
          content: 'Dodajemy wykładniki o tej samej podstawie $2$: $2^7 \\cdot 2^5 = 2^{7+5} = 2^{12}$.',
        },
        {
          stepNumber: 2,
          title: 'Uprość mianownik (potęgowanie potęgi)',
          content: 'Mnożymy wykładniki przez siebie: $(2^3)^3 = 2^{3 \\cdot 3} = 2^9$.',
        },
        {
          stepNumber: 3,
          title: 'Podziel licznik przez mianownik',
          content: 'Odejmujemy wykładniki: $\\frac{2^{12}}{2^9} = 2^{12-9} = 2^3 = 8$. Wynik końcowy to $8$.',
        },
      ],
    },
    {
      id: 'trap',
      title: 'Pułapka E8 — Uważaj na sumę pod pierwiastkiem!',
      subtitle: 'Najczęstszy błąd ósmoklasistów na arkuszach CKE',
      trap: {
        wrongTitle: 'ŹLE (klasyczna pułapka)',
        wrongMath: '\\sqrt{9 + 16} = \\sqrt{9} + \\sqrt{16} = 3 + 4 = 7',
        wrongNote: 'NIGDY nie rozdzielaj pierwiastka na dodawanie ani odejmowanie!',
        rightTitle: 'DOBRZE (złoty odruch E8)',
        rightMath: '\\sqrt{9 + 16} = \\sqrt{25} = 5',
        rightNote: 'Najpierw wykonaj dodawanie pod znakiem pierwiastka, a dopiero na końcu wyciągnij pierwiastek.',
      },
    },
  ],
  tasks: [
    {
      id: 'math_l1_t1',
      subjectId: 'math',
      type: 'abcd',
      topicTag: 'Działania na potęgach',
      prompt: 'Wartość wyrażenia $\\frac{3^8 \\cdot 3^4}{3^{10}}$ wynosi:',
      options: [
        { id: 'A', label: '$3$' },
        { id: 'B', label: '$9$' },
        { id: 'C', label: '$27$' },
        { id: 'D', label: '$81$' },
      ],
      correctAnswer: 'B',
      explanation:
        'Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki (8+4=12), a przy dzieleniu odejmujemy (12−10=2), więc wynik to 3² = 9.',
      hints: [
        'Jaka zasada łączy potęgi o tej samej podstawie?',
        'Najpierw uprość licznik: 3⁸ · 3⁴.',
        'Podziel 3¹² przez 3¹⁰, odejmując wykładniki.',
      ],
    },
    {
      id: 'math_l1_t2',
      subjectId: 'math',
      type: 'true_false',
      topicTag: 'Własności pierwiastków',
      prompt:
        'Oceń prawdziwość zdania: „Liczba $\\sqrt{36 + 64}$ jest równa $\\sqrt{36} + \\sqrt{64}$.”',
      options: [
        { id: 'TRUE', label: 'Prawda' },
        { id: 'FALSE', label: 'Fałsz' },
      ],
      correctAnswer: 'FALSE',
      explanation:
        '√(36+64) = √100 = 10, a √36 + √64 = 6 + 8 = 14. Pierwiastka nie wolno rozdzielać na sumę.',
      hints: [
        'Czy pierwiastek sumy równa się sumie pierwiastków?',
        'Policz najpierw wartość pod pierwiastkiem po lewej stronie.',
        'Porównaj √100 z 6 + 8.',
      ],
    },
    {
      id: 'math_l1_t3',
      subjectId: 'math',
      type: 'abcd',
      topicTag: 'Wyłączanie czynnika przed pierwiastek',
      prompt: 'Liczba $\\sqrt{50}$ jest równa:',
      options: [
        { id: 'A', label: '$2\\sqrt{5}$' },
        { id: 'B', label: '$5\\sqrt{2}$' },
        { id: 'C', label: '$25\\sqrt{2}$' },
        { id: 'D', label: '$10\\sqrt{5}$' },
      ],
      correctAnswer: 'B',
      explanation: '50 = 25 · 2, więc √50 = √25 · √2 = 5√2.',
      hints: [
        'Spróbuj rozłożyć liczbę pod pierwiastkiem na iloczyn z kwadratem.',
        'Który kwadrat liczby całkowitej dzieli 50?',
        'Zapisz 50 jako 25 · 2 i rozdziel pierwiastek.',
      ],
    },
    {
      id: 'math_l1_t4',
      subjectId: 'math',
      type: 'numeric',
      topicTag: 'Kolejność działań z potęgami',
      prompt: 'Oblicz wartość wyrażenia $2^4 + \\sqrt{81} - 5^2$. Wpisz wynik liczbowy:',
      correctAnswer: '0',
      explanation: '2⁴ = 16, √81 = 9, 5² = 25, więc 16 + 9 − 25 = 0.',
      hints: [
        'Oblicz każdy składnik osobno.',
        'Zacznij od 2⁴ i √81.',
        'Policz 16 + 9, a potem odejmij 25.',
      ],
    },
    {
      id: 'math_l1_t5',
      subjectId: 'math',
      type: 'open',
      topicTag: 'Zadanie otwarte CKE (2 pkt)',
      prompt:
        'Kwadrat ma pole równe $49\\text{ cm}^2$, a sześcian ma objętość równą $27\\text{ cm}^3$. Oblicz sumę długości boku tego kwadratu i krawędzi tego sześcianu. Zapisz obliczenia.',
      correctAnswer: '10',
      rubric: {
        keywords: ['pierwiastek', '49', '7', '27', '3', 'suma', '10', 'bok', 'krawedz'],
        expectedResult: '10',
        resultOnly: false,
      },
      explanation:
        'Pole kwadratu 49 cm² daje bok √49 = 7 cm. Objętość sześcianu 27 cm³ daje krawędź ∛27 = 3 cm. Suma: 7 + 3 = 10 cm.',
      hints: [
        'Jak z pola kwadratu otrzymać długość boku?',
        'Jak z objętości sześcianu otrzymać długość krawędzi?',
        'Policz osobno bok kwadratu i krawędź sześcianu, a potem je dodaj.',
      ],
    },
  ],
};

export const MATH_CHAPTERS_MAP: ChapterMeta[] = [
  {
    chapterNumber: 1,
    subjectId: 'math',
    title: 'Liczby, Potęgi i Pierwiastki',
    subtitle: 'Fundament każdego arkusza CKE — pewne punkty na start',
    unlocked: true,
    nodes: [
      {
        id: 'lesson:1.1',
        nodeNumber: '1.1',
        title: 'Potęgi i pierwiastki w zadaniach E8',
        subtitle: '4 karty Bento • 5 zadań • +20 monet',
        unlocked: true,
        rewardCoins: 20,
      },
      {
        id: 'lesson:1.2',
        nodeNumber: '1.2',
        title: 'Ułamki i działania na liczbach wymiernych',
        subtitle: 'Wkrótce w Fazie 2 • +20 monet',
        unlocked: false,
        comingSoon: true,
        rewardCoins: 20,
        previewTopics: [
          'Skracanie i rozszerzanie ułamków zwykłych i dziesiętnych',
          'Zamiana ułamków okresowych i zaokrąglanie liczb',
          'Zadania CKE na oś liczbową',
        ],
      },
      {
        id: 'lesson:1.3',
        nodeNumber: '1.3',
        title: 'Procenty i podwyżki/obniżki E8',
        subtitle: 'Wkrótce w Fazie 2 • +20 monet',
        unlocked: false,
        comingSoon: true,
        rewardCoins: 20,
        previewTopics: [
          'Obliczanie ceny po dwukrotnej obniżce lub podwyżce',
          'Punkty procentowe vs procenty',
          'Diagramy procentowe z arkuszy CKE',
        ],
      },
    ],
  },
  {
    chapterNumber: 2,
    subjectId: 'math',
    title: 'Wyrażenia algebraiczne i równania',
    subtitle: 'Redukcja wyrazów podobnych i budowanie równań do zadań',
    unlocked: false,
    nodes: [],
  },
  {
    chapterNumber: 3,
    subjectId: 'math',
    title: 'Proporcjonalność i zadania tekstowe',
    subtitle: 'Prędkość, droga, czas, skale mapy i stężenia',
    unlocked: false,
    nodes: [],
  },
  {
    chapterNumber: 4,
    subjectId: 'math',
    title: 'Geometria płaska — kąty, trójkąty, Pitagoras',
    subtitle: 'Twierdzenie Pitagorasa i trójkąty szczególne 30°-60°-90°',
    unlocked: false,
    nodes: [],
  },
  {
    chapterNumber: 5,
    subjectId: 'math',
    title: 'Pola figur i układ współrzędnych',
    subtitle: 'Czworokąty, długość odcinka i środek odcinka w układzie XY',
    unlocked: false,
    nodes: [],
  },
  {
    chapterNumber: 6,
    subjectId: 'math',
    title: 'Bryły — graniastosłupy i ostrosłupy',
    subtitle: 'Objętości, pola powierzchni i odcinki w bryłach',
    unlocked: false,
    nodes: [],
  },
  {
    chapterNumber: 7,
    subjectId: 'math',
    title: 'Statystyka, prawdopodobieństwo i odczyt z wykresów',
    subtitle: 'Średnia arytmetyczna, drzewka i klasyczne zadania z kulami',
    unlocked: false,
    nodes: [],
  },
];

export const POLISH_PREVIEW_CHAPTERS = [
  {
    chapterNumber: 1,
    title: 'Lektury obowiązkowe E8',
    subtitle: 'Kamienie na szaniec, Pan Tadeusz, Dziady cz. II, Mały Książę, Balladyna',
    badge: 'Wkrótce — Faza 2',
  },
  {
    chapterNumber: 2,
    title: 'Gramatyka, części mowy i ortografia',
    subtitle: 'Imiesłowy, zdania złożone, interpunkcja i środki stylistyczne',
    badge: 'Wkrótce — Faza 2',
  },
  {
    chapterNumber: 3,
    title: 'Rozprawka, przemówienie i opowiadanie twórcze',
    subtitle: 'Trening argumentacji z AI Tutorem i szablony na 20/20 pkt',
    badge: 'Wkrótce — Faza 2',
  },
];

export const ENGLISH_PREVIEW_CHAPTERS = [
  {
    chapterNumber: 1,
    title: 'Czasy gramatyczne i struktury E8',
    subtitle: 'Present Perfect vs Past Simple, strona bierna, tryby warunkowe',
    badge: 'Wkrótce — Faza 2',
  },
  {
    chapterNumber: 2,
    title: 'Rozumienie tekstu pisanego i ze słuchu',
    subtitle: 'Strategie eliminacji pułapek CKE i słownictwo tematyczne',
    badge: 'Wkrótce — Faza 2',
  },
  {
    chapterNumber: 3,
    title: 'E-mail egzaminacyjny i reakcje językowe',
    subtitle: 'Ocenianie wypowiedzi pisemnej (10 pkt) z AI Tutorem',
    badge: 'Wkrótce — Faza 2',
  },
];

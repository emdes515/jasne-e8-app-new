import type { LessonDefinition, TaskDefinition } from '../types/domain';

const choice = (...labels: string[]) =>
  labels.map((label, index) => ({ id: 'ABCD'[index], label }));

const trueFalse = [
  { id: 'TRUE', label: 'Prawda' },
  { id: 'FALSE', label: 'Fałsz' },
];

type MathTask = Omit<TaskDefinition, 'subjectId'>;

function mathTasks(lesson: string, tasks: MathTask[]): TaskDefinition[] {
  return tasks.map((task) => ({ ...task, id: 'lesson:' + lesson + ':' + task.id, subjectId: 'math' }));
}

export const MATH_LESSON_1_2: LessonDefinition = {
  id: 'lesson:1.2',
  nodeNumber: '1.2',
  subjectId: 'math',
  chapterNumber: 1,
  chapterTitle: 'Liczby, potęgi i pierwiastki',
  title: 'Ułamki i działania na liczbach wymiernych',
  subtitle: 'Skracanie, wspólny mianownik i część całości',
  rewardCoins: 20,
  theory: [
    {
      id: 'essence',
      title: 'Co mówi mianownik?',
      subtitle: 'Dzieli całość na równe części. Licznik mówi, ile części bierzemy.',
      bullets: [
        'W ułamku $\\frac{3}{5}$ bierzemy trzy z pięciu równych części.',
        'Skracając lub rozszerzając ułamek, wykonaj tę samą operację na liczniku i mianowniku.',
        'Przy dodawaniu części muszą mieć tę samą wielkość. Sprowadź ułamki do wspólnego mianownika.',
        'Aby obliczyć ułamek danej liczby, podziel liczbę przez mianownik, a potem pomnóż przez licznik.',
      ],
    },
    {
      id: 'formulas',
      title: 'Reguły działań na ułamkach',
      subtitle: 'Mianownik zawsze jest różny od zera.',
      formulas: [
        { name: 'Rozszerzanie', latex: '\\frac{2}{3}=\\frac{2\\cdot 4}{3\\cdot 4}=\\frac{8}{12}', whenToUse: 'Gdy potrzebujesz wspólnego mianownika.' },
        { name: 'Dodawanie', latex: '\\frac{2}{7}+\\frac{3}{7}=\\frac{5}{7}', whenToUse: 'Gdy mianowniki są już takie same.' },
        { name: 'Dzielenie', latex: '\\frac{2}{5}:\\frac{3}{4}=\\frac{2}{5}\\cdot\\frac{4}{3}=\\frac{8}{15}', whenToUse: 'Pomnóż przez odwrotność ułamka, przez który dzielisz.' },
      ],
    },
    {
      id: 'example',
      title: 'Ile wody wypito?',
      subtitle: 'W butelce jest 1 litr wody. Rano wypito $\\frac{1}{4}$ litra, po południu $\\frac{1}{3}$ litra.',
      steps: [
        { stepNumber: 1, title: 'Znajdź wspólny mianownik', content: 'Najmniejsza wspólna wielokrotność 4 i 3 to 12.' },
        { stepNumber: 2, title: 'Zapisz ułamki w dwunastych', content: '$\\frac{1}{4}=\\frac{3}{12}$ oraz $\\frac{1}{3}=\\frac{4}{12}$.' },
        { stepNumber: 3, title: 'Dodaj liczniki', content: 'Wypito $\\frac{7}{12}$ litra. Zostało $\\frac{5}{12}$ litra.' },
      ],
    },
    {
      id: 'trap',
      title: 'Mianownik to wielkość części',
      subtitle: 'Dodawanie nie zmienia wielkości części po ustaleniu wspólnego mianownika.',
      trap: {
        wrongTitle: 'Błąd: dodane oba mianowniki', wrongMath: '\\frac{1}{2}+\\frac{1}{4}\\ne\\frac{2}{6}',
        wrongNote: 'Pół i ćwiartka razem dają więcej niż pół. Dwie szóste są mniejsze niż pół.',
        rightTitle: 'Poprawnie: dodaj ćwiartki', rightMath: '\\frac{2}{4}+\\frac{1}{4}=\\frac{3}{4}',
        rightNote: 'Najpierw zapisz połowę jako dwie ćwiartki.',
      },
    },
  ],
  tasks: mathTasks('1.2', [
    { id: '1', type: 'abcd', topicTag: 'Skracanie', prompt: 'Który ułamek jest równy $\\frac{18}{24}$?', options: choice('$\\frac{2}{3}$', '$\\frac{3}{4}$', '$\\frac{4}{5}$', '$\\frac{6}{7}$'), correctAnswer: 'B', explanation: 'Podziel licznik i mianownik przez 6. Otrzymasz $\\frac{3}{4}$.', hints: ['Skróć ułamek.', 'Szukaj wspólnego dzielnika liczb 18 i 24.', 'Spróbuj podzielić obie liczby przez 6.'] },
    { id: '2', type: 'true_false', topicTag: 'Ułamek dziesiętny', prompt: 'Liczba $0{,}4$ jest równa $\\frac{1}{4}$.', options: trueFalse, correctAnswer: 'FALSE', explanation: '$0{,}4=\\frac{4}{10}=\\frac{2}{5}$, natomiast $\\frac{1}{4}=0{,}25$.', hints: ['Zamień zapis dziesiętny na zwykły.', 'Cyfra po przecinku oznacza części dziesiąte.', 'Skróć ułamek o mianowniku 10.'] },
    { id: '3', type: 'abcd', topicTag: 'Dodawanie ułamków', prompt: 'Oblicz $\\frac{2}{3}+\\frac{1}{6}$.', options: choice('$\\frac{3}{9}$', '$\\frac{3}{6}$', '$\\frac{5}{6}$', '$\\frac{3}{2}$'), correctAnswer: 'C', explanation: '$\\frac{2}{3}=\\frac{4}{6}$, więc suma to $\\frac{4+1}{6}=\\frac{5}{6}$.', hints: ['Sprowadź ułamki do wspólnego mianownika.', 'Skorzystaj z mianownika 6.', 'Rozszerz pierwszy ułamek przez 2, potem dodaj liczniki.'] },
    { id: '4', type: 'numeric', topicTag: 'Część liczby', prompt: 'Oblicz $\\frac{3}{8}$ z 56.', correctAnswer: '21', explanation: 'Jedna ósma to $56:8=7$. Trzy ósme to $3\\cdot7=21$.', hints: ['Najpierw znajdź jedną część.', 'Podziel 56 przez mianownik.', 'Pomnóż wynik dzielenia przez licznik.'] },
    { id: '5', type: 'open', topicTag: 'Ułamek w zadaniu tekstowym', prompt: 'Pudełko zawiera 48 kredek. Jedna czwarta jest niebieska, a jedna trzecia zielona. Ile kredek ma inny kolor? Zapisz obliczenia.', correctAnswer: '20', rubric: { expectedResult: '20', resultOnly: false, keywords: ['12', '16', '28', '48'] }, explanation: 'Niebieskich jest $48:4=12$, a zielonych $48:3=16$. Pozostało $48-(12+16)=20$ kredek.', hints: ['Oblicz osobno liczbę kredek obu kolorów.', 'Podziel 48 najpierw przez 4, a osobno przez 3.', 'Od całej liczby kredek odejmij sumę obu grup.'] },
  ]),
};

export const MATH_LESSON_1_3: LessonDefinition = {
  id: 'lesson:1.3',
  nodeNumber: '1.3',
  subjectId: 'math',
  chapterNumber: 1,
  chapterTitle: 'Liczby, potęgi i pierwiastki',
  title: 'Procenty, podwyżki i obniżki',
  subtitle: 'Część ze stu i nowa wartość po zmianie',
  rewardCoins: 20,
  theory: [
    {
      id: 'essence',
      title: 'Procent oznacza część ze stu',
      subtitle: 'Zacznij od ustalenia, jaka liczba jest podstawą obliczenia.',
      bullets: [
        '$1\\%=\\frac{1}{100}$, a $25\\%=\\frac{25}{100}=0{,}25$.',
        'Obniżka o 20% zostawia 80% kwoty początkowej.',
        'Podwyżka o 15% daje 115% wartości początkowej.',
        'W kolejnej zmianie procent liczysz od nowej wartości.',
      ],
    },
    {
      id: 'formulas',
      title: 'Jak zapisać zmianę procentową?',
      subtitle: 'Procent zamień na ułamek i pomnóż przez podstawę.',
      formulas: [
        { name: 'Część liczby', latex: '30\\%\\cdot 90=0{,}3\\cdot 90', whenToUse: 'Gdy szukasz wartości odpowiadającej podanemu procentowi.' },
        { name: 'Podwyżka o 10%', latex: '100\\%+10\\%=110\\%=1{,}1', whenToUse: 'Pomnóż wartość początkową przez 1,1.' },
        { name: 'Obniżka o 10%', latex: '100\\%-10\\%=90\\%=0{,}9', whenToUse: 'Pomnóż wartość początkową przez 0,9.' },
      ],
    },
    {
      id: 'example',
      title: 'Dwie obniżki jednej ceny',
      subtitle: 'Buty kosztowały 250 zł. Cenę obniżono najpierw o 20%, a potem o 10%.',
      steps: [
        { stepNumber: 1, title: 'Policz cenę po pierwszej obniżce', content: '$250\\cdot 0{,}8=200$ zł.' },
        { stepNumber: 2, title: 'Zmień podstawę', content: 'Druga obniżka to 10% z 200 zł.' },
        { stepNumber: 3, title: 'Policz cenę końcową', content: '$200\\cdot 0{,}9=180$ zł. Łącznie cena spadła o 70 zł, czyli o 28%.' },
      ],
    },
    {
      id: 'trap',
      title: 'Podwyżka i obniżka mają różne podstawy',
      subtitle: 'Dwie zmiany o ten sam procent mogą dać wartość inną od początkowej.',
      trap: {
        wrongTitle: 'Błąd: procenty się znoszą', wrongMath: '100\\ \\text{zł}\\ \\stackrel{+20\\%,-20\\%}{\\longrightarrow}\\ 100\\ \\text{zł}',
        wrongNote: 'Po podwyżce druga zmiana liczona jest od 120 zł.',
        rightTitle: 'Poprawnie: pomnóż dwa razy', rightMath: '100\\cdot 1{,}2\\cdot 0{,}8=96',
        rightNote: 'Dwadzieścia procent z 120 zł to 24 zł.',
      },
    },
  ],
  tasks: mathTasks('1.3', [
    { id: '1', type: 'abcd', topicTag: 'Procent liczby', prompt: 'Ile wynosi 15% z 200?', options: choice('15', '20', '30', '35'), correctAnswer: 'C', explanation: '$10\\%$ z 200 to 20, a $5\\%$ to 10. Razem 30.', hints: ['Zapisz 15% jako ułamek ze stu.', 'Możesz rozbić 15% na 10% i 5%.', 'Pomnóż 200 przez 0,15.'] },
    { id: '2', type: 'true_false', topicTag: 'Punkty procentowe', prompt: 'Zmiana z 40% na 50% to wzrost o 10 punktów procentowych.', options: trueFalse, correctAnswer: 'TRUE', explanation: 'Różnica udziałów wynosi $50-40=10$ punktów procentowych. Względem 40% jest to wzrost o 25%.', hints: ['Punkty procentowe opisują różnicę udziałów.', 'Odejmij mniejszy udział od większego.', 'W tym zdaniu nie dzielisz różnicy przez wartość początkową.'] },
    { id: '3', type: 'abcd', topicTag: 'Podwyżka', prompt: 'Bilet za 80 zł podrożał o 25%. Ile kosztuje teraz?', options: choice('60 zł', '85 zł', '100 zł', '105 zł'), correctAnswer: 'C', explanation: 'Jedna czwarta z 80 zł to 20 zł. Nowa cena to $80+20=100$ zł.', hints: ['Zamień 25% na ułamek zwykły.', 'Oblicz część z 80 zł.', 'Dodaj obliczoną podwyżkę do ceny początkowej.'] },
    { id: '4', type: 'numeric', topicTag: 'Dwie zmiany ceny', prompt: 'Plecak kosztował 300 zł. Cenę obniżono o 10%, potem o 20% od obniżonej ceny. Podaj cenę końcową w złotych.', correctAnswer: '216', explanation: 'Po pierwszej obniżce cena to $300\\cdot0{,}9=270$ zł. Po drugiej to $270\\cdot0{,}8=216$ zł.', hints: ['Policz cenę w dwóch etapach.', 'Pozostaje 90% ceny początkowej po pierwszym etapie.', 'W drugim etapie zostaje 80% nowej ceny.'] },
    { id: '5', type: 'open', topicTag: 'Cena przed obniżką', prompt: 'Po obniżce o 25% lampka kosztuje 90 zł. Ile kosztowała przed obniżką? Zapisz obliczenia.', correctAnswer: '120', rubric: { expectedResult: '120', resultOnly: false, keywords: ['75', '0,75', '90', '30'] }, explanation: '90 zł stanowi 75% ceny początkowej. Dzielimy $90:0{,}75=120$. Cena przed obniżką wynosiła 120 zł.', hints: ['90 zł to tylko część ceny początkowej.', 'Od 100% odejmij 25%, aby znaleźć udział nowej ceny.', 'Podziel nową cenę przez otrzymany udział zapisany jako ułamek.'] },
  ]),
};

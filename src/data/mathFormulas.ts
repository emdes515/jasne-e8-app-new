// src/data/mathFormulas.ts

export interface FormulaCategory {
  id: string;
  label: string;
  items: Array<{
    title: string;
    latex: string;
    whenToUse: string;
    example: string;
  }>;
}

export const MATH_FORMULAS_CATALOG: FormulaCategory[] = [
  {
    id: 'powers_roots',
    label: 'Potęgi i pierwiastki',
    items: [
      {
        title: 'Mnożenie i dzielenie potęg o tej samej podstawie',
        latex: 'a^m \\cdot a^n = a^{m+n} \\quad \\text{oraz} \\quad \\frac{a^m}{a^n} = a^{m-n}',
        whenToUse: 'Gdy podstawy potęg są identyczne.',
        example: '$3^5 \\cdot 3^2 = 3^7$, a $\\frac{5^8}{5^6} = 5^2 = 25$',
      },
      {
        title: 'Potęgowanie potęgi i iloczynu',
        latex: '(a^m)^n = a^{m \\cdot n} \\quad \\text{oraz} \\quad (a \\cdot b)^n = a^n \\cdot b^n',
        whenToUse: 'Gdy potęga jest w nawiasie lub rozbijasz podstawę na czynniki.',
        example: '$(2^3)^4 = 2^{12}$, a $6^3 = 2^3 \\cdot 3^3$',
      },
      {
        title: 'Mnożenie i dzielenie pierwiastków',
        latex: '\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b} \\quad \\text{oraz} \\quad \\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}',
        whenToUse: 'Przy wyłączaniu czynnika przed pierwiastek (uwaga: NIE działa dla dodawania!).',
        example: '$\\sqrt{75} = \\sqrt{25 \\cdot 3} = 5\\sqrt{3}$',
      },
    ],
  },
  {
    id: 'percentages',
    label: 'Procenty i proporcje',
    items: [
      {
        title: 'Ułamek z liczby i zamiana procentu',
        latex: 'p\\% = \\frac{p}{100}',
        whenToUse: 'Gdy liczysz rabat, podatek lub udział procentowy.',
        example: '$20\\% \\text{ z } 150\\text{ zł} = 0{,}2 \\cdot 150 = 30\\text{ zł}$',
      },
      {
        title: 'Cena po podwyżce i obniżce',
        latex: 'C_{\\text{nowa}} = C_0 \\cdot \\left(1 \\pm \\frac{p}{100}\\right)',
        whenToUse: 'W zadaniach na wyprzedaże i kolejne zmiany ceny.',
        example: 'Obniżka o $15\\%$: mnożymy cenę przez $0{,}85$.',
      },
      {
        title: 'Droga, prędkość i czas',
        latex: 's = v \\cdot t \\quad \\Rightarrow \\quad v = \\frac{s}{t}, \\quad t = \\frac{s}{v}',
        whenToUse: 'W zadaniach tekstowych o ruchu (pamiętaj o ujednoliceniu jednostek!).',
        example: '$15\\text{ min} = \\frac{1}{4}\\text{ h} = 0{,}25\\text{ h}$',
      },
    ],
  },
  {
    id: 'geometry_2d',
    label: 'Geometria i Pitagoras',
    items: [
      {
        title: 'Twierdzenie Pitagorasa',
        latex: 'a^2 + b^2 = c^2',
        whenToUse: 'W każdym trójkącie prostokątnym ($c$ leży naprzeciwko kąta prostego).',
        example: 'Dla $a=6, b=8$: $6^2 + 8^2 = 36 + 64 = 100 \\Rightarrow c = 10$.',
      },
      {
        title: 'Przekątna kwadratu i wysokość trójkąta równobocznego',
        latex: 'd = a\\sqrt{2}, \\qquad h = \\frac{a\\sqrt{3}}{2}, \\qquad P_{\\triangle} = \\frac{a^2\\sqrt{3}}{4}',
        whenToUse: 'W zadaniach z kwadratem, trójkątem równobocznym i kątami $45^\\circ, 60^\\circ$.',
        example: 'Kwadrat o boku $5$ ma przekątną $5\\sqrt{2}$.',
      },
      {
        title: 'Pola figur płaskich',
        latex: 'P_{\\triangle} = \\frac{1}{2}a \\cdot h, \\qquad P_{\\text{trapezu}} = \\frac{(a+b) \\cdot h}{2}, \\qquad P_{\\text{rombu}} = \\frac{e \\cdot f}{2}',
        whenToUse: 'Przy obliczaniu pól wielokątów.',
        example: 'Trójkąt o podstawie $8$ i wysokości $6$ ma pole $24$.',
      },
    ],
  },
  {
    id: 'solids_3d',
    label: 'Pola i objętości brył',
    items: [
      {
        title: 'Sześcian o krawędzi a',
        latex: 'V = a^3, \\qquad P_c = 6a^2, \\qquad D = a\\sqrt{3}',
        whenToUse: 'Gdy w zadaniu pojawia się sześcian (np. $V = 27 \\Rightarrow a = 3$).',
        example: 'Sześcian o krawędzi $3\\text{ cm}$ ma objętość $27\\text{ cm}^3$.',
      },
      {
        title: 'Graniastosłup prosty',
        latex: 'V = P_p \\cdot H, \\qquad P_c = 2P_p + P_b',
        whenToUse: 'Dla prostopadłościanów i graniastosłupów trójkątnych/czworokątnych.',
        example: 'Dla $P_p = 12\\text{ cm}^2$ i $H = 5\\text{ cm}$ mamy $V = 60\\text{ cm}^3$.',
      },
      {
        title: 'Ostrosłup',
        latex: 'V = \\frac{1}{3} P_p \\cdot H, \\qquad P_c = P_p + P_b',
        whenToUse: 'Gdy bryła ma jeden wierzchołek górny — nigdy nie zapomnij o $\\frac{1}{3}$!',
        example: 'Dla $P_p = 9\\text{ cm}^2$ i $H = 4\\text{ cm}$ mamy $V = 12\\text{ cm}^3$.',
      },
    ],
  },
];

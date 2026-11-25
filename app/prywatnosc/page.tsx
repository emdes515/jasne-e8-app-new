import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Database,
  Eye,
  Landmark,
  Lock,
  PencilLine,
  ShieldCheck,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { AppStateProvider } from '../../src/context/AppStateContext';

export const metadata: Metadata = {
  title: 'Prywatność i RODO | JASNE E8',
  description:
    'Proste zasady prywatności w JASNE E8: wiek a zakładanie konta, zakres zbieranych danych, prawa ucznia i opiekuna oraz status pilotażu.',
};

type AgeRule = {
  index: string;
  title: string;
  tag: string;
  points: readonly string[];
};

const AGE_RULES: readonly AgeRule[] = [
  {
    index: '01',
    title: 'Poniżej 13 lat',
    tag: 'Konto zakłada opiekun',
    points: [
      'Zgodnie z art. 12 Kodeksu cywilnego osoba poniżej 13 lat nie ma zdolności do czynności prawnych.',
      'Art. 8 RODO wymaga zgody rodzica lub opiekuna prawnego na przetwarzanie danych dziecka.',
      'Konto w aplikacji zakłada wyłącznie rodzic lub opiekun prawny.',
      'Pierwsza lekcja działa lokalnie, bez konta i bez wysyłania danych na serwer.',
    ],
  },
  {
    index: '02',
    title: '13–15 lat',
    tag: 'Konto z udziałem opiekuna',
    points: [
      'Art. 15 i 20 Kodeksu cywilnego dają ograniczoną zdolność do czynności prawnych w drobnych, bieżących sprawach.',
      'Polska nie obniżyła progu 16 lat z art. 8 RODO, więc zgoda opiekuna nadal jest potrzebna.',
      'Założenie konta w aplikacji wymaga udziału lub zgody rodzica albo opiekuna prawnego.',
    ],
  },
  {
    index: '03',
    title: '16–17 lat',
    tag: 'Samodzielna zgoda na darmowe konto',
    points: [
      'Art. 8 ust. 1 RODO pozwala samodzielnie zgodzić się na przetwarzanie danych przy darmowym koncie ucznia.',
      'Przyszłe płatne plany, takie jak Pass E8 Pro, będą wymagały ukończenia 18 lat albo umowy zawartej przez opiekuna.',
    ],
  },
  {
    index: '04',
    title: '18 lat i więcej lub opiekun',
    tag: 'Pełna zdolność',
    points: [
      'Dorosła osoba ma pełną zdolność do czynności prawnych.',
      'Może założyć konto dla ucznia poniżej 16 lat albo uczyć się na własnym koncie.',
    ],
  },
];

const ACCOUNT_DATA = [
  'Adres e-mail użyty przy rejestracji lub logowaniu.',
  'Ksywka wybrana w profilu — zalecamy nick zamiast imienia i nazwiska.',
  'Przedział wieku, potrzebny do ustalenia zasad zgody.',
  'Zapisana ścieżka zgody na RODO i regulamin oraz wersja i czas tej zgody.',
  'Postępy w nauce: ukończone lekcje, odpowiedzi i powtórki.',
];

const NOT_COLLECTED = [
  'Nie prosimy o PESEL, datę urodzenia, adres zamieszkania ani skany dokumentów.',
  'Nie wyświetlamy reklam i nie prowadzimy profilowania marketingowego.',
];

const RIGHTS = [
  { icon: Eye, title: 'Dostęp do danych', detail: 'Sprawdź, jakie dane o Tobie przechowujemy.' },
  { icon: PencilLine, title: 'Sprostowanie', detail: 'Poproś o poprawienie danych, które są nieaktualne.' },
  { icon: Trash2, title: 'Usunięcie konta i danych', detail: 'Możesz zrezygnować i usunąć konto wraz z postępami.' },
  { icon: Undo2, title: 'Wycofanie zgody', detail: 'Zgodę można wycofać w dowolnym momencie, bez podawania powodu.' },
  { icon: Lock, title: 'Ograniczenie przetwarzania', detail: 'Poproś o czasowe wstrzymanie części operacji na danych.' },
  { icon: Landmark, title: 'Skarga do UODO', detail: 'Możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.' },
];

const DATA_ROWS = [
  {
    icon: Database,
    title: 'Tryb bez konta (pierwsza lekcja)',
    iconClass: 'text-[var(--info)]',
    dotClass: 'bg-[var(--info)]',
    points: [
      'Postępy i ustawienia zapisują się wyłącznie lokalnie w pamięci przeglądarki (localStorage) na Twoim urządzeniu.',
      'Nie wysyłamy wtedy danych osobowych na serwer.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Konto ucznia',
    iconClass: 'text-[var(--accent-text)]',
    dotClass: 'bg-[var(--accent-text)]',
    points: ACCOUNT_DATA,
  },
  {
    icon: X,
    title: 'Czego nie zbieramy',
    iconClass: 'text-[var(--danger)]',
    dotClass: 'bg-[var(--danger)]',
    points: NOT_COLLECTED,
  },
];

export default function PrivacyPage() {
  return (
    <AppStateProvider>
      <main className="mx-auto min-h-svh w-full max-w-[70rem] px-4 pb-14 pt-2 sm:px-6 sm:pt-4 lg:px-10">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <Link
              href="/"
              className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Wróć do nauki
            </Link>
            <span className="font-display text-base font-extrabold">JASNE E8</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/pro#opiekunowie"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[var(--accent-text)] hover:underline"
            >
              Informacje dla opiekunów
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <p className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
              Wersja dokumentu: 2026-11-24
            </p>
          </div>
        </header>

        <section className="study-panel mt-4 p-5 sm:mt-6 sm:p-8 lg:p-10" aria-labelledby="privacy-title">
          <p className="text-[0.8125rem] font-bold text-[var(--accent-text)]">Prywatność i RODO</p>
          <h1 id="privacy-title" className="page-heading mt-2">
            Twoje dane, jasne zasady
          </h1>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            Piszemy prostym językiem — tak, żeby uczeń ósmej klasy i rodzic rozumieli wszystko bez słownika prawniczego.
            Poniżej znajdziesz zasady wieku i zgody, zakres danych, Twoje prawa oraz informację o statusie pilotażu.
          </p>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="wiek-title" id="wiek">
          <h2 id="wiek-title" className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
            Wiek a zakładanie konta w Polsce
          </h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-[var(--text-secondary)]">
            Zasady wynikają z art. 8 RODO oraz z Kodeksu cywilnego. W Polsce próg samodzielnej zgody to 16 lat i nie
            został obniżony.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {AGE_RULES.map((rule) => (
              <article key={rule.index} className="study-panel flex min-w-0 flex-col gap-2 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--bg-elevated)] font-display text-sm font-extrabold text-[var(--accent-text)]"
                  >
                    {rule.index}
                  </span>
                  <h3 className="min-w-0 font-display text-base font-extrabold sm:text-lg">{rule.title}</h3>
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--info)]">{rule.tag}</p>
                <ul className="mt-1 grid gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {rule.points.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-[var(--accent-text)]"
                      />
                      <span className="min-w-0 break-words">{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="dane-title">
          <h2 id="dane-title" className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
            Jakie dane przetwarzamy
          </h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-[var(--text-secondary)]">
            Zbieramy tylko to, co jest naprawdę potrzebne do nauki — tak działa zasada minimalizacji z art. 5 RODO.
            Zakres opisujemy zgodnie z art. 13 RODO.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {DATA_ROWS.map(({ icon: Icon, title, iconClass, dotClass, points }) => (
              <article key={title} className="study-panel flex min-w-0 flex-col p-4 sm:p-5">
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--bg-elevated)] ${iconClass}`}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-base font-extrabold">{title}</h3>
                <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {points.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <span aria-hidden="true" className={`mt-[0.45rem] size-1.5 shrink-0 rounded-full ${dotClass}`} />
                      <span className="min-w-0 break-words">{point}</span>
                    </li>
                  ))}
                </ul>
                {title === 'Czego nie zbieramy' ? (
                  <p className="mt-3 flex items-start gap-2 border-t border-[var(--border-subtle)] pt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--success)]" />
                    <span className="min-w-0 break-words">
                      Baza Cloud Firestore działa w regionie europejskim (europe-central2, Warszawa), a logowanie
                      Firebase Auth (Google LLC) przetwarza dane w USA na podstawie standardowych klauzul umownych
                      (SCC / EU–US DPF).
                    </span>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="prawa-title">
          <h2 id="prawa-title" className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
            Twoje prawa i prawa opiekuna
          </h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-[var(--text-secondary)]">
            Z każdego z tych praw możesz skorzystać w dowolnym momencie. Rodzic lub opiekun prawny może zgłosić
            prośbę w imieniu ucznia poniżej 16 lat.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RIGHTS.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="study-panel flex min-w-0 items-start gap-3 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--bg-elevated)] text-[var(--accent-text)]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-extrabold sm:text-base">{title}</h3>
                  <p className="mt-1 break-words text-sm leading-relaxed text-[var(--text-secondary)]">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="rodo-art13-title">
          <h2 id="rodo-art13-title" className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
            Pełna informacja RODO (art. 13)
          </h2>
          <div className="study-panel mt-4 grid gap-3 p-4 text-sm leading-relaxed text-[var(--text-secondary)] sm:grid-cols-2 sm:p-6">
            <div>
              <h3 className="font-display text-sm font-extrabold text-[var(--text-primary)]">Administrator i kontakt</h3>
              <p className="mt-1">
                W fazie pilotażu aplikację rozwija zespół JASNE E8. Przed uruchomieniem publicznej oferty oraz usług
                płatnych opublikujemy tutaj pełne dane rejestrowe administratora i dedykowany adres kontaktowy ds. danych.
              </p>
            </div>
            <div>
              <h3 className="font-display text-sm font-extrabold text-[var(--text-primary)]">Cele i podstawy prawne</h3>
              <p className="mt-1">
                Obsługa konta i nauki: art. 6 ust. 1 lit. b RODO (realizacja usługi). Dla uczniów poniżej 16 lat zgoda
                rodzica lub opiekuna prawnego: art. 6 ust. 1 lit. a w zw. z art. 8 ust. 1 RODO.
              </p>
            </div>
            <div>
              <h3 className="font-display text-sm font-extrabold text-[var(--text-primary)]">Odbiorcy i transfer poza EOG</h3>
              <p className="mt-1">
                Odbiorcami technicznymi są Google/Firebase (Cloud Firestore w Warszawie europe-central2; Firebase Auth w
                USA na podstawie SCC / EU–US Data Privacy Framework) oraz Vercel (hosting).
              </p>
            </div>
            <div>
              <h3 className="font-display text-sm font-extrabold text-[var(--text-primary)]">Okres przechowywania i dobrowolność</h3>
              <p className="mt-1">
                Dane konta przechowujemy do usunięcia konta lub wycofania zgody; tryb gościa działa wyłącznie w
                localStorage na urządzeniu. Podanie e-maila jest dobrowolne, ale potrzebne do odblokowania lekcji od 2.
                wzwyż.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="pilot-title" id="regulamin">
          <article className="study-panel min-w-0 border-[color:var(--info)] p-4 sm:p-6">
            <h2 id="pilot-title" className="flex items-start gap-2 font-display text-lg font-extrabold sm:text-xl">
              <ShieldCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--info)]" />
              Zasady pilotażu (Regulamin v2026-11-24)
            </h2>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-[var(--text-secondary)]">
              JASNE E8 działa w bezpłatnej fazie pilotażu: lekcje i zadania z matematyki są dostępne teraz, a dla
              języka polskiego i angielskiego udostępniamy plany działów. W pilotażu weryfikacja zgody rodzica poniżej
              16 lat opiera się na oświadczeniu i koncie opiekuna (kolejny etap doda weryfikację mailową). Aplikacja
              nie pobiera opłat, nie wyświetla reklam i nie nakłania do zakupów; przed uruchomieniem płatnego Pass E8
              Pro opublikujemy pełne dane administratora i regulamin usług odpłatnych.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/pro#opiekunowie"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-sm font-bold text-[var(--text-primary)] transition-colors hover:border-[var(--text-secondary)]"
              >
                Zasady dla opiekunów
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-[var(--accent-text)] hover:underline"
              >
                Wróć do nauki
              </Link>
            </div>
          </article>
        </section>
      </main>
    </AppStateProvider>
  );
}

# Specyfikacja Produktowa i Techniczna: JASNE E8 (`jasne-e8-app`)

**Wersja:** 0.4 (po rechecku QA v0.3 — wszystkie niespójności, luki pokrycia i uwagi doprecyzowane)
**Data:** 2026-11-19
**Zmiany 0.3 -> 0.4:** poprawiono 4 kryteria akceptacji (`AC-C6`, `AC-D3`, `AC-H2`, `AC-V5`) oraz sprzeczność kontrastu Solar w sekcji 5; dodano brakujące AC (limit Misji Ratunkowej i wariant płatny, restart egzaminu, kara XP -33% za podpowiedzi, bonus za wielokrotności 7 dni serii, próg `x2.0`, 2 pominięte dni z 2 Tarczami, granice 20/40 znaków i `resultOnly` w AI Tutor mock, FIFO Banku Błędów, limit 3 MB / `QuotaExceededError`) oraz ujednolicono `formatToParts` dla daty `playerDay`.
**Baza referencyjna:** `jasnev2` (Nocturne/Solar Luminary)
**Repozytorium:** `emdes515/jasne-e8-app` (prywatne)

---

## 1. Cel i Zakres Fazy 1 (Objective)

Budujemy odświeżoną, **mobile-first** aplikację edukacyjno-gamingową przygotowującą do **Egzaminu Ósmoklasisty (E8)** z 3 przedmiotów:
1. **Matematyka E8**
2. **Język Polski E8**
3. **Język Angielski E8**

### Założenia Fazy 1
- **Najpierw mechaniki i UI/UX, potem masowe treści:** Architektura jest gotowa pod wszystkie 3 przedmioty, ale na start dostarczamy **1 testową lekcję** oraz **1 próbny mini-arkusz/egzamin** do przetestowania każdego przepływu.
- **Lokalne dane na start:** Stan ucznia (XP, monety, serca, seria, Tarcza Serii, wyzwania dzienne, zapisane zadania, bank błędów, postęp lekcji) działa lokalnie na mockach JSON + `localStorage` przez warstwę `StorageRepository` (gotową pod późniejsze podpięcie Backend BFF + Cloud Firestore).
- **Brak brudnopisu:** Wyrzucamy `CkeScratchpad`. Zamiast tego wprowadzamy **Zapisywanie zadań („Do powtórki”)** jednym kliknięciem.
- **Zostają Przydatne Wzory E8:** Szybki, podręczny panel wzorów/zasad E8 dostępny w trakcie nauki i powtórek.
- **Arena wyłączona:** Moduł `ArenaView` jest wyłączony w Fazie 1.
- **AI Tutor (symulowany w Fazie 1):** Wbudowany asystent do **zadań otwartych** i podpowiedzi krok po kroku działa w Fazie 1 na lokalnym silniku symulacji (`MockAiTutorService`), aby zweryfikować pełny UX przed podpięciem API.
- **Oba motywy od razu:** Równolegle wspieramy motyw **Ciemny (Nocturne Gaming)** oraz **Jasny (Solar Gaming)** z dopracowanym kontrastem komponentów w obu trybach.

---

## 2. Wybór Technologii (Tech Stack)

| Warstwa | Technologia | Uzasadnienie |
|---|---|---|
| UI Framework | React 19 + TypeScript (~5.8) | Reużycie sprawdzonych komponentów z `jasnev2` (KaTeX, diagramy, klawiatura matematyczna), szybki rozwój |
| Stylowanie | Tailwind CSS v4 + CSS variables | Spójny dual-theme (Nocturne + Solar) bez duplikacji klas |
| Animacje | `motion/react` + `canvas-confetti` | Fizyka sprężyn 60 FPS na mobile, `layoutId`, `AnimatePresence` |
| Matematyka & Ikony | `katex`, `lucide-react` | Czytelne wzory matematyczne i lekkie ikony wektorowe |
| Build & Testy | Vite 6, Vitest, Testing Library, Playwright | Szybki HMR, testy logiki + weryfikacja mobile 390x844 |
| Mobile-First / Przyszłość | Responsive Web / PWA (gotowe pod Capacitor) | Natychmiastowy podgląd na telefonie i łatwe pakowanie na Android/iOS |

---

## 3. Komendy i Struktura Projektu

### Komendy (`package.json`)
```bash
npm run dev          # Serwer deweloperski Vite (localhost:5173)
npm run build        # Sprawdzenie TS + build produkcyjny (dist/)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm test             # Jednorazowe uruchomienie testów Vitest
npm run test:watch   # Vitest w trybie watch
```

### Struktura Katalogów
```text
src/
  components/
    layout/          # TopHud, BottomTabBar, SubjectSwitcher, ThemeToggle
    lesson/          # BentoTheoryTabs, LessonRunner, AnswerOptionCard, OpenTaskAiBox
    exam/            # ExamSimulator, ExamQuestionGrid, ExamTimer, ExamSummary
    vault/           # SavedTasksView, MistakesBankView, RescueMissionModal
    formulas/        # FormulasBottomSheet
    gamification/    # ComboBadge, HeartsHud, StreakShieldShop, DailyChallengesCard, RankUpModal
    ui/              # Button, Card, BottomSheet, ToastHost, CountUpNumber
  data/
    mocks/           # 1 testowa lekcja, 1 próbny mini-arkusz, wzory E8, pula zadań dziennych
  lib/
    motionPresets.ts # Stałe sprężyn i warianty animacji
    storageRepo.ts   # Warstwa localStorage + migracja schematu
    gamification.ts  # Logika XP, Rang, Combo, Monet, Serc, Serii i Tarczy Serii
    aiTutorMock.ts   # Symulator AI Tutora (3 poziomy podpowiedzi + ocena otwartych)
  types/             # Typy TypeScript (SubjectId, Task, Lesson, UserProgress, Challenge)
  tests/             # Testy jednostkowe Vitest i komponentów
```

---

## 4. Mapa Modułów (Capability Map)

| ID modułu | Odpowiedzialność | Zależy od |
|---|---|---|
| `core-theme-motion` | Tokeny Nocturne/Solar, typografia, komponenty bazowe, presety animacji, `prefers-reduced-motion` | — |
| `local-store` | Zapis stanu w `localStorage` z wersjonowaniem schematu | — |
| `subject-shell` | Bottom Tab Bar (5 zakładek), przełącznik 3 przedmiotów E8, kompaktowy Top HUD | `core-theme-motion`, `local-store` |
| `gamification-engine` | XP, Rangi E8, Combo Mnożnik, Monety, Seria + Tarcza Serii, Losowe Zadania Dzienne, Serca | `local-store` |
| `lesson-bento` | 4 zakładki Bento + sesja zadań (ABCD, wpisane, otwarte) | `subject-shell`, `gamification-engine` |
| `saved-tasks-vault` | Zapisywanie zadań „Do powtórki” (zamiast brudnopisu) + tryb powtórek | `local-store`, `lesson-bento` |
| `mistakes-bank` | Zbieranie błędnych zadań i Misja Ratunkowa (odzyskiwanie serc) | `local-store`, `gamification-engine` |
| `formulas-drawer` | Bottom-sheet „Przydatne Wzory E8” dla 3 przedmiotów | `subject-shell` |
| `e8-exam-simulator` | Mini-arkusz / Egzamin E8 (timer, siatka pytań, brak utraty serc, podsumowanie) | `subject-shell`, `gamification-engine` |
| `ai-tutor-mock` | Symulowany AI Tutor: podpowiedzi 1-2-3 i ocena zadań otwartych | `lesson-bento`, `e8-exam-simulator` |

**Kolejność budowy:** `core-theme-motion` + `local-store` -> `gamification-engine` -> `subject-shell` -> `lesson-bento` + `formulas-drawer` + `ai-tutor-mock` -> `saved-tasks-vault` + `mistakes-bank` -> `e8-exam-simulator`.

---

## 5. Ocena Stylu `jasnev2` i Dual-Theme „Nocturne & Solar Gaming E8”

### Audyt obecnych komponentów z `jasnev2` — co poprawiamy
1. **Zbyt ciężki nagłówek i nawigacja na mobile:** W `jasnev2` top-bar mieszał nawigację, profil i przełączniki. W nowej aplikacji na mobile wprowadzamy czysty **Top HUD (max 56 px)** + **Bottom Tab Bar (5 pozycji w strefie kciuka: Start, Nauka, Powtórki, Egzamin, Profil)**.
2. **Brak wyrazistego kontrastu w trybie jasnym (Solar):** W `jasnev2` jasny motyw był dodatkiem CSS (`theme-light-adapter.css`), przez co część kart traciła głębię. W `jasne-e8-app` projektujemy oba motywy równorzędnie na zmiennych CSS:
   - **Nocturne Gaming (Dark):** Tło `#070A0F`, karty `#0E1522`, podniesione powierzchnie `#152033`, obramowanie `rgba(255,255,255,0.08)`, główny akcent `#FFB800` (Solar Amber), sukces `#10B981`, błąd `#F43F5E`, akcent info `#38BDF8`.
   - **Solar Gaming (Light):** Tło `#F4F6FB`, karty `#FFFFFF` z subtelnym cieniem `0 2px 10px rgba(15,23,42,0.06)`, obramowanie `#E2E8F0`, główny akcent wypełnień/UI `#D97706` (kontrast ~3,2:1 na białym — spełnia WCAG AA 3:1 dla elementów UI i dużych napisów), tekst akcentowy `#B45309` (kontrast ~5,0:1 na białym — spełnia WCAG AA 4,5:1 dla zwykłego tekstu), sukces `#059669`, błąd `#E11D48`, akcent info `#0284C7`.
3. **Karty odpowiedzi ABCD:** Min. wysokość `52 px`, wyraźna plakietka litery (`A/B/C/D`), wyraźny stan zaznaczenia, poprawy i błędu (nie tylko kolor, ale też ikona `Check`/`X` dla dostępności).
4. **Spójność gamingowa bez kiczu:** Zamiast przesytu neonów — czyste karty, wyraźny pasek Rangi E8, licznik Combo i czytelne ikony Lucide.

---

## 6. Szczegółowa Specyfikacja Animacji i Mikro-interakcji (Motion System)

Wszystkie animacje muszą działać w 60 FPS (wyłącznie `transform` i `opacity`) oraz wyłączać się/upraszczać przy `prefers-reduced-motion: reduce`.

### 6.1. Presety (`src/lib/motionPresets.ts`)
- `SPRING_SNAPPY`: `{ type: 'spring', stiffness: 460, damping: 30, mass: 0.8 }`
- `SPRING_BOUNCY`: `{ type: 'spring', stiffness: 420, damping: 18 }`
- `SPRING_SHEET`: `{ type: 'spring', stiffness: 340, damping: 32 }`

### 6.2. Katalog 10 Animacji Kluczowych
1. **Zakładki Bento:** Wspólna pigułka `layoutId="bento-active-tab"` (`SPRING_SNAPPY`), treść wchodzi `y: 8 -> 0, opacity: 0 -> 1` (180 ms).
2. **Wybór i wynik ABCD:** Tap `scale: 0.97`. Poprawna: podskok `scale: [1, 1.03, 1]`, szmaragdowy puls + wylot cząsteczek XP. Błędna: wstrząs `x: [0, -8, 8, -6, 6, -3, 0]` (360 ms) + karmazynowe podświetlenie.
3. **Pasek Combo (`x1.5` / `x2.0` / `x3.0`):** Wjazd `scale: 0.6 -> 1.1 -> 1` (`SPRING_BOUNCY`). Przy `x3.0` ciepły puls krawędzi (`#EA580C`). Błąd gasi plakietkę (`scale: 0.8, opacity: 0`).
4. **Zapis zadania „Do powtórki”:** Ikona zakładki robi sprężysty obrót (`scale: [1, 1.35, 1], rotate: [0, -10, 0]`), wypełnia się kolorem akcentu i pokazuje krótki toast z dołu.
5. **Utrata i regeneracja Serca:** Utrata: drgnięcie serca + ulatujące `-1` w górę. Odzyskanie: wypełnienie pustego serca rozbłyskiem `scale: [0.8, 1.3, 1]`.
6. **Monety i zakup Tarczy Serii:** Przy zakupie Tarczy Serii w sklepie licznik monet płynnie spada (`useCountUp`), a ikona Tarczy dostaje lodowo-niebieski rozbłysk (`#38BDF8`) i wpina się przy liczniku Serii w HUD.
7. **Podsumowanie Sesji & Awans Rangi:** Liczniki XP, Monet i % skuteczności rosną (`useCountUp`, 700 ms). Awans Rangi odpala modal z konfetti (`canvas-confetti` w kolorach Nocturne/Solar).
8. **Bottom Sheet (Wzory E8 / AI Tutor):** Wysuw z dołu (`y: "100%" -> 0`, `SPRING_SHEET`) z możliwością zamknięcia gestem przeciągnięcia w dół (`drag="y"`).
9. **Przełączanie pytań:** Płynny slajd poziomy (`x: 24 -> 0` vs `0 -> -24`, 200 ms) i płynna interpolacja paska postępu.
10. **AI Tutor (analiza zadania otwartego):** Stan „Analizuję odpowiedź…” (shimmer / puls 3 kropek przez ~700 ms w symulacji), następnie płynne rozwinięcie karty z punktacją CKE i wskazówkami.

---

## 7. Szczegółowe Mechaniki Produktowe

### 7.1. Przedmioty i Nawigacja
- Przełącznik 3 przedmiotów: **Matematyka**, **Język Polski**, **Język Angielski**.
- Wspólny profil ucznia (XP, Monety, Serca, Seria, Tarcza Serii, Zapisane zadania), osobne postępy lekcji per przedmiot.

### 7.2. Lekcja Bento i Typy Zadań
- **Teoria Bento (4 karty):** Esencja -> Wzory/Zasady E8 -> Przykład krok po kroku -> Pułapka E8.
- **Zadania:** ABCD / Prawda-Fałsz, Wpisanie odpowiedzi (z `SmartMathKeyboard` dla matematyki), **Zadanie otwarte z AI Tutorem**.

### 7.3. Zapisywanie Zadań „Do powtórki” & Bank Błędów
- Zamiast brudnopisu: przycisk **Zapisz do powtórki** w każdym zadaniu.
- **Deduplikacja:** klucz unikalny wpisu to `taskId + subjectId`. Zapisanie tego samego zadania drugi raz nie tworzy nowego wpisu — aktualizuje `savedAt` (znacznik „ostatnio zapisane”) i pokazuje toast „Już zapisane”.
- Lista sortowana malejąco po `savedAt`; filtr po przedmiocie; tryb *„Rozwiąż zapisane”* tworzy sesję wyłącznie z unikalnych zadań.
- **Bank Błędów:** zadanie trafia automatycznie po błędnej odpowiedzi (także w egzaminie), z licznikiem `correctStreak`. Znika po **2 poprawnych z rzędu w trybie powtórki**; błąd zeruje `correctStreak`.
- **Limity:** max **200** wpisów w Zapisanych i **200** w Banku Błędów, polityka FIFO (najstarsze `savedAt`/`lastMistakeAt` wypada pierwsze) z jednorazowym toastem przy przekroczeniu.
- **Puste stany:** brak wpisów -> ilustracja + tekst „Nic tu jeszcze nie ma” + CTA „Zapisz pierwsze zadanie w lekcji”.

### 7.4. AI Tutor (Symulowany w Fazie 1)
- **Podpowiedzi Sokratyczne (3 poziomy):** Poziom 1 (naprowadzenie) -> Poziom 2 (zasada/wzór) -> Poziom 3 (pierwszy krok bez gotowego wyniku). Każde żądanie podpowiedzi obniża maksymalny XP zadania o 33% (zaokrąglane w dół: `1` podpowiedź = `floor(baseXP * 0.67)`, `2` = `floor(baseXP * 0.34)`, `3` = `max(1, floor(baseXP * 0.01))`; zawsze **min. 1 XP** za poprawną odpowiedź).
- **Ocena zadania otwartego (deterministyczna heurystyka, bez LLM, sprawdzana w podanej kolejności):**
  1. normalizacja tekstu (trim, lowercase, bez interpunkcji, bez polskich znaków diakrytycznych),
  2. odpowiedź pusta -> **0/2 pkt**,
  3. wyjątek `resultOnly: true` (zadanie jawnie wymaga tylko wyniku): jeśli znormalizowana odpowiedź pasuje do oczekiwanego wyniku -> **2/2 pkt** (niezależnie od długości),
  4. odpowiedź składająca się wyłącznie z liczby/wyniku (np. `12`) przy `resultOnly: false` -> **1/2 pkt** (brak rozumowania; priorytet przed regułą długości `< 20`),
  5. długość znormalizowanego tekstu `< 20` znaków -> **0/2 pkt**,
  6. długość `>= 40` znaków **i** co najmniej 2 słowa kluczowe z rubryki zadania -> **2/2 pkt**,
  7. każdy inny przypadek (w tym długość `20–39` znaków lub `>= 40` znaków z `< 2` słowami kluczowymi) -> **1/2 pkt**.
- **UI:** karta wyniku ma stałą etykietę **„Ocena symulowana (Faza 1)”**; opóźnienie 700 ms jest sztuczne i sterowane stałą `MOCK_AI_LATENCY_MS`.
- **Testy:** `aiTutorMock.test.ts` pokrywa: pustą odpowiedź, odpowiedź 19 znaków, granice dokładnie 20 i 40 znaków, odpowiedź bez słów kluczowych, odpowiedź z samym wynikiem (`resultOnly: false` vs `resultOnly: true`), odpowiedź pełną.

### 7.5. Egzamin / Mini-Arkusz E8
- Dwa tryby: **Mini-arkusz testowy (5 zadań, 15 min)** i **Próbny Arkusz E8**.
- W trakcie egzaminu: timer, siatka numerów pytań (odpowiedziane / pominięte / zapisane do powtórki), brak podpowiedzi AI, **brak utraty serc**, szczegółowe podsumowanie na końcu.
- **Timer odporny na tło (Page Visibility):** stan trzyma `startedAt` (epoch ms) i `deadline = startedAt + durationMs`. Pozostały czas liczy się zawsze jako `deadline - Date.now()`, nigdy przez zliczanie ticków `setInterval`. Po powrocie z tła timer natychmiast się synchronizuje. Po przekroczeniu `deadline` następuje **auto-submit** z odpowiedziami zapisanymi do tej chwili. Ostrzeżenie UI przy 60 s. Brak pauzy; wyjście z egzaminu wymaga potwierdzenia („Przerwiesz próbę — odpowiedzi zostaną utracone”).
- Po restarcie aplikacji nieukończona próba jest w całości odrzucana (Faza 1) — ocenianie w egzaminie zachodzi zbiorczo dopiero przy oddaniu (submit / auto-submit), więc żadne pytania z przerwanej próby nie trafiają do Banku Błędów i nie są przyznawane XP ani monety.

### 7.6. Ekonomia i Grywalizacja

Wariant skrócony | Wartość (robocza)
---|---
Start konta | 120 monet, 5/5 serc, ranga Nowicjusz E8
Nagroda: ukończona lekcja | 20 monet
Nagroda: mini-arkusz | 40 monet
Nagroda: próbny egzamin E8 | 80 monet
Nagroda: wyzwanie dzienne | 15 monet
Bonus za 7 dni serii | 50 monet za każdą wielokrotność 7 dni ciągłej serii (7, 14, 21, ...), jednorazowo na próg (`streakMilestone + playerDay`)
Tarcza Serii (Streak Shield) | 100 monet, max 2 w zapasie, chroni 1 pominięty dzień
Misja Ratunkowa — wariant darmowy | 2 poprawne zadania z Banku Błędów/Zapisanych = +1 serce, max 3 razy dziennie
Misja Ratunkowa — wariant płatny | 60 monet = +1 serce, bez limitu dziennego
Regeneracja serc | +1 serce co 30 min, max 5, także offline (liczone z `lastHeartRefillAt`)
Utrata serca | tylko błąd w lekcji lub powtórce; egzamin nie zabiera serc
XP: ABCD / Prawda-Fałsz | 10 XP
XP: wpisanie odpowiedzi | 15 XP
XP: zadanie otwarte | 25 XP

**Serca — pełna reguła:** błąd w lekcji lub powtórce odejmuje 1 serce (min. 0). Przy 0 serc przycisk „Rozpocznij lekcję” jest zablokowany z wyjaśnieniem i dwiema akcjami: **Misja Ratunkowa** i **Sklep**. Gdy w Banku Błędów i Zapisanych nie ma zadań, dostępna jest tylko regeneracja czasowa lub zakup za monety. **Nigdy paywall blokujący naukę:** po 0 monet i 0 zadaniach uczeń nadal ma dostęp do teorii Bento i wzorów.

**Tarcza Serii (nazwa UI: „Tarcza Serii”, id techniczne: `streakShield`):** przy pominięciu `N` kolejnych dni (np. 1 lub 2 dni) i posiadaniu co najmniej `N` Tarcz w zapasie zużywa się dokładnie `N` Tarcz, a seria pozostaje nietknięta. Jeśli liczba Tarcz `< N`, Tarcze nie wystarczą do pokrycia luki — Tarcze nie są zużywane, a seria zeruje się do 0. Zakup tylko z monet zdobytych w grze.

**Combo — tabela mnożnika:**

Poprawne z rzędu (włącznie z bieżącą) | Mnożnik XP
---|---
1-2 | x1.0
3-4 | x1.5
5-7 | x2.0
8+ | x3.0

Combo rośnie wyłącznie od poprawnej odpowiedzi; mnożnik wyznacza się po inkrementacji licznika (tzn. 3. poprawna odpowiedź dostaje już **x1.5**, 5. dostaje **x2.0**, 8. dostaje **x3.0**). Błąd natychmiast resetuje mnożnik do **x1.0** (i zabiera serce w lekcji/powtórce; w egzaminie resetuje combo **bez** utraty serca). Combo wygasa po **90 s** bez odpowiedzi albo po wyjściu z sesji. Mnożnik nie przenosi się między sesjami ani przedmiotami. XP naliczane jest jako `baseXP * multiplier`, zaokrąglone w dół.

**Rangi E8 — progi XP:**

Ranga | Próg XP
---|---
Nowicjusz E8 | 0
Tropiciel | 500
Taktyk | 1500
Mistrz E8 | 3500
Legenda E8 | 7000

Każda ranga ma ikonę Lucide (kolejno: `Sprout`, `Compass`, `Swords`, `Crown`, `Flame`) i własny kolor akcentu; awans pokazuje modal z konfetti i jest jednorazowy (idempotencja po `rankId`).

**Zadania Dzienne (w tym Codzienny Sprint):** dokładnie **3 wyzwania na dzień**, wybierane **deterministycznie** z puli seedem `hash(playerDay + ':' + subjectId)` — ten sam gracz i ten sam dzień dają ten sam zestaw, także po odświeżeniu. Nagroda jednorazowa, idempotencja po `challengeId + playerDay`. „Codzienny Sprint” to zestaw 5 zadań na czas bez błędu; nie jest osobnym trybem gry, tylko jednym z wyzwań.

### 7.7. Dzień Gracza (strefa czasowa) i Seria

- **Dzień gracza** = data kalendarzowa w **Europe/Warsaw**, wyliczana z zegara urządzenia przez `Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)` i składana jawnie do `YYYY-MM-DD`, zapisywana w stanie jako `playerDay`.
- Z tej samej daty korzystają: licznik serii, seed zadań dziennych, idempotencja nagród i reset wyzwań. Jedno źródło prawdy, brak równoległego liczenia w UTC.
- **Zaliczenie dnia (warunek serii):** ukończenie co najmniej **1 lekcji Bento** albo **1 mini-arkusza/egzaminu** w danym dniu gracza. Otwarcie aplikacji, pojedyncza odpowiedź i wejście w Profil **nie** zaliczają dnia.
- Seria startuje od **1** po pierwszym zaliczonym dniu. Kolejny zaliczony dzień z rzędu -> +1. Pominięty dzień -> 0, chyba że zużyje się Tarcza Serii.
- **DST i zmiana strefy:** przejście na czas letni/zimowy ani zmiana strefy urządzenia w trakcie dnia nie resetuje serii — porównywane są wyłącznie stringi `playerDay`, a przewinięcie dnia oceniane jest przy starcie aplikacji i przy `visibilitychange`.
- Seria jest **globalna** (wspólna dla 3 przedmiotów); postęp lekcji jest per przedmiot. Zmiana przedmiotu w trakcie sesji wymaga potwierdzenia i nie kasuje postępu bieżącej lekcji.

### 7.8. Stan Lokalny (`localStorage`) — schemat i migracja

- Klucz: `jasne-e8-app:state`, obiekt z `schemaVersion: 1`.
- **Odczyt:** `try/catch` + walidacja kształtu (np. `zod` lub ręczne guardy). Uszkodzony JSON lub niezgodny kształt -> reset do stanu początkowego + toast „Nie udało się wczytać postępu — zaczynamy od nowa”. Aplikacja nigdy nie może się wywrócić z powodu stanu.
- **Migracja:** mapa `migrations: Record<number, (old) => new>` uruchamiana po kolei w przód. Brak ścieżki migracji -> reset z ostrzeżeniem (nie próbujemy zgadywać).
- **Limit rozmiaru:** miękki próg 3 MB. Po przekroczeniu: FIFO na Zapisanych i Banku Błędów, potem kompresja pól opcjonalnych. Twardy limit przeglądarki -> zapis kończy się `QuotaExceededError`, aplikacja pokazuje toast i działa dalej w pamięci sesji.
- **Zapis:** debounce 300 ms, tylko po zmianie istotnych pól; zapis synchroniczny w `try/catch`.
- **Testy:** uszkodzony JSON, brak klucza, `schemaVersion` z przyszłości, przekroczenie limitu, migracja 0 -> 1.

### 7.9. Mobile, Dostępność i Klawiatury

- **Cele dotykowe:** min. **44x44 px** dla każdego elementu interaktywnego, także ikon w HUD.
- **Safe area:** Bottom Tab Bar ma `padding-bottom: max(12px, env(safe-area-inset-bottom))`; treść przewijana ma `padding-bottom` równy wysokości paska + safe area.
- **HUD:** maks. 56 px wysokości, `position: sticky`, `z-index: 20`; modalne bottom-sheety `z-index: 100`, toast `z-index: 200`.
- **Klawiatura matematyczna:** pole zadania matematycznego ma `inputmode="none"` przy aktywnej `SmartMathKeyboard`, z przełącznikiem „Klawiatura systemowa” (`inputmode="text"`). Fokus pola wywołuje `scrollIntoView({ block: 'center' })`, żeby klawiatura nie zasłaniała pola ani przycisku „Sprawdź”.
- **Pozostałe pola:** `inputmode="text"`; odpowiedzi liczbowe w zadaniach nie-matematycznych `inputmode="decimal"`.
- **Kontrast:** wymagany pomiar WCAG AA (4,5:1 dla tekstu, 3:1 dla dużych napisów i elementów UI) w obu motywach. W motywie Solar akcent `#D97706` służy wyłącznie jako wypełnienie/wskaźnik; tekst akcentowy używa `#B45309`. Makieta nie jest dowodem — pomiar robi test automatyczny (`axe-core` lub własny `contrast.test.ts`).
- **Orientacja:** aplikacja projektowana w portrait 360-430 px; landscape (844x390) musi działać bez poziomego overflow i bez zasłoniętego HUD, choć nie jest zoptymalizowany.
- **`prefers-reduced-motion: reduce`:** wyłącza cząsteczki, konfetti, sprężyste podskoki i wstrząsy; zostają natychmiastowe zmiany stanu i proste przejścia `opacity` <= 100 ms.

### 7.10. Offline

Faza 1 działa w pełni offline dla zapisanego stanu: brak sieci nie blokuje lekcji, powtórek, egzaminu ani AI Tutora (mock jest lokalny). Komunikat o braku sieci pojawia się tylko przy funkcji wymagającej backendu — w Fazie 1 takiej nie ma. Service worker nie jest częścią Fazy 1.

---

## 8. Strategia Testów i Granice

- **Testy jednostkowe (Vitest):** `gamification.test.ts` (XP, Combo, Rangi, Monety, Tarcza Serii, seed zadań dziennych per `playerDay`), `heartsManager.test.ts` (utrata, regeneracja offline, 0 serc), `savedTasks.test.ts` (deduplikacja, FIFO), `aiTutorMock.test.ts` (progi oceny), `storageRepo.test.ts` (uszkodzony JSON, migracja, limit).
- **Testy UI (Playwright / Testing Library):** brak poziomego overflow na `390x844` i `844x390`, przełączanie motywów Dark/Light, zapis zadania do powtórki, brak animacji przy `reduced-motion`, timer po powrocie z tła.
- **Typecheck:** `npm run typecheck` uruchamia `tsc --noEmit`. `npm run lint` uruchamia ESLint (`eslint .`) — nie mylić obu.
- **Never:** nie wrzucać sekretów do klienta, nie blokować nauki paywallem, nie dodawać ciężkich baz zadań przed zatwierdzeniem mechanik.

---

## 9. Kryteria Akceptacji Fazy 1 (Given / When / Then)

### 9.1. Seria i dzień gracza
- **AC-S1:** Given uczeń ukończył >=1 lekcję w dniu D i >=1 lekcję w dniu D+1 (Europe/Warsaw), When otworzy Start, Then widzi serię `2`.
- **AC-S2:** Given seria `3` i brak aktywności w dniu D+2, When otworzy aplikację w D+3, Then seria wynosi `0`.
- **AC-S3:** Given seria `3` i 1 aktywna Tarcza Serii, brak aktywności w D+2, When otworzy aplikację w D+3, Then seria nadal `3`, a Tarcza ma stan `0`.
- **AC-S4:** Given zmiana strefy urządzenia z Europe/Warsaw na UTC w trakcie dnia, When uczeń ukończy lekcję, Then `playerDay` nie zmienia się i seria nie resetuje.
- **AC-S5:** Given tylko otwarcie aplikacji bez ukończonej lekcji, When mija północ, Then seria nie rośnie.
- **AC-S6:** Given seria `3` i 2 aktywne Tarcze Serii, brak aktywności w dniach D+2 oraz D+3, When otworzy aplikację w D+4, Then seria nadal `3`, a zapas Tarcz wynosi `0` (zużyto 2 Tarcze).
- **AC-S7:** Given seria `6`, When uczeń zaliczy 7. dzień serii z rzędu, Then otrzymuje jednorazowy bonus `+50 monet` (idempotencja po `streakMilestone + playerDay`), a kolejny bonus przysługuje dopiero przy 14. dniu ciągłej serii.

### 9.2. Serca, monety, Tarcza
- **AC-H1:** Given 3 serca, When uczeń odpowie błędnie w lekcji, Then serca = 2, combo = x1.0.
- **AC-H2:** Given 0 serc, When uczeń próbuje rozpocząć lekcję, Then przycisk „Rozpocznij lekcję” jest zablokowany, a widoczne są akcje „Misja Ratunkowa” i „Sklep”.
- **AC-H3:** Given 0 serc, 0 monet i puste Bank/Zapisane, When uczeń otworzy blokadę, Then dostępna jest tylko regeneracja czasowa; teoria Bento i wzory pozostają dostępne.
- **AC-H4:** Given 2 poprawne zadania z Banku w Misji Ratunkowej, When ukończy misję, Then serca +1 (max 5), licznik dzienny misji +1.
- **AC-H5:** Given `lastHeartRefillAt` sprzed 90 min i 2 serca, When aplikacja startuje, Then serca = 5 (3 regeneracje), a nadmiar czasu nie kumuluje się ponad max.
- **AC-H6:** Given 100 monet i 1 Tarcza, When uczeń kupi drugą, Then monety = 0, zapas = 2. Given zapas = 2, When próbuje kupić trzecią, Then przycisk nieaktywny z informacją o limicie.
- **AC-H7:** Given 0 serc i 3 ukończone darmowe Misje Ratunkowe w bieżącym `playerDay`, When uczeń otwiera modal Misji Ratunkowej, Then wariant darmowy jest zablokowany do następnego dnia, a nadal dostępny jest wariant płatny (60 monet).
- **AC-H8:** Given 2 serca, 120 monet i wyczerpany dzienny limit 3 darmowych misji, When uczeń wybierze wariant płatny Misji Ratunkowej (60 monet), Then monety = 60, serca = 3 (brak limitu dziennego dla wariantu płatnego).

### 9.3. Combo i XP
- **AC-C1:** Given 2 poprawne odpowiedzi z rzędu (x1.0), When uczeń udzieli 3. poprawnej odpowiedzi z rzędu, Then już ta 3. odpowiedź nalicza XP z mnożnikiem x1.5.
- **AC-C2:** Given 7 poprawnych odpowiedzi z rzędu (x2.0), When uczeń udzieli 8. poprawnej odpowiedzi z rzędu, Then już ta 8. odpowiedź nalicza XP z mnożnikiem x3.0.
- **AC-C3:** Given combo x2.0, When odpowiedź jest błędna w lekcji, Then combo = x1.0, serca -1, a kolejna poprawna odpowiedź startuje od x1.0.
- **AC-C4:** Given combo x2.0, When odpowiedź jest błędna w egzaminie, Then combo = x1.0, a serca pozostają bez zmian.
- **AC-C5:** Given brak odpowiedzi przez 90 s, When uczeń wraca do zadania, Then combo = x1.0.
- **AC-C6:** Given 3499 XP (ranga Taktyk), When uczeń zdobędzie 1 XP, Then osiąga 3500 XP, ranga zmienia się na Mistrz E8, a modal awansu pokazuje się dokładnie raz.
- **AC-C7:** Given 4 poprawne odpowiedzi z rzędu (x1.5), When uczeń udzieli 5. poprawnej odpowiedzi z rzędu, Then już ta 5. odpowiedź nalicza XP z mnożnikiem x2.0.
- **AC-C8:** Given zadanie za 15 XP bazowego (combo x1.0), When uczeń użyje 1 podpowiedzi AI Tutora i odpowie poprawnie, Then dostaje `floor(15 * 0.67) = 10 XP`; po 3 podpowiedziach dostaje `min. 1 XP`.

### 9.4. Zapisane zadania i Bank Błędów
- **AC-V1:** Given zadanie `t1` już zapisane, When uczeń zapisze je ponownie, Then liczba wpisów nie rośnie, `savedAt` się aktualizuje, pojawia się toast „Już zapisane”.
- **AC-V2:** Given 200 zapisanych zadań, When uczeń zapisze 201., Then najstarszy wpis wypada (FIFO), a rozmiar listy = 200.
- **AC-V3:** Given zadanie w Banku z `correctStreak = 1`, When uczeń rozwiąże je poprawnie, Then znika z Banku.
- **AC-V4:** Given `correctStreak = 1`, When uczeń popełni błąd, Then `correctStreak = 0` i zadanie zostaje w Banku.
- **AC-V5:** Given dane sprzed migracji lub uszkodzony stan zawierający duplikaty klucza `taskId + subjectId`, When startuje tryb „Rozwiąż zapisane”, Then selektor sesji deduplikuje listę i zawiera wyłącznie unikalne zadania (`taskId + subjectId`).
- **AC-V6:** Given 200 wpisów w Banku Błędów, When uczeń popełni błąd w 201. unikalnym zadaniu, Then najstarszy wpis (wg `lastMistakeAt`) wypada (FIFO), rozmiar Banku = 200 i pojawia się jednorazowy toast.

### 9.5. Wyzwania dzienne
- **AC-D1:** Given ten sam `playerDay`, When uczeń odświeży aplikację, Then zestaw 3 wyzwań jest identyczny.
- **AC-D2:** Given ukończone wyzwanie, When uczeń odświeży aplikację, Then nagroda nie nalicza się ponownie (idempotencja `challengeId + playerDay`).
- **AC-D3:** Given nowy `playerDay`, When uczeń otworzy Start, Then widzi nowy zestaw 3 wyzwań, a poprzedni stan wyzwań zostaje nadpisany (brak archiwum w Fazie 1).

### 9.6. AI Tutor (mock)
- **AC-A1:** Given odpowiedź `""`, When ocena, Then `0/2`.
- **AC-A2:** Given odpowiedź 19 znaków z 3 słowami kluczowymi (`resultOnly: false`), When ocena, Then `0/2`.
- **AC-A3:** Given odpowiedź 60 znaków z 2 słowami kluczowymi, When ocena, Then `2/2`.
- **AC-A4:** Given odpowiedź `"12"` (`resultOnly: false`), When ocena, Then `1/2`.
- **AC-A5:** Given każda ocena, Then UI zawiera etykietę „Ocena symulowana (Faza 1)”.
- **AC-A6:** Given znormalizowana odpowiedź dokładnie 20 znaków (bez słów kluczowych) lub 39 znaków (z 2 słowami kluczowymi), When ocena, Then `1/2`.
- **AC-A7:** Given znormalizowana odpowiedź dokładnie 40 znaków z 2 słowami kluczowymi z rubryki, When ocena, Then `2/2`.
- **AC-A8:** Given zadanie z `resultOnly: true` i oczekiwanym wynikiem `"12"`, When uczeń wpisze `"12"`, Then ocena = `2/2`.

### 9.7. Egzamin i timer
- **AC-E1:** Given start mini-arkusza, When mija 15 min, Then następuje auto-submit, a odpowiedzi sprzed deadline są zaliczone.
- **AC-E2:** Given 5 min na timerze, When uczeń przełączy kartę na 10 min i wróci, Then pozostały czas = 0 i nastąpił auto-submit.
- **AC-E3:** Given egzamin, When uczeń odpowie błędnie, Then serca bez zmian, combo x1.0.
- **AC-E4:** Given egzamin, When uczeń próbuje wyjść, Then pojawia się potwierdzenie przerwania próby.
- **AC-E5:** Given nieukończona próba egzaminu z 3 zapisanymi odpowiedziami przed oddaniem, When nastąpi restart aplikacji, Then próba jest odrzucana, do Banku Błędów nie trafiają żadne wpisy i nie są przyznawane XP ani monety.

### 9.8. Stan, mobile, motywy
- **AC-M1:** Given uszkodzony JSON w `localStorage`, When aplikacja startuje, Then stan = początkowy, toast o resecie, brak białego ekranu.
- **AC-M2:** Given `schemaVersion` z przyszłości, When start, Then reset z ostrzeżeniem (bez próby migracji w tył).
- **AC-M3:** Given 360/390/430 px i 844x390, When przeglądasz oba motywy, Then brak poziomego overflow i HUD nie zasłania treści.
- **AC-M4:** Given aktywna klawiatura systemowa na mobile, When pole jest fokusowane, Then pole i przycisk „Sprawdź” są widoczne.
- **AC-M5:** Given `prefers-reduced-motion: reduce`, When uczeń odpowiada, Then brak cząsteczek, konfetti i wstrząsów.
- **AC-M6:** Given motyw Solar, When mierzysz kontrast (test automatyczny), Then zwykły tekst (w tym tekst akcentowy `#B45309`) ma >= 4,5:1, a duże napisy i elementy UI (w tym wypełnienie `#D97706`) mają >= 3:1.
- **AC-M7:** Given każdy element interaktywny, When mierzysz, Then obszar dotyku >= 44x44 px.
- **AC-M8:** Given zapis stanu > 3 MB lub `QuotaExceededError` z `localStorage`, When aplikacja zapisuje stan, Then przy >3 MB przycina najstarsze wpisy FIFO (Zapisane/Bank), a przy `QuotaExceededError` pokazuje toast ostrzegawczy i kontynuuje działanie w pamięci sesji bez crashu.
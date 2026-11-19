# JASNE E8 — Kompletna Specyfikacja Produktowa, Wizualna, Animacyjna i Techniczna (Master Spec pod Google AI Studio)

**Wersja dokumentu:** 1.2 (Master Spec — Faza 1: Prototyp Mechanik, UI/UX i Animacji; po pełnym przeglądzie QA: reguły brzegowe, księga nagród, runner powtórek, zestaw `AC-*`; runda 1.2 domyka 5 drobnych sprzeczności wskazanych w rechecku)  
**Data:** 2026-11-19  
**Docelowe narzędzie wdrożeniowe:** Google AI Studio (Build / React + TypeScript + Tailwind CSS + Framer Motion)  
**Status backendu w Fazie 1:** 100% lokalny (mock data + warstwa repozytoriów na `localStorage`), **architektura w pełni przygotowana pod bezbolesne podpięcie Firebase Auth, Cloud Firestore oraz backendowego AI Tutora w Fazie 2**.

---

## 1. Wizja Produktu, Odbiorca i Filozofia Projektu

### 1.1. Czym jest JASNE E8?
**JASNE E8** to nowoczesna, **mobile-first** aplikacja edukacyjno-gamingowa przygotowująca uczniów 7. i 8. klasy szkoły podstawowej (wiek 13–14 lat) do **Egzaminu Ósmoklasisty (E8)** z trzech obowiązkowych przedmiotów:
1. **Matematyka E8** *(główny, w pełni interaktywny przedmiot demonstracyjny w Fazie 1)*,
2. **Język Polski E8** *(obecny w architekturze, nawigacji i profilu; makieta ścieżki „Wkrótce” w Fazie 1)*,
3. **Język Angielski E8** *(obecny w architekturze, nawigacji i profilu; makieta ścieżki „Wkrótce” w Fazie 1)*.

Celem Fazy 1 **nie jest** wprowadzanie setek zadań egzaminacyjnych, lecz zbudowanie **aplikacji klasy światowej pod względem UX, dotykowego interfejsu, responsywności mobilnej, mikro-animacji, dźwięku i spójnych mechanik grywalizacji**. Na ten szkielet w kolejnych fazach zostanie nałożona baza zadań oraz chmura Firebase.

### 1.2. Rdzeń doświadczenia użytkownika (Core Loop)
Aplikacja projektowana jest w duchu **mikronauki 4–6 minut** i natychmiastowej satysfakcji:
1. **Zero tarcia na wejściu (Guest-First):** uczeń nie musi zakładać konta ani podawać maila. Przechodzi przez efektowny, krótki onboarding prowadzony przez animowaną maskotkę **Lumi**, odbiera startowy pakiet zasobów i od razu wchodzi do gry.
2. **Krótka pętla nauki:** otwiera moduł na mapie działów -> przegląda 4 szybkie karty teorii **Bento** -> rozwiązuje 5 zadań z rosnącym **Combo**, cząsteczkami **XP**, dotykowymi kartami 3D i wsparciem symulowanego **AI Tutora** -> odbiera **XP**, **Monety** i postęp w **Wyzwanich Dziennych**.
3. **Pętla powrotu (Retencja):** zdobyte monety mają realną wartość — uczeń personalizuje swoją maskotkę Lumi i profil w **Sklepie Kosmetyków** albo zbiera na bardzo cenną **Tarczę Serii**. Błędy wpadają automatycznie do **Banku Błędów**, trudniejsze zadania można jednym kliknięciem zapisać do **Powtórek**, a utracone serca można zawsze odzyskać nauką w **Misji Ratunkowej** (zero paywalla blokującego naukę).

### 1.3. Żelazne ograniczenia Fazy 1 (Czego NIE budować)
- **Brak brudnopisu (`CkeScratchpad`):** funkcja rysowania/brudnopisu jest całkowicie usunięta. W jej miejscu w każdym zadaniu znajduje się przycisk **„Zapisz do powtórki”**.
- **Brak Areny (`ArenaView`):** tryb PvP/Arena jest całkowicie wyłączony w Fazie 1 — nie dodawać zakładki ani przycisków „Arena”.
- **Brak panelu „Wzory E8” w Polskim i Angielskim:** przycisk/szuflada **„Wzory E8”** jest widoczna **wyłącznie** dla przedmiotu **Matematyka**. Po przełączeniu na Język Polski lub Język Angielski zakładka „Wzory” znika, a na jej miejscu pojawia się opcjonalny slot zapowiedzi kontekstowej (opisany w sekcji 6.6).
- **Brak prawdziwego Firebase i zewnętrznych wywołań API:** aplikacja musi działać 100% lokalnie i offline bez kluczy API, ale wszystkie operacje na danych przechodzą przez czyste interfejsy serwisów/repozytoriów (gotowe na podmianę na Firebase w Fazie 2).
- **Zero AI-slopu:** zakaz generycznych fioletowo-różowych gradientów na całym tle, zakaz nadużywania ikony `Sparkles` w każdym nagłówku, zakaz nieczytelnych szklanych kart z niskim kontrastem, zakaz nieklikających się makiet typu `alert("Coming soon")` (wszystkie stany „Wkrótce” muszą być zaprojektowane estetycznie i konsekwentnie).

---

## 2. System Wizualny „Tactile 3D Gaming” & Dual-Theme (Nocturne Dark + Solar Light)

### 2.1. Kierunek estetyczny: Tactile 3D Gaming (Duolingo-meets-Modern-Arcade)
Interfejs łączy **przyjemną dotykowość 3D znaną z najlepszych aplikacji edukacyjnych (styl Duolingo)** z **nowoczesnym, dojrzalszym sznytem gamingowym dla 13–14-latka** (inspirowanym Brilliant, Discordem i nowoczesnym e-sportem — bez infantylności i bez chaosu):
- **Przyciski i karty 3D (Tactile Press):** główne przyciski CTA, karty odpowiedzi ABCD, kafelki wyzwań i elementy sklepu mają wyraźną, twardą dolną krawędź 3D (`border-2` + `border-b-[5px]` lub `shadow-[0_5px_0_0_var(--btn-edge)]`). W momencie naciśnięcia (`active` / `whileTap`) przycisk **fizycznie zapada się w dół** o `4px` (`translateY(4px)`), a jego dolna krawędź skraca się do `1px` — dając natychmiastowe wrażenie wciśnięcia mechanicznego klawisza.
- **Wyraźna geometria i hierarchia:** zaokrąglone narożniki (`rounded-2xl` dla kart i przycisków, `rounded-3xl` dla modali i bottom-sheetów, `rounded-full` dla pigułek Combo i badge'y). Wyraźne obramowania zamiast rozmytych, brudnych cieni.
- **Spójne kolory akcentowe per przedmiot (Subject Identity):**
  - **Matematyka:** Bursztynowe Złoto (Solar Amber — energia, jasność, fokus),
  - **Język Polski:** Ciepły Koral / Rubin (literatura, ekspresja),
  - **Język Angielski:** Żywy Szmaragd / Cyjan (świeżość, komunikacja).
- **Dual-Theme od startu (równorzędna jakość obu motywów):** przełącznik motywu (`Nocturne Dark` / `Solar Light`) dostępny w Profilu (oraz szybka ikona w desktopowym sidebarze), oparty w 100% na zmiennych CSS w `:root` oraz `[data-theme="light"]` / `.dark`.

### 2.2. Paleta kolorów i kontrast WCAG AA (Tokeny CSS)

| Rola tokenu | Nocturne Gaming (Dark — domyślny) | Solar Gaming (Light) | Zasada użycia i kontrast |
|---|---|---|---|
| `--bg-canvas` | `#080C16` | `#F4F6FB` | Główne tło aplikacji; subtelny radialny blask w rogu (`opacity 0.06`) |
| `--bg-surface` | `#11192B` | `#FFFFFF` | Karty zadań, kafelki Bento, panele statystyk |
| `--bg-elevated` | `#19243D` | `#F8FAFC` | Wyróżnione kasetony, aktywne pola, dropdowny |
| `--border-subtle` | `#24324E` | `#DCE3F0` | Obramowanie kart (`border-2`) |
| `--border-3d-edge` | `#050811` | `#CBD5E1` | Twarda dolna krawędź 3D kart i przycisków drugorzędnych |
| `--text-primary` | `#F8FAFC` | `#0F172A` | Nagłówki, treść zadań (kontrast > 14:1) |
| `--text-secondary` | `#94A3B8` | `#475569` | Opisy, podtytuły, etykiety pomocnicze (kontrast > 5.5:1) |
| `--accent-primary` | `#FFB800` | `#D97706` | Wypełnienia przycisków CTA, paski postępu, ikony (kontrast UI ≥ 3:1) |
| `--accent-primary-edge` | `#B45309` | `#92400E` | Dolna krawędź 3D głównego przycisku CTA |
| `--on-accent` | `#080C16` | `#0F172A` | **Kolor tekstu i ikon NA wypełnieniu akcentu** (`--accent-primary`). Biały tekst jest zabroniony: na `#FFB800` daje 1,73:1, na `#D97706` 3,19:1. Ciemny `#080C16` na `#FFB800` ≈ 11,0:1, `#0F172A` na `#D97706` ≈ 5,66:1 -> WCAG AA |
| `--accent-text` | `#FFC933` | `#B45309` | **Tekst akcentowy** na powierzchni karty (w Solar `#B45309` na `#FFFFFF` ma kontrast ~5.0:1 -> pełne WCAG AA 4.5:1!) |
| `--success` / edge | `#10B981` / `#047857` | `#059669` / `#065F46` | Poprawna odpowiedź, zaliczone wyzwanie, odblokowana lekcja |
| `--danger` / edge | `#F43F5E` / `#BE123C` | `#E11D48` / `#9F1239` | Błędna odpowiedź, utrata serca, ostrzeżenie timera < 60 s |
| `--info` / edge | `#38BDF8` / `#0284C7` | `#0284C7` / `#0369A1` | Tarcza Serii (lodowy błękit), AI Tutor, badge CKE |
| `--combo-fire` | `#F97316` | `#EA580C` | Combo x2.0 / x3.0, płomień serii |
| `--rarity-epic` | `#A855F7` | `#7E22CE` | Wyłącznie etykiety rzadkości przedmiotów Epickich w Sklepie |

> **Ważna reguła kontrastu w trybie Solar (Light):** kolor `#D97706` służy wyłącznie jako wypełnienie/ikona/obramowanie (spełnia 3:1 dla UI i dużego tekstu). Wszelki zwykły tekst w kolorze akcentowym w trybie jasnym MUSI używać tokenu `--accent-text` (`#B45309`, kontrast ok. 5,0:1 na białym).

> **Twarde reguły dla etykiet na kolorowych wypełnieniach (oba motywy):**
> 1. Tekst i ikony na tle `--accent-primary` używają **wyłącznie** `--on-accent` (`#080C16` w Dark, `#0F172A` w Light). Biały tekst na jakimkolwiek akcencie jest błędem implementacyjnym.
> 2. Ta sama zasada dotyczy wypełnień `--success`, `--danger`, `--info`, `--combo-fire`: etykieta zawsze ciemna (`#080C16`) lub biała, wyłącznie gdy zmierzony kontrast ≥ 4,5:1. Przykład poprawny: `#F8FAFC` na `#047857` ≈ 5,4:1.
> 3. Etykiety na przyciskach drugorzędnych (tło `--bg-elevated`, obramowanie `--border-subtle`) używają `--text-primary`.

> **Reguła świateł i poświat (obowiązuje w całym produkcie):** dozwolony jest **wyłącznie statyczny** radialny blask tła (`opacity ≤ 0.06`) oraz statyczna aura wektorowa maskotki (`opacity ≤ 0.15`, rysowana w SVG). **Zakaz animowanego `box-shadow`/`drop-shadow`/`filter: blur` w pętli** (czyli animowanego „glow”). Dozwolone jest natomiast animowanie `opacity`, `scale` oraz `border-color` **istniejącego** elementu — dlatego puls Combo (4.2 #5) realizujemy jako zmianę `opacity` statycznego obrysu `border`, a nie jako rozmyty cień. Reguła dotyczy obu motywów i wszystkich 14 animacji z sekcji 4.

### 2.3. Typografia
- **Nagłówki i liczby gamingowe (Display):** `Plus Jakarta Sans` lub `Outfit` (wagi `700`, `800`, `900`, `tracking-tight`, `tabular-nums` dla wszystkich liczników XP, monet, timera i Combo!).
- **Treść zadań i UI (Body):** `Inter` (wagi `400`, `500`, `600`, czytelny interlinia `1.5`, minimum `15px–16px` dla treści zadań na mobile).
- **Wzory matematyczne:** `KaTeX` (z polskim przecinkiem dziesiętnym w zapisie `$7{,}5$`, automatyczną obsługą horyzontalnego scrollu długich wzorów z subtelną maską wygaszania na prawej krawędzi, zero surowego LaTeXa widocznego dla ucznia).
- **Zasoby offline (bezwzględne):** aplikacja nie może pobierać niczego z sieci przy pierwszym uruchomieniu.
  - CSS KaTeX importowany z pakietu: `import 'katex/dist/katex.min.css'` (nigdy z CDN). Fonty KaTeX ładowane przez Vite z `node_modules/katex/dist/fonts`.
  - Fonty UI przez `@fontsource/plus-jakarta-sans` i `@fontsource/inter` (import wag w `main.tsx`) **albo** stack systemowy: `font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`. Zakaz `<link href="https://fonts.googleapis.com/...">`.
  - Ikony wyłącznie z `lucide-react` (importowane jako komponenty), zero ikon z zewnętrznych URL. Wszystkie obrazy to inline SVG lub dane w repo.

### 2.4. Układ responsywny: Mobile-First z dopracowanym Desktopem
- **Mobile (`360px – 1023px`, punkt odniesienia `390×844`):**
  - Górny **Top HUD** (`height: 56px`, `position: sticky`, `top: 0`, `z-index: 20`), zero poziomego przepełnienia (`0px overflow`).
  - Główna kolumna treści z marginesem bocznym `16px` oraz dolnym paddingiem równym wysokości Bottom Tab Bar + `env(safe-area-inset-bottom)` + `24px`, aby dolny pasek nigdy nie zasłaniał przycisku „Sprawdź”.
  - Dolny **Bottom Tab Bar** (`position: fixed`, `bottom: 0`, `z-index: 30`, `padding-bottom: max(10px, env(safe-area-inset-bottom))`) z **5 zakładkami** w strefie kciuka: `Start`, `Nauka`, `Powtórki`, `Egzamin`, `Profil`.
- **Desktop (`≥ 1024px`):**
  - Dolny pasek zamienia się płynnie w elegancki **lewy panel nawigacyjny (Sidebar o szerokości `248px`)** z logo **JASNE E8**, przełącznikiem przedmiotów, 5 pozycjami menu z dotykowymi kapsułkami i szybkim przełącznikiem motywu.
  - Główna przestrzeń robocza jest wycentrowana, z kompaktowym paskiem zasobów (Seria, Serca, Monety, XP/Ranga) u góry.
  - **Progi szerokości (twarde, wynikają z arytmetyki layoutu):**
    - `1024–1439px`: tylko sidebar `248px` + treść `max-w-[760px]`, **bez prawego panelu**; padding treści `24px`.
    - `≥ 1440px`: sidebar `248px` + treść `max-w-[780px]` + prawy **panel towarzyszący `300px`** + paddingi `24px` po obu stronach. Suma `248 + 780 + 300 + 48 = 1376px ≤ 1440px`, więc nic nie wychodzi poza ekran.
  - Prawy panel (tylko `≥ 1440px`, ekrany Start i Nauka) zawiera maskotkę Lumi, dzienny cel i wyzwania; na mobile i w zakresie `1024–1439px` te same kafelki są w głównym strumieniu.
  - **Zakaz `overflow-x`:** cała powłoka ma `overflow-x: hidden` na kontenerze głównym, ale layout musi mieścić się bez tego zabezpieczenia — test na `1440px` i `1280px` sprawdza brak uciętej treści, nie tylko brak paska przewijania.
- **Hierarchia warstw (`z-index`):** Top HUD `20`, Bottom Tab Bar / Sidebar `30`, Pływające banery/paski sesji `40`, Modale i Bottom Sheety `100`, Modal awansu Rangi / zakupu `150`, Toasty powiadomień `200`.

---

## 3. Maskotka „Lumi” — Projekt, Emocje i Personalizacja

### 3.1. Koncepcja i budowa wektorowa (100% czysty SVG + Framer Motion)
Ponieważ aplikacja działa lokalnie bez zewnętrznych grafik, maskotka **Lumi** jest budowana jako **autorski, wielowarstwowy, animowany komponent React SVG (`<LumiMascot />`)**, zaprojektowany tak, by wyglądał jak postać z dopracowanej gry indie / Duolingo:
- **Wygląd bazowy:** urocza, geometryczna **świetlista iskierka / cyber-duszek światła** (nawiązanie do marki **JASNE** — „rozjaśnia naukę”) w kształcie zaokrąglonej kropli-żaróweczki / sówki energetycznej z:
  - miękkim, sprężystym korpusem z delikatnym połyskiem 3D (highlight na czole + ciepły cień u dołu),
  - parą dużych, ekspresyjnych oczu z ruchomymi źrenicami i automatycznym mruganiem co 3–5 s,
  - ruchomymi brwiami i ustami zmieniającymi kształt per emocja,
  - dwoma małymi, unoszącymi się „rączkami” / skrzydełkami oraz małym świetlistym czubkiem-płomykiem na głowie,
  - cieniem eliptycznym na ziemi pod maskotką, który skaluje się odwrotnie do wysokości jej podskoku!

### 3.2. Katalog 8 stanów emocjonalnych (`mood`)
Komponent `<LumiMascot mood={...} loadout={...} size={...} />` obsługuje 8 płynnie animowanych stanów:
1. **`idle` (Domyślny / Kibic):** spokojne unoszenie się w pionie (`y: [0, -6, 0]`, pętla `2.8s`), cykliczne mruganie oczami, lekki uśmiech.
2. **`happy` (Sukces / Powitanie):** radosny podskok z rozciągnięciem i ściśnięciem (squash & stretch: `scaleX/scaleY`), uśmiechnięte oczy w kształcie łuków `^ ^`, unoszące się małe gwiazdki wokół głowy.
3. **`celebrate` (Combo x2/x3 / Awans Rangi / Zakup w Sklepie):** wysoki wyskok z obrotem `rotate: [0, -12, 12, 0]`, szeroko rozłożone rączki, **statyczna** promienista aura za postacią (rysowana w SVG, `opacity ≤ 0.15`, jedynie `opacity`/`scale` mogą się animować), złoty akcent korpusu.
4. **`thinking` (AI Tutor analizuje / Wybór trudnej opcji):** lekko przechylona głowa (`rotate: -8`), jedna rączka przy brodzie, przesuwające się oczy, mała unosząca się żarówka / znak zapytania obok.
5. **`surprised` (Błędna odpowiedź):** szybkie wzdrygnięcie (`x: [-5, 5, -3, 3, 0]`), szeroko otwarte oczy i małe „o” zamiast ust — **nigdy zła ani złośliwa**, natychmiast po 1 s przechodzi w wspierającą minę „spróbujemy jeszcze raz!”.
6. **`supportive` (0 serc / Misja Ratunkowa / Pusty stan):** łagodny, ciepły uśmiech, maskotka trzyma w rączkach małe pęknięte lub regenerujące się serduszko / książkę.
7. **`focused` (Egzamin E8 / Codzienny Sprint):** determinacja, lekko ściągnięte brwi w stylu „tryb skupienia”, opaska/iskra gotowości, spokojny rytm bez rozpraszania ucznia w trakcie samego egzaminu.
8. **`cool` (Sklep / Tryb przymierzalni):** pewny siebie uśmiech, prezentacja założonego stroju, lekkie kołysanie na boki przy każdej zmianie kosmetyku.

### 3.3. Warstwowy system kosmetyków na maskotce (`loadout`)
`<LumiMascot />` renderuje kupione w Sklepie akcesoria bezpośrednio w swoich warstwach SVG (z natychmiastowym podglądem na żywo w Sklepie, na ekranie Start, w Lekcji i w Profilu!):
- **Warstwa `aura` (za postacią):** np. brak / *Złote Promienie* / *Błękitna Orbita* / *Plazmowy Pierścień*.
- **Warstwa `headgear` (na głowie):** np. brak / *Słuchawki Gamingowe* / *Korona Mistrza E8* / *Czapka z Daszkiem (Street)* / *Hełm Kosmiczny*.
- **Warstwa `eyewear` (na oczach):** np. brak / *Okulary Pixelowe 8-bit* / *Gogle Cyber-Alchemika*.
- **Warstwa `colorScheme` (kolor korpusu Lumi):** domyślny *Złota Iskra* oraz odblokowywane np. *Szmaragdowy Błysk*, *Lodowy Kryształ*, *Karmazynowa Kometa*.

---

## 4. Choreografia Animacji Klasy Światowej (Motion System)

Animacje to **filar jakości** tej aplikacji. Całość opiera się na `motion/react` (Framer Motion) + `canvas-confetti` + CSS keyframes tam, gdzie potrzebna jest minimalna narzutowość.

### 4.1. Zasady techniczne wydajności i dostępności
- **Żelazne 60 FPS:** animujemy wyłącznie właściwości kompozytowane przez GPU (`transform`, `opacity`, `clip-path`, `filter` oszczędnie). Nigdy nie animujemy `width`, `height`, `top`, `left` w pętlach.
- **Presety sprężyn (`src/lib/motionPresets.ts`):**
  - `SPRING_TACTILE`: `{ type: 'spring', stiffness: 520, damping: 28, mass: 0.7 }` (kliknięcia przycisków 3D, przełączniki).
  - `SPRING_SNAPPY`: `{ type: 'spring', stiffness: 440, damping: 30, mass: 0.8 }` (zakładki Bento, Bottom Tab Bar `layoutId`, karty odpowiedzi).
  - `SPRING_BOUNCY`: `{ type: 'spring', stiffness: 380, damping: 16, mass: 0.9 }` (Combo badge, wyskok maskotki, zdobyte nagrody, odblokowanie kosmetyku).
  - `SPRING_SHEET`: `{ type: 'spring', stiffness: 320, damping: 32 }` (Bottom Sheety: Wzory E8, AI Tutor, Misja Ratunkowa).
- **Pełna obsługa `prefers-reduced-motion: reduce`:** globalny wrapper `<MotionConfig reducedMotion="user">` + własny hook `useReducedMotionFlag()`. Gdy użytkownik ma włączone ograniczenie ruchu: wyłączamy cząsteczki XP, konfetti, wstrząsy błędów i sprężyste wyskoki; zostają natychmiastowe zmiany stanu i krótkie przejścia `opacity` (`≤ 100 ms`).

### 4.2. Katalog 14 Animacji Kluczowych (szczegółowa choreografia)

1. **Tactile 3D Press (Wszystkie główne przyciski i karty ABCD):**
   - *Wyzwalacz:* dotyk/kliknięcie (`whileTap`).
   - *Przebieg:* natychmiastowe zapadnięcie `y: 4`, redukcja dolnego cienia 3D z `5px` do `1px` (`duration: 0.06s`), sprężyste odbicie z powrotem po puszczeniu (`SPRING_TACTILE`).
2. **Płynna Nawigacja z Wspólną Kapsułą (`layoutId`):**
   - *Gdzie:* Bottom Tab Bar / Left Sidebar, zakładki teorii Bento (4 karty), segmented control `Zapisane | Bank Błędów`, zakładki Sklepu.
   - *Przebieg:* aktywne tło-kapsułka płynnie przelatuje między przyciskami (`layoutId`, `SPRING_SNAPPY`), a ikona aktywnej zakładki robi subtelny podskok (`scale: [1, 1.18, 1]`).
3. **Kaskadowe Wejście Ekranów (Staggered Entrance):**
   - *Gdzie:* Start, Mapa Nauki, Sklep, Podsumowanie Lekcji/Egzaminu.
   - *Przebieg:* kontener przełącza widok z delikatnym crossfade + przesunięciem `y: 12 -> 0`, a kolejne kafelki wchodzą kaskadowo co `45 ms` (`staggerChildren: 0.045`), dzięki czemu interfejs ożywa bez spowalniania nawigacji.
4. **Karty Odpowiedzi ABCD — Sukces & Błąd:**
   - *Poprawna odpowiedź:* karta robi sprężysty podskok `scale: [1, 1.03, 1]`, wypełnia się szmaragdowym obramowaniem, litera `A/B/C/D` zamienia się płynnie w animowaną ikonę `Check` (rysowanie ścieżki SVG `pathLength: 0 -> 1`), a z miejsca kliknięcia **wylatuje 4–6 złotych cząsteczek `+XP`**, które lecą lekkim łukiem ku górnemu paskowi postępu.
   - *Błędna odpowiedź:* karta wykonuje krótki, wyraźny wstrząs poziomy `x: [0, -10, 10, -7, 7, -3, 0]` (`340 ms`), podświetla się karmazynem z ikoną `X`, a na dole płynnie wysuwa się karta informacji zwrotnej z krótkim wyjaśnieniem błędu.
5. **Plakietka i Pasek Combo (`x1.5` / `x2.0` / `x3.0`):**
   - *Przebieg:* przy osiągnięciu progu (3., 5., 8. poprawna z rzędu) plakietka wyskakuje z `scale: 0.5 -> 1.18 -> 1` (`SPRING_BOUNCY`) z efektem obrotu `-6deg -> 0deg`.
   - *Stan `x2.0`:* ciepły obrys `border` w kolorze bursztynowo-pomarańczowym z pulsowaniem **wyłącznie `opacity`** (`0.55 <-> 0.9`, `1.4 s`), bez `box-shadow`.
   - *Stan `x3.0` (ON FIRE):* animowana ikona płomienia + pomarańczowy obrys `border` paska postępu z pulsowaniem `opacity` (`0.45 <-> 0.85`, bez animowanego `box-shadow`/glow) oraz uśmiech `celebrate` na maskotce Lumi.
   - *Reset po błędzie lub 90 s:* szybkie zgaszenie (`scale: 0.75, opacity: 0`) w `180 ms`.
6. **Przełączanie Pytań i Płynny Pasek Postępu:**
   - *Przebieg:* `AnimatePresence mode="wait"` — stare pytanie wyjeżdża w lewo (`x: 0 -> -28, opacity: 1 -> 0`, `160 ms`), nowe wjeżdża z prawej (`x: 28 -> 0, opacity: 0 -> 1`, `200 ms`). Pasek postępu u góry lekcji wypełnia się płynnie sprężyną z błyskiem świetlnym (shimmer) przesuwającym się po pasku przy każdym skoku.
7. **Zapis Zadania „Do powtórki” (Zamiast Brudnopisu):**
   - *Przebieg:* przycisk zakładki (`Bookmark`) robi sprężysty obrót i powiększenie (`scale: [1, 1.38, 1], rotate: [0, -14, 6, 0]`, `SPRING_BOUNCY`), wypełnia się kolorem akcentu z mikro-rozbłyskiem 4 kropek wokół ikony, a u dołu wysuwa się kompaktowy toast „Zapisano do powtórek” (lub „Już zapisane — zaktualizowano”).
8. **Utrata i Regeneracja Serca (Hearts HUD):**
   - *Utrata:* ostatnie aktywne serce drga (`x: [-4, 4, -3, 3, 0]`), pęka/traci wypełnienie, a znad licznika w HUD unosi się czerwone `-1` (`y: 0 -> -22, opacity: 1 -> 0`, `650 ms`).
   - *Odzyskanie (Misja Ratunkowa / Sklep / Czas):* puste serce rozbłyskuje powiększeniem `scale: [0.7, 1.35, 1]` i falą pierścienia (`ripple`), wypełniając się żywym kolorem.
9. **Monety & Zakup w Sklepie (Shine Sweep + Przymierzalnia):**
   - *Zakup:* licznik monet w HUD płynnie spada (`CountUpNumber`, `500 ms`), na kupionej karcie przelatuje ukośny blask (`shine sweep`), odpala się mini-konfetti z punktu karty, a maskotka Lumi w podglądzie na górze Sklepu podskakuje w trybie `celebrate` i **natychmiast zakłada kupiony przedmiot**!
   - *Zakup Tarczy Serii:* dodatkowy lodowo-niebieski rozbłysk (`#38BDF8`) przy ikonie tarczy obok licznika Serii w Top HUD.
10. **Bottom Sheety z Fizyką Przeciągania (Wzory E8, AI Tutor, Misja Ratunkowa):**
    - *Przebieg:* tło przyciemnia się płynnie (`backdrop-blur-xs`, `opacity: 0 -> 1`), panel wysuwa się z dołu (`y: "100%" -> 0`, `SPRING_SHEET`). Posiada wyraźny uchwyt (drag handle) u góry i obsługuje gest `drag="y"` (przeciągnięcie w dół > `110px` lub szybkie machnięcie płynnie zamyka panel).
11. **AI Tutor — Analiza Zadania Otwartego:**
    - *Przebieg:* po kliknięciu „Sprawdź z AI Tutorem” Lumi przechodzi w stan `thinking`, pojawia się elegancka karta ładowania z pulsującymi 3 kropkami i shimmerem tekstu („Lumi sprawdza tok rozumowania…” przez `700 ms`), a następnie wynik rozwija się płynnie (`height` / `opacity` + `y: 10 -> 0`) pokazując punkty CKE (`0/2`, `1/2`, `2/2`), podświetlone znalezione słowa kluczowe, informację zwrotną i etykietę „Ocena symulowana (Faza 1)”.
12. **Ekran Podsumowania Sesji & Awans Rangi (Celebration Screen):**
    - *Przebieg:* Lumi wchodzi w `celebrate`, 3 kafelki wyników (Zdobyte XP, Skuteczność %, Zdobyte Monety) pojawiają się kolejno z animacją odliczania liczb (`CountUpNumber`, `700 ms`), a pasek Rangi E8 płynnie dopełnia się od starego do nowego XP. Jeśli próg Rangi został przekroczony — po zakończeniu animacji paska odpala się pełnoekranowy modal **AWANS RANGI** z nową odznaką, konfetti (`canvas-confetti` w palecie Nocturne/Solar) i fanfarą dźwiękową.
13. **Onboarding — Płynna Zmiana Kroków i Reaktywna Maskotka:**
    - *Przebieg:* górny pasek postępu onboardingu (1/5 -> 5/5) płynie sprężyną, dymek dialogowy maskotki pojawia się z efektem `scale: 0.92 -> 1`, każda karta wyboru celu dziennego zmienia ekspresję Lumi na żywo, a finałowy ekran odblokowuje startowe 120 monet i 5 serc kaskadową animacją.
14. **Timer Egzaminu (< 60 s Urgent Pulse):**
    - *Przebieg:* w ostatnich 60 sekundach pigułka timera płynnie zmienia kolor na karmazynowy i dostaje subtelny, miarowy puls skali co sekundę (`scale: [1, 1.05, 1]`) oraz jednorazowy sygnał dźwiękowy.

---

## 5. Silnik Dźwiękowy (Procedural Web Audio API -> Gotowy pod `.WAV`)

Dźwięki znacząco podnoszą odczucie „żywej gry”, pozostając subtelne, nowoczesne i nigdy nachalne.

### 5.1. Architektura gotowa na pliki `.WAV` w Fazie 2
Wszystkie komponenty UI korzystają wyłącznie z hooka `useSound()` wywołującego interfejs `ISoundEngine`:
```ts
export type SoundEvent =
  | 'tap'
  | 'tabSwitch'
  | 'correct'
  | 'wrong'
  | 'comboUp'
  | 'bookmark'
  | 'coin'
  | 'heartLoss'
  | 'heartRestore'
  | 'purchase'
  | 'rankUp'
  | 'timerWarning';

export interface ISoundEngine {
  play(event: SoundEvent, options?: { comboCount?: number }): void;
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
}
```
- **Faza 1 (`ProceduralWebAudioSoundEngine`):** syntetyzuje lekkie, czyste brzmienia w natywnym Web Audio API (`AudioContext` tworzony leniwie przy pierwszym geście użytkownika, bez żadnych błędów autoplay). Zero plików zewnętrznych, natychmiastowe działanie offline.
- **Faza 2 (`WavAssetSoundEngine` — gotowy szkielet komentarza/adaptera):** mapuje `SoundEvent -> /assets/sfx/${event}.wav` z buforowaniem `AudioBuffer`, dzięki czemu w przyszłości podmienimy syntezator na profesjonalne pliki `.wav` zmianą jednej linijki w konfiguracji.

### 5.2. Katalog brzmień Fazy 1 (Web Audio)
- `tap`: krótki, miękki klik drewniano-plastikowy (`40 ms`, trójkątna fala 420->260 Hz, niski gain `0.08`).
- `tabSwitch`: ultra-delikatny „pop” (`30 ms`, sinus 520->640 Hz).
- `correct`: dwudźwięk tercji wielkiej w górę; **im wyższe `comboCount`, tym wyższa tonacja** (o półton za każdą kolejną poprawną odpowiedź aż do 8. — klasyczny efekt dopaminowy z gier!).
- `wrong`: krótki, łagodny niski dwudźwięk w dół (`240 Hz -> 180 Hz`, miękki filtr dolnoprzepustowy — zero irytującego brzęczyka).
- `comboUp`: jasny akord arpeggio (3 szybkie nuty w górę, krystaliczny sinus/trójkąt).
- `bookmark`: lekki, przyjemny dwuklik-dzwoneczek („przypięto”).
- `coin`: klasyczne podwójne metaliczne „pling-pling” (B5 -> E6).
- `heartLoss`: miękkie opadające „thud” (320 -> 140 Hz).
- `heartRestore`: ciepłe narastające arpeggio (C5 -> E5 -> G5).
- `purchase`: radosna, krótka fanfara 4-nutowa.
- `rankUp`: pełniejszy, zwycięski akord rozłożony (C5 -> E5 -> G5 -> C6) z lekkim pogłosem obwiedni.
- `timerWarning`: subtelne podwójne piknięcie zegara przy wejściu w ostatnie 60 sekund.

Użytkownik ma **przełącznik Dźwięki SFX (Wł./Wył.)** w Profilu (domyślnie Wł., zapisywany w stanie lokalnym).

---

## 6. Szczegółowy Opis Wszystkich Widoków i Przepływów (Ekran po Ekranie)

Każdy poniższy widok musi zostać w pełni zaimplementowany i połączony ze stanem aplikacji.

### 6.1. Imponujący Onboarding bez Rejestracji + Product Tour
Uruchamia się automatycznie przy pierwszym wejściu (`onboardingCompleted === false`), a Tour można w każdej chwili powtórzyć z Profilu. Brak jakiegokolwiek formularza rejestracji czy logowania!

- **Krok 1 — Powitanie z Lumi:** pełnoekranowa scena z dużym `<LumiMascot mood="happy" size="lg" />` na środku, żywym dymkiem dialogowym („Cześć! Jestem Lumi. Zrobimy z E8 grę, którą da się wygrać w 5 minut dziennie.”), trzema pigułkami obietnicy (`Zero nudy`, `AI Tutor do otwartych`, `Zaczynasz od razu — bez konta`) oraz dużym, dotykowym przyciskiem 3D **„Zaczynamy!”**.
- **Krok 2 — Poznajmy się (Podstawowe dane lokalne):**
  - Maskotka Lumi pyta o **ksywkę / imię** (pole tekstowe + przycisk z ikoną kostki **„Losuj nick”**, np. *CyberPitagoras*, *SzybkiUłamek*, *MistrzE8*, *BłyskLogiki* — żeby nie zatrzymywać ucznia).
    - **Walidacja nicku (twarda):** długość `2–20` znaków po `trim`; dozwolone litery (także polskie), cyfry, spacja, `-`, `_`; zakaz znaków `< > & " '`; pusty lub 1-znakowy nick blokuje „Dalej” z komunikatem pod polem. Nick jest przycinany do 20 znaków, nie do 40.
  - Wybór **etapu nauki** (3 dotykowe karty):
    - *Klasa 8 — zdaję w tym roku* („Skupimy się na konkretach CKE i szybkości”),
    - *Klasa 7 — zaczynam na spokojnie* („Zbudujesz przewagę bez stresu”),
    - *Powtórka przed próbnym* („Lecimy od razu w powtórki i mini-arkusze”).
  - Wybór **startowego koloru Lumi** (3 darmowe warianty na start: Złota Iskra / Błękitna Fala / Szmaragdowy Impuls).
- **Krok 3 — Przedmiot startowy i Cel Dzienny:**
  - Wybór przedmiotu startowego: **Matematyka** (oznaczona plakietką „Pełny prototyp Fazy 1 — Polecane”), **Język Polski** („Podgląd — wkrótce”), **Język Angielski** („Podgląd — wkrótce”).
  - Wybór **celu dziennego** (3 dotykowe karty 3D — każda zmienia minę Lumi!):
    - *Rozgrzewka — 5 min / dzień* (1 lekcja lub 5 zadań),
    - *Solidny trening — 10 min / dzień* (2 lekcje lub 10 zadań — rekomendowane),
    - *Tryb Mistrza — 15 min / dzień* (3 lekcje — Lumi wchodzi w `focused`/`celebrate`!).
- **Krok 4 — Krótki Interaktywny Tour po Aplikacji (3 slajdy z możliwością pominięcia „Pomiń”):**
  - *Slajd 1 (Nauka Bento & Zapisz):* wizualna mini-karta pokazująca 4 pigułki teorii, Combo `x3.0` i przycisk „Zapisz do powtórki” zamiast brudnopisu.
  - *Slajd 2 (AI Tutor & Wzory E8):* pokazuje jak AI Tutor podpowiada krok po kroku i ocenia zadania otwarte oraz jak w Matematyce działa wysuwana ściąga ze wzorami.
  - *Slajd 3 (Serca, Monety, Sklep Lumi):* pokazuje Serca (5/5 + Misja Ratunkowa, nigdy blokady płatnością), Monety na personalizację Lumi oraz cenną Tarczę Serii.
- **Krok 5 — Ekran Odblokowania Startu:** animowana scena z konfetti: „Wszystko gotowe, [Nick]!” + wyskakujące pakiety startowe: **+120 Monet**, **5/5 Serc**, **Ranga: Nowicjusz E8** + dwa wyraźne przyciski: główny 3D **„Odpal pierwszą lekcję!”** oraz drugorzędny **„Wejdź na pulpit Start”**.

### 6.2. Globalna Powłoka (Top HUD + Nawigacja)
- **Top HUD (Mobile max `56px`, Desktop kompaktowy pasek u góry):**
  - Lewa strona: **Przełącznik Przedmiotu** (klikana pigułka z ikoną i nazwą `Matma` / `Polski` / `Angielski`, otwierająca czysty popover/bottom-sheet z 3 przedmiotami — zmiana w trakcie aktywnej sesji wymaga modalu potwierdzenia i nie kasuje postępu lekcji).
  - Prawa strona (czytelne, dotykowe wskaźniki min. `44×44px` z licznikami `tabular-nums`):
    1. **Seria (Płomień):** liczba dni + mała niebieska ikona **Tarczy Serii** obok, jeśli uczeń posiada `≥ 1` Tarczę (klik otwiera mini-tooltip ze statusem serii i tarcz).
    2. **Serca:** ikona serca + `5/5` (gdy `< 5`, klik pokazuje czas do kolejnej regeneracji oraz skrót do Misji Ratunkowej).
    3. **Monety:** ikona monety + liczba (klik przenosi prosto do Sklepu w Profilu).
  - **Reguła responsywna HUD (twarda, poniżej `380px`):** przedmiot pokazuje skrót (`Mat.`, `Pol.`, `Ang.`) zamiast pełnej nazwy, serca pokazują samą liczbę (`3`) bez `5/5`, monety od `1000` w formacie `1,2k`, odstępy między wskaźnikami `8px`. Każdy wskaźnik zachowuje strefę dotyku `44×44px` (może być większa niż widoczna ikona). HUD nigdy nie zawija się do drugiej linii i nigdy nie powoduje `overflow-x`.
- **Bottom Tab Bar (Mobile) / Left Sidebar (Desktop) — dokładnie 5 zakładek:**
  1. `Start` (`Home`)
  2. `Nauka` (`Map` / `BookOpen`)
  3. `Powtórki` (`BookmarkCheck` + opcjonalna mała kropka/licznik zadań w Banku Błędów)
  4. `Egzamin` (`Timer` / `FileCheck2`)
  5. `Profil` (`User` / mini-awatar z ramką)

### 6.3. Zakładka 1: Start (Pulpit Gracza)
Dynamiczne centrum dowodzenia zaprojektowane tak, by uczeń w **1 sekundę** wiedział, co kliknąć:
1. **Hero Card z Maskotką Lumi i Głównym CTA:**
   - Po lewej/górze: powitanie („Cześć, [Nick]!”, kontekstowa kwestia Lumi w małym dymku np. „Zostało Ci 1 zadanie do zaliczenia dzisiejszej serii!” albo „Dzień zaliczony — seria rośnie!”) + żywa maskotka `<LumiMascot />` w założonych kosmetykach.
   - Pasek postępu **Dziennego Celu** i **Paska Rangi E8** (`Nowicjusz E8 -> Tropiciel`, ile XP brakuje).
     - **Dzienny cel ma jedną jednostkę wyświetlania: procent celu** (`0% – 100%`) plus podpis `"1 z 2 lekcji"` albo `"3 z 5 zadań"`. Nigdy dwa różne liczniki w tym samym miejscu.
     - **Mapowanie celu (tabela obowiązująca w całej aplikacji):**

       | Cel wybrany w onboardingu | Równowartość w lekcjach | Równowartość w zadaniach | Procent celu |
       |---|---|---|---|
       | 5 min („Rozgrzewka”) | 1 lekcja Bento | 5 zadań | `min(100, round(100 * postęp / 1 lekcji))` lub `... / 5 zadań` |
       | 10 min („Solidny trening”) | 2 lekcje Bento | 10 zadań | analogicznie `/ 2` lub `/ 10` |
       | 15 min („Tryb Mistrza”) | 3 lekcje Bento | 15 zadań | analogicznie `/ 3` lub `/ 15` |

     - **Co się liczy do celu (bez podwójnego liczenia):** ukończona lekcja Bento = `1` lekcja; **każde sprawdzone zadanie** (poprawne lub błędne — liczy się wysiłek, nie wynik) w lekcji, sesji powtórkowej lub egzaminie = `1` zadanie. Mini-arkusz **nie dodaje dodatkowych 5 zadań za samo ukończenie** — wliczają się wyłącznie jego sprawdzone zadania (maks. `5`), więc jedno zadanie nigdy nie jest liczone dwa razy. Cel jest osiągnięty, gdy którakolwiek ścieżka (lekcje **albo** zadania) sięgnie `100%`. Samo otwarcie lekcji lub teorii Bento nie liczy się do celu.
     - Wartość `postęp` jest liczona jako maksimum z obu ścieżek, więc uczeń nie musi spełniać obu jednocześnie.
   - Duży, 3D przycisk CTA: **„Kontynuuj: Potęgi i Pierwiastki — Lekcja 1”** (lub po ukończeniu: **„Powtórz lekcję / Zagraj Mini-Arkusz E8”**).
2. **Bento Grid Statystyk (3 kompaktowe kafelki):**
   - *Rozwiązane zadania* (liczba + skuteczność %). **Definicja skuteczności:** `accuracy = Math.round(100 * punktyZdobyte / punktyMożliwe)`, liczona po wszystkich sprawdzonych zadaniach zamkniętych (1 pkt za poprawną, 0 za błędną) i otwartych (0/1/2 pkt), **bez sesji powtórkowych** (nie zawyżają wyniku). Wartość globalna od pierwszego dnia, pusty stan `—` przy `0` zadaniach.
   - *Bank Błędów / Zapisane* (liczba zadań czekających -> klik przenosi do zakładki Powtórki),
   - *Najlepsze Combo* (rekord serii poprawnych odpowiedzi).
3. **Karta „Wyzwania Dzienne” (dokładnie 3 na bieżący `playerDay`, wspólne dla wszystkich przedmiotów):**
   - **Jedno źródło prawdy:** wyzwania są **globalne dla dnia, nie per przedmiot**. Seed: `hash(playerDay)` — **bez `subjectId`**. Po przełączeniu Matematyka -> Polski -> Angielski te same 3 wyzwania, ten sam postęp i ten sam stan odbioru.
   - **Limit nagród:** maksymalnie `3 × 15 = 45 monet` z wyzwań na `playerDay`, niezależnie od liczby przedmiotów i sesji.
   - Pula wyzwań jest **niezależna od przedmiotu** i każde da się wykonać w Matematyce (jedynej grywalnej ścieżce Fazy 1): „Ukończ 1 lekcję Bento”, „Codzienny Sprint: 5 poprawnych z rzędu bez błędu”, „Zapisz 1 zadanie do powtórki”, „Rozwiąż 1 zadanie otwarte z AI Tutorem”, „Ukończ mini-arkusz”, „Osiągnij ≥ 80% w mini-arkuszu”, „Ukończ sesję powtórkową z ≥ 3 zadań”.
   - **Zakaz wyzwania „Ukończ lekcję/arkusz w Polskim lub Angielskim”** — te przedmioty nie mają treści w Fazie 1 i takie wyzwanie byłoby niewykonalne.
   - Każde wyzwanie ma pasek postępu, nagrodę `+15 monet`, a po ukończeniu pokazuje dotykowy przycisk-nagrodę **„Odbierz +15”** (z animacją monet) lub zielony stan „Odebrane ✓”.
   - **Idempotencja odbioru:** klucz `challengeClaimed[playerDay][challengeId] = true`; ponowne kliknięcie, restart aplikacji i powrót na ekran Start nie przyznają nagrody drugi raz. Nowy `playerDay` nadpisuje całą listę i czyści stan odbioru (brak archiwum w Fazie 1).
4. **Szybki skrót do Mini-Arkusza E8:** estetyczna karta zachęcająca do 15-minutowego testu bez utraty serc.

### 6.4. Zakładka 2: Nauka (Ścieżka Działów E8)
Widok musi wyglądać jak **pełnoprawna, gamingowa mapa ścieżki nauki (w stylu nowoczesnego Duolingo / mapy poziomów)** — nigdy pusty ekran!
- **Dla Matematyki E8 (w pełni interaktywna ścieżka):**
  - Górny baner działu z postępem (`Dział 1 z 7 • Postęp: X%`) oraz przyciskiem **„Przydatne Wzory E8”** (otwierającym bottom-sheet wzorów).
  - **Dział 1: Liczby, Potęgi i Pierwiastki (AKTYWNY):**
    - Wizualna, lekko falująca (zygzakowata) ścieżka okrągłych/zaokrąglonych węzłów 3D z liniami łączącymi i maskotką Lumi stojącą przy aktualnym węźle!
    - **Węzeł 1.1 — „Potęgi i pierwiastki w zadaniach E8” (ODBLOKOWANY, W PEŁNI KLIKALNY):** pulsujący pierścień zachęty, opis „4 karty Bento • 5 zadań • +20 monet”, pokazuje gwiazdki/status ukończenia. Klik otwiera pełną Lekcję Bento. (Jeśli `hearts === 0`, przycisk startu zadań jest zablokowany zgodnie z `AC-H2` — z natychmiastowym modalem/akcjami „Misja Ratunkowa”, „Sklep” oraz otwartym dostępem do **samej Teorii Bento i Wzorów**!).
    - **Węzeł 1.2 — „Ułamki i działania na liczbach wymiernych” (WKRÓTCE):** czytelna, przygaszona karta/węzeł z kłódką i krótkim podglądem co będzie w lekcji.
    - **Węzeł 1.3 — „Procenty i podwyżki/obniżki E8” (WKRÓTCE).**
  - **Kolejne działy E8 poniżej na mapie (realistyczne karty sekcji w stanie „Wkrótce — Faza 2”):**
    - *Dział 2: Wyrażenia algebraiczne i równania*,
    - *Dział 3: Proporcjonalność i zadania tekstowe*,
    - *Dział 4: Geometria płaska — kąty, trójkąty, Pitagoras*,
    - *Dział 5: Pola figur i układ współrzędnych*,
    - *Dział 6: Bryły — graniastosłupy i ostrosłupy*,
    - *Dział 7: Statystyka, prawdopodobieństwo i odczyt z wykresów*.
    - Kliknięcie zablokowanego działu nie rzuca surowego alertu, lecz otwiera elegancki, mały popover z informacją „Ten dział jest w przygotowaniu do kolejnej aktualizacji — na razie przetestuj pełną mechanikę w Dziale 1 lub w Mini-Arkuszu E8!”.
- **Dla Języka Polskiego E8 i Języka Angielskiego E8:**
  - Przycisk „Wzory E8” **jest całkowicie ukryty** (znika z paska).
  - Zamiast pustego ekranu wyświetla się dedykowana mapa działów w kolorze przedmiotu (Polski: *Lektury obowiązkowe*, *Gramatyka i ortografia*, *Rozprawka i opowiadanie*; Angielski: *Czasy gramatyczne*, *Rozumienie tekstu*, *E-mail i reakcje językowe*) z eleganckim banerem „Moduł w budowie — w Fazie 1 wszystkie mechaniki testujemy na Matematyce E8” i dotykowym przyciskiem 3D **„Przełącz na Matematykę E8”** + podglądem przyszłego slotu kontekstowego (Ściąga Lektur / Bank Zwrotów).

### 6.5. Ekran Lekcji Bento (Teoria Core-4 + Sesja Zadań)
Serce doświadczenia edukacyjnego, podzielone na 2 płynne etapy:

#### Etap A: Teoria Bento (4 karty — zawsze dostępna, nawet przy 0 sercach!)
- Górny pasek: przycisk wstecz (`X`), tytuł lekcji, a dla Matematyki przycisk **„Wzory E8”** (ukryty w innych przedmiotach).
- **4 zakładki pigułkowe z płynną kapsułą `layoutId`:**
  1. `Esencja` (`Lightbulb`) — sedno tematu w 3–4 zwięzłych punktach „z polskiego na nasze”, bez akademickiego żargonu.
  2. `Wzory E8` (`BookOpen`) — 2–3 kluczowe wzory renderowane w `KaTeX` w wyraźnych kasetonach z krótkim opisem „kiedy użyć”.
  3. `Przykład` (`ListOrdered`) — wzorcowe zadanie E8 rozpisane na **3 numerowane kroki** z zaznaczonym wynikiem.
  4. `Pułapka E8` (`ShieldAlert`) — najczęstszy błąd ósmoklasistów z wyraźnym zestawieniem `ŹLE (pułapka)` vs `DOBRZE (złoty odruch)`.
- Na dole przypięty (sticky) przycisk 3D **„Przejdź do zadań (5 zadań)”** (a przy `0 serc` — zablokowany stan z jasnym komunikatem „Masz 0 serc — odzyskaj serce, żeby rozwiązywać zadania” i przyciskami „Misja Ratunkowa” oraz „Sklep”).

#### Etap B: Interaktywna Sesja Zadań (5 zadań z pełnymi mechanikami)
- **Górny pasek sesji:**
  - przycisk wyjścia `X` (z potwierdzeniem przerwania sesji),
  - **animowany pasek postępu** (`1/5` -> `5/5`) z błyskiem shimmer,
  - dynamiczna **plakietka Combo** (`x1.5`, `x2.0`, `x3.0`) pojawiająca się po prawej, gdy gracz ma passę,
  - licznik **Serc** w tej sesji.
- **Pasek narzędzi nad/przy karcie zadania (zero brudnopisu!):**
  - Odznaka numeru i typu zadania (np. `Zadanie 1 z 5 • Wybór ABCD` / `Wpisz wynik` / `Otwarte • AI Tutor`),
  - **Przycisk „Zapisz do powtórki”** (ikona zakładki `Bookmark`, stan pusty vs wypełniony, animacja obrotu + toast),
  - **Przycisk „Wzory E8”** (wyłącznie dla Matematyki — otwiera Bottom Sheet bez przerywania zadania!),
  - **Przycisk „Podpowiedź AI”** (otwiera stopniowane podpowiedzi 1 -> 2 -> 3 z jasną informacją o karze `-33% XP` za każdy poziom).
- **Obsługiwane typy zadań:**
  1. **Jednokrotny wybór (ABCD) i Prawda/Fałsz:** duże dotykowe karty 3D (wysokość `≥ 56px`), wyraźny kwadracik litery `A/B/C/D`, bogaty stan zaznaczenia, sprawdzenia, animacje podskoku/wstrząsu, cząsteczki XP i ikony `Check`/`X`.
  2. **Wpisanie odpowiedzi liczbowej (`Numeric Input` + `SmartMathKeyboard`):**
     - Pole odpowiedzi z `inputmode="none"` gdy aktywna jest wbudowana, zgrabna **`SmartMathKeyboard`** (`0–9`, `,`, `-`, `/`, `√`, `^`, `⌫`) — plus widoczny przełącznik **„Klawiatura systemowa”** (`inputmode="text"`).
     - Po fokusie pole wywołuje `scrollIntoView({ block: 'center' })`, aby klawiatura nigdy nie zasłaniała pola ani przycisku „Sprawdź”.
  3. **Zadanie Otwarte z AI Tutorem (`Open Task`):**
     - Czytelne pole `textarea` z licznikiem znaków i małą podpowiedzią „Zapisz obliczenia lub rozumowanie — AI Tutor oceni je jak egzaminator CKE (0–2 pkt)”.
     - Przycisk 3D **„Oceń z AI Tutorem”** -> uruchamia 700 ms animację analizy z maskotką Lumi w trybie `thinking` -> rozwija rozbudowaną kartę oceny z punktacją `0/2`, `1/2` lub `2/2`, wykazem kryteriów, informacją zwrotną krok po kroku i stałą etykietą **„Ocena symulowana (Faza 1)”**.
- **Dolny panel informacji zwrotnej (Feedback Sheet):** po sprawdzeniu zadania wysuwa się u dołu zwięzłe wyjaśnienie rozwiązania, zdobyte `+XP` (z uwzględnieniem Combo i ewentualnych podpowiedzi), reakcja maskotki Lumi oraz przycisk 3D **„Dalej”**.
- **Ekran Podsumowania Lekcji:** animowany ekran zwycięstwa z Lumi (`celebrate`), odliczaniem `useCountUp` dla XP, Monet (`+20 monet`) i Skuteczności %, aktualizacją Dziennej Serii i Wyzwań Dziennych oraz opcjonalnym pełnoekranowym modalem **Awansu Rangi** (z konfetti!).

#### Etap C: Reguły brzegowe sesji zadaniowej (obowiązkowe)
1. **Zejście do 0 serc w trakcie sesji:** po pokazaniu feedbacku błędnej odpowiedzi sesja zostaje **przerwana** i przechodzi w stan „Serca się skończyły”. Pozostałe zadania nie są naliczane (brak XP, brak monet za ukończenie lekcji, brak zaliczenia dnia), a bieżące odpowiedzi zostają zapisane lokalnie. Ekran pokazuje Lumi `supportive`, licznik `0/5`, przyciski **„Misja Ratunkowa”** i **„Sklep — 80 monet”** oraz **„Wróć później”**. Po odzyskaniu serca przycisk **„Kontynuuj lekcję”** wznawia od pierwszego nierozwiązanego zadania z zachowanym postępem.
2. **Przerwanie przez ucznia (X):** modal „Przerwać sesję? Postęp zostanie zapisany, ale lekcja nie zostanie ukończona”. Po potwierdzeniu postęp jest zapisywany, monety i XP za ukończenie nie przysługują.
3. **Trwałość między odświeżeniami:** stan `activeSession` (lekcja lub sesja powtórkowa) zapisywany jest razem ze stanem aplikacji po każdym sprawdzonym zadaniu. Po F5 uczeń wraca do pierwszego nierozwiązanego zadania z komunikatem „Wróciliśmy do Twojej lekcji”. **Wyjątek:** egzamin — patrz 6.8 (próba odrzucana).
4. **Zmiana przedmiotu w trakcie sesji:** wymaga potwierdzenia; po potwierdzeniu sesja jest zapisywana w tle (nie kasowana) i można do niej wrócić z ekranu Start przez CTA „Kontynuuj”.
5. **Kolejność zdarzeń po sprawdzeniu zadania (jedna, wspólna dla wszystkich typów):** `oceń -> odejmij serce (jeśli wrong) -> zaktualizuj combo -> nalicz XP -> nalicz postęp wyzwań i celu dnia -> dopisz do Banku Błędów (jeśli wrong) -> pokaż feedback`. Żadna animacja nie może zmienić tej kolejności.

### 6.6. Podręczny Panel „Przydatne Wzory E8” (Matematyka) vs Kontekstowe Sloty (Polski/Angielski)
- **W Matematyce (`FormulasBottomSheet`):**
  - Wysuwany z dołu Bottom Sheet (`SPRING_SHEET`, z gestem `drag="y"` do zamknięcia) dostępny z ekranu Nauki, z teorii Bento, z lekcji i z sesji powtórkowej.
  - **Decyzja wiążąca (bez „lub opcjonalnie”):** w trybie egzaminu (Mini-Arkusz i przyszły pełny arkusz) przycisk „Wzory E8” **jest całkowicie niedostępny** — znika z paska egzaminu i nie da się go otworzyć skrótem. Po oddaniu arkusza wraca normalnie. Uzasadnienie: zgodność ze standardem arkusza CKE; w lekcji i powtórkach wzory są zawsze dostępne.
  - Zawiera przejrzyste zakładki kategorii (np. *Potęgi i pierwiastki*, *Geometria i Pitagoras*, *Pola i objętości*, *Procenty i proporcje*), wzory w `KaTeX`, krótkie podpowiedzi „Kiedy użyć?” oraz prosty przykład liczbowy.
- **W Polskim i Angielskim:**
  - Przycisk „Wzory E8” **całkowicie znika z UI** (nie pokazujemy mylącej zakładki „Wzory” dla języków!).
  - W widoku danego przedmiotu zamiast tego znajduje się elegancka, zwinna karta zapowiedzi: *„Ściąga Lektur & Form (Wkrótce)”* dla Polskiego oraz *„Bank Zwrotów & Czasów (Wkrótce)”* dla Angielskiego.

### 6.7. Zakładka 3: Powtórki (Zapisane „Do powtórki” + Bank Błędów + Misja Ratunkowa)
- Górny przełącznik 2-stanowy z `layoutId`: **`Zapisane (N)`** | **`Bank Błędów (M)`**.
- Filtr pigułkowy po przedmiocie (`Wszystkie` / `Matematyka` / `Polski` / `Angielski`).
- **Widok „Zapisane do powtórki”:**
  - Lista zapisanych zadań posortowana malejąco po `savedAt`, z plakietką przedmiotu, podglądem treści zadania (z poprawnym `KaTeX`) i przyciskiem usunięcia zakładki.
  - Główny przycisk 3D **„Rozwiąż zapisane (N)”** — uruchamia sesję powtórkową wyłącznie z unikalnych zadań (`taskId + subjectId`), bez duplikatów.
  - Pusty stan: maskotka Lumi (`supportive`), napis „Nic tu jeszcze nie ma” i przycisk „Zapisz pierwsze zadanie w lekcji”.
- **Widok „Bank Błędów”:**
  - Każde zadanie trafia tu automatycznie po błędzie (z lekcji, powtórki lub po oddaniu egzaminu).
  - Przy każdym zadaniu widoczny wizualny pasek opanowania: **2 kropeczki/gwiazdki `correctStreak` (`0/2` -> `1/2` -> Opanowane i usunięte!)**.
  - Przycisk 3D **„Wyczyść błędy”** (uruchamia sesję powtórkową; błąd w trakcie zeruje `correctStreak` do `0`).
- **Karta / Modal „Misja Ratunkowa” (widoczny przy `< 5` serc lub z blokady `0 serc`):**
  - **Wariant darmowy:** rozwiąż poprawnie **2 zadania** z Banku Błędów lub Zapisanych = **`+1 Serce`** (limit: **max 3 razy na `playerDay`**; po wyczerpaniu wyraźna etykieta „Wykorzystano 3/3 dzisiaj — wróć jutro”). Gdy Bank i Zapisane są puste, wariant darmowy informuje o braku zadań do powtórki, a teoria Bento i wzory nadal działają bez blokad.
  - **Wariant płatny za monety:** **`80 monet = +1 Serce`**, bez limitu dziennego.
  - Zegar odliczający dokładnie ile minut zostało do automatycznej regeneracji kolejnego serca (`+1 serce / 30 min`).

### 6.8. Zakładka 4: Egzamin (Mini-Arkusz Testowy & Próbny Arkusz E8)
- **Ekran Lobby Egzaminu:**
  - Dwie dopracowane, dotykowe karty 3D z badge'ami:
    1. **Mini-Arkusz Testowy E8 (AKTYWNY W FAZIE 1):** `5 zadań • 15 minut • +40 monet • Bez utraty serc`. Przycisk 3D **„Rozpocznij Mini-Arkusz”**.
    2. **Pełny Próbny Arkusz E8 (WKRÓTCE — FAZA 2):** `19 zadań • 100 minut • +80 monet • Formuła CKE`. Elegancka karta z odznaką „Wkrótce” i podglądem struktury.
  - Historia ostatnich wyników mini-arkuszy (data, wynik %, zdobyte punkty).
- **Tryb Egzaminacyjny (w trakcie pisania):**
  - Górny pasek: przycisk `Zakończ` (wymaga modalu potwierdzenia „Przerwiesz próbę — niezapisane odpowiedzi zostaną utracone”), **Timer** (liczony wyłącznie jako `deadline - Date.now()`, odporny na przełączenie karty/zablokowanie telefonu; puls ostrzegawczy poniżej 60 s; **auto-submit** przy 0:00) oraz przycisk **siatki pytań** (`1–5`).
  - **Siatka pytań (`ExamQuestionGrid`):** szybkie przeskakiwanie między zadaniami 1–5 ze stanami kolorystycznymi (`Odpowiedziane`, `Pominięte`, `Aktualne`, ikona zakładki jeśli `Zapisane do powtórki`).
  - Brak podpowiedzi AI Tutora w trakcie egzaminu, **brak utraty serc**, możliwość zapisania dowolnego zadania do powtórki.
  - Zadanie otwarte w egzaminie oceniane jest zbiorczo przez `MockAiTutorService` dopiero **po oddaniu arkusza**.
  - Przycisk **„Oddaj arkusz”** na ostatnim pytaniu (lub z siatki) z krótkim podsumowaniem „Odpowiedziałeś na X z 5 zadań — oddać?”.
- **Ekran Podsumowania Egzaminu:**
  - Duży pierścień procentowy z animowanym wynikiem (np. `80%`), podsumowanie punktów CKE, zdobyte `+XP` i `+40 monet` (plus zaliczenie Dnia Gracza dla Serii!).
  - Lista wszystkich 5 zadań z możliwością rozwinięcia każdego: Twoja odpowiedź vs Poprawna odpowiedź vs Ocena AI Tutora + informacja „Błędne zadania (N) zostały automatycznie dodane do Banku Błędów”.
  - **Restart aplikacji w trakcie próby:** nieukończona próba egzaminu jest w całości odrzucana (brak oceny przed oddaniem -> zero wpisów w Banku Błędów, zero XP/monet).

### 6.9. Zakładka 5: Profil & Sklep Kosmetyków
Podzielona czystym przełącznikiem na **2 główne sekcje** (lub płynny układ z zakładkami `Profil & Ustawienia` | `Sklep Lumi`):

#### Część A: Profil Ucznia
- **Karta Gracza (Hero):**
  - Wybrane tło karty profilu (kosmetyk), ramka awatara z kolorem rzadkości, animowana maskotka `<LumiMascot />` w pełnym założonym ekwipunku, ksywka ucznia, założony **Tytuł Gracza** (np. *„Pogromca Ułamków”*), aktualna **Ranga E8** z ikoną Lucide i szczegółowym paskiem XP do kolejnej rangi.
  - Podgląd posiadanych **Tarcz Serii** (np. `0/2` lub `1/2` z opisem działania).
- **Ustawienia Aplikacji:**
  - Przełącznik motywu: **Nocturne Dark** / **Solar Light** (natychmiastowe płynne przełączenie bez przeładowania),
  - Przełącznik **Dźwięki SFX (Web Audio)** (`Wł./Wył.`),
  - Zmiana **ksywki** i **celu dziennego** (5 / 10 / 15 min),
  - Przycisk **„Powtórz intro / Product Tour”**,
  - Przycisk **„Resetuj postępy lokalne”** (z podwójnym modalem potwierdzenia — bardzo przydatne do testowania!).
    - **Zakres resetu (dokładny):** usuwa **cały** klucz `jasne-e8-app:state` z `localStorage` (postęp, XP, monety, serca, serię, tarcze, kosmetyki, wyzwania, powtórki, historię egzaminów, ustawienia motywu i SFX) i przywraca stan startowy, po czym **ponownie uruchamia onboarding** (nowy `guestId`). Nie pozostawia żadnego klucza pomocniczego i nie dotyczy plików aplikacji ani cache przeglądarki.
    - **Potwierdzenie dwustopniowe:** modal 1 „Usunąć wszystkie postępy?” -> modal 2 z przepisaniem słowa `RESET`. Po resecie toast „Postępy wyczyszczone” i ekran onboardingu.

#### Część B: Sklep Lumi (Kosmetyki + Tarcza Serii + Sekcja Premium „Wkrótce”)
Na górze Sklepu znajduje się **interaktywna Scena Przymierzalni z maskotką Lumi** — kliknięcie dowolnego kosmetyku (nawet jeszcze niekupionego!) pozwala go **przymierzyć na żywo** przyciskiem „Podgląd”, zanim uczeń kliknie „Kup”!

**Reguły zakupu (obowiązkowe):**
1. **Za mało monet:** przycisk „Kup” jest wizualnie nieaktywny (`disabled`, `opacity 0.5`), z etykietą `Brakuje X monet` zamiast ceny. Klik nie otwiera modalu zakupu, ale pokazuje toast „Zbierz jeszcze X monet — nagrody czekają w lekcjach i wyzwaniach”.
2. **Limit zapasu (Tarcza Serii):** przy `2/2` przycisk `Osiągnięto limit 2/2`, bez możliwości zakupu.
3. **Posiadany przedmiot:** przycisk `Założone` (jeśli aktywny) albo `Załóż`, cena znika, powtórny zakup niemożliwy (idempotencja po `itemId`).
4. **Zakup poprawny:** jedno zdarzenie: `odejmij monety -> dodaj do ownedItems -> założ (jeśli kosmetyk) -> zapis -> animacja`. Monety nigdy nie schodzą poniżej `0`.
5. **Zakup Tarczy Serii** nie zmienia `streakShields` powyżej `2` i nie jest możliwy przy `hearts === 0`? — **jest możliwy** (tarcza nie leczy), ale serce `+1` przy `5/5` jest zablokowane etykietą `Serca pełne (5/5)`.

Zakładki w Sklepie:
1. **Maskotka (Akcesoria i Kolory Lumi):**
   - *Słuchawki Gamingowe* — `150 monet` (Zwykłe)
   - *Okulary Pixelowe 8-bit* — `220 monet` (Rzadkie)
   - *Czapka Street E8* — `180 monet` (Zwykłe)
   - *Gogle Cyber-Alchemika* — `320 monet` (Rzadkie)
   - *Korona Mistrza E8* — `550 monet` (Epickie)
   - *Aura Plazmowego Pierścienia* — `750 monet` (Legendarne)
   - *Skórka: Lodowy Kryształ* — `260 monet` (Rzadkie)
   - *Skórka: Karmazynowa Kometa* — `380 monet` (Epickie)
2. **Ramki & Tytuły Profilu:**
   - Ramka *Szmaragdowy Impuls* — `140 monet`
   - Ramka *Złoty Pierścień E8* — `340 monet`
   - Ramka *Cyber-Plazma* — `620 monet`
   - Tytuł *„Pogromca Ułamków”* — `120 monet`
   - Tytuł *„Nocny Marek”* — `180 monet`
   - Tytuł *„Sniper CKE”* — `300 monet`
   - Tytuł *„Władca Pitagorasa”* — `450 monet`
3. **Wspomagacze (Drogie / Strategiczne):**
   - **Tarcza Serii (`streakShield`)** — **`450 monet`** (bardzo cenna ochrona 1 pominiętego dnia; limit zapasu: **max 2 sztuki**; przy 2/2 przycisk nieaktywny z etykietą „Osiągnięto limit 2/2”).
   - **Doładowanie +1 Serca** — **`80 monet`** (natychmiastowe +1 serce, max 5/5, bez limitu dziennego).
4. **Pakiety Premium / Mikropłatności (Sekcja „Wkrótce — Faza 2”):**
   - Elegancka, wyraźnie oznaczona sekcja zapowiedzi przyszłych mikropłatności kosmetyczno-wspomagających (np. *Pakiet Tarcza Serii ×2 + 500 Monet*, *Pakiet Założyciela Lumi*) z etykietą **„Dostępne w Fazie 2 — bez prawdziwych płatności w prototypie”**. Zawsze zachowana zasada: **nauka nigdy nie jest blokowana paywallem**.

---

## 7. Szczegółowe Mechaniki i Reguły Brzegowe (Single Source of Truth)

Wszystkie poniższe liczby i reguły muszą zostać zakodowane dokładnie tak w warstwie logiki (`src/lib/`):

### 7.1. Tabela Ekonomii (Wartości zbalansowane pod Sklep i drogą Tarczę Serii)

| Element | Wartość / Reguła |
|---|---|
| Stan początkowy (po onboardingu) | `120 monet`, `5/5 serc`, `0 XP`, ranga `Nowicjusz E8`, `0` Tarcz Serii |
| Nagroda: ukończona lekcja Bento | `+20 monet` |
| Nagroda: ukończony mini-arkusz E8 | `+40 monet` |
| Nagroda: ukończony pełny egzamin E8 | `+80 monet` |
| Nagroda: 1 wyzwanie dzienne | `+15 monet` (3 wyzwania dziennie = do `+45 monet/dzień`) |
| Bonus za wielokrotność 7 dni ciągłej serii | `+50 monet` przy 7., 14., 21., ... dniu ciągłej serii (idempotencja `streakMilestone + playerDay`) |
| **Tarcza Serii (Streak Shield)** | **`450 monet`**, max `2` w zapasie, chroni `1` pominięty dzień |
| Misja Ratunkowa — wariant darmowy | `2` poprawne zadania z Banku Błędów/Zapisanych = `+1 serce`, max `3` razy na `playerDay` |
| Misja Ratunkowa / Sklep — wariant płatny | `80 monet` = `+1 serce` (max 5/5), bez limitu dziennego |
| Regeneracja serc | `+1 serce` co `30 minut`, max `5`, liczona również offline (nadmiar czasu nie kumuluje się ponad 5). **Zakotwiczenie zegara:** stan trzyma `heartRefillAnchorAt` = moment, w którym serca spadły poniżej `5/5` (utrata serca lub obniżenie przez zdarzenie). Regeneracja liczy `floor((now - heartRefillAnchorAt) / 30 min)`; po każdym przyznanym sercu `heartRefillAnchorAt += 30 min * przyznane`. Gdy `hearts === 5`, pole jest `null` i zegar nie biegnie. Przykład: `4/5` od 29 minut -> utrata serca do `3/5` **nie** resetuje zegara, więc po 1 minucie wpada `+1` (do `4/5`), a nie po 30. |
| Utrata serca | Wyłącznie błędna odpowiedź w lekcji lub powtórce; **egzamin nigdy nie zabiera serc** |
| Bazowe XP: ABCD / Prawda-Fałsz | `10 XP` |
| Bazowe XP: Wpisanie odpowiedzi | `15 XP` |
| Bazowe XP: Zadanie otwarte | `25 XP` (za `2/2 pkt`; `12 XP` za `1/2 pkt`; `0 XP` za `0/2 pkt`) |

#### 7.1.1. Powtarzanie treści a nagrody (ochrona przed farmieniem i martwą drabinką XP)
- **Klucz księgi nagród:** `rewardLedger` w stanie gry, wpis `key = playerDay + ':' + contentId + ':' + rewardKind`, gdzie `rewardKind` to `coins` lub `xp`. `contentId` = `lesson:1.1` albo `mini-exam:default` (egzamin można zdawać wielokrotnie, ale nagroda dzienna liczona jest raz).
- **Pierwsze ukończenie danego `contentId` w danym `playerDay`:** pełne monety (`+20` lekcja / `+40` mini-arkusz / `+80` pełny egzamin) i `100%` XP.
- **Kolejne ukończenie tego samego `contentId` w tym samym dniu:** `0 monet` i **`30%` XP** (`Math.floor(xp * 0.3)`), z etykietą w podsumowaniu: „Powtórka — monety przyznawane raz dziennie, XP 30%”.
- **Nowy `playerDay`:** pełna nagroda znów przysługuje (klucz zawiera datę). Dotyczy to też powtórki lekcji następnego dnia.
- **Sesje powtórkowe (Zapisane, Bank Błędów, Misja Ratunkowa):** zawsze `0 monet` i **`50%` bazowego XP** zadania; nie zaliczają się do dziennego celu jako lekcja, ale liczą się jako zadania.
- **Dzienny cel i wyzwania** naliczają się przy każdym ukończeniu (nie są objęte księgą nagród), bo nie generują monet bezpośrednio — wyzwania mają własną idempotencję opisaną w 6.3.
- **Uzasadnienie liczb:** przy jednej lekcji i jednym mini-arkuszu dziennie pełne nagrody dają `60 monet` i ok. `150–200 XP` dziennie; próg `7000 XP` wymaga więc kilku tygodni regularnej nauki (celowo), a farmienie jednej lekcji daje `30%` XP i zero monet, co czyni je nieopłacalnym.

### 7.2. Combo i Mnożnik XP
- Mnożnik wyznaczany **po inkrementacji licznika (włącznie z bieżącą odpowiedzią)**:
  - `1–2` poprawne z rzędu -> **`x1.0`**
  - `3–4` poprawne z rzędu -> **`x1.5`** (już 3. poprawna odpowiedź dostaje `x1.5`!)
  - `5–7` poprawnych z rzędu -> **`x2.0`** (już 5. dostaje `x2.0`!)
  - `8+` poprawnych z rzędu -> **`x3.0`** (już 8. dostaje `x3.0`!)
- **Combo wygasa po `90 s` bez odpowiedzi w lekcji i sesji powtórkowej. W egzaminie combo nie wygasa w czasie** (egzamin ma 15 min na 5 zadań, więc licznik 90 s byłby matematycznie nieosiągalny) — egzamin liczy combo wyłącznie per sekwencja odpowiedzi i zeruje je na błędzie.
- Combo nie przenosi się między sesjami ani przedmiotami.

#### 7.2.1. Znaczenie wyniku zadania (jedna tabela dla wszystkich typów)
| Wynik | Definicja | Serce | Combo | Bank Błędów | XP |
|---|---|---|---|---|---|
| `correct` | ABCD/Prawda-Fałsz trafione; wynik liczbowy równy oczekiwanemu; otwarte `2/2` | bez zmian | `+1` | nie | pełne (z combo i karą za podpowiedzi) |
| `partial` | **wyłącznie** zadanie otwarte ocenione na `1/2` | bez zmian | **bez zmian** (nie rośnie, nie zeruje) | nie | `12 XP` bazowo (z combo) |
| `wrong` | błędna opcja, zły wynik liczbowy, otwarte `0/2`, brak odpowiedzi po „Sprawdź” | `-1` (poza egzaminem) | reset do `x1.0` | tak | `0` |

- **Poprawna odpowiedź po użyciu podpowiedzi** to nadal `correct`: działa combo i serce zostaje, karane jest wyłącznie XP (mnożnik `0,67 / 0,34 / 0,01`).
- **Uwaga:** `1/2` nigdy nie zabiera serca i nigdy nie trafia do Banku Błędów — inaczej uczeń byłby karany dwa razy za jedną próbę.
- Kara za podpowiedzi AI: każda podpowiedź (1, 2 lub 3) obniża maksymalne XP zadania o 33% (`1` podpowiedź -> `floor(base * 0.67)`, `2` -> `floor(base * 0.34)`, `3` -> `max(1, floor(base * 0.01))`; zawsze **min. 1 XP** za poprawną odpowiedź). Końcowe XP: `Math.max(1, Math.floor(adjustedBaseXP * comboMultiplier))`.

### 7.3. Rangi E8 (Progi XP)
1. **Nowicjusz E8** — `0 XP` (ikona `Sprout`)
2. **Tropiciel** — `500 XP` (ikona `Compass`)
3. **Taktyk** — `1500 XP` (ikona `Swords`)
4. **Mistrz E8** — `3500 XP` (ikona `Crown`)
5. **Legenda E8** — `7000 XP` (ikona `Flame`)
- Awans odpala pełnoekranowy modal z konfetti i jest ściśle jednorazowy (idempotencja po `achievedRankIds`). Przykład graniczny: przejście z `3499 XP` na `3500 XP` uruchamia awans na *Mistrz E8* dokładnie raz.

### 7.4. Dzień Gracza (`Europe/Warsaw`), Seria i Tarcza Serii
- **Dzień gracza (`playerDay`):** wyliczany zawsze dla strefy `Europe/Warsaw` przez `Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)` i składany jawnie do `YYYY-MM-DD`. Jedno źródło prawdy dla serii, wyzwań dziennych, limitu Misji Ratunkowych i bonusów.
- **Zaliczenie dnia:** ukończenie co najmniej **1 lekcji Bento** lub **1 mini-arkusza/egzaminu** w danym `playerDay`. Samo otwarcie aplikacji lub pojedyncza odpowiedź nie zalicza dnia.
- **Tarcza Serii dla `N` pominiętych dni:** jeśli między ostatnim zaliczonym dniem a dzisiaj minęło `N` pełnych pominiętych dni (np. `N=1` lub `N=2`) i uczeń posiada `streakShields >= N`, automatycznie zużywa się `N` Tarcz, seria zostaje zachowana i pojawia się powiadomienie „Tarcza Serii uratowała Twoją serię!”. Jeśli `streakShields < N`, Tarcze nie wystarczą — nie są zużywane, a seria zeruje się do `0`.
- **Różnica dni bez błędów DST (obowiązkowa implementacja):** nigdy nie dziel różnicy milisekund przez `86 400 000`. Najpierw zamień `YYYY-MM-DD` na indeks dnia: `const [y, m, d] = day.split('-').map(Number); const dayIndex = Date.UTC(y, m - 1, d) / 86_400_000;` (uwaga: `Date.UTC` przyjmuje miesiąc `0–11`). Różnica `dayIndex(dzisiaj) - dayIndex(ostatniZaliczonyDzien)` jest zawsze całkowita i odporna na zmianę czasu. `N = różnica - 1` to liczba pełnych pominiętych dni (`0` = dzień następny po zaliczonym, `1` = jeden pominięty dzień).
- **Wyzwania dzienne:** dokładnie `3` na dany `playerDay`, **globalne dla wszystkich przedmiotów**, losowane deterministycznie seedem `hash(playerDay)` — **bez `subjectId`**. Ten sam zestaw i ten sam postęp po przełączeniu przedmiotu, po F5 i po restarcie. W nowym dniu poprzedni stan wyzwań jest nadpisywany (brak archiwum w Fazie 1). Pula wyzwań i limit `45 monet/dzień` zgodnie z 6.3.

### 7.5. Zapisane Zadania & Bank Błędów
- **Deduplikacja Zapisanych:** klucz unikalny `taskId + ':' + subjectId`. Powtórny zapis aktualizuje `savedAt` i pokazuje toast „Już zapisane — zaktualizowano”. Selektor sesji „Rozwiąż zapisane” dodatkowo deduplikuje listę (odporność na uszkodzony/stary stan).
- **Bank Błędów:** licznik `correctStreak` — zadanie znika po **2 poprawnych odpowiedziach z rzędu** w trybie powtórki; błąd zeruje `correctStreak` do `0`.
- **Limity FIFO:** max `200` wpisów w Zapisanych i `200` w Banku Błędów — 201. unikalny wpis wyrzuca najstarszy (`savedAt`/`lastMistakeAt`) z jednorazowym toastem informacyjnym.

### 7.5.1. Sesja powtórkowa (`PracticeRunner`) — jeden runner, trzy źródła
Wszystkie powtórki korzystają z **jednego** komponentu `PracticeRunner` (ten sam co `TaskRunner` lekcji, z innym `source`), a nie z listy z przyciskiem otwierającym pojedyncze zadanie.

| Cecha | `source: 'saved'` (Rozwiąż zapisane) | `source: 'bank'` (Wyczyść błędy) | `source: 'rescue'` (Misja Ratunkowa) |
|---|---|---|---|
| Skąd zadania | unikalne wpisy Zapisanych (`taskId + subjectId`) | wpisy Banku Błędów | wpisy Banku Błędów **lub** Zapisanych |
| Monety | `0` | `0` | `0` |
| XP | `50%` bazowego, z combo | `50%` bazowego, z combo | `50%` bazowego, z combo |
| Serca | tak (`wrong` = `-1`) | tak | tak |
| Combo | tak, wygasa po 90 s | tak | tak |
| `correctStreak` Banku | nie dotyczy | `correct` -> `+1`, `wrong` -> `0`, `2/2` usuwa wpis | `correct` -> `+1` i zalicza misję, `wrong` -> `0` |
| Cel dzienny | liczy się jako zadania | liczy się jako zadania | liczy się jako zadania |
| Wyzwania | tak | tak | tak |

- **Pasek sesji:** tytuł (`Powtórka: Zapisane` / `Bank błędów` / `Misja Ratunkowa 0/2`), postęp `n/N`, licznik serc, przycisk `X` z potwierdzeniem.
- **Koniec sesji:** ekran podsumowania z `CountUpNumber` XP i liczbą opanowanych zadań (bez monet). Pusty zestaw -> Lumi `supportive` + powrót do listy.
- **Misja Ratunkowa:** postęp `poprawne/2` trzymany **per `playerDay`** w stanie gry, więc wyjście i powrót go nie zerują; zalicza go wyłącznie `correct` (nie `partial`). Po `2/2` natychmiast `+1 serce`, licznik `misjeWykorzystaneDzisiaj++`, reset licznika postępu misji do `0/2`. Limit `3` ukończonych misji na `playerDay`; po limicie karta pokazuje „Wykorzystano 3/3 dzisiaj”.
- **Wspólny licznik bez podwójnego naliczania:** jedno zdarzenie `correct` w źródle `bank` **jednocześnie** podnosi `correctStreak` i zalicza misję — to dwa różne liczniki, nie dwie nagrody. Zadanie usunięte z Banku po `2/2` nie może zostać zaliczone drugi raz do tej samej misji (deduplikacja po `taskId` w ramach bieżącej misji).
- **Brak farmienia:** sesja nie przyznaje monet ani nagród za ukończenie, więc nie obowiązuje jej księga nagród z 7.1.1; XP zawsze `50%`.

### 7.6. AI Tutor Mock (Deterministyczna Heurystyka Fazy 1)
Sprawdzanie odpowiedzi otwartej przebiega w ścisłej kolejności po normalizacji tekstu (`trim`, `toLowerCase`, usunięcie interpunkcji i polskich znaków diakrytycznych):
**Normalizacja i dopasowanie (twarde):** kolejność operacji jest obowiązkowa:
1. `trim` i `toLowerCase`;
2. **przecinek dziesiętny zamień na kropkę, zanim usuniesz interpunkcję:** `10,0` -> `10.0`, `1,5` -> `1.5` (inaczej `10,0` po usunięciu przecinka staje się `100` — to błąd);
3. usuń pozostałą interpunkcję i diakrytyki;
4. podziel na **tokeny** (`split(/\s+/)`) i porównuj liczby jako wartości (`10` = `10.0`, ale `10` ≠ `100`).

**Zakaz dopasowania podciągiem** (`includes`): `'3'` nie może trafić w `"30"` ani `"13"`. Wynik uznajemy za obecny tylko wtedy, gdy występuje jako **cały token** (lub cała liczba po normalizacji).

1. Odpowiedź pusta -> **`0/2 pkt`**.
2. Jeśli zadanie ma `resultOnly: true` i w odpowiedzi występuje **oczekiwany wynik jako cały token** -> **`2/2 pkt`**; jeśli nie występuje -> **`1/2 pkt`** („Wynik nie zgadza się z kluczem — sprawdź ostatni krok”).
3. Jeśli odpowiedź składa się wyłącznie z liczby/wyniku (np. `12`) przy `resultOnly: false` -> **`1/2 pkt`** (komunikat: „Wynik wygląda dobrze, ale na E8 egzaminator wymaga pokazania obliczeń!”). Jeśli ta liczba jest **inna** niż oczekiwana -> **`0/2 pkt`**.
4. Długość znormalizowanego tekstu `< 20` znaków -> **`0/2 pkt`** („Odpowiedź jest zbyt krótka — dopisz kroki rozwiązania”).
5. **Warunek `2/2` (łącznie, wszystkie muszą być spełnione):** długość `>= 40` znaków **oraz** co najmniej `2` słowa kluczowe z rubryki, **oraz** oczekiwany wynik obecny jako cały token (dla każdego zadania otwartego, także `resultOnly: false`).
6. Każdy inny przypadek (m.in. `20–39` znaków, `< 2` słów kluczowych, poprawny tok bez oczekiwanego wyniku) -> **`1/2 pkt`** („Dobry kierunek — rozwiń uzasadnienie i użyj kluczowych pojęć z zadania”).
7. **Zakaz `2/2` przy błędnym wyniku:** odpowiedź `„bok 7, krawędź 4, suma 11, bo 7 plus 4 daje 11”` przy oczekiwanym `10` musi dostać `1/2` (dobre słowa kluczowe, zły wynik), nigdy `2/2`.

**Testy graniczne heurystyki (muszą przejść):** `""` -> 0; `"10"` w zadaniu `resultOnly: true` z wynikiem 10 -> 2; `"100"` w tym samym zadaniu -> 1 (nie 2); `"nie wiem"` -> 0; 45 znaków z 3 słowami kluczowymi i wynikiem 11 przy oczekiwanym 10 -> 1; 45 znaków z 3 słowami kluczowymi i wynikiem 10 -> 2; `"3"` nie może dopasować oczekiwanego `"30"`.
- Sztuczne opóźnienie `MOCK_AI_LATENCY_MS = 700` ms + zawsze widoczna etykieta **„Ocena symulowana (Faza 1)”**.

---

## 8. Kompletny Zestaw Danych Testowych Fazy 1 (Mock Data)

Aplikacja musi zawierać autentyczne, poprawne merytorycznie, gotowe do gry polskie treści E8 (Matematyka):

### 8.1. Kompletna Lekcja Testowa 1.1: „Potęgi i pierwiastki w zadaniach E8”
- **Teoria Bento (4 karty):**
  1. *Esencja:* czym jest potęga ($a^n$), jak działa mnożenie/dzielenie potęg o tej samej podstawie, czym jest pierwiastek kwadratowy i sześcienny.
  2. *Wzory E8:* $a^m \cdot a^n = a^{m+n}$, $\frac{a^m}{a^n} = a^{m-n}$, $(a^m)^n = a^{m \cdot n}$, $\sqrt{a \cdot b} = \sqrt{a} \cdot \sqrt{b}$.
  3. *Przykład krok po kroku:* Oblicz wartość wyrażenia $\frac{2^7 \cdot 2^5}{(2^3)^3}$ (Krok 1: licznik $2^{12}$; Krok 2: mianownik $2^9$; Krok 3: dzielenie $2^{12-9} = 2^3 = 8$).
  4. *Pułapka E8:* $\sqrt{9 + 16} \neq \sqrt{9} + \sqrt{16}$! Najpierw dodajemy pod pierwiastkiem: $\sqrt{25} = 5$, a nie $3 + 4 = 7$.
- **5 Zadań w lekcji (każde z wyjaśnieniem i 3 poziomami podpowiedzi AI):**
  1. *(ABCD)* Wartość wyrażenia $\frac{3^8 \cdot 3^4}{3^{10}}$ wynosi: A) `3`, B) `9` *(poprawna)*, C) `27`, D) `81`.
  2. *(Prawda/Fałsz)* Oceń prawdziwość zdania: „Liczba $\sqrt{36 + 64}$ jest równa $\sqrt{36} + \sqrt{64}$.” — Poprawna: **Fałsz** ($\sqrt{100} = 10 \neq 14$).
  3. *(ABCD)* Liczba $\sqrt{50}$ jest równa: A) $2\sqrt{5}$, B) $5\sqrt{2}$ *(poprawna)*, C) $25\sqrt{2}$, D) $10\sqrt{5}$.
  4. *(Wpisz liczbę — `SmartMathKeyboard`)* Oblicz wartość wyrażenia $2^4 + \sqrt{81} - 5^2$. Poprawna: `0` (akceptowane `0`).
  5. *(Zadanie otwarte — AI Tutor, 2 pkt)* „Kwadrat ma pole równe $49\text{ cm}^2$, a sześcian ma objętość równą $27\text{ cm}^3$. Oblicz sumę długości boku tego kwadratu i krawędzi tego sześcianu. Zapisz obliczenia.”
     - Rubryka słów kluczowych mock AI: `['pierwiastek', '49', '7', '27', '3', 'suma', '10', 'bok', 'krawedz']`, oczekiwany wynik: `10`, `resultOnly: false`.

#### 8.1.1. Wyjaśnienia i podpowiedzi do lekcji 1.1 (gotowe treści, nie do wymyślania przez model)
Każde zadanie ma pole `explanation` (pokazywane po sprawdzeniu) oraz `hints[3]`. **Twarda reguła treści podpowiedzi:** poziom 1 naprowadza na pojęcie, poziom 2 podaje pierwszy krok, poziom 3 podaje szkielet obliczenia — **żaden poziom nie może zawierać końcowego wyniku ani gotowej odpowiedzi**.

1. **Zadanie 1 (ABCD, `9`).** `explanation`: „Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki (8+4=12), a przy dzieleniu odejmujemy (12−10=2), więc wynik to 3² = 9.”
   - H1: „Jaka zasada łączy potęgi o tej samej podstawie?”
   - H2: „Najpierw uprość licznik: 3⁸ · 3⁴.”
   - H3: „Podziel 3¹² przez 3¹⁰, odejmując wykładniki.”
2. **Zadanie 2 (P/F, `Fałsz`).** `explanation`: „√(36+64) = √100 = 10, a √36 + √64 = 6 + 8 = 14. Pierwiastka nie wolno rozdzielać na sumę.”
   - H1: „Czy pierwiastek sumy równa się sumie pierwiastków?”
   - H2: „Policz najpierw wartość pod pierwiastkiem po lewej stronie.”
   - H3: „Porównaj √100 z 6 + 8.”
3. **Zadanie 3 (ABCD, `5√2`).** `explanation`: „50 = 25 · 2, więc √50 = √25 · √2 = 5√2.”
   - H1: „Spróbuj rozłożyć liczbę pod pierwiastkiem na iloczyn z kwadratem.”
   - H2: „Który kwadrat liczby całkowitej dzieli 50?”
   - H3: „Zapisz 50 jako 25 · 2 i rozdziel pierwiastek.”
4. **Zadanie 4 (Wpisz liczbę, `0`).** `explanation`: „2⁴ = 16, √81 = 9, 5² = 25, więc 16 + 9 − 25 = 0.”
   - H1: „Oblicz każdy składnik osobno.”
   - H2: „Zacznij od 2⁴ i √81.”
   - H3: „Policz 16 + 9, a potem odejmij 25.”
5. **Zadanie 5 (Otwarte, `10`, `resultOnly: false`).** `explanation`: „Pole kwadratu 49 cm² daje bok √49 = 7 cm. Objętość sześcianu 27 cm³ daje krawędź ∛27 = 3 cm. Suma: 7 + 3 = 10 cm.”
   - H1: „Jak z pola kwadratu otrzymać długość boku?”
   - H2: „Jak z objętości sześcianu otrzymać długość krawędzi?”
   - H3: „Policz osobno bok kwadratu i krawędź sześcianu, a potem je dodaj.”

### 8.2. Kompletny Mini-Arkusz Testowy E8 (5 zadań, 15 minut, Matematyka)
Zestaw 5 świeżych zadań E8 (innych niż w lekcji 1.1), obejmujący:
1. *(ABCD)* Procenty / obniżka ceny plecaka o 20% ze 150 zł (`120 zł`, `resultOnly: true`). `explanation`: „20% ze 150 zł to 30 zł, więc 150 − 30 = 120 zł.”
2. *(Prawda/Fałsz)* Pole trójkąta prostokątnego o przyprostokątnych `6 cm` i `8 cm` wynosi `24 cm²` (`Prawda`, `resultOnly: true`). `explanation`: „P = ½ · 6 · 8 = 24 cm².”
3. *(ABCD)* Równanie liniowe $3(x - 2) = 15$ (`x = 7`, `resultOnly: true`). `explanation`: „Podziel obie strony przez 3: x − 2 = 5, więc x = 7.”
4. *(Wpisz liczbę)* Przeciwprostokątna trójkąta prostokątnego o przyprostokątnych `6` i `8` (`10`, `resultOnly: true`). `explanation`: „Twierdzenie Pitagorasa: 6² + 8² = 36 + 64 = 100, więc c = √100 = 10.”
5. *(Zadanie otwarte — AI Tutor, 2 pkt)* „Kasia kupiła 3 zeszyty po 4,50 zł i długopis za 6,50 zł. Zapłaciła banknotem 50 zł. Ile reszty otrzymała? Zapisz obliczenia.” (`30 zł`, `resultOnly: false`, słowa kluczowe: `['3', '450', '1350', '650', '20', '50', '30', 'reszta', 'koszt']`). `explanation`: „3 · 4,50 = 13,50 zł; 13,50 + 6,50 = 20 zł; 50 − 20 = 30 zł reszty.”
   - Podpowiedzi (poziomy 1–3, zasada jak w 8.1.1): H1 „Najpierw policz koszt zeszytów.”, H2 „Dodaj do tego długopis.”, H3 „Odejmij łączny koszt od 50 zł.”

**Podpowiedzi dla zadań 1–4 (zadanie 5 ma je wyżej), zgodne z regułą „podpowiedź nie zdradza wyniku”:**
- **Zadanie 1:** H1 „Ile wynosi 20% z 150 zł?”, H2 „Policz 10% i pomnóż przez 2.”, H3 „Odejmij rabat od ceny początkowej.”
- **Zadanie 2:** H1 „Jaki jest wzór na pole trójkąta?”, H2 „Pomnóż długości przyprostokątnych.”, H3 „Podziel iloczyn przez 2.”
- **Zadanie 3:** H1 „Jak odwrócić kolejność działań w równaniu?”, H2 „Podziel obie strony przez 3.”, H3 „Do wyniku dzielenia dodaj 2.”
- **Zadanie 4:** H1 „Który wzór łączy boki trójkąta prostokątnego?”, H2 „Policz sumę kwadratów przyprostokątnych.”, H3 „Wyciągnij pierwiastek z tej sumy.”

Wszystkie 5 zadań mini-arkusza ma komplet pól `explanation` i `hints[3]`; sprawdzają to kryteria **AC-L1** (komplet pól) i **AC-L2** (podpowiedź bez wyniku).

### 8.3. Katalog „Przydatne Wzory E8” (Matematyka)
4 zakładki (po 3–4 wzory w `KaTeX` z przykładem): *Potęgi i pierwiastki*, *Procenty i proporcje*, *Geometria płaska (Pitagoras, pola)*, *Bryły (graniastosłup, ostrosłup)*.

---

## 9. Architektura Techniczna i Przygotowanie pod Firebase (Faza 2 Ready)

### 9.1. Stack i struktura katalogów
- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + `motion/react` (Framer Motion) + `lucide-react` + `katex` + `canvas-confetti`.
- **Struktura modularna:**
```text
src/
  types/
    domain.ts              # SubjectId, Task, Lesson, UserProfile, GamificationState, ShopItem, ExamAttempt
    repositories.ts        # Kontrakty interfejsów pod lokalny storage i przyszły Firebase
  services/
    storage/
      localStateRepo.ts    # localStorage + schemaVersion + migracje + 3 MB pruning + QuotaExceeded fallback
      firebaseReadyStub.ts # Jasno opisany adapter-szkielet pod przyszły Cloud Firestore + Guest->Auth merge
    ai/
      aiTutorMock.ts       # IAiTutorService -> MockAiTutorService (deterministyczna heurystyka)
    audio/
      soundEngine.ts       # ISoundEngine -> ProceduralWebAudioSoundEngine (+ szkielet WavAssetSoundEngine)
  lib/
    playerDay.ts           # Europe/Warsaw formatToParts -> YYYY-MM-DD + obliczenia różnicy dni
    gamification.ts        # Czyste funkcje: XP, Combo, Rangi, Serca offline, Seria + N Tarcz, Seed Wyzwań
    motionPresets.ts       # Sprężyny, warianty kaskadowe, helpery reduced-motion
  data/
    mathLessonMock.ts      # Lekcja 1.1 + mapa 7 działów
    mathExamMock.ts        # Mini-Arkusz 5 zadań
    mathFormulas.ts        # Wzory E8 w KaTeX
    shopCatalog.ts         # Kosmetyki Lumi, Ramki, Tytuły, Tarcza Serii (450), Serce (80), Premium Wkrótce
    dailyChallengesPool.ts # Pula wyzwań dziennych (w tym Codzienny Sprint)
  context/
    AppStateContext.tsx    # Główny store z akcjami domenowymi i debounced zapisem 300 ms
  components/
    mascot/                # LumiMascot.tsx (wielowarstwowy animowany SVG + kosmetyki)
    onboarding/            # OnboardingFlow.tsx (5 kroków + Product Tour)
    layout/                # TopHud.tsx, BottomTabBar.tsx, DesktopSidebar.tsx, SubjectSwitcher.tsx
    start/                 # StartView.tsx, DailyChallengesCard.tsx
    learn/                 # LearnPathView.tsx, SubjectComingSoonView.tsx
    lesson/                # LessonView.tsx, BentoTheoryTabs.tsx, TaskRunner.tsx, AnswerOptionCard.tsx,
                           # SmartMathKeyboard.tsx, OpenTaskAiBox.tsx, LessonSummaryModal.tsx
    formulas/              # FormulasBottomSheet.tsx
    vault/                 # VaultView.tsx, RescueMissionModal.tsx
    exam/                  # ExamLobbyView.tsx, ExamRunnerView.tsx, ExamQuestionGrid.tsx, ExamSummaryView.tsx
    profile/               # ProfileShopView.tsx, MascotDressingRoom.tsx, RankUpModal.tsx
    ui/                    # TactileButton.tsx, BottomSheet.tsx, CountUpNumber.tsx, MathText.tsx, ToastHost.tsx
```

### 9.2. Odporność `localStorage` i gotowość na Firebase
- Klucz: `jasne-e8-app:state`, pole `schemaVersion: 1`, pole `accountMode: 'guest'` oraz `guestId` (UUID) — gotowe do płynnego przeniesienia dokumentu gościa do `users/{uid}` po włączeniu Firebase Auth w Fazie 2.
- Odczyt zawsze w `try/catch` z walidacją kształtu: uszkodzony JSON lub `schemaVersion` z przyszłości -> bezpieczny reset do stanu startowego + toast ostrzegawczy, zero białego ekranu.
- Miękki limit `3 MB` (automatyczne przycinanie FIFO Zapisanych/Banku Błędów) + obsługa `QuotaExceededError` (toast + dalsze działanie w pamięci sesji).
- Zapis debounced `300 ms` + synchroniczny flush na `visibilitychange` (`hidden`).

---

## 10. Kryteria Akceptacji (numerowane, wiążące dla wdrożenia)

Każde kryterium ma identyfikator używany w promptach i w testach ręcznych. Format: **Given / When / Then**. Wdrożenie uznajemy za gotowe dopiero, gdy wszystkie `AC-*` przechodzą.

### 10.1. Seria i dzień gracza
- **AC-S1:** Given gracz ukończył lekcję dziś, When sprawdzamy `playerDay`, Then data jest w formacie `YYYY-MM-DD` dla `Europe/Warsaw` (nie dla strefy urządzenia).
- **AC-S2:** Given poprzedni dzień zaliczony wczoraj, When gracz nie ukończył nic przez cały kolejny dzień i wraca następnego dnia, Then `N=1`: przy `streakShields >= 1` tarcza jest zużyta i seria zachowana, a bez tarczy seria `0` (brak stanu „N z ostrzeżeniem” — rozstrzygnięcie następuje przy wejściu, zgodnie z 7.4).
- **AC-S3:** Given `N=1` pominięty dzień i `streakShields=1`, When gracz wraca, Then tarcza jest zużyta (`0`), seria zachowana, widoczny komunikat „Tarcza Serii uratowała Twoją serię!”.
- **AC-S4:** Given `N=2` pominięte dni i `streakShields=1`, When gracz wraca, Then tarcze **nie** są zużywane, seria `0`.
- **AC-S5:** Given ostatni dzień `2026-03-28`, When gracz wraca `2026-03-30` z 1 tarczą (zmiana czasu), Then różnica to dokładnie `1` pominięty dzień, tarcza zużyta, seria zachowana.
- **AC-S6:** Given ostatni dzień `2026-10-25`, When gracz wraca `2026-10-26`, Then różnica to `0` pominiętych dni i seria rośnie o `1` po ukończeniu lekcji.
- **AC-S7:** Given 7. dzień ciągłej serii, When dzień zostaje zaliczony, Then `+50 monet` przyznane raz (ponowne wejście tego dnia nie powtarza bonusu).

### 10.2. Serca i Misja Ratunkowa
- **AC-H1:** Given `4/5` serc, When mija 30 minut (także przy zamkniętej aplikacji), Then `5/5`.
- **AC-H2:** Given `0` serc, When gracz próbuje rozpocząć zadania lekcji, Then start jest zablokowany modalem z akcjami „Misja Ratunkowa” i „Sklep” (przycisk „Przejdź do zadań” nieaktywny).
- **AC-H3:** Given `0` serc, When gracz otwiera teorię Bento lub Wzory E8, Then dostęp jest pełny, bez blokad.
- **AC-H4:** Given `hearts=3`, When mija 90 minut, Then `hearts=5` (nadmiar nie przekracza 5).
- **AC-H5:** Given `hearts=4` od 29 minut, When tracimy serce do `3/5`, Then po 1 minucie wpada `+1` (zegar nie resetuje się).
- **AC-H6:** Given 3 ukończone darmowe misje dziś, When gracz otwiera misję, Then etykieta „Wykorzystano 3/3 dzisiaj — wróć jutro”, a wariant za 80 monet nadal działa.
- **AC-H7:** Given `1` serce, When gracz myli się na 2. z 5 zadań, Then sesja przechodzi w stan „Serca się skończyły”, pozostałe zadania nie są naliczane, brak monet i XP za ukończenie, a „Kontynuuj lekcję” po odzyskaniu serca wznawia od zadania 3.
- **AC-H8:** Given przerwana sesja i odświeżenie strony, When gracz wraca, Then widzi pierwsze nierozwiązane zadanie (postęp zapisany), poza egzaminem.

### 10.3. Combo i XP
- **AC-C1:** Given 2 poprawne z rzędu, When odpowiada poprawnie po raz 3., Then mnożnik `x1.5` obowiązuje **już tę** odpowiedź.
- **AC-C2:** Given 4 poprawne, When 5. jest poprawna, Then `x2.0`; 8. poprawna daje `x3.0`.
- **AC-C3:** Given combo `x2.0`, When mija 90 s bez odpowiedzi w lekcji, Then combo wraca do `x1.0` (w egzaminie **nie** wygasa).
- **AC-C4:** Given combo `x2.0`, When odpowiedź jest błędna, Then combo `x1.0`, serce `-1` (poza egzaminem).
- **AC-C5:** Given użyto 1 podpowiedzi, When odpowiedź poprawna, Then XP = `max(1, floor(floor(base * 0.67) * combo))`; przy 3 podpowiedziach `max(1, floor(floor(base * 0.01) * combo))`. Przykład: `base=10`, 1 podpowiedź, combo `x1.5` -> `floor(6 * 1.5) = 9` (nie `10`).
- **AC-C6:** Given otwarte ocenione `1/2`, When sprawdzamy, Then serce bez zmian, combo bez zmian, brak wpisu w Banku, XP `12` bazowo.
- **AC-C7:** Given odpowiedź poprawna po podpowiedzi, When sprawdzamy, Then brak utraty serca i normalne combo.

### 10.4. Ekonomia i nagrody
- **AC-E1:** Given nowy gracz po onboardingu, Then `120 monet`, `5/5 serc`, `0 XP`, `Nowicjusz E8`, `0` tarcz.
- **AC-E2:** Given pierwsze ukończenie lekcji dziś, Then `+20 monet` i `100%` XP.
- **AC-E3:** Given to samo `contentId` ukończone 3× tego samego dnia, Then monety przyznane raz, a XP za 2. i 3. przebieg = `30%`.
- **AC-E4:** Given ten sam `contentId` ukończony następnego dnia, Then znowu pełne `+20 monet` i `100%` XP.
- **AC-E5:** Given sesja powtórkowa, Then `0 monet` i `50%` bazowego XP.
- **AC-E6:** Given mini-arkusz ukończony 2× dziś, Then `+40 monet` raz.
- **AC-E7:** Given XP `3499`, When zdobywa `1 XP`, Then awans na `Mistrz E8` dokładnie raz (`3500`), bez powtórki po F5.
- **AC-E8:** Given `0 monet` i przedmiot za `150`, When klika „Kup”, Then brak zakupu, etykieta „Brakuje 150 monet”, toast z podpowiedzią.

### 10.5. Wyzwania dzienne
- **AC-D1:** Given dzień `D`, When przełączamy Matematyka -> Polski -> Angielski, Then te same 3 wyzwania, ten sam postęp, ten sam stan odbioru.
- **AC-D2:** Given wszystkie 3 wyzwania ukończone i odebrane, Then suma monet z wyzwań tego dnia = `45`, czwarty odbiór niemożliwy.
- **AC-D3:** Given restart aplikacji po odebraniu wyzwania, Then stan „Odebrane ✓” i brak ponownej nagrody.
- **AC-D4:** Given nowy `playerDay`, Then nowy zestaw 3 wyzwań, liczniki `0`, poprzedni stan nadpisany.

### 10.6. Lekcja, powtórki i egzamin
- **AC-L1:** Given lekcja 1.1, When liczymy zadania, Then jest ich `5` (2×ABCD, 1×Prawda/Fałsz, 1×liczbowe, 1×otwarte) i każde ma `explanation` oraz `hints[3]`.
- **AC-L2:** Given dowolne `hints[i]`, Then tekst nie zawiera końcowego wyniku zadania.
- **AC-P1:** Given 3 zapisane zadania, When startuje „Rozwiąż zapisane”, Then sesja ma `3` kroki, własny pasek postępu i podsumowanie bez monet.
- **AC-P2:** Given sesja powtórkowa i błędna odpowiedź, Then serce `-1` (poza egzaminem), combo reset, wpis w Banku.
- **AC-P3:** Given zadanie w Banku z `correctStreak=1`, When odpowiada poprawnie w „Wyczyść błędy”, Then wpis znika (`2/2`).
- **AC-P4:** Given misja `1/2` i wyjście z sesji, When wraca tego samego dnia, Then licznik nadal `1/2`; przerwanie nie zalicza misji.
- **AC-P5:** Given `2/2` w misji, Then `+1 serce` i `misjeWykorzystaneDzisiaj++`, licznik misji `0/2`.
- **AC-X1:** Given egzamin rozpoczęty, When mija czas, Then auto-submit o `0:00` i wynik zapisany.
- **AC-X2:** Given egzamin i przełączenie karty na 5 min, When wracamy, Then pozostały czas liczony z `deadline - Date.now()`.
- **AC-X3:** Given egzamin przerwany przez F5, Then próba odrzucona: `0 XP`, `0 monet`, brak wpisów w Banku.
- **AC-X4:** Given egzamin, When próbujemy otworzyć „Wzory E8”, Then przycisk nie istnieje w UI.
- **AC-X5:** Given odpowiedzi `1/2` w egzaminie, Then brak utraty serc i brak wpisu w Banku (tylko `0/2`).

### 10.7. AI Tutor (mock)
- **AC-A1:** Given pusta odpowiedź, Then `0/2` i etykieta „Ocena symulowana (Faza 1)”.
- **AC-A2:** Given `resultOnly: true` i wynik jako cały token poprawny, Then `2/2`; wynik błędny -> maks. `1/2`.
- **AC-A3:** Given 45 znaków, 3 słowa kluczowe i **błędny** wynik, Then `1/2` (nigdy `2/2`).
- **AC-A4:** Given `"3"` przy oczekiwanym `"30"`, Then brak dopasowania (porównanie tokenów, nie podciągów).
- **AC-A5:** Given poprawna, pełna odpowiedź, Then `2/2` dopiero po `700 ms` i zawsze z etykietą symulacji.

### 10.8. Mobile, dostępność i desktop
- **AC-M1:** Given `360px`, `390px`, `430px`, `844×390` i `1440px`, Then `0px` poziomego overflow.
- **AC-M2:** Given `360px`, Then HUD nie zawija się, używa skrótów przedmiotu i samej liczby serc.
- **AC-M3:** Given jakikolwiek przycisk/wskaźnik, Then strefa dotyku `≥ 44×44px` i `env(safe-area-inset-bottom)` na dole.
- **AC-M4:** Given `prefers-reduced-motion: reduce`, Then brak cząsteczek, konfetti, wstrząsów i sprężystych wyskoków; zostają przejścia `opacity ≤ 100 ms`.
- **AC-M5:** Given wypełnienie `--accent-primary`, Then etykieta ma kolor `--on-accent`; kontrast tekstu ≥ 4,5:1, UI ≥ 3:1 (także Solar).
- **AC-M6:** Given desktop `1280px`, Then brak prawego panelu i brak przyciętej treści; panel pojawia się dopiero od `1440px`.
- **AC-M7:** Given walidacja nicku, Then pusty, 1-znakowy i 21-znakowy nick są odrzucane, a nick 2–20 znaków przechodzi.

### 10.9. Trwałość, offline i integracje
- **AC-V1:** Given uszkodzony JSON w `jasne-e8-app:state`, When start, Then reset do stanu startowego + toast, brak białego ekranu.
- **AC-V2:** Given `schemaVersion` z przyszłości, Then bezpieczny reset z komunikatem.
- **AC-V3:** Given `QuotaExceededError`, Then toast i dalsza praca w pamięci sesji, bez utraty bieżącej sesji.
- **AC-V4:** Given 201. wpis w Zapisanych lub Banku, Then najstarszy wypada (FIFO 200).
- **AC-V5:** Given przełączenie motywu, wyłączenie SFX i założenie kosmetyku, When F5, Then wszystkie trzy ustawienia zachowane.
- **AC-V6:** Given pierwsze uruchomienie bez internetu, Then fonty i wzory KaTeX renderują się poprawnie (brak CDN).
- **AC-V7:** Given reset postępów, Then znika cały klucz stanu, wraca onboarding, motyw i SFX również wracają do domyślnych.

### 10.10. Sklep i zawartość
- **AC-G1:** Given Sklep, Then Tarcza Serii `450 monet` (max 2), Serce `80 monet`, sekcja Premium oznaczona „Wkrótce (Faza 2)”.
- **AC-G2:** Given „Podgląd” kosmetyku, Then Lumi zmienia strój natychmiast, jeszcze przed zakupem.
- **AC-G3:** Given zakup kosmetyku, Then `ownedItems` zawiera przedmiot, monety odjęte raz, Lumi w nowym stroju w całej aplikacji.
- **AC-G4:** Given Polski lub Angielski, Then przycisk „Wzory E8” nie istnieje, a widok pokazuje zapowiedź kontekstową.
- **AC-G5:** Given dowolny ekran, Then nie ma `alert()`, `// TODO`, pustych handlerów, brudnopisu ani Areny.

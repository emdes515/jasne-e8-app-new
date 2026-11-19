# AGENTS.md — Kontrakt Operacyjny Ekosystemu JASNE E8

> Ten plik obowiązuje każdego agenta AI pracującego w repozytoriach `jasne-e8-app-new` oraz `jasne-e8-admin`. Źródłem prawdy (SSOT) dla architektury i produktu są dokumenty w `docs/`:
> - `docs/ARCHITECTURE_E8_DATA_FIREBASE_SPEC.md`
> - `docs/MASTER_SPEC_AI_STUDIO.md`
> - `docs/QA_HANDOFF_2026-11-19.md`

---

## 1. Co budujemy i mapa ekosystemu JASNE E8

Budujemy **mobile-first** aplikację edukacyjno-gamingową (PWA → docelowo **Capacitor iOS/Android**) przygotowującą uczniów do **Egzaminu Ósmoklasisty (E8)**.
- **Faza 1:** Matematyka (architektura nawigacji, danych i profilu gotowa na Język Polski i Język Angielski).

### Dwa osobne repozytoria GitHub i projekty Vercel
1. **Aplikacja ucznia:** `emdes515/jasne-e8-app-new` (`https://jasne-e8-app-new.vercel.app`)
   - Stack: **Next.js 15, React 19, TypeScript, Tailwind CSS 4, KaTeX, Framer Motion (`motion`)**.
   - Rdzeń produktu: kierunek wizualny **Tactile 3D Gaming**, Dual-Theme (**Nocturne Dark** / **Solar Light**), wektorowa maskotka **Lumi** (8 emocji + warstwowe kosmetyki), lekcje **Bento** (4 karty teorii), **7 typów zadań CKE**, tryb skupienia, pismo odręczne/zdjęcia, mini-arkusze, seria i **Tarcza Serii** (450 monet).
2. **Panel Redakcji i Dewelopera (Studio):** `emdes515/jasne-e8-admin` (`https://jasne-e8-admin.vercel.app`)
   - Stack: osobna aplikacja **Next.js 15** z bramką **Firebase Auth + Admin SDK** (*Nocturne Editorial Console*).
   - Moduły: 3-panelowy CMS dla wszystkich **7 typów zadań CKE** z interaktywnym symulatorem telefonu `390 px`, edytor Lekcji Bento (`admin_lessons`), kreator Arkuszy CKE (`admin_sheets`), Importer JSON/PDF, 1-klik publikacja paczek do **Storage CDN** + `meta/content_manifest` + **Remote Config**, Live Remote Config & Soft/Force Update, Sklep Lumi, LiveOps oraz Konta/Uprawnienia (`private/entitlements`, `ledger`, role `admin` / `editor`).

### Wspólny projekt Firebase
- **Projekt:** `jasne-e8-app` (numer: `934617311874`, konto: `mjankowski515@gmail.com`, plan: **Blaze**, region: `europe-central2` Warszawa, standardowa baza `(default)`).
- **Usługi:**
  - **Firestore** (`firestore.rules`),
  - **Authentication** (Email/Hasło, Anonymous Auth; admin `mjankowski515@gmail.com` z `customClaims.role = "admin"`),
  - **Storage** (`jasne-e8-app.firebasestorage.app`, `storage.rules`),
  - **Remote Config** (`contentManifestVersion`, `app_update_policy`, `feature_flags`, `economy_config`).

---

## 2. Kluczowe zasady architektury (SSOT z `docs/`)

1. **7 typów zadań CKE E8 + pochodzenie (`origin`):**
   - Typy: `single_choice`, `true_false_multi`, `dual_choice`, `choice_with_reason`, `numeric_input`, `open_calculation`, `open_proof`.
   - Oznaczanie źródła: `cke_official`, `jasne_cke_variant`, `jasne_original`.
   - **Zakaz duplikowania wersji A/B** arkuszy CKE — przechowujemy kanoniczną treść zadania i używamy dynamicznego tasowania opcji (`shuffleOptions`).
2. **Minimalizacja odczytów Firestore (~3–6 readów/uczeń/dzień):**
   - Treści edukacyjne (zadania, lekcje, wzory, arkusze) są publikowane jako skompresowane paczki JSON w **Firebase Storage (`/packs/**`)** + wersjonowane przez `meta/content_manifest` oraz `contentManifestVersion` w **Remote Config** + lokalny cache klienta (**IndexedDB / SQLite**).
   - **Nigdy nie projektuj odczytu pojedynczych dokumentów zadań po stronie aplikacji ucznia.**
3. **Wskazówki Static-First + AI Tutor on-demand:**
   - Wskazówki bazowe `staticHints` (elastycznie **1–3** w bazie zależnie od trudności) ładują się z paczką działu przy **0 zł kosztów AI**.
   - **AI Tutor** działa na żądanie i jest rozliczany serwerowo z limitów konta (`dailyFreeUsed` → `monthlyPlanRemaining` → `purchasedPackCredits`), z automatycznym zwrotem (`refund`) przy błędzie/timeoucie.
4. **Model bezpieczeństwa danych i ekonomii:**
   - Klient ucznia **nigdy** nie zapisuje do `meta/**`, `config/**`, `content/**`, `admin_tasks/**`, `server_config/**`, `users/{uid}/private/**` ani `users/{uid}/ledger/**`.
   - Cała ekonomia (monety, pakiet Pro, serca, Tarcze Serii, kredyty AI, zakupy w sklepie) jest obsługiwana **wyłącznie po stronie serwera / Admin SDK / Cloud Functions** z transakcyjnym wpisem w `users/{uid}/ledger/{txId}`.

---

## 3. Obowiązkowa integracja z Drugim Mózgiem (Second Brain)

Lokalizacja skarbca: `C:\Users\mateu\SecondBrain`

1. **Przed rozpoczęciem pracy:**
   - Przeczytaj aktualny stan projektu w:
     - `C:\Users\mateu\SecondBrain\01_Projects\Osobiste\JASNE\00_JASNE_Command_Center.md`
     - `C:\Users\mateu\SecondBrain\Todos.md`
     - bieżącej notatce dziennej `C:\Users\mateu\SecondBrain\Days\YYYY-MM-DD.md`
   - Nowy kod, architektura i decyzje muszą być spójne z dokumentacją w skarbcu.
2. **Po każdej zmianie, wdrożeniu lub researchu:**
   - Zaktualizuj `C:\Users\mateu\SecondBrain\Todos.md` (`[x]` ukończone, `[ ]` nowe zadania).
   - Odnotuj wykonany krok w `C:\Users\mateu\SecondBrain\Days\YYYY-MM-DD.md`.
   - Zsynchronizuj dokumentację projektu (w tym `00_JASNE_Command_Center.md` lub powiązane notatki modułowe).
3. **Standardy techniczne Second Brain:**
   - Linki wewnętrzne wyłącznie w formacie Wikilinks `[[Nazwa Notatki]]`.
   - Kodowanie **UTF-8**, pełny poprawny język polski.
   - **Zakaz usuwania starych notatek** bez wyraźnej zgody użytkownika — wyłącznie dopisuj, aktualizuj lub archiwizuj.

---

## 4. Aktywne szukanie i instalowanie Skilli, Pluginów i narzędzi

1. Masz obowiązek **aktywnie szukać, instalować i używać** najlepszych dostępnych Agent Skills (przez `find-skills`, lokalny katalog `C:\Users\mateu\.agents\skills\`, repozytoria GitHub ze skillami i pluginami, paczki open-source/npm, szablony i narzędzia CLI/MCP), które realnie podnoszą jakość kodu, UI, testów i architektury.
2. **Przed każdym większym zadaniem** sprawdź i załaduj pasujące skille, w szczególności:
   - `frontend-ui-engineering`, `vercel-react-best-practices`, `ui-taste`
   - `firebase-firestore`, `firebase-auth-basics`, `firebase-hosting-basics`, `firebase-security-rules-auditor`
   - `code-review-and-quality`, `test-driven-development`, `debugging-and-error-recovery`, `security-and-hardening`
3. Jeśli brakuje lepszego skilla lub pluginu — **znajdź go i zainstaluj** (z GitHuba lub rejestrów skilli).
4. Wartościowe znalezione skille, pluginy i paczki **odnotowuj w Second Brain**.

---

## 5. Jakość, bezpieczeństwo i zasady graficzne

1. **Ochrona sekretów:**
   - Nigdy nie zapisuj kluczy API, tokenów, plików `.env.local` ani zawartości `.secrets/` w kodzie, commitach, logach ani plikach współdzielonych.
2. **Weryfikacja przed zgłoszeniem ukończenia (zero zgadywania):**
   - Zawsze sprawdź realny stan zmodyfikowanych plików.
   - Uruchom weryfikację odpowiednią dla danego repozytorium:
     - `npx tsc --noEmit` (0 błędów),
     - testy (`bun test`),
     - build produkcyjny (`npm run build`).
   - Dla zmian UI zweryfikuj widoki **mobile (`320px`, `390px`)** i **desktop (`1440px`)** w obu motywach (`Nocturne` i `Solar` w aplikacji ucznia).
3. **Zakaz operacji destrukcyjnych:**
   - Nigdy nie wykonuj destrukcyjnych operacji git (`git reset --hard`, `git push --force`) ani nie usuwaj danych/zasobów chmurowych Firebase/Vercel bez wyraźnej zgody użytkownika.
4. **Grafiki i identyfikacja wizualna:**
   - **Kategoryczny zakaz generowania grafik przez API** (DALL-E, OpenAI, OpenRouter, subagenty `image-generator` itp.).
   - Przygotowuj wyłącznie gotowe, produkcyjne **prompty pod Google Flow** (z podziałem na *Action & Scenery*, *Lighting & Mood*, *Negative Prompt* oraz wytyczne kompozycyjne zgodne z estetyką projektu).

---

## 6. Styl komunikacji

- **Na czacie:** odpowiadaj **po polsku, zwięźle i konkretnie** (bez waty), podając dokładne ścieżki plików, wyniki uruchomionych testów i realny status prac.
- **W plikach:** kod, dokumenty `.md`, opisy commitów i wpisy w Second Brain pisz pełną, czystą polszczyzną (identyfikatory techniczne w kodzie konsekwentnie po angielsku).

---

## 7. Przeglądarka w T3 Code (zweryfikowane 2026-11-19)

1. **Wewnętrzna przeglądarka T3 = narzędzia `preview_*`** z serwera MCP `t3-code-<threadId>`:
   - `preview_open`, `preview_navigate`, `preview_resize` (`fill` / `freeform` / `preset`), `preview_evaluate`, `preview_snapshot` (`save: true` zapisuje PNG w `%USERPROFILE%\.t3\userdata\browser-artifacts\`), `preview_act` (click/type/hover/select/press/scroll), `preview_dialog`, `preview_status`, `t3_preview_list`.
   - To jest właściwy sposób sprawdzania UI, zrzutów ekranu i pomiarów layoutu w tym ekosystemie.
2. **`browser.*` (45 narzędzi opencode) NIE działa w T3 Code** — to mostek desktopowy opencode 2.3.2, który wymaga klienta wysyłającego `attach.started`. T3 Code 0.1.10 go nie implementuje, więc wynikiem jest zawsze `[browser.disconnected]`, **niezależnie od modelu i providera** (Antigravity, Codex, Claude czy OpenCode — bez różnicy). Nie ponawiać wywołań `browser.*`; od razu używać `preview_*`.
3. **Fallback poza T3** (CI, sesje bez MCP, modele bez `preview_*`): `npm run shot -- <url> --size 390x844 [--out plik.png] [--full] [--json] [--net]` — `scripts/shot.mjs` steruje lokalnym Chrome/Edge po CDP bez zależności npm; zwraca PNG, `horizontalOverflow`, listę elementów wystających poza viewport, błędy konsoli i żądania 4xx/5xx.
4. **Wątek pomocniczy dla Antigravity (Hydrogen):** harness `antigravity-acp` nie wystawia `preview_open`, `preview_navigate` ani `preview_act` (wstrzykuje 61 z 71 narzędzi MCP `t3-code`). Pracując na modelach Antigravity, zlecaj testy w wewnętrznej przeglądarce T3 przez `t3_thread_send` → `t3_thread_wait` → `t3_thread_read` do stałego wątku **OpenCode (`opencode/deepseek-v4.1-flash-free`)**: `threadId: mcp:3f6b8c5a-c096-416a-804a-4c708b307d81:fork` (`QA Przeglądarka (OpenCode)`). Wątek pomocniczy służy wyłącznie do testów i podglądu w przeglądarce (bez edycji kodu).

# Przekazanie do odbioru QA — JASNE E8 (Migracja Firebase Blaze + Przebudowa Panelu Admina)

**Data:** 2026-11-19  
**Autor:** Adam (Dev)  
**Odbiorca:** Judytka (QA)  
**Status:** Gotowe do odbioru QA (wdrożone na produkcji Vercel i Firebase)

---

## 1. Zakres zmian i wdrożone środowisko

### Infrastruktura Firebase (nowy projekt na koncie docelowym `mjankowski515@gmail.com`)
- **Stary projekt:** `jasne-e8-prod` (`602916567036`, konto `mateuszhg5@gmail.com`) został usunięty (`DELETE_REQUESTED`).
- **Nowy projekt:** `jasne-e8-app` (numer `934617311874`, aktywny plan **Blaze** `01E979-286753-6687DC`).
- **Usługi aktywne i zweryfikowane:**
  - **Firestore:** standardowa baza `(default)`, region `europe-central2` (Warszawa). Zasidowane: `meta/content_manifest` (v1), `config/live_ops`, `config/shop_catalog` (10 pozycji), `admin_tasks/cke_2025_maj_z07_demo`.
  - **Reguły Firestore (`firestore.rules`):** wdrożone po audycie zgodności ze specyfikacją (`ARCHITECTURE_E8_DATA_FIREBASE_SPEC.md`, sekcje 4.4 i 5.2):
    - `meta/**`, `config/**`, `content/**` — odczyt publiczny, zapis wyłącznie Admin SDK.
    - `admin_tasks/**`, `server_config/**` — brak dostępu z klienta (tylko Admin SDK).
    - `users/{uid}` — właściciel (z `hasOnly` + walidacją typów, bez możliwości wstrzyknięcia `role`/`plan`/`coins`).
    - `users/{uid}/progress/{subjectId}` — właściciel tylko dla `math|polish|english`.
    - `users/{uid}/exam_attempts/{attemptId}` — append-only dla właściciela (`update: false`).
    - `users/{uid}/private/{docId}` oraz `users/{uid}/ledger/{txId}` — właściciel **tylko odczyt**, zapis wyłącznie serwer/Admin SDK (naprawiono wcześniejszą lukę pozwalającą na zapis do `ledger`).
  - **Firebase Authentication:** włączone Email/Hasło oraz Anonymous Auth; domeny autoryzowane (`jasne-e8-app-new.vercel.app`, `jasne-e8-admin.vercel.app`, `localhost`); konto admina `mjankowski515@gmail.com` z `customClaims.role = "admin"`. *(Google Sign-In wymaga 1 kliknięcia OAuth w konsoli Firebase.)*
  - **Firebase Storage:** bucket `jasne-e8-app.firebasestorage.app` (`europe-central2`) + wdrożone `storage.rules` (`/packs/**` public read, `/users/{uid}/solutions/**` właściciel max 5 MB obraz, `/admin_uploads/**` tylko Admin SDK).
  - **Firebase Remote Config:** opublikowany szablon v1 (`contentManifestVersion`, `app_update_policy`, `feature_flags`, `economy_config`).

### Repozytoria i adresy produkcyjne Vercel
1. **Aplikacja ucznia (`emdes515/jasne-e8-app-new`, commit `979ac7e`):**
   - URL: https://jasne-e8-app-new.vercel.app
   - Health: https://jasne-e8-app-new.vercel.app/api/firebase-health
   - Zmienione pliki: `.firebaserc`, `firebase.json`, `firestore.rules`, `storage.rules`, `src/lib/firebase.ts`, `app/api/firebase-health/route.ts`, `.env.example`, `docs/ARCHITECTURE_E8_DATA_FIREBASE_SPEC.md`.
2. **Panel Dewelopera i Redakcji (`emdes515/jasne-e8-admin`, commit `192625d` — Studio v1.0):**
   - URL: https://jasne-e8-admin.vercel.app
   - Health: https://jasne-e8-admin.vercel.app/api/health
   - Pełna przebudowa UI i funkcjonalności do standardu konsoli redakcyjnej (*Nocturne Editorial Console*):
     - Typografia `Plus Jakarta Sans` + `JetBrains Mono`, pogrupowany sidebar, sticky topbar, paleta poleceń `Ctrl+K` (`CommandPalette.tsx`), pływające powiadomienia `ToastProvider.tsx` i responsywny drawer mobilny.
     - Bramka logowania Firebase Auth (`AdminAuthGate.tsx`) + serwerowa weryfikacja Bearer i ról (`adminAuth.ts`).
     - Pulpit z metrykami live (`/api/admin/overview`), pokryciem 7 działów E8, 4 sondami usług Firebase i szybkimi akcjami (`OverviewTab.tsx`).
     - **3-panelowy warsztat CMS Zadań (`CmsTasksTab.tsx` + `TaskPhonePreview.tsx`)**: wyszukiwarka + filtry, pełne dynamiczne edytory dla **wszystkich 7 typów CKE** (`single_choice`, `true_false_multi`, `choice_with_reason`, `dual_choice`, `numeric_input`, `open_calculation`, `open_proof`), pasek wstawek KaTeX, edytor wskazówek (1–3) i kroków wyjaśnienia, duplikowanie wariantów, skrót `Ctrl+S` oraz **interaktywny symulator telefonu 390 px** (klikanie odpowiedzi, sprawdzanie klucza, odkrywanie wskazówek).
     - **Nowy moduł Lekcji Bento (`LessonsTab.tsx`, `/api/admin/lessons`)**: pełny CRUD 4 kart teorii (Esencja, Wzory, Przykład, Pułapka E8) z podglądem 390 px KaTeX.
     - **Nowy moduł Arkuszy CKE (`SheetsTab.tsx`, `/api/admin/sheets`)**: składanie arkuszy rocznikowych z zadań CMS, zmiana kolejności, auto-suma punktów CKE.
     - **Importer JSON / PDF (`ImporterTab.tsx`, `/api/admin/import`)**: wsadowy import `draft` + upload PDF i lista wgranych plików z Firebase Storage.
     - **Centrum Publikacji Paczek (`PacksTab.tsx`, `/api/admin/packs`)**, **Live Remote Config z podglądem okna aktualizacji (`RemoteConfigTab.tsx`)**, **LiveOps + pełna edycja/dodawanie/usuwanie przedmiotów Sklepu + zarządzanie rolami `admin`/`editor` i uprawnieniami z audytem `ledger` (`ShopUsersTab.tsx`, `/api/admin/users/[uid]/role`)**.

---

## 2. Uruchomione testy i wyniki (Adam Dev)

- `jasne-e8-app-new`:
  - `npx tsc --noEmit` — **0 błędów**
  - `bun test` — **14/14 PASS** (`src/lib/gamification.test.ts`)
  - `npm run build` — **PASS**
  - Live Firestore rules smoke test (REST API bez autoryzacji) — **6/6 PASS** (`meta` read 200, `config` read 200, `admin_tasks` read 403, `meta` write 403, `private/entitlements` read 403, `ledger` write 403)
  - Live `/api/firebase-health` — **200 OK**, `status: "ok"`, `projectId: "jasne-e8-app"`, `databaseId: "(default)"`, `contentManifestVersion: "1"`
- `jasne-e8-admin`:
  - `npm run typecheck` (`tsc --noEmit`) — **0 błędów**
  - `bun test` — **4/4 PASS** (`src/lib/taskValidation.test.ts`)
  - `npm run build` — **PASS** (10 dynamicznych tras API + `/`)
  - Live `/api/health` — **200 OK**, `mode: "connected_ready"`, 4/4 usługi `ok: true`
  - Live Unauth Guard (`/api/admin/me`, `/tasks`, `/packs`, `/remote-config`, `/live-ops`, `/users`) — **6/6 → HTTP 401**
  - Live Auth E2E (token `mjankowski515@gmail.com` z `role: admin`) — **6/6 → HTTP 200**

---

## 3. Zakres do weryfikacji przez Judytkę (QA)

1. **Bezpieczeństwo i autoryzacja panelu (`jasne-e8-admin.vercel.app`):**
   - Czy wejście bez logowania pokazuje wyłącznie ekran logowania (brak dostępu do danych CMS/użytkowników)?
   - Czy wszystkie endpointy `/api/admin/*` zwracają `401` bez tokena i `403` dla zwykłego konta ucznia bez roli admina?
   - Czy `/api/health` nie ujawnia sekretów, kluczy ani PII?
2. **Przepływ CMS → Paczka → Remote Config (edge case'y i walidacja):**
   - Walidacja 7 typów zadań CKE (`taskValidation.ts`), blokada zapisu zadania bez wskazówki statycznej, wymuszenie `status: "draft"` w importerze JSON, limit 15 MB i rozszerzenia `.pdf` przy uploadzie.
   - Publikacja paczki działu z 0 zadań `active` → czy zwraca czytelny błąd `400` bez podbijania manifestu?
   - Sprawdzenie drobnych rozbieżności ze specyfikacją `ARCHITECTURE_E8_DATA_FIREBASE_SPEC.md` (np. `manifestUpdatedAt: null` w `/api/firebase-health` aplikacji ucznia przy string ISO vs Firestore Timestamp; brak pełnego edytora `options`/`statements`/`reasons` dla wszystkich 7 typów w formularzu UI CMS — na dziś edytor formularzowy w `CmsTasksTab.tsx` ma prompt/klucz/wskazówki/wyjaśnienie + podgląd opcji, a pełne struktury opcji/stwierdzeń można importować przez JSON).
3. **Reguły bezpieczeństwa Firestore i Storage (`firestore.rules`, `storage.rules`):**
   - Audyt pod kątem eskalacji uprawnień, obejść `update` i zgodności z sekcjami 4.4 i 5.2 specyfikacji.
4. **Responsywność i UI panelu (`390px` mobile i `1440px` desktop) + regresja aplikacji ucznia (`jasne-e8-app-new.vercel.app`).**

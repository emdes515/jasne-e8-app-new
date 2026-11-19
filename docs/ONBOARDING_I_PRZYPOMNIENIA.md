# Onboarding rodzinny i przypomnienia o nauce

## Doświadczenie ucznia i rodzica

- Pierwsze pytanie dotyczy osoby, która konfiguruje naukę. Uczeń wybiera własne tempo i może natychmiast otworzyć pierwszą lekcję. Rodzic lub opiekun ustala tempo i harmonogram razem z uczniem. Informacja o wybranej ścieżce pozostaje na urządzeniu.
- Wybór przypomnień jest dobrowolny. Po włączeniu proponujemy 16:30 w dni szkolne. Dostępne są trzy pory, własna godzina oraz niezależny wybór dni. Harmonogram stosuje czas polski, także po zmianie czasu.
- Komunikat pojawia się, jeśli aplikacja jest widoczna w ciągu 30 minut od wybranej godziny. Przypomnienie czeka na wyjście z lekcji, miniarkusza lub otwartego dialogu, o ile okno czasowe jest wciąż aktualne. Zaplanowane przypomnienie pojawia się raz dziennie na danym profilu i urządzeniu.
- Ustawienia w profilu pozwalają zmienić plan lub wyłączyć przypomnienia. Lokalny harmonogram i kopia na koncie są niezależne. Rodzic jawnie zapisuje, wczytuje lub usuwa kopię. Wczytanie stosuje harmonogram na bieżącym urządzeniu.
- Wartość nauki pojawia się w pierwszej lekcji. Konto osoby dorosłej jest oddzielną decyzją. Wejście do formularzy logowania i rejestracji wymaga przejścia przez komunikat dla dorosłego. Przy logowaniu samoczynnie nie przenosimy dziennika pracy ani lokalnego profilu ucznia.

## Podstawa prawna i decyzje przed uruchomieniem kont uczniowskich

- **Art. 8 RODO** dotyczy sytuacji, w której podstawą przetwarzania jest zgoda z art. 6 ust. 1 lit. a, a usługa społeczeństwa informacyjnego jest oferowana bezpośrednio dziecku. W Polsce poniżej 16 lat taką zgodę wyraża lub aprobuje osoba sprawująca władzę rodzicielską lub opiekę. Administrator podejmuje rozsądne starania, by to zweryfikować. Osobno trzeba przypisać podstawę poszczególnym celom, ograniczyć zbierane dane i opisać je prostym językiem. [RODO, art. 5–8, 12–13](https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=PL), [UODO o prawach dziecka](https://www.uodo.gov.pl/pl/493/2261).
- **Zdolność do czynności prawnych** to osobna kwestia. Dziecko poniżej 13 lat co do zasady nie ma zdolności do czynności prawnych. Od 13 lat do pełnoletności zdolność jest co do zasady ograniczona. Kodeks przewiduje wyjątki dla drobnych bieżących spraw, ale sprzedaży dostępu lub subskrypcji w JASNE E8 nie należy opierać na tym wyjątku. Umowę płatną zawiera osoba dorosła. [Kodeks cywilny, art. 12, 14–15, 17, 20](https://eli.gov.pl/eli/DU/2026/795/ogl).
- **Wersja bieżąca** nie tworzy konta dziecka. Przechowuje na urządzeniu plan nauki, a po jawnym działaniu rodzica może utworzyć kopię samego harmonogramu na jego koncie. Potwierdzenie e-maila ustala dostęp do skrzynki, a deklaracja pełnoletniości jest elementem interfejsu. Oba mechanizmy nie potwierdzają wieku ani prawa do reprezentowania konkretnego ucznia.
- **Wersja z połączonym kontem ucznia** wymaga osobnego procesu: konto rodzica, bezpieczny sposób potwierdzenia uprawnień dobrany do ryzyka, informacja o dokładnych celach, zakres akceptacji i jej wersja, przypisanie do profilu ucznia, możliwość cofnięcia oraz usunięcia danych. Przed wdrożeniem należy ocenić ryzyko według art. 35 RODO, a w razie ustalenia wysokiego ryzyka przeprowadzić ocenę skutków. [UODO o ocenie skutków](https://bip.uodo.gov.pl/pl/598/3617).
- **Przypomnienia o nauce** zawierają wyłącznie komunikat odpowiadający intencji ustawienia harmonogramu. Informacje o promocjach, sprzedaży lub przedłużeniu oferty należą do odrębnego procesu, z osobną oceną i uprzednią zgodą dla kanału marketingowego, jeśli znajduje zastosowanie art. 398. Nie wolno nakłaniać dziecka w reklamie do zakupu ani proszenia dorosłego o zakup. [Prawo komunikacji elektronicznej, art. 398](https://eli.gov.pl/eli/DU/2024/1221/ogl), [ustawa o przeciwdziałaniu nieuczciwym praktykom, art. 9 pkt 5](https://eli.gov.pl/api/acts/DU/2023/845/text.html).

## Zapis i dostęp

| Element | Zasada |
|---|---|
| Lokalny plan | Istniejący zapis stanu w przeglądarce. Brak harmonogramu oznacza wyłączone przypomnienia. |
| Kopia na koncie | Jeden dokument `users/{uid}/private/study_reminder`. Zawiera godzinę, dni, strefę i czas ostatniego zapisu. |
| Uprawnienia | API wyprowadza UID ze zweryfikowanego tokena Firebase, odrzuca sesję anonimową i wymaga potwierdzonego e-maila. Nie przyjmuje UID i dodatkowych pól od klienta. Zapis przez Admin SDK korzysta z istniejących reguł dla dokumentów prywatnych. |
| Koszt | Firestore jest używany po kliknięciu akcji zapisu, wczytania lub usunięcia kopii. Otwarcie aplikacji i odmierzanie czasu odbywają się lokalnie. |
| Awaria | Nieudana operacja konta pokazuje komunikat. Lokalnie zapisany harmonogram nadal działa. |
| Usunięcie | Usunięcie kopii w Firestore i wyłączenie planu na urządzeniu są osobnymi akcjami. Przyszłe usunięcie konta musi czyścić również dokument harmonogramu. |

## Uruchomienie zapisu w środowisku wdrożeniowym

API wymaga serwerowej konfiguracji Firebase Admin dla projektu, którego używa Firebase Auth. Obecny mechanizm odczytuje ją z `FIREBASE_SERVICE_ACCOUNT_JSON`. Zmienna pozostaje wyłącznie po stronie serwera. Jej brak skutkuje odpowiedzią 503 po próbie dostępu i nie przerywa nauki ani zapisu lokalnego. Udostępnienie zapisu w podglądzie wymaga konfiguracji właściwego środowiska i weryfikacji na koncie testowym. Nie należy przenosić klucza administratora produkcji do podglądu bez ustalenia jego uprawnień.

## Rozszerzenie o push

1. Po potwierdzeniu zasad dla kont rodzinnych dodać opcję „Włącz push na tym urządzeniu”. Prośbę o uprawnienie przeglądarki pokazać po aktywnym kliknięciu. Na iOS/iPadOS obsłużyć ścieżkę dodania aplikacji do ekranu początkowego. Zgoda przeglądarki i prawna podstawa przetwarzania to osobne warstwy. [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/web/get-started), [WebKit iOS/iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
2. Przypisać subskrypcję do konta i konkretnego urządzenia. Przechowywać dedykowane ustawienia aktywacji, wycofanie i minimalne metadane dostarczenia. Kopia harmonogramu w Firestore sama nie włącza push. Po wycofaniu wstrzymać wysyłkę i usunąć identyfikator urządzenia.
3. Backend wylicza następny termin w lokalnej strefie, zapisuje go w UTC i pobiera tylko rekordy gotowe do wysyłki. Klucz unikalny obejmuje konto, urządzenie, typ komunikatu i dzień lokalny. Ponowienia mają ograniczony czas ważności. Nie wysyła się zaległych komunikatów w nocy, a nieaktualne subskrypcje są usuwane.
4. Treść ekranu blokady nie ujawnia imienia, wyniku, problemów ucznia ani nazwy szkoły. Proponowana treść to „Czas na zaplanowaną powtórkę”. Link prowadzi do nauki.
5. Ocenić pierwsze użycie na podstawie czasu do otwarcia lekcji i odsetka rozpoczętych lekcji. Pomiar dostaw i zmian preferencji na wdrożeniu powinien być zagregowany. Rozpoznawanie nawyków indywidualnego dziecka wymaga odrębnej oceny celu i nie jest potrzebne do ustawienia stałej godziny.

# FoodLab
Aplikacja pozwala na zarządzanie produktami, które mamy w domu, i na ich podstawie podpowiada, co można z nich ugotować - użytkownik sam dobiera poziom trudności oraz wartość energetyczną posiłków. FoodLab jest dla osób, które nie wiedzą, co ugotować z tego, co aktualnie mają w kuchni, a jednocześnie chcą  mieć podgląd na makroskładniki zjadanych dań. Korzystając masz wpływ na rozbudowę bazy produktów poprzez dodawanie ich do aplikacji. 

## Zespół

| Osoba | Login | Część projektu |
|---|---|---|
| Oleksandr Tkach | @Olek2q | Wirtualna spiżarnia |
| Michał Szczygieł | @m1szczygiel | Baza produktów i integracja z Open Food Facts |
| Krzysztof Oleksy | @quazowski0 | Wyszukiwanie przepisów i lista zakupów |
| Maksymilian Zakrzewski | @Jeroklif | Filtry trudności i kalorii, podsumowanie makroskładników |

Za realizację Issue 1, czyli stworzenie modułu wirtualnej spiżarni, odpowiada @Olek2q.
Moduł ten pozwala użytkownikowi na swobodne dodawanie, edytowanie oraz usuwanie produktów spożywczych, które aktualnie posiada w swojej kuchni. Głównym elementem interfejsu będzie czytelna lista prezentująca zgromadzone zapasy wraz z ich ilością oraz datą ważności. Wszystkie wprowadzane informacje muszą być zapisywane lokalnie w przeglądarce przy użyciu mechanizmu localStorage, co zapobiegnie ich utracie po odświeżeniu strony. Największym wyzwaniem w tym zadaniu jest poprawne zaprojektowanie globalnego stanu aplikacji, aby pozostałe moduły mogły bezproblemowo odczytywać dane o dostępnych składnikach. Prace zostaną uznane za zakończone, gdy panel będzie w pełni interaktywny, a aplikacja stabilnie zapamięta każdą wprowadzoną przez użytkownika zmianę.

Za realizację Issue 2, czyli stworzenie bazy produktów i integrację API, odpowiada @m1szczygiel.
Moduł ten pozwala użytkownikom na wyszukiwanie gotowych produktów spożywczych oraz pobieranie ich wartości odżywczych z zewnętrznej bazy, takiej jak Open Food Facts. Interfejs będzie składał się z wygodnej wyszukiwarki oraz kart szczegółów, na których wyświetlone zostaną kalorie i makroskładniki danego składnika. W przypadku braku jakiegoś towaru, użytkownik zyska możliwość ręcznego dodania go do systemu wraz ze wszystkimi niezbędnymi wartościami odżywczymi. Najtrudniejszym etapem prac będzie prawidłowa obsługa zapytań do API oraz wyłuskanie z odpowiedzi tylko tych danych, które są rzeczywiście potrzebne w aplikacji. Zadanie zostanie uznane za gotowe, gdy wyszukane lub dodane produkty będą mogły zostać bez problemu zapisane i przekazane do wirtualnej spiżarni.

Za realizację Issue 3, obejmującego wyszukiwanie przepisów i listę zakupów, odpowiada @quazowski0.
Głównym zadaniem tego modułu jest proponowanie użytkownikowi konkretnych posiłków na podstawie składników, które aktualnie znajdują się w jego wirtualnej lodówce. Aplikacja będzie analizować dostępne przepisy i sortować proponowane dania według liczby brakujących produktów. Po wybraniu interesującego posiłku, system automatycznie wygeneruje przejrzystą listę zakupów, zestawiając wymagane w przepisie składniki z obecnymi zapasami ze spiżarni. Kluczowym wyzwaniem będzie stworzenie wydajnego algorytmu, który bezbłędnie porówna i skrzyżuje dane o przepisach z lokalnym stanem aplikacji. Moduł będzie ukończony, gdy interfejs poprawnie wyświetli dopasowane dania i pozwoli na bezproblemowe wygenerowanie trafnej listy zakupów.

Za realizację Issue 4, czyli filtry, poziom trudności i podsumowanie makroskładników, odpowiada @Jeroklif.
Ten moduł umożliwia użytkownikom precyzyjne filtrowanie proponowanych przepisów ze względu na poziom trudności wykonania oraz maksymalną kaloryczność posiłku. Ponieważ zewnętrzne API rzadko podają stopień skomplikowania, konieczne będzie zaplanowanie logiki, która oszacuje go samodzielnie, na przykład na podstawie czasu przygotowania. Dodatkowo powstanie specjalny widok makroskładników przepisu, który podsumuje wartości odżywcze wybranych dań. Największą trudnością będzie tutaj płynne przeliczanie tych wartości w czasie rzeczywistym oraz sprawne powiązanie filtrów z wynikami wyszukiwania przepisów. Prace uznacie za zakończone, gdy suwaki będą poprawnie zawężać widoczne wyniki, a użytkownik otrzyma czytelny podgląd wszystkich makroskładników posiłku.

## Technologia
- **Framework i język:** React, JavaScript
- **Narzędzie do budowania:** Vite
- **Routing:** React Router
- **Stan aplikacji:** React Context + useReducer
- **Zapis danych:** localStorage (bez własnego backendu)
- **API:**
  - [Open Food Facts](https://world.openfoodfacts.org/data) – produkty i wartości odżywcze, bez klucza
  - [Spoonacular](https://spoonacular.com/food-api) – przepisy, wyszukiwanie po składnikach, kalorie, makro i czas przygotowania (darmowy plan)
- **Biblioteki:** html5-qrcode (skanowanie kodów kreskowych)
- **Jakość kodu:** ESLint, Prettier


Funkcjonalności
| Funkcja | Właściciel | Opis |
|---|---|---|
| Wirtualna spiżarnia | @Olek2q | [#2](../../issues/2) – dodawanie, edycja i usuwanie produktów z ilością i datą ważności, zapis w localStorage |
| Baza produktów | @m1szczygiel | [#3](../../issues/3) – wyszukiwanie produktów w Open Food Facts i ręczne dodawanie z wartościami odżywczymi |
| Przepisy i lista zakupów | @quazowski0 | [#4](../../issues/4) – propozycje dań sortowane według liczby brakujących składników, generowanie listy zakupów |
| Filtry i makroskładniki | @Jeroklif | [#5](../../issues/5) – filtry trudności i kaloryczności, widok makroskładników przepisu |

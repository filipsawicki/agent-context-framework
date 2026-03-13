# Agent Context Framework (ACF)

Lekki, oparty na plikach framework do rozpoczynania pracy, utrzymywania i przekazywania kontekstu projektu między sesjami agentów AI.

Agent Context Framework pomaga utrzymać ciągłość pracy w projektach rozwijanych z pomocą agentów AI, szczególnie między świeżymi sesjami, resetami kontekstu i handoffami. Kanoniczny stan projektu znajduje się w plikach Markdown w `context/*`, a MCP Memory pełni rolę pomocniczej warstwy semantycznego recallu.

Angielska wersja główna znajduje się w [README.md](README.md).

## Dlaczego ACF
- utrzymuje kanoniczne, plikowe źródło prawdy w `context/*`
- daje agentom powtarzalny workflow startu i handoffu
- ogranicza konieczność ponownego tłumaczenia projektu po compact i resetach sesji
- traktuje MCP jako warstwę pomocniczą, a nie jedyne miejsce przechowywania wiedzy o projekcie
- pozostaje lekki architektonicznie, ale obejmuje szeroki workflow projektowy

## Kompatybilność Z Agentami
ACF jest agent-agnostic na poziomie workflow.

To znaczy, że główny model pracy działa z:
- Codex
- ChatGPT
- Claude
- Cursor
- Aider
- Continue
- własnymi agentami CLI lub agentami w edytorze

Sam framework opiera się na:
- kanonicznych plikach kontekstowych w `context/*`
- powtarzalnych zasadach startu i handoffu
- MCP jako opcjonalnej, pomocniczej warstwie pamięci

Część automatyzacji w tym repo jest świadoma integracji z Codexem, szczególnie skrypty rejestracji MCP, ale sam workflow nie zależy od Codexa.

## Co Dostajesz
- `context/next_context_sync.md` jako plik startowy i aktywną mapę kodu
- `context/project_map.md` jako lekką mapę repozytorium i modułów
- `context/handoff_migration.md` jako stan techniczny, decyzje i runbooki
- `context/context_change_history.md` jako historię zmian, testów i commitów
- `context/master_plan.md` jako scope i zasady delivery
- `tools/acf_setup.sh` jako główny interaktywny entrypoint
- `tools/init_project_context.sh` do bezpośredniej inicjalizacji projektu
- `tools/bootstrap_existing_project.sh` do generowania draftu kontekstu dla istniejących repo
- `tools/generate_project_map.js` do generowania draftu mapy projektu
- `tools/verify_context_links.js` do walidacji referencji do kodu
- `tools/verify_project_map.js` do walidacji ścieżek w mapie projektu
- skrypty MCP do tworzenia kontenerów, rejestracji i smoke testów

## Wymagania
- `bash`
- `node` i `npm`
- `python3`
- `podman` dla workflow MCP opartego na kontenerach
- `codex`, jeśli chcesz automatycznie rejestrować MCP z poziomu setupu

## Po Pobraniu Repo
Jeśli właśnie pobrałeś lub sklonowałeś to repo, użyj dokładnie tej kolejności:

1. Wejdź do katalogu repozytorium.
2. Zainstaluj zależności:

```bash
npm install
```

3. Uruchom wspólny setup:

```bash
npm run acf:setup
```

4. Gdy skrypt zapyta, wybierz jeden tryb:
- `new`, jeśli zaczynasz nowy projekt z tego frameworka
- `existing`, jeśli podłączasz framework do repo, które już ma kod

5. W czasie setupu ACF może także:
- utworzyć i uruchomić kontenery Podmana dla MCP Memory
- zarejestrować MCP Memory w Codex
- opcjonalnie zarejestrować osobny filesystem MCP ograniczony do tego repo

6. Po zakończeniu setupu przejrzyj:
- `context/next_context_sync.md`
- `context/project_map.md`
- `context/handoff_migration.md`
- `docs/mcp_ai_memory_setup.md`

7. Zweryfikuj wygenerowane referencje kontekstowe:

```bash
npm run verify:context
```

8. Potem przejdź do:
- [NEW_PROJECT_CHECKLIST.md](NEW_PROJECT_CHECKLIST.md), jeśli chcesz operacyjną checklistę
- [docs/system_flow.md](docs/system_flow.md), jeśli chcesz zrozumieć jak współpracują `context/*` i MCP Memory

## Tryby Startu

### Nowy Projekt
Wybierz `new`, gdy:
- tworzysz projekt od zera
- chcesz, żeby framework zainicjalizował czyste placeholdery i nazewnictwo MCP
- chcesz uzupełniać pliki kontekstowe od początku projektu

Co robi ACF w tym trybie:
- inicjalizuje placeholdery projektu
- generuje `config/project.env`
- przygotowuje pliki kontekstowe dla nowego projektu
- może utworzyć i zarejestrować infrastrukturę MCP

### Istniejący Projekt
Wybierz `existing`, gdy:
- repozytorium zawiera już realny kod
- chcesz podłączyć ACF do istniejącej bazy kodu
- chcesz wygenerować draft plików kontekstowych na podstawie skanu repo

Co robi ACF w tym trybie:
- inicjalizuje konfigurację projektu
- skanuje repo pod kątem manifestów, prawdopodobnego stacku, katalogów i potencjalnych entrypointów
- generuje robocze pliki kontekstowe oznaczone do review
- może utworzyć i zarejestrować infrastrukturę MCP

Ważne:
- tryb `existing` tworzy punkt startowy, a nie ostateczną prawdę o projekcie
- użytkownik powinien przejrzeć i poprawić wygenerowane pliki, zanim staną się kanoniczne

## Szybki Start
Jeśli znasz już framework i chcesz tylko najkrótszą ścieżkę:

```bash
npm install
npm run acf:setup
npm run verify:context
```

## Szybka Instalacja Przez Agenta
Jeśli pracujesz już z agentem AI do kodu, możesz zlecić instalację zamiast robić setup ręcznie.

Użyj takiego promptu w repo docelowym:

```text
Zainstaluj Agent Context Framework w tym repozytorium.

Kroki:
1. Sklonuj albo skopiuj ACF do tego repo.
2. Uruchom `npm install` w katalogu ACF.
3. Uruchom `npm run acf:setup`.
4. Jeśli repozytorium ma już kod, wybierz tryb `existing`.
5. Po setupie uruchom `npm run verify:context`.
6. Podsumuj, co zostało utworzone i co dalej wymaga ręcznego review.
```

Bardziej precyzyjna wersja:

```text
Podłącz Agent Context Framework do tego istniejącego repozytorium, użyj trybu `existing`, zweryfikuj wygenerowane linki kontekstowe i potem wskaż mi, które pliki kontekstowe powinienem przejrzeć najpierw.
```

Najkrótsza wersja do wklejenia:

```text
Zainstaluj tutaj ACF, wybierz `existing`, jeśli to repo ma już kod, uruchom setup, zweryfikuj linki kontekstowe i powiedz mi, co mam przejrzeć dalej.
```

## Przykład Nieinteraktywny

```bash
./tools/acf_setup.sh \
  --mode new \
  --project-name "Nowy Projekt" \
  --project-slug "nowy-projekt" \
  --db-port 55735 \
  --redis-port 56810 \
  --with-filesystem
```

Domyślnie inicjalizator:
- wyprowadza `project-slug` z nazwy nadrzędnego folderu repo
- buduje `project-name` z tego sluga
- używa domyślnych portów `55735` i `56810`

## Typowy Workflow

```text
LLM Agent
   |
   v
context/next_context_sync.md
   |
   v
context/project_map.md
   |
   v
MCP semantic recall
   |
   v
verify with canonical context
   |
   v
work on codebase
   |
   v
update context + memory
```

W ACF rekomendowany przebieg sesji wygląda tak:

1. Agent zaczyna od `context/next_context_sync.md`.
2. Agent czyta `context/project_map.md`, żeby szybko zorientować się w modułach, entrypointach i ważnych plikach.
3. Agent robi recall odpowiednich wpisów z MCP Memory.
4. Agent weryfikuje recall względem kanonicznych plików w `context/*`.
5. Agent pracuje na kodzie.
6. Część pracy jest zamykana przez:
- krótki code review
- commit implementacyjny
- aktualizację `context/*`
- jeden zwięzły wpis do MCP

Najważniejsza zasada:
- `context/*` wygrywa nad MCP.

## Praca Wielu Agentów
ACF dobrze nadaje się do pracy wielu agentów nad jednym projektem.

Typowe przykłady:
- jeden agent pracuje nad backendem
- drugi agent pracuje nad frontendem
- kolejny agent robi review albo aktualizuje dokumentację

To działa dlatego, że:
- `context/*` jest współdzielonym, kanonicznym stanem projektu
- `context/next_context_sync.md` jest wspólnym punktem startowym dla każdej nowej sesji
- `context/project_map.md` daje każdej sesji lekką mapę repo przed głębszą analizą
- MCP Memory służy do zwięzłego recallu, a nie jako jedyne źródło prawdy

Żeby praca wielu agentów była stabilna:
- każda zamknięta część pracy powinna aktualizować `context/*`
- każda zamknięta część pracy powinna zapisywać jeden zwięzły rekord do MCP
- każda nowa sesja powinna zaczynać od `context/next_context_sync.md`, a potem czytać `context/project_map.md`
- jeśli MCP i `context/*` się różnią, wygrywa `context/*`

W skrócie:
- ACF wspiera pracę wielu agentów nad jednym projektem
- to współdzielone pliki kontekstowe utrzymują tych agentów w zgodzie

## Setup MCP
Szczegóły rejestracji MCP i środowiska znajdziesz w [docs/mcp_ai_memory_setup.md](docs/mcp_ai_memory_setup.md).

Przydatne komendy:

```bash
npm run acf:setup
npm run generate:project-map
npm run mcp:init
npm run verify:context
npm run verify:project-map
npm run mcp:register
npm run mcp:status
npm run mcp:smoke
```

## Mapa Dokumentacji
- [NEW_PROJECT_CHECKLIST.md](NEW_PROJECT_CHECKLIST.md): checklista setupu dla człowieka
- [docs/system_flow.md](docs/system_flow.md): architektura i przepływ pamięci
- [docs/agent_workflow.md](docs/agent_workflow.md): codzienny workflow agenta
- [docs/mcp_ai_memory_setup.md](docs/mcp_ai_memory_setup.md): rejestracja MCP i setup runtime
- [docs/mcp_memory_rules.md](docs/mcp_memory_rules.md): zasady source of truth oraz zapisu i odczytu

## Rekomendowany Prompt Startowy

```text
Działaj jako senior engineer dla projektu <nazwa>.

Startup:
1. Przeczytaj `context/next_context_sync.md`.
2. Przeczytaj `context/project_map.md`.
3. Zrób recall wcześniejszych decyzji z MCP `<server-name>` po słowach kluczowych projektu.
4. Zweryfikuj recall względem:
   - `context/handoff_migration.md`
   - `context/context_change_history.md`

Zasady:
- `context/*` jest źródłem prawdy.
- Jeśli MCP i `context/*` się różnią, wygrywa `context/*`.
- Po każdej zamkniętej części:
  - krótki code review,
  - commit,
  - update `context/*`,
  - 1 zwięzły rekord do MCP.
```

## Współtworzenie
Jeśli chcesz wnosić zmiany, przeczytaj [CONTRIBUTING.md](CONTRIBUTING.md).

## Bezpieczeństwo
Jeśli znajdziesz problem bezpieczeństwa, postępuj zgodnie z [SECURITY.md](SECURITY.md).

## Licencja
Projekt jest dostępny na licencji [MIT](LICENSE).

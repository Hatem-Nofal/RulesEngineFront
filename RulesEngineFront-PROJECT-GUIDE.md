# RulesEngineFront — Project Guide (living document)

> **Purpose.** Reference for Claude (and humans) to read **before** making any change to this repo, and to update **after** every change.
> **Where to keep it.** Commit it to the repo as `docs/PROJECT_GUIDE.md` (best: always in sync with the code) and/or add it to the "RuleEngine" Project knowledge.
> **Repo:** https://github.com/Hatem-Nofal/RulesEngineFront.git · **Backend companion:** `RulesEngineback` (.NET 10, ABP)
> **Analysed snapshot:** commit `9f54af2` ("hg", 2026-11-22), 382 files, single-commit history (shallow clone).
> **Confidence legend:** ✅ verified by reading the code · ⚠️ likely, confirm at runtime · ❓ not reviewed.

---

## 0. How to use this document (workflow for every change request)

1. Read §3 (architecture), the relevant §5 feature row, and §11 (recipes) for the area being changed.
2. Check §9 (known issues) — don't "fix" something silently that's listed there unless asked; do mention it if the change touches it.
3. Make the change following §8 (conventions).
4. Append an entry to §12 (change log): date · files touched · what/why · any new gotcha. Update §5/§6/§9 if facts changed.
5. Hand the updated guide back to the user (they re-commit / re-upload it).

---

## 1. Stack at a glance

| Area | Choice |
|---|---|
| Framework | Angular **21.2.x**, bootstrapped with **NgModule** (`platformBrowserDynamic().bootstrapModule(AppModule)`), zone.js, `@angular-devkit/build-angular:application` builder |
| App framework | **ABP Framework 10.6** Angular packages (core, oauth, account, identity, tenant-mgmt, setting-mgmt, feature-mgmt, theme.shared) + **LeptonX 5.6** theme |
| UI | **PrimeNG 21** (Aura preset, dark mode disabled), Bootstrap 5 classes (via LeptonX) + `ng-bootstrap 20`, Bootstrap Icons, PrimeIcons, `chart.js 4` |
| Realtime | `@microsoft/signalr 8` (hub at `{apiUrl}/signalr`) — used only for a connection indicator (§7.4) |
| Auth | ABP OAuth (OpenIddict backend), `jwt-decode` |
| Language | TypeScript 5.9 (not `strict`), SCSS |
| Tests | Karma + Jasmine (37 spec files, mostly scaffold) |
| Lint/format | ESLint 9 with legacy `.eslintrc.json`; Prettier (`singleQuote`, width 100) — *many files actually use double quotes; match the file you edit* |
| Package manager | Dockerfile uses **yarn**; **no lockfile is committed** (§9-C) |

Size: ~9.1k lines of non-spec TS in `src/app`, 33 components, only **1** `OnPush` component (`RuleNodeComponent`), ~61 `.subscribe(` calls (8 use `takeUntilDestroyed`), ~123 `any` outside proxies.

---

## 2. Folder map

```
src/
  main.ts                      NgModule bootstrap
  environments/                environment.ts (= prod copy), .prod.ts, .dev.ts, *-qc/-uat variants (text copies)
  assets/config/               primeng.config.ts (Aura), primeng-table-helper.ts, config*.json (legacy, other project)
  scss/ + styles.scss          global styles; rule-builder styles in pages/rule-builders-components/_rule-builder.scss
  app/
    app.module.ts / app-routing.module.ts / app.component.ts / route.provider.ts
    application-layout/        eager+lazy layout module, routes, ApplicationScreenComponent (shell)
    pages/
      home/                    NgModule home page (legacy claims permissions inside)
      dashboard/               Chart.js violation dashboard (standalone)
      execution-logs/          paged log list (standalone)
      rule-builders-components/
        rules/                 rule-list, rule-edit, rule-node (THE tree editor), rules-bulk, rules-services/
        workflows/             workflow-list, workflow-edit
        form-configs/          form-config-list, form-config-edit (+ models/fieldgroup.ts)
      MedicalRulesRoutingModule.ts   DEAD (never imported; duplicates routes)
    proxy/                     ABP-generated API client — DO NOT hand-edit (see §7.1)
    shared/
      abp/                     overrides of ABP Identity/Account/Permission-management UI (mostly unused, §9-D)
      components/              header, sidebar, footer, breadcrumb, shared-table (UNUSED), CVA-Form/* (form-page + custom inputs)
      directives/, pipes/, validators/
      guards/, interceptors/, services/, models/ (constant.ts = operators/data types, appPermissions.ts)
```

Path aliases: `@proxy` / `@proxy/*` → `src/app/proxy/*`; `baseUrl: ./` so `src/app/...` absolute imports are used too.

---

## 3. Architecture

### 3.1 Bootstrap (`app.module.ts`)
- `APP_INITIALIZER` #1: `SignalRService.reconnectIfNeeded()`; #2 (`APP_ROUTE_PROVIDER`): registers a single ABP menu route `HomePage`.
- ABP providers: `provideAbpCore(withOptions({environment, registerLocaleFn}))`, `provideAbpOAuth()`, `provideAbpThemeShared(...)` (**called twice**, §9-A), setting/account/identity/tenant/feature config providers.
- `HTTP_ERROR_HANDLER` = `handleHttpErrors`; `HTTP_INTERCEPTORS` = `ErrorInterceptor` (class-based). `AuthInterceptor` exists but is **not registered**.
- PrimeNG via `primeConfig.providers` (`provideAnimationsAsync` + `providePrimeNG(Aura)`), while `BrowserAnimationsModule` is also imported.
- `AppComponent` template: `<abp-loader-bar/><abp-dynamic-layout/>`; it swaps LeptonX **ApplicationLayout → `ApplicationScreenComponent`** and **AccountLayout → `CustomeLoginComponent`** through `ReplaceableComponentsService`.

### 3.2 Routing
- `AppRoutingModule`: one route `'' (pathMatch:'full')` → lazy `ApplicationLayoutModule`.
- `ApplicationLayoutModule` is **also imported eagerly** in `AppModule` → its `forChild` routes are registered at root as well (§9-A).
- Routes (in `application-layout-routing.module.ts`):

| Path | Loads | Guards |
|---|---|---|
| `''` | `HomeModule` (HomeComponent) | `authGuard`, `loginGuard` |
| `dashboard` | `DashboardComponent` | **none** |
| `rules` (`''`, `new`, `rules-bulk`, `:id`) | rule-list / rule-edit / rules-bulk | **none** |
| `workflows` (`''`, `new`, `:id`) | workflow-list / workflow-edit | `authGuard`, `loginGuard` |
| `form-configs` (`''`, `new`, `:id`) | form-config-list / form-config-edit | `authGuard`, `loginGuard` |
| `execution-logs` | execution-log-list | `authGuard`, `loginGuard` |
| `account`, `identity`, `tenant-management`, `setting-management` | ABP lazy modules | ABP defaults / `authGuard` |
| `**` | redirect to `''` | — |

- `loginGuard` **always returns `true`** (body commented out). All `requiredPolicy` permission checks on rule routes are **commented out**. Sidebar computes `canViewRules/canViewWorkflows` but never uses them. ⇒ **UI authorization is effectively absent; backend must enforce it.**
- `RouterModule.forRoot(..., {onSameUrlNavigation: 'reload'})`.

### 3.3 Auth & environment
- OAuth config in `environment.ts`: issuer `https://rebackend-dev.ehealth.com.eg/`, clientId `RulesEngine_App`, scope `offline_access RulesEngine`, `requireHttps: true`, API `https://rebackend-dev.ehealth.com.eg`.
- `remoteEnv: { url: '/getEnvConfig', mergeStrategy: 'deepmerge' }` → runtime override. IIS `web.config` redirects `getEnvConfig` → `dynamic-env.json` (currently `{}`); the nginx template has **no** equivalent rule (§9-C).
- Build configs (`angular.json`): `production` (file-replaces `environment.ts` → `environment.prod.ts`, budgets 2.75MB warn / 3MB error initial), `development`, `dev` (replaces with `environment.dev.ts`: `https://localhost:44354`, clientId `RulesEngines_App`, implicit flow). `defaultConfiguration` for build is **production**; for serve **development**.

### 3.4 Theming/layout
`LayoutService` toggles `light-theme`/`dark-theme` on `<body>` and the sidebar signal; RTL/LTR set from `AppLocalizationService` (en/ar). Sidebar (PrimeNG PanelMenu) items: Dashboard, Rules, Workflows, Formconfigs, Bulk Rules, ExecutionLogs under group "RuleManagement" + Settings/Management groups.

---

## 4. Domain model (what the UI manipulates)

- **FormConfig (RuleFormConfig)** — a named set of *fields* (from the backend field **catalog**, `POST rule-fields`) with per-field `allowedOperators` and `isMultiple` (List fields only), plus `allowNestedGroups`, `isActive`, `description`. It defines **what can appear in a rule's conditions**.
- **Workflow** — `name`, `rejectionLevel` (`Activity=1`, `Claim=2`), `violationType` (`Error=1`, `Warning=2`), `violationMessage`, optional `ruleFormConfigId`, `ruleCount`, and either:
  - **Config workflow** (`isWorkflowLevel=false`): has a `root` condition tree edited in `mode="configure"` (structure only — values/activityTypeId are nulled on save by `configurationRoot()`), or
  - **Workflow-level** (`isWorkflowLevel=true`): a raw `ruleExpression` string; its rules are read-only in the UI.
- **Rule** — belongs to one workflow (can't be changed after creation), `isActive`, `violationType/Message`, `root` tree edited in `mode="values"` using the workflow's form config (`GET by-workflow`). On **create**, the workflow's `root` is copied in as the starting skeleton (`loadWorkflow(id, true)`); on **edit**, it's used only if the saved rule has no conditions.
- **RuleNodeDto** (the tree): `nodeType` (`Group=1`, `Condition=2`), `logicalOperator` (`And=1`, `Or=2`, group's own), `logicalJoinOperator` (connector to the **previous sibling**), `fieldKey`, `operator` (`RuleOperator` 1–8: `=,≠,>,≥,<,≤,Contains,NotContains`), `value` (shape depends on field), `isMultiple`, `activityTypeId`, `children`. UI hint: "AND is evaluated before OR; use a group for other grouping."
- **Data types** (`constant.ts`): `Number | Decimal | String | Enum | List | DateTime` (+ `ItemList` handled in the template switch only). `OPERATORS` table maps type → allowed operator ids; field-specific `allowedOperators` override it. `isListOperator` = ops 7/8 (Contains/Not contains).
- **Execution log** — per evaluated rule: workflow, rule, claim number, activity, expression, errorType/Message, `isViolated`, creation time.

---

## 5. Feature map (page → files → API)

| Feature | Component(s) | Key behaviour | API (proxy service) |
|---|---|---|---|
| Rules list | `rules/rule-list-component` (extends `AppComponentBase`) | PrimeNG lazy table; filters (workflow, rule name) via `FormPageComponent`; native `confirm()` delete | `RuleService.getList/delete`, `LookupService.getWorkflowsDropDownList` |
| Rule edit/create | `rules/rule-edit-component` | Pick workflow → load workflow + form config → edit tree → `preview` expression → save; load chain: workflows lookup ‖ rule → workflow → config | `RuleService.get/create/update/previewExpressionByInput`, `WorkFlowService.get`, `RuleFormConfigService.getByWorkflow` |
| Rule tree editor | `rules/rule-node-component` (recursive, OnPush, 645 lines) | See §6 | `LoadingLookupService` → `LookupService.*` |
| Bulk rules | `rules/rules-bulk-component` | Choose workflow → download XLSX template → upload XLSX; returns an error XLSX blob (empty blob = success) | `RuleService.getRulesSample/bulkUpload` |
| Workflows list | `workflows/workflow-list-component` | Filters: name, form config, rejection level | `WorkFlowService.getList/delete`, `RuleFormConfigService.getConfigs` |
| Workflow edit | `workflows/workflow-edit-component` | Name, rejection level, violation type/message, form config, workflow-level toggle + expression, configure-mode tree | `WorkFlowService.get/create/update`, `RuleFormConfigService.get/getConfigs` |
| Form configs list | `form-configs/form-config-list-component` | Lazy table; no filters | `RuleFormConfigService.getList/delete` |
| Form config edit | `form-configs/form-config-edit-component` (338 lines) | Catalog grouped by `groupName` (collapsible, select-all per group), pick fields, per-field operators/isMultiple, allowNestedGroups, isActive | `RuleFormConfigService.ruleFields(POST)/get/getList/create/update` |
| Dashboard | `pages/dashboard` | Filters (workflow name, dates, activity, claim no.) → 1 summary + 3 bar charts (workflow/activity/claim-number, top 10) | `DashboardService.*` |
| Execution logs | `pages/execution-logs` | Filters + lazy table; uses `takeUntilDestroyed` | `RulesEngineExecutionLogService.getRulesEngineExecutionLogListByInput`, `LookupService.getWorkflowsDropDownList` |
| Login | `shared/abp/account/.../customelogin.component` | Replaces AccountLayout; calls `SignalRService.connect()` after login ❓ (not fully reviewed) | ABP OAuth |

**API base paths (all under `/api/app/...`):** `rule`, `work-flow`, `rule-form-config`, `lookup`, `dashboard`, `rules-engine-execution-log/rules-engine-execution-log-list`, `integrations/validate-claims-integration-extended` (generated proxy only; no UI usage found — pairs with backend `SpecificValidateClaimsByCodesExtended`).

---

## 6. Rule tree editor deep-dive (`RuleNodeComponent`)

- **Inputs/outputs:** `node` (model, required), `fields`, `mode` (`'values'` default | `'configure'`), `allowGroups`, `isRoot`, `keyTotals`, `keysBefore` (set by parent), `remove` output. Recursion via `<app-rule-node [node]=c (nodeChange)=updateChild(c,$event) (remove)=removeChild($index)>`. All updates are **immutable** (`patch()` → `node.update`), bubbling up through `updateChild`.
- **Modes:** `configure` = structure editing (add/remove condition/group, pick field/operator/join); `values` = fill values (field/join selects disabled, Activity-type select shown).
- **Repeated fields labelling:** `repeated-field-label.ts` — when a rule uses the same field key more than once, labels become "Primary X", "Secondary X", "3rd X"… (display only; key unchanged). Computed top-down via `keyTotals`/`keysBefore`.
- **Value control chosen by `field.dataType`:**
  - `List` + collection → **server-searched** p-autoComplete if key ∈ `SEARCHED_FIELDS`; else preloaded p-multiselect / p-select.
  - `Number` (number input), `Decimal` (text input with pattern, converted by `Number()`), `DateTime` (`datetime-local`), `Enum` (select or multiselect when operator is Contains/Not contains), `ItemList` (select/multiselect of `listOptions`), default text input.
- **`SEARCHED_FIELDS`** (key → lookup kind; node stores the **CODE**, UI shows the **name**; min 3 chars): `Activities`→Activities, `Activity`→activity, `Diagnoses`→diagnosis, `GenericsGroups`, `PrimaryGenericsGroup` (both generic-drugs search), `SpecialitiesCode`→specialities-id, `DiagnosisGroupCodes`→morbidity-groups.
- **`MULTISELECT_FIELD_LOOKUPS`** (preloaded full list, stores the **name**): `BatchType` → `batchTypes`.
- **Activity fields (`Activities`/`Activity`)** require an **Activity Type** first (`activityTypeId` on the node); changing it resets the value. Types loaded once (`ensureTypes`).
- **Label resolution for saved codes:** `LoadingLookupService.resolveLabels` — activities: loads the type's full list once; other kinds: **one search request per stored code** (§10 perf). `pinLabel` keeps the name the user actually clicked. First-seen name wins in `remember`.
- **Single-operator fields:** an `effect` auto-selects the only allowed operator and disables the select.
- **Legacy tolerance:** older rules stored a single string or option objects → `valueList`, `storedValue` normalise.
- **Validation** lives in `RuleEditComponent.isValid` (group needs ≥1 child; condition needs fieldKey+operator+non-empty value).
- Effects per node: types, label resolution, preloaded lookup, diagnoses full list (when not autocomplete), single-operator sync.

---

## 7. Shared infrastructure

### 7.1 Proxy layer (`src/app/proxy`)
Generated by ABP (`abp generate-proxy -t ng` — check `generate-proxy.json`, which acts as a lock file). **Never hand-edit; regenerate.** Known DTO drift vs. what components send (works because objects are built untyped): `CreateRuleDto` has no `id/name`; `FormConfigFieldInputDto` has no `dataType/isDefault` (sent anyway); `RuleFieldCatalogDto`/`RuleFormFieldDto` lack `groupName` (read via cast in `form-config-edit`). If the backend DTOs gain these, regenerate and delete the casts.

### 7.2 Error handling
- `ErrorInterceptor`: on 401/403/404 calls `AuthenticationService.authLogout()` (result Observable **not subscribed** ⚠️), 404 → `EMPTY` (swallowed). For `POST/PUT` shows a toast (`CustomConfirmationService.error`, auto-clears after 5s). Rethrows `{code, message}`.
- `handleHttpErrors` (ABP `HTTP_ERROR_HANDLER`): cancelled → toast + go to login; timeout/offline → toast + go home; 403/404 → "no permission" toast + go home.
- List/detail GET errors are handled locally in components (`loading.set(false)`).

### 7.3 Common UI helpers
- `CustomConfirmationService` (ABP `ConfirmationService` wrapper: `success/error/warnConfrim/clear`).
- `FormPageComponent` (`app-form-page`): reactive filter bar driven by `dynamicControls` (`text|number|month|date|checkbox|dropdown|filterDropdown|radio`), emits `formSubmit`/`formResets`. Used by rule-list, workflow-list, dashboard.
- `AppComponentBase` → `primengTableHelper` (only rule-list extends it).
- Directives (trim, numeric, arabic-letter, …) mostly unused by current pages.

### 7.4 SignalR
`SignalRService` (root singleton): connects in `APP_INITIALIZER` (before login) and after login; `accessTokenFactory` = ABP access token; auto-reconnect every 5s; failures swallowed. **No hub event handlers (`.on`) exist anywhere** — it only feeds `ServerConnectSignalService` → header connection indicator.

---

## 8. Conventions (follow when changing code)

- New pages: **standalone components**, `inject()`, **signals**, new control flow (`@if/@for/@let`), `loadComponent` lazy routes. NgModules only where legacy requires (`Home`, `Shared`, `ApplicationLayout`).
- PrimeNG v21 modules (`SelectModule`, `MultiSelectModule`, `AutoCompleteModule`, `TableModule`, …); tables use `[lazy]=true` with `skipCount/maxResultCount/sorting` (`"field ASC|DESC"`).
- API access **only** via proxy services (`@proxy/...`). Local-only types go next to the component.
- List pages share a copy-pasted pattern (`load`, `remove`, `sumbitFilter`, `resetFilter`) — keep the same shape for consistency, or extract a helper if asked.
- Established names with typos are **kept as-is** (`sumbitFilter`, `customeidentity`, `custome.users`, `loadingLookup-service.ts`, `Formconfigs`, `warnConfrim`) — don't rename without being asked.
- Styling: rule-builder pages use classes from `_rule-builder.scss` (`rule-builder-page/card/field/actions`, `rule-node-select`).
- Complete, copy-paste-ready code is the user's preference (don't deliver partial sketches).

---

## 9. Known issues & findings (prioritised)

### A. Bugs / correctness
1. ✅ **`RuleEditComponent.save()`** checks `!this.selectedViolationType` — that's the signal function (always truthy), so violation type is never actually validated. Should be `!this.selectedViolationType()`.
2. ⚠️ **Reset button on filter pages**: `FormPageComponent.formReset()` emits `formSubmit.emit(null)` *then* `formResets.emit(null)`. `sumbitFilter(event)` in rule-list / workflow-list / dashboard dereferences `event.xxx` → `TypeError` on `null` (RxJS reports it async, so reset still runs but a console error fires). Fix: guard `if (!event) return;` or stop emitting `formSubmit(null)`.
3. ✅ **Filter doesn't reset to page 1** in rule-list/workflow-list (`table.createLazyLoadMetadata()` keeps current `first`). Execution-logs does it right (`first: 0`).
4. ✅ **Rule list header mismatch**: 3rd column header "Rejection Level" (sort field `workflow.rejectionLevel`) but the cell renders the Active/Inactive tag.
5. ✅ **`track $index`** on recursive children in `rule-node-component.html`: removing a middle sibling re-binds per-node state (autocomplete `suggestions`, `query$`) to a different node. Use a stable client id.
6. ✅ **Decimal field** can store `NaN` (`Number("abc")`); `isValid` doesn't reject it.
7. ✅ `ErrorInterceptor` dereferences `err.error.message` — throws when `err.error` is `null` (empty-body 401/403) ⚠️, masking the real error. Also a **404 triggers the logout path** (any missing entity).
8. ✅ `form-config-edit.setMultiple` mutates `this.selected()[index]` in place and silently clears `allowedOperators`; `remove()` sets `isDeleted` then immediately filters the item out (backend must infer deletions from absence).
9. ✅ `workflow-edit` uses native `alert()` for validation (also `form-config-edit`); list pages use native `confirm()`.

### B. Security / authorization
1. ✅ `/rules/**` and `/dashboard` have **no `authGuard`**; `loginGuard` is a no-op; all permission policies commented out (§3.2). Backend must be the enforcement point — verify it is.
2. ✅ `default.conf.template` enables **WebDAV** (`dav_methods PUT DELETE MKCOL COPY MOVE; create_full_put_path on;`) on the static site root and `client_max_body_size 900M`. Remove unless intentionally required.
3. ✅ `environment.dev.ts` uses implicit flow (`id_token token`) — deprecated; clientId/scope differ from prod (`RulesEngines_App`/`RulesEngines` vs `RulesEngine_App`/`RulesEngine`).

### C. Build / deploy
1. ✅ **No lockfile** committed (`package-lock.json`/`yarn.lock` absent) with `^` ranges → non-reproducible builds.
2. ✅ `Dockerfile`: `node:18-alpine` (Angular 21 requires Node ≥ 20.19/22.12), `COPY nginx.conf` (file doesn't exist in repo; only `default.conf.template`), copies `dist/RulesEngines` but `angular.json` outputs to `dist/` (`browser: ""`). `.gitlab-ci.yml` includes an external pipeline, so the Dockerfile may be stale ⚠️.
3. ✅ `ng serve` default (`development`) does **not** swap environments → runs with prod-copy `environment.ts` (`redirectUri` = deployed dev host, not localhost). Use `ng serve -c dev`. `serve.dev` uses legacy `browserTarget`.
4. ✅ `environment.ts` ≡ `environment.prod.ts` (identical; `production: true` even for `ng serve`).
5. ✅ nginx template lacks the `/getEnvConfig` rewrite that IIS `web.config` has.
6. ✅ Styles in `angular.json` and several TS imports rely on **transitive** packages not in `package.json` (`@fortawesome/fontawesome-free`, `@swimlane/ngx-datatable`, `@volo/ngx-lepton-x.lite`, `bootstrap`, `@popperjs/core`, `@ngx-validate/core`, `@abp/ng.permission-management`). Works while ABP/LeptonX keep them; declare explicitly if upgrades break.
7. ✅ `tsconfig`: `lib: [es2018, dom]` with `target: ES2022`; not `strict`. `nx`/`@nx/*` devDependencies with no `nx.json` (unused).
8. ✅ Template leftovers: `index.html` `<title>MCP</title>`, favicon `insurance.png`, `assets/config/config.json` points to `cmbackend-dev` (another app), README is the ABP boilerplate.

### D. Tech debt
- Legacy claims-app leftovers: `appPermissions.ts` (Claims/Batches/MyTasks/DigitalArchive/Beneficiaries/Family…), `HomeComponent` permissions, `claimDraft_` localStorage cleanup in `AuthenticationService`, `datapersistenceservice.ts` (fully commented), `MedicalRulesRoutingModule.ts`, `AuthInterceptor`.
- **Unused components**: `shared-table` (declared in `SharedModule`, never used in a template), CVA `custom-dropdown-multiple`, `custom-textarea`, `custom-date-picker`, `custom-input-search`; ABP Identity/Roles/Users overrides (commented out in `AppComponent`).
- Mixed NgModule + standalone; `dynamicControls: any[]` mutated after construction (`options` patched in `subscribe`); ~123 `any`; header registers a `window.resize` listener it never removes; `pingSubscription` unused.
- 37 spec files, mostly CLI scaffolds — treat as not providing coverage ❓.

### A′. Module wiring (verify at runtime ⚠️)
- `ApplicationLayoutModule` is imported eagerly in `AppModule` **and** lazy-loaded at `''` → duplicated route registration and a second `provideAbpCore(...)`.
- `provideAbpThemeShared(withHttpErrorConfig(...))` is followed by a bare `provideAbpThemeShared()` in the same providers array — the later call may override the HTTP error config (`skipHandledErrorCodes: [404]`, `hideCloseIcon`).
- `BrowserAnimationsModule` + `provideAnimationsAsync()` both present (async loading benefit lost; `@angular/animations` is deprecated in favour of native `animate.enter/leave`).

---

## 10. Performance notes & suggestions (ordered by expected payoff)

1. **Label resolution storm** — opening a rule with N saved codes for diagnoses/generics/specialities/morbidity fires **N separate search requests** (`resolveLabels`). Add a backend "get names by codes" endpoint (batch) and call it once per field. *(Largest realistic win; needs backend change.)*
2. **`findListItem()` in form-config-edit** pages through the full config list (100/page, serial) just to read `description`/`isActive` of one config. Return those from `RuleFormConfigService.get`, or add a get-by-id on the list DTO.
3. **Rule-edit load chain** — rule → workflow → form-config are sequential. Once `workflowId` is known, fetch workflow and `getByWorkflow` in parallel (`forkJoin`) and cancel in-flight loads on workflow change (`switchMap`).
4. **Tree editor** — already OnPush/signal-based. Add a stable `uid` per node and `track c.uid` (also fixes bug A5); avoid recomputing `countFieldKeys` over the whole tree for every group (only root needs it, children reuse parent's result).
5. **Dashboard** — `import('chart.js/auto')` pulls every controller; register only `BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend` (and drop the `allowedCommonJsDependencies: chart.js` entry). Convert `metrics`/`violationCharts` to signals and drop manual `detectChanges()`. Don't fire 4 requests per filter change with no cancellation (use `switchMap`/`forkJoin`).
6. **List pages** — convert to `OnPush`; extract shared `load/remove/filter` logic; debounce/ignore duplicate submits; reset `first` on filter.
7. **Bundle/CSS** — initial budget is 2.75–3 MB. Eagerly loaded: LeptonX + all ABP config modules + `SharedModule` (imports PermissionManagement, Extensible, PageModule) via the eager `ApplicationLayoutModule`. Fix the double-import (§9-A′), lazy-load Identity/permission-management pieces, and trim global styles/fonts that nothing uses (fontawesome, icofont, icomoon, bootstrap-icons, primeicons, ngx-datatable CSS all ship).
8. **Startup** — `SignalRService.reconnectIfNeeded()` in `APP_INITIALIZER` runs before auth and delays/clutters boot for a feature with no consumers; connect lazily after login only if the indicator is needed.
9. **Zone** — app uses zone.js; once pages are signal/OnPush-clean, `provideZonelessChangeDetection()` is a possible later step (ABP/LeptonX compatibility must be checked first).

---

## 11. Recipes (common changes)

**Add a server-searched List field (autocomplete, stores code)**
1. Backend: add field to catalog (`dataType: "List"`); admin enables it in a Form Config with `isMultiple` as needed.
2. Regenerate proxy if a new lookup endpoint was added (`LookupService.getXxxDropDownListBySearchTerm`).
3. `loadingLookup-service.ts`: add the kind to `LabelSource`, add `searchXxx()` (via `this.searched(...)`) and a `case` in `search()`.
4. `rule-node-component.ts`: add `["FieldKey","kind"]` to `SEARCHED_FIELDS`.

**Add a preloaded multiselect field (stores name)**
`PreloadedLookup` union → `preloadedItems` + `preloadedLoaders` in `LoadingLookupService` → `["FieldKey","lookup"]` in `MULTISELECT_FIELD_LOOKUPS`.

**Add a data type or operator**
`constant.ts` (`DataType`, `isDataType`, `OPERATORS`, `defaultValue`, `isCollectionType`) → `@switch` in `rule-node-component.html` → `RuleEditComponent.isValid` → `form-config-edit.operatorsFor` → backend enum parity (`RuleOperator`).

**Add a page**
Standalone component + `*.routes.ts` (`loadComponent`) → route in `application-layout-routing.module.ts` (**add `canActivate: [authGuard, ...]`** and `data.requiredPolicy` if permissions are to be enforced) → sidebar entry in `sidebar.component.ts` → proxy service (regenerate) → record in §5.

**Add a list filter**
`dynamicControls` entry (+ options when dropdown) → signal → pass to proxy `getList` params (backend DTO must have it; regenerate) → handle in `sumbitFilter`/`resetFilter` (and reset `first`).

**Change environment/endpoints**
Edit `environment.prod.ts` (prod build) / `environment.dev.ts` (`-c dev`) / `dynamic-env.json` (runtime via `/getEnvConfig`). Remember `environment.ts` is only used when no replacement applies.

---

## 12. Change log

| Date | Files | Change | Notes |
|---|---|---|---|
| 2026-11-22 | `docs/PROJECT_GUIDE.md` (this file) | Initial analysis of commit `9f54af2` | No code changed. Not reviewed ❓: SCSS, spec bodies, custom CVA component internals, `permission-management`, Identity overrides, login component internals, `shared-table` internals. |

*(Append new rows here after every change.)*

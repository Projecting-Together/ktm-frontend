# Next.js Research vs Current Codebase Cross-Comparison Audit

Date: 2026-04-24
Baseline: `nextjs-research.md`
Design: `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-design.md`

## 1) Objective and Scope
This audit compares `nextjs-research.md` against the current repository implementation to identify concrete platform gaps and produce a balanced execution roadmap.

Scope coverage aligns with the approved design:
- Architecture and routing
- Rendering strategy
- Caching and revalidation
- Performance optimization
- Security hardening
- Deployment and operations
- Testing and verification readiness

Out of scope:
- Implementing code changes from findings
- External repository benchmarking
- Security penetration testing

## 2) Method and Scoring Model
Baseline summary:
- Baseline source: `nextjs-research.md`
- Normalization source: `docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md`
- Method: convert research guidance into atomic checks, then map each check to repository evidence

Search scope for matrix evidence: this worktree repository root, primarily `src/**`, `tests/**`, and root config files (`next.config.ts`, `tsconfig.json`, `package.json`, `jest.config.ts`, `playwright.config.ts`, `.env.example`) as inspected during this audit pass.

Status rubric:
- `Missing`: expected artifact/control is absent in the scanned scope.
- `Unknown`: status cannot be inferred from code and docs in the scanned scope alone.

Weighted prioritization (applied to roadmap ordering):
- 30% risk reduction
- 30% performance/user impact
- 20% effort-to-value
- 20% platform maturity gain
## 3) Gap Matrix by Pillar
| Pillar | Check ID | Recommendation | Evidence (files/symbols) | Status | Impact | Effort | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Architecture and routing | ARCH-01 | Default new routes to App Router (`app/`); allow Pages Router only with a documented legacy dependency. | `src/app/layout.tsx`; `src/app/(public)/page.tsx`; `src/app/(auth)/login/page.tsx`; no `src/pages/**` found. | Compliant | High | Low | High | App Router is the active route system; no Pages Router footprint detected. |
| Architecture and routing | ARCH-02 | Organize routes with nested layouts and route groups to preserve URL shape while improving colocation and maintainability. | `src/app/(public)/layout.tsx`; `src/app/dashboard/layout.tsx`; `src/app/manage/layout.tsx`; `src/app/admin/layout.tsx`. | Compliant | Medium | Low | High | Route groups and nested layouts are already in use. |
| Architecture and routing | ARCH-03 | Keep server-only modules in server-only locations and prevent imports from Client Components. | `src/server/index.ts` exists; many client modules marked `"use client"` (for example `src/app/dashboard/page.tsx`); no `server-only` marker import found across `src/**`. | Partial | High | Medium | Medium | Structural separation exists but explicit server-only import guards are not present. |
| Rendering strategy | RENDER-01 | Map each route to SSG when content is public and stable. | Public routes under `src/app/(public)/**`; explicit `revalidate` on `src/app/(public)/page.tsx` and `src/app/(public)/apartments/[id]/page.tsx`; no route inventory document found in checked files. | Partial | High | Medium | Medium | Some public routes are mapped, but a full route-to-strategy map is not documented. |
| Rendering strategy | RENDER-02 | Use ISR (`revalidate`) for public content that changes frequently to balance freshness and cost. | `export const revalidate = 300` in `src/app/(public)/page.tsx`; `export const revalidate = 60` in `src/app/(public)/apartments/[id]/page.tsx`. | Compliant | High | Low | High | ISR is explicitly configured for key public pages. |
| Rendering strategy | RENDER-03 | Use SSR for user-specific or personalized responses that must be fresh on each request. | Personalized surfaces are client-first (`"use client"` in `src/app/dashboard/page.tsx`, `src/app/manage/page.tsx`, `src/app/admin/page.tsx`); no `cache: 'no-store'`/dynamic route config found in `src/app/**`. | Missing | High | Medium | Medium | No explicit server-render freshness strategy is documented for personalized routes in the scanned scope. |
| Rendering strategy | RENDER-04 | Decide streaming/Suspense at render-strategy level only when early delivery improves UX; defer implementation details to PERF checks. | `<Suspense>` used in `src/app/(public)/apartments/page.tsx`; no adjacent decision note or UX target reference in the scanned scope. | Partial | Medium | Low | Medium | Streaming primitive exists, but rationale and targets are not captured. |
| Caching and revalidation | CACHE-01 | Define per-route freshness using `export const revalidate` values instead of ad-hoc caching behavior. | `revalidate` present in `src/app/(public)/page.tsx` and `src/app/(public)/apartments/[id]/page.tsx`; no `revalidate` in most other route files. | Partial | High | Medium | High | Freshness is explicit for selected routes, not consistently across route set. |
| Caching and revalidation | CACHE-02 | Choose `fetch(..., { cache: 'force-cache' })` for cacheable data and `fetch(..., { cache: 'no-store' })` for always-fresh data explicitly. | Search for `cache: 'force-cache'`, `cache: 'no-store'`, and cache option usage in `src/**` returned no matches. | Missing | High | Medium | High | Explicit fetch cache policy controls are absent in the scanned code. |
| Caching and revalidation | CACHE-03 | Use `revalidatePath` and `revalidateTag` for targeted invalidation flows and document trigger points. | Search for `revalidatePath` and `revalidateTag` in repository returned no matches. | Missing | High | Medium | High | No targeted invalidation APIs are currently wired. |
| Caching and revalidation | CACHE-04 | Account for instance-scoped on-demand ISR invalidation in multi-instance or edge deployments. | Unknown: no on-demand ISR invalidation implementation (`revalidatePath`/`revalidateTag`) found, so instance-scope behavior cannot be validated from code. | Unknown | High | Medium | Medium | Requires deployment architecture note plus invalidation implementation evidence. |
| Performance optimization | PERF-01 | Default UI composition to Server Components to minimize shipped client JavaScript. | Many route files include `"use client"` (for example `src/app/dashboard/page.tsx`, `src/app/manage/page.tsx`, `src/app/admin/page.tsx`, plus numerous `src/components/**`). | Missing | High | High | High | Client-first composition is widespread in route-level UI. |
| Performance optimization | PERF-02 | Constrain Client Components to small interactive islands to reduce hydration cost. | Stateful islands exist (`src/components/search/SearchPageClient.tsx`, `src/components/map/SearchMap.tsx`), but entire route pages are client components (`src/app/dashboard/page.tsx`, `src/app/manage/page.tsx`). | Partial | High | High | Medium | Island pattern is used in places but not consistently at page boundaries. |
| Performance optimization | PERF-03 | Implement approved streaming/Suspense decisions with route-level loading boundaries and measurable UX targets. | `<Suspense>` present in `src/app/(public)/apartments/page.tsx`; no `src/app/**/loading.tsx` files found; no measurable streaming targets found in `tests/**`. | Partial | Medium | Medium | Medium | Basic streaming exists without standardized route loading boundaries or targets. |
| Performance optimization | PERF-04 | Use built-in Next.js image and font optimization paths and verify immutable static asset caching behavior. | `next/image` used in `src/components/listings/ListingCoverImage.tsx`; image optimization config in `next.config.ts` (`images.remotePatterns`, `images.formats`); no immutable static asset cache verification in `tests/**`. | Partial | Medium | Medium | High | Image optimization is configured; verification for static cache headers is missing. |
| Security hardening | SEC-01 | Keep middleware logic lightweight because it runs before routing and can execute on every request including prefetch traffic. | Middleware in `src/middleware.ts` handles auth redirecting, role checks, and CSP header application across broad matcher. | Partial | Medium | Medium | High | Functionality is centralized, but middleware includes non-trivial branching per request. |
| Security hardening | SEC-02 | Do not rely on Node built-ins (`fs`, `path`) in Edge Runtime middleware unless middleware runtime is explicitly moved to Node. | `src/middleware.ts` imports only `next/server` and `@/lib/csp`; no `fs`/`path` usage; no explicit `runtime` export found. | Compliant | High | Low | High | Current middleware implementation appears Edge-safe by dependency surface. |
| Security hardening | SEC-03 | Ensure all secrets access stays in server-only execution contexts and modules. | `.env.example` currently exposes only `NEXT_PUBLIC_*`; `src/lib/api/client.ts` and `src/components/map/MapView.tsx` read `NEXT_PUBLIC_*`; no non-public secret keys detected in scanned env template. | Compliant | High | Low | Medium | No private secret usage was found in the scanned sources. |
| Deployment and operations | DEPLOY-01 | Choose deployment mode intentionally: Node server or Docker for full feature compatibility, static export only when server features are unnecessary. | `package.json` uses `next build` + `next start`; `next.config.ts` has no `output: 'export'`; `src/middleware.ts` present. | Compliant | High | Low | High | Configuration aligns with server deployment, not static export. |
| Deployment and operations | DEPLOY-02 | Use Edge runtime only for workloads that benefit from low-latency global execution and fit Edge constraints. | Unknown: no explicit `export const runtime = 'edge'`/`'nodejs'` found in routes; middleware default runtime behavior is implicit only. | Unknown | Medium | Medium | Medium | Explicit runtime decisions are not documented in code-level exports. |
| Deployment and operations | DEPLOY-03 | Document middleware runtime selection (`edge` vs `node`) per use case to avoid hidden behavior shifts. | Unknown: `src/middleware.ts` has no runtime selection comment/export and no dedicated ops doc reference in this spec yet. | Unknown | Medium | Low | Medium | Runtime selection documentation gap remains. |
| Deployment and operations | DEPLOY-04 | Validate package scripts for build/start paths as a deployment readiness gate. | `package.json` scripts include `dev`, `build`, `start`, `preview`, `test`, `test:e2e`; test tooling configs exist in `jest.config.ts` and `playwright.config.ts`. | Compliant | High | Low | High | Build/start/test scripts are explicit and deployment-friendly. |
| Testing and verification readiness | VERIFY-01 | For each critical route, verify expected behavior for `revalidate`, `no-store`, and on-demand invalidation flows before production rollout. | `tests/**` contains unit/integration coverage but no checks for `revalidate`, `no-store`, `revalidatePath`, or `revalidateTag`. | Missing | High | Medium | High | Caching behavior verification coverage is currently absent. |
| Testing and verification readiness | VERIFY-02 | Track and validate stale-window behavior for ISR pages under representative traffic. | Unknown: no ISR stale-window or cache-age performance tests found in `tests/**`; no `tests/performance/*` files in this worktree. | Unknown | Medium | Medium | Medium | Requires dedicated ISR freshness/perf test harness. |
| Testing and verification readiness | VERIFY-03 | Log unresolved evidence gaps as explicit follow-up tickets before release hardening. | Unknown: no ticket references (issue IDs, tracked backlog links, or release tags) found in scanned spec/checklist scope for unresolved gaps. | Unknown | Medium | Low | Low | Follow-up ticketing process evidence is outside current checked sources or not present. |
## 4) Top Findings
1. Caching policy and invalidation controls are the largest current gap (`CACHE-02`, `CACHE-03`, `VERIFY-01`) and pose correctness/freshness risk.
2. Personalized route freshness intent remains implicit (`RENDER-03`, `CACHE-01`) across dashboard/manage/admin surfaces.
3. Route-level Client Component scope is broader than recommended (`PERF-01`, `PERF-02`), increasing hydration and bundle risk.
4. Runtime and middleware intent documentation is incomplete (`DEPLOY-02`, `DEPLOY-03`, `SEC-01`), creating operational ambiguity.
5. Verification evidence for ISR stale-window and unknown-closure tracking is not yet established (`VERIFY-02`, `VERIFY-03`).
## 5) Prioritized Roadmap (Now / Next / Later)
### Now
1. **NOW-1 (`CACHE-02`, `CACHE-03`, `VERIFY-01`)**  
   Add explicit fetch cache modes (`force-cache`/`no-store`) and targeted invalidation (`revalidatePath`/`revalidateTag`) for critical listing/detail data paths.  
   - Rationale: Highest combined risk-reduction and user-impact score because stale or incorrect cache behavior affects correctness and freshness platform-wide.
   - Dependencies: Needs route/data inventory from `RENDER-01` evidence and owner mapping for invalidation triggers.

2. **NOW-2 (`RENDER-03`, `CACHE-01`)**  
   Define explicit dynamic freshness strategy for personalized routes (for example dashboard/manage/admin surfaces) and document route-level render/cache intent.  
   - Rationale: Prevents hidden SSR/CSR drift and production regressions where personalized data can be stale or inconsistently rendered.
   - Dependencies: Should follow NOW-1 cache policy conventions so render decisions and cache controls are aligned.

3. **NOW-3 (`PERF-01`, `PERF-02`)**  
   Reduce route-level `"use client"` scope and move non-interactive data/layout shells to Server Components with small client islands only where interactivity is required.  
   - Rationale: Directly improves bundle size and hydration cost on high-traffic paths with strong user-perceived performance upside.
   - Dependencies: Requires baseline measurement targets and guardrails in `VERIFY-01`.

### Next
4. **NEXT-1 (`PERF-03`, `RENDER-04`)**  
   Standardize route-level loading boundaries (`loading.tsx` where applicable) and tie Suspense usage to explicit UX targets (TTFB/LCP perception goals).  
   - Rationale: Medium effort with meaningful UX consistency gains once cache/render foundations are stabilized.
   - Dependencies: Depends on NOW-2 render strategy map and NOW-3 component boundary cleanup.

5. **NEXT-2 (`DEPLOY-02`, `DEPLOY-03`, `SEC-01`)**  
   Document runtime decisions (`edge` vs `nodejs`) for middleware and selected routes, with guardrails on middleware complexity.  
   - Rationale: Reduces operational ambiguity and hard-to-debug runtime drift before broader deployment scaling.
   - Dependencies: Requires confirmed hosting/runtime constraints from deployment owners.

### Later
6. **LATER-1 (`VERIFY-02`)**  
   Add ISR stale-window behavior tests under representative traffic and cache-age scenarios.  
   - Rationale: High maturity value but lower immediate payoff than correctness/performance baseline gaps.
   - Dependencies: Depends on NOW-1/NOW-2 being complete so behavior under test is stable.

7. **LATER-2 (`VERIFY-03`, `CACHE-04`)**  
   Create explicit backlog tickets for unresolved unknowns and multi-instance invalidation assumptions; link each unknown to an owner and closure date.  
   - Rationale: Improves governance and release readiness after core engineering controls are implemented.
   - Dependencies: Requires outputs from NEXT-2 runtime documentation and initial invalidation rollout results.

## 6) Verification Criteria
### NOW-1 (`CACHE-02`, `CACHE-03`, `VERIFY-01`)
- Success condition: Critical data fetches have explicit cache policies, and invalidation APIs are implemented where mutation flows require freshness.
- Validate command: `rg "cache:\s*'(force-cache|no-store)'|revalidate(Path|Tag)\(" src`
- Expected behavior: Command returns matches in route/data modules tied to listing/detail read paths and mutation handlers.

### NOW-2 (`RENDER-03`, `CACHE-01`)
- Success condition: Personalized routes declare/implement documented freshness intent (dynamic/no-store or equivalent route-level decision) with no implicit defaults for critical paths.
- Validate command: `rg "dashboard|manage|admin|revalidate|dynamic|no-store" src/app`
- Expected behavior: Output shows explicit render/cache intent on personalized route entry points, not only in downstream utilities.

### NOW-3 (`PERF-01`, `PERF-02`)
- Success condition: Route-level Client Components are reduced, with client usage limited to interactive islands and measurable JS/hydration reduction from baseline.
- Validate command: `npm run build && cp .next/analyze/client.html docs/superpowers/evidence/now-3-baseline-client.html` (baseline), then rerun after changes and compare total JS for targeted routes.
- Expected behavior: Build succeeds; documented post-change client JS total for targeted routes is >=10% lower than the saved baseline artifact in `docs/superpowers/evidence/`.

### NEXT-1 (`PERF-03`, `RENDER-04`)
- Success condition: Suspense/loading boundaries are present on selected routes and each boundary maps to a documented UX objective.
- Validate command: `rg "Suspense|loading\.tsx" src/app`
- Expected behavior: Matches include both boundary implementation and route coverage beyond a single page.

### NEXT-2 (`DEPLOY-02`, `DEPLOY-03`, `SEC-01`)
- Success condition: Runtime choices and middleware scope constraints are documented and reflected in code where required.
- Validate command: `rg "runtime\s*=|middleware" src docs/superpowers/specs`
- Expected behavior: Results show explicit runtime declarations or rationale docs and middleware guidance aligned to deployment constraints.

### LATER-1 (`VERIFY-02`)
- Success condition: ISR stale-window tests exist and fail when freshness guarantees regress.
- Validate command: `npm run test -- tests/performance/*.spec.ts`
- Expected behavior: All performance/freshness specs pass and enforce explicit stale-window thresholds without regression.

### LATER-2 (`VERIFY-03`, `CACHE-04`)
- Success condition: All unknowns from this audit are tracked as owner-assigned backlog items with target resolution dates.
- Validate command: `rg "CACHE-04|VERIFY-03|owner|target date|unknown" docs/superpowers/specs docs/superpowers/plans`
- Expected behavior: Traceable artifact links unknown matrix items to actionable follow-up work with clear accountability.
## 7) Risks, Assumptions, and Unknowns
- Risk: mid-migration repository changes can quickly age some findings.
  - Mitigation: preserve `Unknown` where evidence is incomplete and re-verify before implementation.
- Risk: roadmap selection may over-favor low-effort items.
  - Mitigation: keep weighted scoring across risk, user impact, effort-to-value, and maturity.
- Assumption: scanned scope (`src/**`, `tests/**`, configs, and related docs) represents active behavior for this audit.
- Unknown: multi-instance invalidation behavior remains unresolved until invalidation APIs and deployment topology are both documented.
- Open question: where should ownership and target dates for `VERIFY-03` follow-up tickets be enforced (planning docs or issue tracker)?

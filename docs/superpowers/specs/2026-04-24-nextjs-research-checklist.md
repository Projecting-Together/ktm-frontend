# Next.js Research Checklist (Normalized)

Date: 2026-04-24
Source: `nextjs-research.md`

## Coverage and Traceability
- Coverage check: all seven design pillars are represented by one or more checklist IDs (`ARCH`, `RENDER`, `CACHE`, `PERF`, `SEC`, `DEPLOY`, `VERIFY`).
- Evidence anchors for audit mapping: `src/`, `tests/`, `next.config.ts`, `tsconfig.json`, `package.json`, `jest.config.ts`, `playwright.config.ts`, `.env.example`.

## Pillars
1. Architecture and routing
2. Rendering strategy
3. Caching and revalidation
4. Performance optimization
5. Security hardening
6. Deployment and operations
7. Testing and verification readiness

## Checklist Entries

- [ARCH] Check ID: ARCH-01
  - Recommendation: "Default new routes to App Router (`app/`); allow Pages Router only with a documented legacy dependency."
  - Source section: "1. Architecture and project structure"
  - Priority hint: High
- [ARCH] Check ID: ARCH-02
  - Recommendation: "Organize routes with nested layouts and route groups to preserve URL shape while improving colocation and maintainability."
  - Source section: "1. Architecture and project structure"
  - Priority hint: Medium
- [ARCH] Check ID: ARCH-03
  - Recommendation: "Keep server-only modules in server-only locations and prevent imports from Client Components."
  - Source section: "1. Architecture and project structure"
  - Priority hint: High

- [RENDER] Check ID: RENDER-01
  - Recommendation: "Map each route to SSG when content is public and stable."
  - Source section: "2. Rendering strategy: SSG, ISR, SSR, Server & Client Components, streaming"
  - Priority hint: High
- [RENDER] Check ID: RENDER-02
  - Recommendation: "Use ISR (`revalidate`) for public content that changes frequently to balance freshness and cost."
  - Source section: "2. Rendering strategy: SSG, ISR, SSR, Server & Client Components, streaming"
  - Priority hint: High
- [RENDER] Check ID: RENDER-03
  - Recommendation: "Use SSR for user-specific or personalized responses that must be fresh on each request."
  - Source section: "2. Rendering strategy: SSG, ISR, SSR, Server & Client Components, streaming"
  - Priority hint: High
- [RENDER] Check ID: RENDER-04
  - Recommendation: "Decide streaming/Suspense at render-strategy level only when early delivery improves UX; defer implementation details to PERF checks."
  - Source section: "2. Rendering strategy: SSG, ISR, SSR, Server & Client Components, streaming"
  - Priority hint: Medium

- [CACHE] Check ID: CACHE-01
  - Recommendation: "Define per-route freshness using `export const revalidate` values instead of ad-hoc caching behavior."
  - Source section: "3. Caching: CDN, edge, server, browser, ISR caches, cache-control strategies"
  - Priority hint: High
- [CACHE] Check ID: CACHE-02
  - Recommendation: "Choose `fetch(..., { cache: 'force-cache' })` for cacheable data and `fetch(..., { cache: 'no-store' })` for always-fresh data explicitly."
  - Source section: "3. Caching: CDN, edge, server, browser, ISR caches, cache-control strategies"
  - Priority hint: High
- [CACHE] Check ID: CACHE-03
  - Recommendation: "Use `revalidatePath` and `revalidateTag` for targeted invalidation flows and document trigger points."
  - Source section: "3. Caching: CDN, edge, server, browser, ISR caches, cache-control strategies"
  - Priority hint: High
- [CACHE] Check ID: CACHE-04
  - Recommendation: "Account for instance-scoped on-demand ISR invalidation in multi-instance or edge deployments."
  - Source section: "3. Caching: CDN, edge, server, browser, ISR caches, cache-control strategies"
  - Priority hint: High

- [PERF] Check ID: PERF-01
  - Recommendation: "Default UI composition to Server Components to minimize shipped client JavaScript."
  - Source section: "4. Performance optimizations (bundle size, images, fonts, hydration, code-splitting, metrics & budgets)"
  - Priority hint: High
- [PERF] Check ID: PERF-02
  - Recommendation: "Constrain Client Components to small interactive islands to reduce hydration cost."
  - Source section: "4. Performance optimizations (bundle size, images, fonts, hydration, code-splitting, metrics & budgets)"
  - Priority hint: High
- [PERF] Check ID: PERF-03
  - Recommendation: "Implement approved streaming/Suspense decisions with route-level loading boundaries and measurable UX targets."
  - Source section: "4. Performance optimizations (bundle size, images, fonts, hydration, code-splitting, metrics & budgets)"
  - Priority hint: Medium
- [PERF] Check ID: PERF-04
  - Recommendation: "Use built-in Next.js image and font optimization paths and verify immutable static asset caching behavior."
  - Source section: "4. Performance optimizations (bundle size, images, fonts, hydration, code-splitting, metrics & budgets)"
  - Priority hint: Medium

- [SEC] Check ID: SEC-01
  - Recommendation: "Keep middleware logic lightweight because it runs before routing and can execute on every request including prefetch traffic."
  - Source section: "5. Security hardening"
  - Priority hint: Medium
- [SEC] Check ID: SEC-02
  - Recommendation: "Do not rely on Node built-ins (`fs`, `path`) in Edge Runtime middleware unless middleware runtime is explicitly moved to Node."
  - Source section: "5. Security hardening"
  - Priority hint: High
- [SEC] Check ID: SEC-03
  - Recommendation: "Ensure all secrets access stays in server-only execution contexts and modules."
  - Source section: "5. Security hardening"
  - Priority hint: High

- [DEPLOY] Check ID: DEPLOY-01
  - Recommendation: "Choose deployment mode intentionally: Node server or Docker for full feature compatibility, static export only when server features are unnecessary."
  - Source section: "6. Deployment and operations (CI/CD, hosting, edge vs serverless vs self-managed, rollbacks, observability, incident response)"
  - Priority hint: High
- [DEPLOY] Check ID: DEPLOY-02
  - Recommendation: "Use Edge runtime only for workloads that benefit from low-latency global execution and fit Edge constraints."
  - Source section: "6. Deployment and operations (CI/CD, hosting, edge vs serverless vs self-managed, rollbacks, observability, incident response)"
  - Priority hint: Medium
- [DEPLOY] Check ID: DEPLOY-03
  - Recommendation: "Document middleware runtime selection (`edge` vs `node`) per use case to avoid hidden behavior shifts."
  - Source section: "6. Deployment and operations (CI/CD, hosting, edge vs serverless vs self-managed, rollbacks, observability, incident response)"
  - Priority hint: Medium
- [DEPLOY] Check ID: DEPLOY-04
  - Recommendation: "Validate package scripts for build/start paths as a deployment readiness gate."
  - Source section: "6. Deployment and operations (CI/CD, hosting, edge vs serverless vs self-managed, rollbacks, observability, incident response)"
  - Priority hint: High

- [VERIFY] Check ID: VERIFY-01
  - Recommendation: "For each critical route, verify expected behavior for `revalidate`, `no-store`, and on-demand invalidation flows before production rollout."
  - Source section: "9. Tooling, measurement, and enforcement (evidence and gaps)"
  - Priority hint: High
- [VERIFY] Check ID: VERIFY-02
  - Recommendation: "Track and validate stale-window behavior for ISR pages under representative traffic."
  - Source section: "9. Tooling, measurement, and enforcement (evidence and gaps)"
  - Priority hint: Medium
- [VERIFY] Check ID: VERIFY-03
  - Recommendation: "Log unresolved evidence gaps as explicit follow-up tickets before release hardening."
  - Source section: "9. Tooling, measurement, and enforcement (evidence and gaps)"
  - Priority hint: Medium

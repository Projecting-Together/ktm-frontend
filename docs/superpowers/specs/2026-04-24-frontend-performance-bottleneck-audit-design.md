# Frontend Performance Bottleneck Audit Design

Date: 2026-04-24
Status: Proposed and user-approved (brainstorming)
Owner: Frontend Team

## 1) Goal

Establish a reliable frontend performance audit that identifies where bottlenecks occur, how they impact user experience, and what actions should be prioritized to improve loading and data flow.

The audit should:

- detect real bottlenecks in route loading, data flow, and rendering;
- separate frontend bottlenecks from backend/network latency effects;
- produce a ranked fix list with impact, confidence, and effort.

## 2) Scope

### In scope

- Search flow performance on `/apartments` (filters, request behavior, rendering)
- Auth and manage route loading behavior (`/login`, `/register`, `/manage/*`)
- Global asset loading hotspots (chunks, fonts, CSS, images)
- Structured performance artifacts under `build/performance/`
- A repeatable scorecard that ranks bottlenecks and fix priority

### Out of scope

- Backend service optimization implementation
- Infrastructure-level tuning (CDN/server config) beyond frontend evidence collection
- Large architectural rewrites not justified by measured bottlenecks

## 3) Architecture and Audit Flow

Use a single performance audit pipeline with three phases and one consolidated scorecard.

### Phase 1: Search Flow Audit

Focus: `/apartments` data flow and interaction responsiveness.

### Phase 2: Auth/Manage Route Audit

Focus: route transitions, redirect cost, and loading behavior on auth/manage paths.

### Phase 3: Global Asset Audit

Focus: asset-level loading costs and weight contributors.

### Final Output

Produce one ranked bottleneck report with:

- bottleneck description
- location
- user impact
- confidence
- estimated fix effort
- recommended action

## 4) Metrics and Thresholds

### Phase 1 (`/apartments`)

- Interaction latency (filter action to visible UI update), target <= 1000ms in mocked mode
- Duplicate request ratio per interaction cycle (same endpoint + same query)
- Phase timing breakdown:
  - interaction -> URL update
  - URL update -> response complete
  - response complete -> UI update
- Large dataset rendering pressure (200-500 records)
- Slow backend UX behavior (loading hint, graceful recovery path)

### Phase 2 (Auth/Manage)

- Route transition time to first meaningful render
- Blocking resource count on auth/manage routes
- Hydration stability over repeated runs
- Protected-route redirect overhead

### Phase 3 (Global Assets)

- Largest JS chunk timing/weight hotspots
- Font request timing and cumulative font cost
- Critical CSS response timing
- Heavy/repeated image request pressure
- Asset hotspot ranking by avg/max ms and request frequency

### Cross-phase Scoring

Each finding includes:

- Impact: High / Medium / Low
- Confidence: High / Medium / Low
- Effort: S / M / L
- Priority score: impact-weighted and confidence-adjusted

## 5) Fix Catalog

### A) Duplicate data requests

- Stabilize query keys and avoid identity churn
- Debounce/commit filter updates when appropriate
- Prevent URL-sync and query-trigger loops
- Use query `enabled` guards to avoid premature refetch
- Tune stale caching behavior where safe

### B) Slow interaction to UI update

- Move heavy transforms out of the hot render path
- Memoize repeated derived collections
- Defer non-critical secondary work until primary UI is visible
- Reduce synchronous work in filter handlers

### C) Large result render pressure

- Virtualize long lists where UX permits
- Limit initial above-the-fold render count
- Progressively render remaining cards
- Avoid eager expensive subcomponents per card

### D) Route/Auth loading slowness

- Lazy-load non-critical route modules
- Reduce auth page initial dependency load
- Avoid loading manage-only logic on public/auth routes
- Optimize protected-route redirect paths

### E) JS/CSS/Font hotspots

- Split oversized chunks
- Defer low-priority modules
- Preload only truly critical fonts and reduce variants
- Scope and trim CSS payloads

### F) Real backend/network latency

- Endpoint-appropriate timeout and retry strategy
- Improve loading/error UX and fallback behavior
- Keep reporting clear on frontend vs backend ownership

## 6) Testing and Rollout Strategy

### Rollout

- Phase A: audit-only baseline runs (report-only)
- Phase B: enable high-confidence mocked guardrails
- Phase C: apply top 1-2 bottleneck fixes per cycle
- Phase D: tighten budgets gradually after stability

### Required checks

- `npm run check`
- `npm run test`
- targeted `npm run test:e2e` for changed areas
- `npm run test:perf`
- optional `npm run test:perf:real` when API env is available

### Merge criteria

- No functional regression
- No new high-impact bottleneck introduced
- Mocked perf guardrails remain green
- Updated artifacts:
  - `build/performance/summary.json`
  - `build/performance/summary.md`

### Failure handling

- Classify failures as regression, noise, or harness drift
- Use repeat/median strategy for noisy metrics
- Revert or patch real regressions before merge
- Fix diagnostics drift before re-baselining

### Budget governance

Every threshold change must include:

- reason (quality increase or noise control)
- old vs new value
- evidence from recent runs

## 7) Success Criteria

This audit design is successful when:

- bottlenecks are measurable and ranked with clear priority;
- the team can distinguish frontend issues from backend latency issues;
- fixes are shipped with verification evidence and without functional regression;
- the performance report becomes a stable decision-making artifact.

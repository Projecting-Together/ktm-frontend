# Next.js Research vs Current Codebase Cross-Comparison Design

Date: 2026-04-24
Status: Proposed and user-approved (brainstorming)
Owner: Frontend Team

## 1) Goal

Create a full, evidence-backed cross-comparison between:

- the research baseline in `nextjs-research.md`, and
- the current `ktm-frontend` Next.js codebase

to produce a balanced, prioritized action roadmap that can guide implementation work without over-optimizing for only one axis (for example, performance only or security only).

## 2) Scope

### In scope

- Full-domain comparison across:
  - architecture and routing
  - rendering strategy
  - caching and revalidation
  - performance optimization patterns
  - security hardening posture
  - deployment and operations readiness
  - test and verification readiness
- File-level evidence mapping from repository sources
- Gap classification and prioritization (`Now`, `Next`, `Later`)
- Explicit assumptions, unknowns, and confidence scoring

### Out of scope

- Implementing code changes from findings
- Rewriting existing feature plans unrelated to Next.js platform posture
- Deep external benchmarking against other repositories
- Security pentesting or production incident simulation

## 3) Decision Summary (Validated)

- Chosen approach: **Gap Matrix (Option A)**
- Why this approach:
  - gives broad coverage across all requested domains
  - keeps findings auditable through direct file evidence
  - supports balanced prioritization instead of single-factor ranking
  - creates a clean handoff into implementation planning

## 4) Inputs and Sources

Primary baseline:

- `nextjs-research.md` (Tavily research output generated in repo)

Primary codebase evidence locations:

- `src/app/**` (routing, rendering, data flow)
- `src/components/**` and `src/lib/**` (component boundaries, data access, caching usage, server/client boundaries)
- `src/middleware.ts` (if present)
- `next.config.ts`, `tsconfig.json`, `package.json`
- test config and suites (`jest.config.ts`, `playwright.config.ts`, `tests/**`)
- environment and runtime docs (`.env.example`, relevant docs under `docs/superpowers/**`)

## 5) Comparison Framework

The cross-comparison will use seven pillars:

1. Architecture and routing model
2. Rendering strategy and server/client split
3. Caching and revalidation controls
4. Performance optimization and measurement
5. Security hardening and secret boundaries
6. Deployment and operational readiness
7. Testing and verification maturity

Each pillar is evaluated as a set of concrete checks extracted from `nextjs-research.md`.

## 6) Gap Matrix Schema

Each check row in the matrix contains:

- `Research Recommendation`
- `Current Evidence` (file paths and symbols)
- `Status`: `Compliant` | `Partial` | `Missing` | `Unknown`
- `Impact`: `High` | `Medium` | `Low`
- `Effort`: `S` | `M` | `L`
- `Confidence`: `High` | `Medium` | `Low`
- `Notes / Constraints`

Status definitions:

- `Compliant`: clear implementation evidence exists and aligns with recommendation intent
- `Partial`: some implementation exists, but incomplete or inconsistent
- `Missing`: no evidence found for the recommendation
- `Unknown`: cannot be determined from repository evidence alone

## 7) Scoring and Prioritization Model

To satisfy balanced prioritization, roadmap ranking uses weighted scoring:

- 30% Risk reduction
- 30% Performance and user-impact potential
- 20% Effort-to-value ratio
- 20% Platform maturity and maintainability gain

This creates a domain-balanced sequence and avoids bias toward only one area.

## 8) Execution Method (Three Passes)

### Pass 1: Baseline normalization

- Parse `nextjs-research.md` into a normalized checklist grouped by the seven pillars.
- Convert narrative recommendations into atomic verifiable checks.

### Pass 2: Repository evidence mapping

- Map each check to repository evidence (or lack of evidence).
- Assign `Status`, `Impact`, `Effort`, and `Confidence`.
- Record any ambiguous cases as `Unknown` with follow-up validation notes.

### Pass 3: Balanced roadmap construction

- Rank items with weighted scoring.
- Group into:
  - `Now` (high-value near-term)
  - `Next` (important but dependent or medium effort)
  - `Later` (strategic or high-effort initiatives)
- Add dependency notes where items must precede others.

## 9) Deliverable Format

The produced cross-comparison output document will include:

1. Objective and scope
2. Baseline summary from research
3. Gap matrix by pillar
4. Consolidated top findings
5. Balanced prioritized roadmap (`Now / Next / Later`)
6. Verification criteria per roadmap item
7. Risks, assumptions, and open questions

## 10) Error Handling and Quality Controls

- If repository evidence is conflicting, mark `Unknown` instead of forcing a false conclusion.
- If recommendation wording is ambiguous, preserve original intent and add interpretation notes.
- Keep evidence references specific and reproducible (paths and symbols, not vague descriptions).
- Separate factual findings from recommendations to prevent scope drift.

## 11) Acceptance Criteria

This design is complete when:

- full requested domains are covered in the comparison framework
- matrix schema and status rules are explicit
- balanced prioritization model is defined and reproducible
- deliverable format is concrete and implementation-ready
- handoff path to planning is clear

## 12) Risks and Mitigations

- Risk: research baseline includes mixed-quality sources
  - Mitigation: prioritize official Next.js guidance when interpreting conflicts
- Risk: current codebase may be mid-migration, causing stale signals
  - Mitigation: tag uncertain findings as `Unknown` and list targeted validation steps
- Risk: roadmap over-weights easy fixes
  - Mitigation: enforce weighted balance across risk, performance, effort, and maturity

## 13) Handoff to Implementation Planning

After user review and approval of this design spec:

- create an implementation plan document focused on executing the comparison workflow
- keep execution phase separate from this design to maintain traceability

# Next.js Research vs Current Codebase Cross-Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a full, evidence-backed gap matrix that compares `nextjs-research.md` against the current `ktm-frontend` codebase and delivers a balanced `Now / Next / Later` roadmap.

**Architecture:** Execute in small documentation-first slices: normalize research into atomic checks, map each check to repository evidence, score findings with the approved weighted model, then publish an actionable audit report. Keep findings factual and verifiable, and keep recommendations separate from evidence.

**Tech Stack:** Next.js 15 (App Router), TypeScript codebase, Markdown docs, ripgrep, Git, PowerShell.

---

## File Structure and Responsibilities

- `nextjs-research.md`
  - canonical research baseline input
- `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-design.md`
  - approved design and rubric source
- `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md` (create)
  - final cross-comparison deliverable with matrix and roadmap
- `docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md` (create)
  - normalized checklist extracted from research, used as audit worksheet

---

### Task 1: Preflight and Audit Artifact Scaffolding

**Files:**
- Create: `docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md`
- Create: `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`
- Modify: none
- Test: command-only preflight checks

- [ ] **Step 1: Verify baseline files and repository status**

Run:
```bash
git status --short
ls docs/superpowers/specs
ls nextjs-research.md
```

Expected:
- working tree status prints without errors
- design spec and `nextjs-research.md` are present

- [ ] **Step 2: Create checklist scaffold**

Add this initial content to `docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md`:
```markdown
# Next.js Research Checklist (Normalized)

Date: 2026-04-24
Source: `nextjs-research.md`

## Pillars
1. Architecture and routing
2. Rendering strategy
3. Caching and revalidation
4. Performance optimization
5. Security hardening
6. Deployment and operations
7. Testing and verification readiness

## Checklist Entries
<!-- Add atomic recommendation checks here, grouped by pillar -->
```

- [ ] **Step 3: Create audit report scaffold**

Add this initial content to `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`:
```markdown
# Next.js Research vs Current Codebase Cross-Comparison Audit

Date: 2026-04-24
Baseline: `nextjs-research.md`
Design: `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-design.md`

## 1) Objective and Scope
## 2) Method and Scoring Model
## 3) Gap Matrix by Pillar
## 4) Top Findings
## 5) Prioritized Roadmap (Now / Next / Later)
## 6) Verification Criteria
## 7) Risks, Assumptions, and Unknowns
```

- [ ] **Step 4: Commit scaffolding**

Run:
```bash
git add docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md
git commit -m "docs: scaffold nextjs research checklist and audit report"
```

Expected: one commit containing only scaffold docs.

---

### Task 2: Normalize Research into Atomic Checklist Items

**Files:**
- Modify: `docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md`
- Test: checklist completeness checks

- [ ] **Step 1: Extract atomic recommendations from research**

Use `nextjs-research.md` and expand the checklist into concrete checks.

Use this checklist row format:
```markdown
- [PILLAR] Check ID: RENDER-01
  - Recommendation: "Use Server Components by default; isolate Client Components"
  - Source section: "Architecture and project structure"
  - Priority hint: High
```

- [ ] **Step 2: Ensure every design pillar has at least 3 checks**

Run:
```bash
rg "Check ID:" docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md
```

Expected:
- output includes checks for all seven pillars
- no pillar is empty

- [ ] **Step 3: Validate no placeholders remain**

Run:
```bash
rg "TODO|TBD|later|placeholder" docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md
```

Expected:
- no matches

- [ ] **Step 4: Commit normalized checklist**

Run:
```bash
git add docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md
git commit -m "docs: normalize nextjs research into atomic checklist checks"
```

Expected: one commit with checklist-only changes.

---

### Task 3: Map Codebase Evidence and Build Gap Matrix

**Files:**
- Modify: `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`
- Reference: `src/app/**`, `src/lib/**`, `src/components/**`, `next.config.ts`, `tsconfig.json`, `package.json`, `jest.config.ts`, `playwright.config.ts`, `.env.example`, `tests/**`
- Test: evidence traceability checks

- [ ] **Step 1: Add matrix table template to audit document**

Insert this table template under "Gap Matrix by Pillar":
```markdown
| Pillar | Check ID | Recommendation | Evidence (files/symbols) | Status | Impact | Effort | Confidence | Notes |
|---|---|---|---|---|---|---|---|---|
```

- [ ] **Step 2: Populate evidence for each check**

For each checklist item, add a matrix row with:
- specific file paths (and symbols if applicable)
- `Status` as one of `Compliant` / `Partial` / `Missing` / `Unknown`
- `Impact`, `Effort`, `Confidence`

Use evidence commands like:
```bash
rg "revalidate|revalidatePath|revalidateTag|cache|router.refresh" src next.config.ts
rg "use client|use server" src/app src/components
rg "middleware|headers|cookies|Authorization|CSP" src
rg "testDir|testMatch|check|build|start" playwright.config.ts jest.config.ts package.json
```

Expected:
- every checklist check has a corresponding matrix row
- every row has at least one evidence reference or explicit `Unknown` reason

- [ ] **Step 3: Validate matrix completeness**

Run:
```bash
rg "Unknown|Missing|Partial|Compliant" docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md
```

Expected:
- all rows include a valid status
- no rows with blank status

- [ ] **Step 4: Commit matrix evidence mapping**

Run:
```bash
git add docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md
git commit -m "docs: map nextjs checklist checks to codebase evidence"
```

Expected: one commit with completed matrix entries.

---

### Task 4: Apply Weighted Scoring and Create Balanced Roadmap

**Files:**
- Modify: `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`
- Test: roadmap consistency checks

- [ ] **Step 1: Add scoring rubric to the audit**

Insert this scoring block under "Method and Scoring Model":
```markdown
Weighted prioritization:
- 30% risk reduction
- 30% performance/user impact
- 20% effort-to-value
- 20% platform maturity gain
```

- [ ] **Step 2: Create prioritized roadmap sections**

Add:
```markdown
## 5) Prioritized Roadmap (Now / Next / Later)

### Now
- [Item ID] ...

### Next
- [Item ID] ...

### Later
- [Item ID] ...
```

Populate with concrete matrix items, including rationale and dependencies.

- [ ] **Step 3: Add verification criteria per roadmap item**

For each roadmap item, include:
- success condition
- validation command(s)
- expected output/behavior

Example format:
```markdown
- Item: CACHE-03
  - Success: all critical listing routes define explicit cache/revalidation strategy
  - Validate: `rg "revalidate|cache:" src/app`
  - Expected: non-empty matches on targeted routes
```

- [ ] **Step 4: Commit roadmap and verification criteria**

Run:
```bash
git add docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md
git commit -m "docs: add balanced roadmap and verification criteria for nextjs gaps"
```

Expected: one commit with scoring and roadmap only.

---

### Task 5: Final QA Pass and Publication Readiness

**Files:**
- Modify: `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`
- Modify: `docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md` (if needed)
- Test: lint-style content quality checks

- [ ] **Step 1: Spec coverage check against approved design**

Manually verify each design section from:
`docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-design.md`
maps to completed content in the audit document.

- [ ] **Step 2: Placeholder and ambiguity scan**

Run:
```bash
rg "TODO|TBD|placeholder|maybe|etc\\.|and so on" docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md
```

Expected:
- no matches

- [ ] **Step 3: Ensure evidence traceability**

Run:
```bash
rg "src/|next.config.ts|tsconfig.json|package.json|jest.config.ts|playwright.config.ts|.env.example|tests/" docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md
```

Expected:
- every major section has concrete file evidence references

- [ ] **Step 4: Final commit**

Run:
```bash
git add docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md docs/superpowers/specs/2026-04-24-nextjs-research-checklist.md
git commit -m "docs: finalize nextjs research cross-comparison audit"
```

Expected: final audit publication commit created.

---

## Self-Review Checklist (Run Before Execution Handoff)

- [ ] Every requirement in the design spec maps to at least one task above
- [ ] No placeholders (`TODO`, `TBD`, vague "add error handling")
- [ ] All statuses and scoring categories are explicitly defined
- [ ] Commands include expected outcomes
- [ ] Commit boundaries are small and phase-aligned


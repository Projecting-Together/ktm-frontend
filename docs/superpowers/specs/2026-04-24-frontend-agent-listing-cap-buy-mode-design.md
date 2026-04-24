# Frontend Agent Upgrade, Listing Cap, and Buy Mode Expansion Design

Date: 2026-04-24
Status: Proposed and user-validated (brainstorming)
Owner: Frontend Team

## 1) Goal

Strengthen marketplace behavior by combining three connected improvements:

- Expand Rent/Buy functionality across all key browsing surfaces
- Add realistic buy-focused mock ecosystem for full frontend iteration
- Introduce a role capability model where normal users can list with limits and agents can list at scale

## 2) Scope

### In scope (MVP)

- Keep `purpose=rent|sale` as the primary marketplace intent model
- Ensure purpose consistency across:
  - `/apartments`
  - homepage listing sections
  - listing detail related/recommended listings
- Expand mock datasets for buy flow:
  - additional `purpose=sale` inventory
  - featured/recent buy groups
  - sale inquiries/leads
  - sale-aware analytics counters
- Allow normal users to create listings with cap enforcement:
  - max 2 active listings for normal users
- Support self-serve upgrade to `agent` role:
  - upgrade prompt when cap is reached
  - confirmation-based instant upgrade
  - continue listing flow immediately after successful upgrade
- Preserve listing wizard purpose support (`rent` default, `sale` when requested)

### Out of scope (MVP)

- Billing/subscription system for agent plans
- Legal verification workflow for agent/company identity
- Complex multi-tier limits by city or listing type
- Backend-wide RBAC redesign

## 3) Product Decisions (Validated)

- Delivery strategy: **Unified rollout** (Rent/Buy UX + buy mock ecosystem + role/listing capability flow)
- Agent assignment model: **self-serve, instant switch**
- Listing entry behavior: **confirmation step before switching to agent**
- Normal user listing policy: **max 2 active listings**
- Cap overflow behavior: **auto-prompt upgrade to agent**
- Cap counting method: **only `active` listings count**
- Surface consistency target: **apartments + homepage + listing detail related listings**

## 4) Capability Model

### 4.1 Roles and listing rights

- Normal tier (`renter` / `owner` behavior path):
  - Can create both rent and sale listings
  - Can keep at most 2 active listings at a time
- Agent tier (`agent`):
  - Can create both rent and sale listings
  - No listing count limit

### 4.2 Agent profile meaning

An agent represents a high-volume lister profile (individual or company) focused on listing properties for rent or sale at scale.

## 5) UX and Interaction Design

### 5.1 Listing creation entry gate

When a logged-in normal user starts listing creation:

1. Read current active listing count
2. If count is `< 2`, continue directly
3. If count is `>= 2`, show modal:
   - explain user cap reached
   - present "Become an Agent" confirmation
4. On confirm:
   - trigger role upgrade
   - refresh auth/capabilities
   - continue into listing wizard in same flow
5. On cancel:
   - keep user on current screen with clear guidance

### 5.2 Purpose-aware listing wizard behavior

- Default purpose remains `rent`
- Entry from buy context or explicit query preselects `purpose=sale`
- Wizard copy remains purpose-aware and backward-compatible with existing steps

### 5.3 Marketplace mode consistency

Purpose mode influences:

- `/apartments` filters, cards, and messaging
- Homepage listing modules (featured/recent sections)
- Detail-page related listings and contextual copy

## 6) Data Flow and Service Boundaries

### 6.1 Capability resolver

Create a small frontend capability resolver/facade to centralize listing eligibility logic:

- input: authenticated user + owned listing stats
- output:
  - `activeListingCount`
  - `canCreateWithoutUpgrade`
  - `requiresAgentUpgrade`

This avoids duplicating cap logic in components.

### 6.2 Role transition facade

Isolate role switch behind a single `upgradeToAgent()` path so:

- mock implementation and API implementation share a stable interface
- UI pages do not own token/cookie/store synchronization details

### 6.3 Buy mock ecosystem expansion

Extend existing mock datasets with sale-first realism:

- add 8-12 additional sale listings with varied owners/agents, locations, and prices
- create sale-focused collections for homepage/discovery modules
- add sale inquiry/lead samples tied to sale listings
- align analytics counters to include sale conversion activity

## 7) Error Handling and Resilience

- If active listing count lookup fails:
  - block risky continuation
  - show retryable error state
- If upgrade action fails:
  - keep previous role intact
  - show actionable error toast/message
  - do not navigate into protected listing path unless capability check passes
- If user declines upgrade at cap:
  - do not auto-retry
  - keep clear CTA for later upgrade
- If purpose value is invalid:
  - normalize to `rent`
  - preserve stable rendering

## 8) Testing Strategy

### 8.1 Unit tests

- Capability resolver boundaries at active counts `0`, `1`, `2`, `3`
- Role gate behavior for normal vs agent users
- Purpose fallback and preselect logic for listing wizard

### 8.2 Integration tests

- User with 2 active listings sees upgrade prompt
- Upgrade confirmation transitions role and continues flow
- Upgrade cancel preserves current role and blocks continuation
- Buy mode collections render expected sale inventory

### 8.3 E2E tests

- Normal user with 1 active listing can create listing successfully
- Normal user with 2 active listings is prompted to become agent
- Confirming upgrade allows creating additional listings beyond cap
- Purpose consistency checks across apartments, homepage, and detail related listings

## 9) Risks and Mitigations

- Risk: cap logic drift across pages
  - Mitigation: single capability resolver
- Risk: role state mismatch (cookie/store/UI)
  - Mitigation: centralized role transition + post-upgrade refresh routine
- Risk: buy mode appears inconsistent between surfaces
  - Mitigation: route-level contract tests for purpose propagation
- Risk: mock data feels unrealistic for sales
  - Mitigation: curated sale dataset with varied inventory and lead samples

## 10) Acceptance Criteria

- Normal users can list rent or sale properties up to 2 active listings
- Users with 2 active listings get an upgrade-to-agent confirmation flow
- Confirmed upgrade switches user to agent and continues listing creation immediately
- Agents can create listings without quantity limits
- Rent/Buy behavior is consistent on apartments, homepage modules, and detail related listings
- Buy mock ecosystem includes richer sale inventory, lead data, and aligned analytics mocks
- Existing rent flows and current listing wizard baseline behavior remain stable

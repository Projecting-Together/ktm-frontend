# Frontend Buyer/Seller Purpose Mode Design

Date: 2026-04-23
Status: Proposed and user-validated (brainstorming)
Owner: Frontend Team

## 1) Goal

Add a clear buyer/seller experience for sale transactions while keeping the current platform architecture lightweight and frontend-first.

This MVP introduces purpose-driven flows inside existing surfaces, centered on `purpose=rent|sale`, without creating new top-level role systems.

## 2) Scope

### In scope (MVP)

- Separate user intent in discovery via an in-page mode switch: `Rent | Buy`
- Seller flow support:
  - Post property for sale (purpose preselected)
  - View sale leads in seller inbox
- Buyer flow support:
  - Browse/search sale listings
  - Send inquiry on sale listings
- Purpose-aware UI copy and CTA behavior in list/detail/inquiry surfaces
- Instrumentation for:
  - C: matched conversations started
  - D: time-to-first-inquiry for sale listings

### Out of scope (MVP)

- New global role model (`buyer` / `seller`) in auth contracts
- Deep backend refactors or schema redesign
- Dedicated `/buy` route family
- New chat system or payment workflow

## 3) Product Decisions (Validated)

- Architecture choice: **Approach 1 — Purpose-Driven Search Mode**
- Entry UX: **Option B — keep current nav and add `Rent | Buy` toggle inside pages**
- Delivery approach: **Frontend-first**
- MVP core actions selected:
  - A: Seller can post for sale
  - B: Buyer can browse sale listings
  - C: Buyer can send inquiry
  - E: Seller gets simple lead inbox
- Primary success metrics:
  - C: matched conversations started
  - D: time-to-first-inquiry

## 4) Architecture

Keep existing app structure and add a strict intent layer via `purpose`.

- Single discovery route remains `/apartments`
- New top-of-page mode switch sets filter intent:
  - `Rent` => `purpose=rent`
  - `Buy` => `purpose=sale`
- The same purpose flows through:
  - listing query
  - listing cards and detail copy
  - inquiry action context
  - seller inbox categorization
- Seller “Post for Sale” CTA routes to existing listing form with sale intent preselected

This minimizes churn and preserves current renter/owner functionality.

## 5) UX and Component Design

### 5.1 Discovery (`/apartments`)

- Add segmented control near search controls: `Rent | Buy`
- Default mode: `Rent`
- Selecting `Buy`:
  - writes `purpose=sale` to URL/store
  - updates labels/headings to buying context
  - keeps existing filters unless wording is rent-specific

### 5.2 Listing card and detail

- Purpose badge visible where relevant (`For Sale`, `For Rent`)
- Purpose-aware price copy:
  - Rent keeps period context
  - Sale emphasizes total price
- Detail CTA text becomes context-aware:
  - “Send Inquiry to Seller” for sale
  - existing wording retained for rent

### 5.3 Seller posting flow

- Add explicit “Post for Sale” entry CTA
- Listing form initializes `purpose=sale` when entered from this CTA
- No split form in MVP; reuse current form structure

### 5.4 Seller lead inbox

- Reuse existing inquiry inbox
- Add purpose chips/filters:
  - `Sale Leads`
  - `Rental Leads`
- Each conversation row shows listing purpose label for quick triage

## 6) Data Flow and State

### 6.1 Source of truth

- `purpose` in filter store + URL query is the only discovery intent state
- No parallel local intent flags

### 6.2 Query behavior

- Listings query always includes current `purpose` when set
- Mode switch updates query params and triggers refetch

### 6.3 Backward compatibility

- Keep compatibility with current `Listing` and `ListingFilters` contracts
- If backend returns inconsistent purpose shapes, normalize in frontend adapter layer

## 7) Telemetry and Success Metrics

### 7.1 Events

- `purpose_mode_changed`:
  - payload: `{ from, to, page }`
- `sale_listing_post_started`
- `sale_listing_post_completed`
- `inquiry_sent`:
  - payload: `{ listing_id, listing_purpose, mode_context }`
- `seller_lead_viewed`:
  - payload: `{ lead_type: sale|rent }`

### 7.2 KPI definitions

- **C: matched conversations started**
  - count of `inquiry_sent` where `listing_purpose=sale`
- **D: time-to-first-inquiry**
  - `first_inquiry_timestamp - listing_created_at` for sale listings
  - report median + p75

## 8) Error Handling

- Mode query invalid/missing:
  - normalize to `rent`
  - emit lightweight warning telemetry
- Sale listings fetch fails:
  - keep selected mode visible
  - show retry state (do not silently flip mode)
- Sale posting fails:
  - preserve form state
  - distinguish validation vs network/auth errors
- Inquiry submit fails:
  - preserve draft content
  - allow immediate retry

## 9) Testing Strategy

### 9.1 Unit tests

- Mode switch updates store and URL with `purpose`
- Purpose-aware UI copy/CTA rendering
- “Post for Sale” path preselects `purpose=sale`

### 9.2 Integration tests

- Listings request receives expected purpose param
- Seller inbox purpose filters classify leads correctly

### 9.3 E2E tests

- Rent/Buy switch updates URL and result context
- Seller posts a sale listing (MVP path) and purpose persists
- Buyer inquiry on sale listing appears in seller inbox

### 9.4 Regression tests

- Existing rent workflows remain unchanged under `purpose=rent`

## 10) Risks and Mitigations

- Risk: purpose drift between URL/store/query
  - Mitigation: single source of truth + route-level sync tests
- Risk: rent-first UI copy leaks into buy mode
  - Mitigation: purpose-aware copy map and snapshot tests
- Risk: noisy metrics due to missing purpose context
  - Mitigation: require listing purpose in inquiry telemetry payload

## 11) Acceptance Criteria

- Users can clearly switch between Rent and Buy within `/apartments`
- Buy mode returns sale-context listings and copy
- Seller can enter post flow with sale purpose preselected
- Buyer can send inquiry to sale listing
- Seller inbox can distinguish sale leads from rental leads
- Metrics C and D are measurable from emitted frontend events
- No regressions to existing rent flows


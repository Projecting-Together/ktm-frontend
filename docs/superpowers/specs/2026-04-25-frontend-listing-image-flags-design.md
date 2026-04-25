# Frontend — Listing Image Flags (Pets + Moderated)

Date: 2026-04-25  
Status: Approved (brainstorming)  
Owner: Frontend Team

## 1) Goal

Add clear listing-image signals that help renters quickly identify trusted and policy-fit homes, while preserving the current verified badge behavior.

The approved additions are:

- A **pet-friendly icon badge** (icon-only: black paw on green background).
- A **Moderated** flag for listings explicitly marked by backend moderation.
- Existing **Verified** badge remains unchanged.

## 2) Decision summary (validated)

| Decision | Choice |
| --- | --- |
| Visual approach | **Approach 1**: preserve current layout and add new top-right stack. |
| Placement | Existing badges remain top-left; new flags go top-right near favorite button. |
| Pet signal format | **Icon-only** badge (no text), black paw on green background. |
| Sponsored/recommended wording | Use **`Moderated`** label. |
| Verified style | Keep existing `VerifiedBadge` style as-is. |
| Moderated source of truth | Backend boolean field **`is_moderated`**. |
| Coexistence | If both pet-friendly and moderated are true, **show both**. |

## 3) Scope

### In scope

- Update listing-card image overlay UI to support two new right-side signals:
  - pet-friendly icon-only badge
  - `Moderated` text flag
- Extend frontend listing contract/types with `is_moderated?: boolean`.
- Ensure graceful fallback when backend does not provide the new field yet.
- Add targeted tests for rendering combinations.

### Out of scope

- Redesigning all listing card badge placements.
- Replacing or restyling `VerifiedBadge`.
- Changing moderation workflows in admin/manage areas.
- Adding ranking/recommendation logic beyond `is_moderated` display.

## 4) Architecture and component boundaries

- **Render owner:** `ListingCard` remains owner of image overlay rendering logic.
- **Existing left stack:** Keep current top-left badges (`VerifiedBadge`, listing-type/sale pills).
- **Right side overlay model:**
  - Favorite heart remains at top-right.
  - New badges render in a compact vertical stack near/under heart.
- **Data contract:**
  - `pets_allowed` (existing) controls pet icon badge visibility.
  - `is_moderated` (new) controls `Moderated` flag visibility.
  - `is_verified` continues to drive existing verified badge behavior.

This keeps responsibility local to `ListingCard` and avoids spreading presentational rules into hooks or shared stores.

## 5) Data flow

1. Public listings API returns listing items with:
   - existing `pets_allowed`
   - existing `is_verified`
   - new `is_moderated` (boolean)
2. API types/contracts/adapters pass fields through to `ListingListItem`.
3. `ListingCard` evaluates overlay rendering:
   - `pets_allowed === true` -> show pet icon badge
   - `is_moderated === true` -> show `Moderated` flag
   - `is_verified` -> keep existing verified badge behavior
4. If both new conditions are true, both badges are shown in the right-side stack.

## 6) Error handling and fallback behavior

- If `is_moderated` is absent or false, do not render `Moderated`.
- If `pets_allowed` is null/undefined/false, do not render pet icon badge.
- Never throw due to missing optional badge fields; silently degrade.
- Favorite button interaction and auth redirect flow remain unchanged and independent from badges.

## 7) Testing plan

- **Unit (`ListingCard`)**
  - renders pet icon only
  - renders moderated flag only
  - renders both pet and moderated
  - renders neither
  - still renders existing verified badge under current conditions
- **Contract/adapter tests**
  - include `is_moderated` in mapping expectations when API payload includes it
  - verify absent field remains optional and does not break parsing

Optional: add/refresh visual snapshot coverage for grid listing card if this project currently uses snapshot checks for UI overlays.

## 8) Success criteria

- Listing cards visually show:
  - pet-friendly icon-only badge with approved style
  - `Moderated` flag when backend sends `is_moderated: true`
  - existing verified badge unchanged
- Right-side overlay remains readable and non-overlapping with favorite heart.
- Tests cover key badge combinations and pass in local frontend test run.

## 9) References

- `src/components/listings/ListingCard.tsx`
- `src/lib/api/types.ts`
- `src/lib/contracts/adapters.ts`

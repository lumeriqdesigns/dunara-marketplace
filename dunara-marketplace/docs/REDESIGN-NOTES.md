# Dunara visual redesign

This update applies a unified visual system inspired by the clarity and spacing of Buvvo while retaining Dunara's own identity and official logo assets.

## Visual direction

- Forest green primary: `#176B4B`
- Deep forest hover: `#10533A`
- Soft sage surface: `#E8F1EB`
- Warm ivory canvas: `#F6F5EF`
- Ink: `#18251F`
- Muted text: `#737D75`
- Lime accent: `#D6F36A`
- Inter typography, rounded controls, generous spacing, restrained borders and low-contrast surface shadows.

## Updated areas

- Global colour tokens and interaction styling.
- Public header, navigation, footer and homepage hero/section composition.
- Seller and admin workspace shells, sidebars, active navigation, top bars and content spacing.
- Authentication card presentation.
- Shared buttons, cards and inputs.
- Listing cards, shop cards, seller page headings and stat cards.
- Public site chrome is hidden in authenticated seller/admin workspaces and authentication flows to keep those screens focused.

## Functionality preservation

The redesign intentionally leaves route handlers, server actions, Supabase queries, authentication checks, role checks, billing logic, Paystack integration, listing forms, shop forms and database types unchanged.

## Validation note

The source archive did not include `node_modules`. Dependency installation timed out in this environment, so a full Next.js build and browser QA could not be completed here. Run `npm install`, `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` before deployment.

## Interface polish pass (Explore, Categories, Locations, auth, seller, admin)

Visual direction is unchanged (same palette, Inter, radii). This pass fixes consistency, accessibility and a few defects.

### Fixed
- `globals-dashboard-append.css` was never imported, so `glass-panel`, `interactive`, `motion-*` and the `dunara-drawer-in` keyframe did nothing. The contents now live in `globals.css` and the orphan file is removed.
- Seller overview "Activity" chart was generated from a formula, not real data. Replaced with a real published/draft breakdown.
- Searching on Explore dropped the active Products/Services tab. The form now carries `type` through.
- Active-filter chips showed the category slug; they now show the category name.
- Admin → Listings showed "Page X of Y" with no way to change page. Added Previous/Next. Admin → Shops pagination now URL-encodes the search text.
- Admin → Verifications subtitle repeated a sentence.
- Nested `<main>` on Explore/Categories/Locations (the site chrome already provides one).
- Mobile header menu had no "List your business" button.

### Design changes
- Removed tracked all-caps eyebrow labels, numbered 01/02 category markers, decorative rings and `↗` arrows.
- Categories use the icon stored on each category (`CategoryIcon`).
- Locations lists active states first; the rest are grouped under "Coming soon".
- Auth screens: two-panel layout with the real logo, shared `TextField` / `PasswordField` (show/hide) / `SubmitButton`, `aria-invalid` + `aria-describedby` wiring.
- Seller/admin: shared sidebar parts (`WorkspaceParts`), icons, role label, user chip, one `PageHeader` and `StatCard` for both areas.
- New shared pieces: `Select`, `EmptyState` `action` slot, admin `FilterBar` + `Pager`, `loading.tsx` skeletons for Explore/Categories/Locations.

### Known gaps (not changed)
- `/terms` and `/privacy` are linked from the sign-up form and footer but no such pages exist yet.
- `/pricing` still renders its own `<main>` inside the site chrome.
- Not built or browser-tested in this environment (no network for `npm install`). Run `npm run typecheck && npm run lint && npm test && npm run build`.

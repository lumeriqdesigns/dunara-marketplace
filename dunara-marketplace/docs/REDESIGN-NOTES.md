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

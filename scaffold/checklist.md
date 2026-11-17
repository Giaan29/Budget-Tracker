# Budget Tracker checklist

Tracks the MVP, the quality requirements, and the suggested build order from `scaffold/project_overview.md`.

Legend: `[x]` implemented in this repository, `[ ]` still to do. Automated checks are listed at the end.

## MVP features

### 1. Monthly overview

- [x] Month switcher with previous and next month
- [x] Income total, spent total, and remaining for the selected month
- [x] Remaining amount shows its sign and uses a positive or negative tone
- [x] Category list with spent amount, limit, progress bar, and amount left or over
- [x] Budget summary for the month with total budgeted, spent, and left
- [x] Note when spending falls outside a budgeted category
- [x] Empty states for no categories and no limits
- [x] Links to set and review budgets

### 2. Add transaction

- [x] Amount field with `inputMode="decimal"` and locale-aware parsing
- [x] Expense or income selector
- [x] Category selector filtered by kind
- [x] Date field defaulting to today
- [x] Optional note with a length limit
- [x] Validation messages for amount, category, and date
- [x] Reachable from every screen through the persistent add action
- [x] Dedicated `/transactions/new` route
- [x] Save returns to the transaction list

### 3. Transactions list

- [x] Grouped by day, newest first
- [x] Each day shows its net amount
- [x] Filter by kind
- [x] Filter by category, including archived categories on past entries
- [x] Edit a transaction in a sheet
- [x] Delete a transaction with an inline confirmation
- [x] Empty states for an empty month and for filters with no matches
- [x] Clear filters action
- [x] Month switcher and month totals

### 4. Budgets

- [x] Set a limit per active expense category per month
- [x] Show spent, limit, progress, and amount left or over per row
- [x] Clear a limit
- [x] Copy last month's limits as a starting point
- [x] Copy skips categories that already have a limit for the month
- [x] Copy only applies to active expense categories
- [x] Summary of budgeted, spent, and left
- [x] Disabled copy action when the previous month has nothing to copy
- [x] Empty state when no active expense categories exist

### 5. Categories

- [x] Add expense and income categories
- [x] Rename categories
- [x] Archive and restore categories
- [x] Archived categories stay on past transactions and are hidden from new entries
- [x] Duplicate-name and length validation
- [x] Starter set created on first run
- [x] Categories remain usable even when every one of a kind is archived

### 6. Settings

- [x] Currency code preference with validation
- [x] Locale preference with validation
- [x] Week start preference (Monday or Sunday)
- [x] Live amount preview using the draft preferences
- [x] Export the full document as JSON
- [x] Export transactions as CSV with spreadsheets in mind
- [x] Import JSON with shape and schema validation
- [x] Import asks for confirmation before replacing data
- [x] Rejected imports leave current data untouched
- [x] Reset all data behind a confirmation dialog
- [x] Request persistent storage where supported
- [x] Show whether storage is available
- [x] State the known limitations in the app

## Data and persistence

- [x] One storage key: `budget-tracker:v1`
- [x] A single JSON document
- [x] One module, `lib/storage.ts`, touches `localStorage`
- [x] `useSyncExternalStore` subscription
- [x] Neutral skeleton on the server and first paint
- [x] Reads and writes wrapped in `try/catch`
- [x] `schemaVersion` and `migrate()` from the first version
- [x] Money stored as integer minor units
- [x] Transaction dates stored as local `YYYY-MM-DD`
- [x] Cross-tab updates through the `storage` event
- [x] Starter document persisted after hydration
- [x] Import rejects future schema versions and malformed documents
- [x] Import validates duplicate IDs and category references
- [x] Export, reset, then import restores identical data (unit test)
- [x] CSV export neutralises formula-leading cells

## Screens and navigation

- [x] `/` overview
- [x] `/transactions`
- [x] `/transactions/new`
- [x] `/budgets`
- [x] `/settings`
- [x] Mobile bottom navigation with four items and a central add action
- [x] Desktop left rail from 1024px
- [x] Content column capped at a readable width
- [x] Optional second column for the month summary on desktop
- [x] Native `<dialog>` sheet for the add and edit forms
- [x] Full-height sheet on mobile and centred dialog on desktop
- [x] Skip link to main content
- [x] Active navigation state with `aria-current`

## Mobile and installability

- [x] Mobile-first styles, designed from 360px up
- [x] Touch targets at least 44 by 44 pixels for controls
- [x] Amount input uses `inputMode="decimal"`
- [x] Safe-area bottom padding with `env(safe-area-inset-bottom)`
- [x] Full-height layouts use `100dvh`
- [x] `viewport-fit=cover` through the Next.js viewport export
- [x] Inputs use at least 16px font size
- [x] `app/manifest.ts` with name, icons, standalone display, and theme colors
- [x] 192px and 512px icons, including a maskable entry
- [x] Apple touch icon and browser icon
- [ ] Installed and tested on iOS Safari
- [ ] Installed and tested on Android Chrome
- [ ] Offline app-shell caching (optional after MVP; not implemented)

## Design

- [x] Warm off-white background, warm near-black text, muted secondary text
- [x] Hairline borders and lists rather than stacks of cards
- [x] One accent color, deep green, used sparingly
- [x] Negative and positive amounts use sign, muted red or green, and text labels
- [x] Small 4px to 6px corner radii
- [x] No gradients, glass effects, blobs, or decorative shadows
- [x] IBM Plex Sans for text and IBM Plex Mono for amounts
- [x] Tabular numerals and right-aligned amounts
- [x] No emojis in code, copy, or category names
- [x] No component library, state library, chart library, or utility class helper
- [x] Motion limited to short state transitions and reduced-motion support
- [x] Plain, specific copy without exclamation marks

## Accessibility

- [x] Text contrast of at least 4.5:1 for the main palette
- [x] Visible focus rings matching the design
- [x] Semantic `main`, `nav`, `header`, `section`, `ul`, and `button` elements
- [x] Every form control has a bound label
- [x] Every icon-only button has an `aria-label`
- [x] Icons are 20px with a 1.5 stroke width from `lucide-react`
- [x] Decorative icons are hidden from assistive technology
- [x] Errors use `role="alert"` or associated descriptions
- [x] Async status uses polite live regions
- [x] Progress bars expose accessible values
- [x] Sheets and confirmations use labelled native dialogs

## Quality checklist from the specification

- [x] No emojis in code, copy, or assets
- [x] Only `lucide-react` icons, one size and stroke width
- [x] Runtime dependencies limited to next, react, react-dom, lucide-react
- [x] Layout verified at 360px, 390px, 768px, 1024px, and 1440px (headless Chrome, no horizontal overflow)
- [ ] Tested on iOS Safari and Android Chrome, including installed to the home screen
- [x] No hydration warnings on first load with empty and populated storage (headless Chrome console check)
- [x] Export, then reset, then import restores identical data (unit test)
- [x] Import rejects malformed files without touching existing data
- [ ] Lighthouse accessibility score of 95 or higher
- [ ] No layout shift from fonts or from loading stored data

The unchecked items need a real device or Lighthouse run. Responsive classes, font `display: "swap"`, and the data skeleton are implemented, but automated checks cannot certify the device result or layout shift.

## Build order

1. [x] Scaffold with `create-next-app` (TypeScript, Tailwind, App Router, ESLint)
2. [x] Remove sample content and default fonts
3. [x] Define tokens in `globals.css` and load fonts with `next/font`
4. [x] Build `money.ts`, `dates.ts`, `storage.ts`, `migrate.ts`, and the store
5. [x] Add tests for the pure functions
6. [x] Build the layout shell and navigation, mobile first
7. [x] Transaction form and list
8. [x] Categories and budgets
9. [x] Overview screen and selectors
10. [x] Settings with export, import, and reset
11. [x] Manifest and icons
12. [ ] Deploy to Vercel and test on real devices

## After the MVP

- [ ] Recurring transactions generated on open
- [ ] Simple monthly trend view in SVG
- [ ] Search across notes
- [ ] Dark theme by overriding the CSS variables
- [ ] Optional offline service worker and app-shell cache

## Automated verification

Last run:

- [x] `npm run lint`
- [x] `npm run typecheck` (TypeScript 7)
- [x] `npm test` (unit tests)
- [x] `npm run build` (production build, all routes prerendered)

Headless Chrome smoke checks also passed:

- Every route renders with empty and populated storage.
- No horizontal overflow at 360, 390, 768, 1024, or 1440 pixels.
- Filtering transactions, adding a transaction, and editing a budget limit work.
- Category add, rename, and archive work.
- Reset, malformed import rejection, and valid backup import work.
- Copy last month copies active categories and skips archived ones.
- No console or runtime errors during those flows.

Manual verification still needed: real iOS Safari and Android Chrome, installed app behaviour, Lighthouse, and layout shift measurement.

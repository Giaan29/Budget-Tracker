# Budget Tracker - Project Overview

A personal budget tracker built with Next.js and deployed on Vercel. It has no database and no accounts. All data lives in the user's browser, and the app is designed phone-first so it works as well in a pocket as on a desktop.

## 1. Goals

- Log income and expenses in a few taps.
- Set a monthly budget per category and see how much is left.
- Work well on a phone, including when installed to the home screen.
- Keep the dependency list as short as possible.
- Look like a considered, hand-designed product, not a template.

## 2. Non-goals

- No user accounts, authentication, or server-side storage.
- No cross-device sync (see "Data and persistence" for the trade-off).
- No bank connections, receipts scanning, or multi-currency conversion.
- No component library.

## 3. Tech stack

Versions below were the latest stable releases at the time of writing. Re-check with `npm view <package> version` before scaffolding and pin to whatever is current.

| Purpose | Package | Version |
| --- | --- | --- |
| Framework | next | 16.4.x |
| UI runtime | react, react-dom | 19.3.x |
| Language | typescript | 7.0.x |
| Styling | tailwindcss, @tailwindcss/postcss | 4.3.x |
| Icons | lucide-react | 1.74.x |
| Linting | eslint, eslint-config-next | 10.x, 16.4.x |
| Types | @types/node, @types/react, @types/react-dom | latest |
| Runtime | Node.js | 22 LTS or newer (Next.js requires 20.9+) |

Runtime dependencies are only `next`, `react`, `react-dom`, and `lucide-react`. Everything else is a dev dependency.

### What is intentionally not included

- No state library (Zustand, Redux, Jotai). React state, `useReducer`, and context are enough for this data size.
- No chart library. Charts are plain SVG and CSS bars, which are small and fully styleable.
- No date library. Use `Intl.DateTimeFormat` and the native `Date` object.
- No form or validation library. The forms are small; validate by hand.
- No UI kit, headless component package, or animation library. Build the few components needed.
- No PWA plugin. Next.js supports a web app manifest natively.
- No ID library. Use `crypto.randomUUID()`.
- No `clsx` or `tailwind-merge`. Compose class strings with template literals.

## 4. Data and persistence

No database. Data is stored in the browser with `localStorage`.

### Storage rules

- One key, `budget-tracker:v1`, holding a single JSON document.
- Read and write through one small module (`lib/storage.ts`). No component touches `localStorage` directly.
- Subscribe with `useSyncExternalStore` so React stays consistent and there is no hydration mismatch. Render a neutral skeleton on the server and on first paint, then the real data.
- Wrap reads and writes in try/catch. Storage can be unavailable (private mode, quota, disabled).
- Include a `schemaVersion` field and a `migrate()` function from day one.
- Store money as integers in the smallest currency unit (centavos, cents). Never store floats.
- Dates are stored as `YYYY-MM-DD` strings in local time. Do not store timestamps with time zones for transaction dates.

### Document shape

```ts
type Store = {
  schemaVersion: 1;
  settings: {
    currency: string;        // ISO 4217 code, e.g. "PHP"
    locale: string;          // e.g. "en-PH"
    weekStartsOn: 0 | 1;
  };
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
};

type Category = {
  id: string;
  name: string;
  kind: "expense" | "income";
  archived: boolean;
};

type Transaction = {
  id: string;
  date: string;              // YYYY-MM-DD
  amount: number;            // integer, minor units, always positive
  kind: "expense" | "income";
  categoryId: string;
  note: string;
};

type Budget = {
  categoryId: string;
  month: string;             // YYYY-MM
  limit: number;             // integer, minor units
};
```

### Known limitations (state these in the app too)

- Data lives on one device and one browser. A phone and a laptop will not share data.
- Clearing site data deletes everything.
- Safari may clear storage for sites that have not been used for about a week unless the app is installed to the home screen.

### Mitigation

- Export to a JSON file and import from a JSON file, in Settings. Import validates the shape and the `schemaVersion` before replacing anything and asks for confirmation.
- Export to CSV for use in a spreadsheet.
- Request persistent storage with `navigator.storage.persist()` where supported.
- If sync is ever needed, that is the point to add a database. The single `lib/storage.ts` module is the only code that would change.

## 5. Features

### MVP

1. **Overview for a month.** Month switcher, income total, spent total, remaining, and a list of categories with spent versus limit.
2. **Add transaction.** Amount, kind, category, date, optional note. Reachable in one tap from every screen.
3. **Transactions list.** Grouped by day, filterable by category and kind, editable and deletable.
4. **Budgets.** Set a limit per expense category per month. Copy last month's limits as a starting point.
5. **Categories.** Add, rename, archive. A sensible starter set is created on first run.
6. **Settings.** Currency, locale, week start, export, import, reset all data.

### After the MVP, if wanted

- Recurring transactions (generated on open, not by a server).
- Simple monthly trend view in SVG.
- Search across notes.
- Dark theme.

## 6. Screens and navigation

| Screen | Route |
| --- | --- |
| Overview | `/` |
| Transactions | `/transactions` |
| Budgets | `/budgets` |
| Settings | `/settings` |
| Add or edit transaction | Sheet or full screen on mobile, dialog on desktop; also `/transactions/new` for direct links |

- **Mobile:** bottom navigation bar with four items and a persistent add action. Content is a single column.
- **Desktop (from about 1024px):** left rail navigation, content column capped at a readable width, optional second column for the month summary.
- Use the native `<dialog>` element for the desktop add form and a full-height page on mobile. Do not pull in a dialog library.

## 7. Mobile requirements

- Mobile-first CSS. Design at 360px width first, then scale up.
- Touch targets at least 44 by 44 px.
- Amount input uses `inputMode="decimal"` so the numeric keypad opens.
- Respect safe areas with `env(safe-area-inset-bottom)` for the bottom nav.
- Use `100dvh`, not `100vh`, for full-height layouts.
- Set `viewport-fit=cover` through the Next.js `viewport` export.
- Inputs use at least 16px font size so iOS does not zoom on focus.
- Installable: add `app/manifest.ts` with name, icons, `display: "standalone"`, and theme colors. Add an Apple touch icon.
- Works offline after the first load. Because data is local, a small hand-written service worker that caches the app shell is enough. Add it only after the MVP is stable, and only if offline use matters.

## 8. Design direction

The goal is a calm, precise, ledger-like interface. It should feel designed for money, not generated.

### Principles

- Typography and spacing carry the design, not decoration.
- Numbers are the main content. Use tabular numerals everywhere amounts appear, right-aligned in lists.
- Prefer lists separated by hairlines over stacks of cards. Avoid cards inside cards.
- One accent color, used sparingly for the primary action and for state. Negative and positive amounts are distinguished by sign and by a muted red and green, never by color alone.
- Small, consistent corner radius (4px to 6px). No fully rounded pills except for a deliberate few.
- Borders over shadows. If there is a shadow, there is one, and it is subtle.
- Copy is plain and specific. No exclamation marks, no "Welcome back", no filler headings.

### Things to avoid

- Emojis anywhere: UI, copy, category names, empty states, commit messages.
- Gradients, glassmorphism, glowing blurs, and decorative blobs.
- Purple-to-blue palettes and the default dark-slate-with-indigo look.
- Large rounded cards with soft shadows on every surface.
- The shadcn/ui look: zinc and slate neutrals, `rounded-lg` everywhere, the stock input, button, and dialog styling, and the default Inter or Geist type pairing.
- Hero sections, marketing-style copy, and stock illustration.
- Animation for its own sake. Motion is limited to short transitions (150ms to 200ms) on state change, and respects `prefers-reduced-motion`.

### Palette (starting point, adjust by eye)

- Background: warm off-white, for example `#F6F4EF`.
- Surface: slightly lighter than the background, for example `#FBFAF7`.
- Text: near-black with a warm tint, for example `#1B1A17`. Secondary text `#6B675E`.
- Borders: `#DDD8CC`.
- Accent: a single deep color, for example a dark green `#1F5C46` or a dark ink blue `#23394F`. Pick one.
- Negative: `#A63D2F`. Positive: `#2F6B4F`.
- Define all of these as CSS variables in `@theme` in `globals.css` so a dark theme can be added later by overriding the variables.

### Typography

- Load fonts through `next/font` (self-hosted, no layout shift, no extra package).
- Pick a text face with some character instead of the framework default. Good candidates from Google Fonts: IBM Plex Sans, Instrument Sans, or Source Sans 3. For numerals, IBM Plex Mono or the text face with `font-variant-numeric: tabular-nums`.
- Limit to two weights. Use size and spacing for hierarchy.

### Icons

- `lucide-react` only. No other icon set, no inline emoji, no custom icon fonts.
- Import icons individually by name so unused icons are tree-shaken.
- Use one size (20px) and one stroke width (1.5) across the app.
- Every icon-only button has an `aria-label`.

### Accessibility

- Contrast of at least 4.5:1 for text.
- Visible focus rings that match the design, not the browser default and not removed.
- Semantic HTML: real `button`, `nav`, `main`, `table` or `ul` as appropriate.
- Forms use labels bound to inputs, not placeholders as labels.

## 9. Suggested project structure

```
app/
  layout.tsx
  page.tsx                  Overview
  transactions/
    page.tsx
    new/page.tsx
  budgets/page.tsx
  settings/page.tsx
  manifest.ts
  globals.css               Tailwind import, @theme tokens
components/
  nav/                      BottomNav, SideRail
  transaction/              TransactionList, TransactionForm, AmountInput
  budget/                   BudgetRow, ProgressBar
  ui/                       Button, Field, Sheet, MonthSwitcher (hand-built, small)
lib/
  storage.ts                the only file that touches localStorage
  store.tsx                 context provider, reducer, selectors
  money.ts                  parse, format, minor-unit helpers
  dates.ts                  month and day helpers using Intl
  export.ts                 JSON and CSV export, import validation
  migrate.ts                schema migrations
```

Notes:

- Most pages are client components because the data is local. Keep layouts and static shells as server components.
- Selectors (totals per month, spent per category) are pure functions in `lib/store.tsx` and are unit-testable without React.

## 10. Money handling rules

- Parse user input to integer minor units once, at the form boundary, in `money.ts`.
- Format with `Intl.NumberFormat` using the stored currency and locale.
- All arithmetic is on integers.
- Never show negative zero. Never show more precision than the currency supports.

## 11. Deployment on Vercel

- Push to GitHub and import the repository in Vercel. Framework preset is detected as Next.js. No environment variables are needed because there is no backend.
- Set the Node.js version in project settings to 22.x or newer.
- Every pull request gets a preview deployment. The production branch deploys on merge.
- Because the app is effectively static and client-driven, no server functions are required for the MVP.
- Add basic security headers in `next.config.ts` (`X-Content-Type-Options`, `Referrer-Policy`, a conservative `Content-Security-Policy`).

## 12. Quality checklist

- [ ] No emojis in code, copy, or assets.
- [ ] Only `lucide-react` icons, one size and stroke width.
- [ ] Runtime dependencies limited to next, react, react-dom, lucide-react.
- [ ] Layout verified at 360px, 390px, 768px, 1024px, and 1440px.
- [ ] Tested on iOS Safari and Android Chrome, including installed to the home screen.
- [ ] No hydration warnings on first load with empty and populated storage.
- [ ] Export, then reset, then import restores identical data.
- [ ] Import rejects malformed files without touching existing data.
- [ ] Lighthouse accessibility score of 95 or higher.
- [ ] No layout shift from fonts or from loading stored data.

## 13. Build order

1. Scaffold with `create-next-app` (TypeScript, Tailwind, App Router, ESLint). Remove the sample content and default fonts.
2. Define tokens in `globals.css` and load fonts with `next/font`.
3. Build `money.ts`, `dates.ts`, `storage.ts`, `migrate.ts`, and the store, with tests for the pure functions.
4. Build the layout shell and navigation (mobile first).
5. Transaction form and list.
6. Categories and budgets.
7. Overview screen and selectors.
8. Settings with export, import, and reset.
9. Manifest and icons, then optional offline support.
10. Deploy to Vercel and test on real devices.

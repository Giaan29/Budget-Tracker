# Budget Tracker

A personal budget tracker built with Next.js. It has no accounts, no database, and no server-side storage. Everything you enter is kept in this browser, and the interface is designed phone-first.

## Stack

- Next.js 16.4, React 19.3, TypeScript 7.0
- Tailwind CSS 4.3 with design tokens in `app/globals.css`
- `lucide-react` for icons, IBM Plex Sans and IBM Plex Mono through `next/font`
- `localStorage` for persistence, wrapped in one module

Runtime dependencies are limited to `next`, `react`, `react-dom`, and `lucide-react`. See `scaffold/project_overview.md` for the full product specification.

## Getting started

Node.js 22 or newer is required.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with TypeScript 7 |
| `npm test` | Run the unit tests with Node's test runner |

## How data works

- One key, `budget-tracker:v1`, holds a single JSON document.
- `lib/storage.ts` is the only module that reads or writes `localStorage`.
- React reads the document through `useSyncExternalStore`. The server and first paint show a neutral skeleton, then the real data appears.
- Money is stored as integer minor units. Dates are local `YYYY-MM-DD` strings.
- A `schemaVersion` field and `migrate()` exist from the first version.
- Settings can export JSON or CSV, import a JSON backup, and reset all data.

Known limitations are also shown in Settings:

- Data lives on one device and one browser.
- Clearing site data deletes everything.
- Safari may clear storage for sites that have not been used for about a week unless the app is installed to the home screen.

Export a JSON backup before clearing browser data or moving to another device.

## Project layout

```
app/                    Routes, layout, global styles, manifest, icons
components/             Navigation, screens, transaction and budget UI
  ui/                   Hand-built Button, Field, Sheet, Money, and similar
lib/
  storage.ts            The only localStorage boundary
  store.tsx             Provider and write actions
  selectors.ts          Pure calculations used by screens and tests
  money.ts              Parse and format integer minor units
  dates.ts              Local date and month helpers with Intl
  migrate.ts            Validation, defaults, schema migrations
  export.ts             JSON and CSV export, import validation
tests/                  Unit tests for pure modules
scaffold/               Original project specification
```

Selectors live in `lib/selectors.ts` rather than `lib/store.tsx` so Node can test them without JSX. `checklist.md` records what is implemented and what still needs device testing.

## Testing

Unit tests cover money parsing and formatting, local dates, schema validation, selectors, JSON round-trips, the export-reset-import sequence, and CSV escaping.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## TypeScript 6 and 7

The project targets TypeScript 7.0. The current `typescript-eslint` parser used by `eslint-config-next` does not support TypeScript 7 yet, so the toolchain installs both compilers side by side:

- `typescript` is aliased to `@typescript/typescript6` for the ESLint parser.
- `@typescript/native` is aliased to `typescript@7` and supplies the native `tsc`.

Because npm's `.bin/tsc` resolves to TypeScript 6, `npm run typecheck` calls the TypeScript 7 binary directly. Do not point it back at `.bin/tsc` without checking lint first.

## Deploying

Push the repository to GitHub, import it in Vercel, and keep the detected Next.js preset. No environment variables are needed. Set the project's Node.js version to 22.x or newer. Security headers and a conservative Content-Security-Policy are configured in `next.config.ts`.

## Notes

- The app is installable through `app/manifest.ts`, with a theme color, standalone display mode, and 192px and 512px icons. Apple touch and browser icons are generated in the `app/` directory.
- Offline caching is intentionally not included yet. The specification lists it as optional after the MVP is stable.
- Invalid imports are validated before anything is replaced. A rejected file leaves the current document untouched.

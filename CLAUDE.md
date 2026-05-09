# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                 # Dev server on http://localhost:3000
npm test                  # Interactive watch mode (Jest + RTL)
npm test -- --watchAll=false --runInBand   # CI-friendly single run
npm test -- --coverage                    # Run with coverage report
npm test -- src/lib/tradingUtils.test.js  # Run a single test file
npm run build             # Production build to /build
```

## Architecture

Create React App (React 19) single-page application — a personal trading journal for tracking Options and Mutual Fund trades. Uses shadcn/ui components (Radix primitives + Tailwind CSS) and Supabase for the database backend.

### State & data flow

`App.js` owns all trade state and acts as the single source of truth. It fetches from the `trading` table in Supabase on mount (via `AppContent.fetchTrades`, gated with `useRef` to prevent double-fetch in Strict Mode). The `form` object and all CRUD handlers (`addTrade`, `startEdit`, `cancelEdit`, `handleChange`) live in `App.js` and are passed down as props to page components.

- `AppContent` → `JournalPage` receives `trades`, `form`, `handleChange`, `addTrade`, `startEdit`, `cancelEdit`, `submitting`, `editingId`, `saveError`, `setSaveError`
- `AppContent` → `DashboardPage` receives `trades` (filtered: only complete trades via `getCompleteTrades`)
- `AppContent` → `PerformancePage` receives `trades` (complete only)
- `MarginCalculatorPage` is self-contained (no external data dependency)

### Pages

| Route | Component | Purpose |
|---|---|---|
| `/` | `JournalPage` | Add/edit trade form + sortable/filterable trade history table |
| `/dashboard` | `DashboardPage` | KPIs: total P&L, win rate, profit factor, best/worst trade, time-period filter |
| `/performance` | `PerformancePage` | Chart.js line chart comparing Options % vs MF % with absolute/percentage toggle |
| `/margin-calculator` | `MarginCalculatorPage` | Standalone calculator: lot distribution and profit based on margin inputs |

### Key calculations (`src/lib/tradingUtils.js`)

- `calculateRequiredProfit(entry, exit, amount)` — `(amount * 16 * days) / (100 * 365)`, rounded to integer
- `calculateAnnualizedPercent(profit, entry, exit, amount)` — `(profit * 365 * 100) / (days * amount)`, returns `toFixed(2)` string
- `getCompleteTrades(trades)` — filters to trades where all numeric fields are non-null and non-zero

These are duplicated inline in `App.js`'s `handleChange` for real-time form auto-calculation; the exported versions are the canonical implementations.

### Supabase (`src/supabaseClient.js`)

Reads `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` from environment variables (`.env` file, gitignored). The `trading` table is the single database table. The `src/__mocks__/supabaseClient.js` provides a chainable stub for tests.

### UI system

shadcn/ui components live in `src/components/ui/` (button, card, input, label). Tailwind CSS with CSS custom properties for theming (defined in `src/index.css` via shadcn's default slate palette). `src/lib/utils.js` exports `cn()` (clsx + tailwind-merge) and `formatIndianNumber()` (Indian comma-numbering format).

### Tests

Jest + React Testing Library. Three test suite files: `tradingUtils.test.js` (11 tests, core calculation logic), `PerformancePage.test.js` (1 test), `PerformanceChart.test.js` (7 tests). Mocks in `src/__mocks__/` stub react-router-dom (BrowserRouter, Routes, Route, NavLink, Outlet, useLocation) and supabaseClient.
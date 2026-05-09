# GEMINI.md

This file provides project-specific guidance, architecture, and conventions for the Trading App.

## Project Overview

A personal trading journal single-page application (SPA) for tracking Options and Mutual Fund trades.

- **Frontend:** React 19 (Create React App), Tailwind CSS
- **UI Components:** shadcn/ui (Radix primitives), lucide-react
- **Data Persistence:** Supabase
- **Charts:** Chart.js, react-chartjs-2
- **Notifications:** react-toastify

## Core Commands

```bash
npm start                 # Run development server (http://localhost:3000)
npm test                  # Run tests in interactive watch mode
npm test -- --watchAll=false --runInBand   # CI-friendly single run
npm test -- --coverage                    # Run tests with coverage report
npm test -- <path_to_test>                # Run a specific test file
npm run build             # Build for production
```

## Architecture & State Management

### State Flow
- `App.js` is the single source of truth.
- Trade state is managed in `App.js` and fetched from Supabase's `trading` table.
- CRUD handlers and form state are passed down from `App.js` to page components.
- `AppContent.fetchTrades` handles data fetching, using `useRef` to prevent double-fetching in React Strict Mode.

### Route Mapping
| Path | Component | Description |
|---|---|---|
| `/` | `JournalPage` | Trade entry form and sortable/filterable history table. |
| `/dashboard` | `DashboardPage` | Key metrics (P&L, win rate, etc.) with period filtering. |
| `/performance` | `PerformancePage` | Comparison charts for Options vs. Mutual Funds. |
| `/margin-calculator` | `MarginCalculatorPage` | Standalone margin and profit calculator. |

## Coding Standards & Conventions

### Styling & Theme
- **Tailwind CSS:** Primary styling method.
- **Custom Theme:** Defined in `src/index.css` (not default shadcn).
  - Primary: rust/burnt orange (`hsl(15 100% 23%)`)
  - Accent: amber/gold (`hsl(45 93% 47%)`)
- **Mobile UX:** Use `font-size: 16px` for inputs to prevent iOS auto-zoom.

### Formatting
- **Number Formatting:** Use `formatIndianNumber()` from `src/lib/utils.js` for Indian comma-numbering format (e.g., 1,00,000).

### Key Utilities (`src/lib/tradingUtils.js`)
- `calculateRequiredProfit`: 16% annual return model.
- `calculateAnnualizedPercent`: Annualized ROI calculation.
- `getCompleteTrades`: Filter for trades with all numeric fields populated.
- **Note:** Form auto-calculations in `App.js` should align with these canonical implementations.

## Supabase Configuration

Requires the following environment variables in a `.env` file (ensure these are never committed):
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_KEY`

## Testing Strategy

- **Framework:** Jest + React Testing Library.
- **Environment Fixes:** 
  - `window.matchMedia` is mocked in `src/setupTests.js` to prevent JSDOM runtime errors.
- **Mocks:**
  - `src/__mocks__/react-router-dom.js` for routing.
  - Inline `jest.mock()` for `supabaseClient`, `react-toastify`, `chart.js`, and UI components.
- **Coverage:** Prioritize `tradingUtils.js` for logic and individual pages for rendering/integration.

## Project Memory

- Mobile inputs must maintain `font-size: 16px`.
- Indian number formatting is the standard for all currency/numeric displays.
- Real-time form calculations in `App.js` must match `tradingUtils.js` logic.

# LA 2028 Olympic Event Viewer

An interactive web app for browsing the LA 2028 Olympic Games competition schedule — search, filter, and visualize 843 sessions across 58 sports, 52 venues, and 21 competition days.

**Live demo:** [clabrosse2025.github.io/la-28-event-viewer](https://clabrosse2025.github.io/la-28-event-viewer/)

---

## Why I built this

The official LA 2028 schedule ships as a 35-page PDF. Finding "what swimming finals are on Saturday?" or "what's at the Coliseum this week?" means scrolling through dense tables. I wanted a fast, filterable view of the full schedule, and I also wanted a real-world test of how far I could carry a project end-to-end with [Claude Code](https://www.anthropic.com/claude-code) as my primary engineering surface — from PDF parsing through React UI through CI/CD deployment.

Both goals worked out.

## What's here

- **Smart search.** Natural-language queries like "swimming finals saturday", "basketball at coliseum", or "wrestling weekend" work directly in the search bar. The [query parser](src/utils/queryParser.js) handles sport names, session types, venues, weekdays, weekends, and time-of-day phrases.
- **Filters.** Sport, venue, session type, date range, time of day. Active filters are visible and individually removable.
- **Two views.** A sortable list view for scanning, and a Gantt-style timeline view for seeing the day's events at a glance.
- **Session-type badges.** Color-coded: gold (Final), silver (Semifinal), blue (Quarterfinal), sky (Preliminary), emerald (Repechage), purple (Classification).
- **Dark mode, responsive layout, Olympic rings header, sport emoji icons.** The small-app comforts.
- **Data integrity tests.** Vitest suite validates the parsed event data and the query parser on every push (CI gates deploys on green tests).

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Testing | Vitest + React Testing Library + jsdom |
| Data parsing | Python + pdfplumber |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (install → test → build → deploy) |

## Quick start

```bash
npm install
npm run dev          # local dev server
npm test             # run the test suite
npm run build        # production build
```

To re-parse the source PDF into `src/data/events.json`:

```bash
pip install pdfplumber
python scripts/parse-pdf.py
```

## Project structure

- `scripts/parse-pdf.py` — PDF → JSON converter
- `src/components/` — 14 React components (App, FilterPanel, ResultsTable, GanttView, SearchBar, …)
- `src/hooks/useFilteredSessions.js` — filtering hook
- `src/utils/queryParser.js` — natural-language search parser
- `src/utils/formatDate.js`, `src/utils/sportIcons.js` — helpers
- `src/data/events.json` — 843 parsed sessions
- `src/test/` — Vitest suites (data integrity, query parser, filtering, formatDate)
- `PRD.md` — full product requirements + architecture notes
- `.github/workflows/deploy.yml` — CI/CD pipeline

## Notes on building with Claude Code

A few things I took away from running this end-to-end through an agentic coding loop:

- **PRD-first paid off.** Writing the [PRD](PRD.md) before any code gave the model enough context to make consistent decisions across components without me re-stating constraints every prompt.
- **Tests are the alignment surface.** The Vitest suite was the single best mechanism for keeping AI-authored changes from regressing data shape or filter behavior. CI gates deploys on `npm test`; that loop is what made me trust agentic edits across larger swathes of the codebase.
- **Small commits, descriptive messages.** Easier to review the model's work and easier to roll back if something drifted.
- **Where I had to steer hardest:** the natural-language query parser. The first few drafts were too eager to match anything; tightening the heuristics took several iterations of reading the parser tests and pushing back.

## Data source

LA28 Organizing Committee, *Olympic Games Competition Schedule by Event*, Version 3.0 (March 16, 2026). The source PDF is checked in at the repo root for reproducibility.

## License

MIT.

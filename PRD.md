# LA 2028 Olympic Event Viewer - Product Requirements Document

## Overview

An interactive web application for browsing, searching, filtering, and visualizing the LA 2028 Olympic Games competition schedule. Built for fans, journalists, and planners who need to quickly find events across 58 sports, 52 venues, and 21 competition days.

## Problem Statement

The official LA 2028 competition schedule is published as a dense 35-page PDF with 843 sessions. Finding specific events requires manually scanning pages with no search, filter, or visual overview capabilities. Users need a fast, interactive tool to answer questions like:

- "What swimming finals are on Saturday?"
- "What events are happening at the Coliseum this week?"
- "When are all the Women's basketball games?"
- "What does the full schedule look like for a given day?"

## Data Source

- **Input:** `LA28OlympicGamesCompetitionScheduleByEventV3.0.pdf` (Version 3.0, as of March 16, 2026)
- **Parsing:** Python script (`scripts/parse-pdf.py`) using `pdfplumber` extracts structured data
- **Output:** `src/data/events.json` - 843 sessions with fields:
  - Sport, Venue, Zone (location area), Session Code
  - Date (ISO format), Games Day, Session Type
  - Event descriptions (array), Start/End times

## Target Users

- **Olympic fans** planning which events to attend or watch
- **Journalists** researching schedules for coverage planning
- **Travel planners** coordinating trips around specific sports or venues
- **Casual users** browsing what's happening on a given day

## Features

### Core: Search & Filter

| Feature | Description | Status |
|---------|-------------|--------|
| **Text search** | Full-text search across sport names, venues, locations, session codes, and event descriptions. Debounced input (200ms). Keyboard shortcut: press `/` to focus. | Complete |
| **Smart search** | Natural language query parser. Type questions like "What swimming finals are on Saturday?" and the system extracts structured filters (sport, session type, dates, venue, gender) automatically. Recognizes sport aliases ("soccer" → Football, "polo" → Water Polo, "track" → Athletics), day names (expanded to all matching dates), venue nicknames ("coliseum" → Exposition Park), session type synonyms ("prelims", "gold medal"), and gender terms. Unrecognized words fall through to substring search. Smart-parsed filters shown as distinct pills. | Complete |
| **Sport filter** | Multi-select dropdown with all 58 sports. Shows session count per sport. | Complete |
| **Location filter** | Multi-select dropdown with all 25 location zones (renamed from "Zone"). | Complete |
| **Date filter** | Multi-select dropdown for all 21 competition days (Jul 10-30). Dynamically formatted with correct weekday names. | Complete |
| **Session Type filter** | Multi-select for Preliminary, Quarterfinal, Semifinal, Final, Repechage, Classification. | Complete |
| **Gender filter** | Toggle buttons for Men's, Women's, Mixed. Uses word-boundary regex to avoid false positives (e.g., "women's" no longer matches "men's" filter). | Complete |
| **Cross-filtered facets** | Filter counts update based on other active filters. Selecting "Swimming" updates Date counts to only show days with Swimming events. | Complete |
| **Active filter pills** | Color-coded pills showing all active filters with individual remove buttons and "Clear all". | Complete |

### Views

| View | Description | Status |
|------|-------------|--------|
| **List view** | Default view. Session cards sorted by date/time, sport, or venue. Cards show sport, session type badge, first event description, time, and venue. Multi-event cards expand on click. Auto-expands when gender filter is active so users can see all events. Paginated (30 per page). | Complete |
| **Timeline view** | Sessions grouped under date section headers with sticky headers. Shows Games Day number and session count per day. | Complete |
| **Schedule (Gantt) view** | Horizontal Gantt chart. Rows = sports, columns = time slots. Bars color-coded by session type. Per-day hour columns trimmed to only show hours with events. Sticky sport labels (left) and date headers (top). Hover tooltips with full session details. Zoom controls (50%-200%). Container fills viewport height and resizes with window. | Complete |

### UI/UX

| Feature | Description | Status |
|---------|-------------|--------|
| **Dark mode** | Toggle in header. Sun/moon icon. Applies `.dark` class for Tailwind variant styling. | Complete |
| **Responsive layout** | Desktop: sidebar filters + main content. Mobile: collapsible filter drawer with overlay. Cards adapt to screen width. | Complete |
| **Session type badges** | Color-coded: gold (Final), silver (Semifinal), blue (Quarterfinal), sky (Preliminary), emerald (Repechage), purple (Classification). | Complete |
| **Sort controls** | Sort by Date, Sport, or Venue with ascending/descending toggle. Available in List view. | Complete |
| **Olympic rings** | Interlocking 5-ring SVG in header. Adapts to dark mode. | Complete |
| **Sport emoji icons** | Emoji icons for all 58 sports shown on cards, filter dropdowns, and Gantt rows. Toggleable via header button. On by default. | Complete |

## Technical Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4.2 |
| Testing | Vitest + React Testing Library |
| Data parsing | Python + pdfplumber |
| Deployment | GitHub Pages via Actions (auto-deploy on push) |
| CI/CD | GitHub Actions: install → test → build → deploy |
| Live URL | https://clabrosse2025.github.io/la-28-event-viewer/ |

### File Structure

```
la-28-event-viewer/
  scripts/
    parse-pdf.py              # One-time PDF-to-JSON converter
  src/
    data/
      events.json             # 843 parsed sessions (checked in)
    components/
      App.jsx                 # Root component, all state management
      SearchBar.jsx           # Debounced search with "/" shortcut
      FilterPanel.jsx         # Sidebar: gender toggles + filter dropdowns
      FilterSelect.jsx        # Reusable multi-select dropdown with search
      ActiveFilters.jsx       # Color-coded filter pills
      ResultsTable.jsx        # Paginated list of session cards
      SessionRow.jsx          # Individual session card (expandable)
      TimelineView.jsx        # Date-grouped timeline layout
      GanttView.jsx           # Schedule/Gantt chart with zoom
      SortControls.jsx        # Sort field + direction toggles
      ViewToggle.jsx          # List / Timeline / Schedule switcher
      DarkModeToggle.jsx      # Dark mode icon button
      OlympicRings.jsx        # Interlocking 5-ring SVG header logo
      SportIcon.jsx           # Reusable sport emoji icon component
    hooks/
      useFilteredSessions.js  # Core filtering, sorting, cross-filtered facets
    utils/
      formatDate.js           # Date formatting helpers
      queryParser.js          # Smart search: NL query → structured filters
      sportIcons.js           # Sport name → emoji icon mapping
    test/
      setup.js                # Test environment setup
      data-integrity.test.js  # Validates events.json structure
      filtering.test.js       # Tests filter logic, search, sort, gender matching
      queryParser.test.js     # Tests smart search NL parsing
      formatDate.test.js      # Tests date formatting correctness
    main.jsx                  # Entry point
    index.css                 # Tailwind imports + theme config
  index.html
  vite.config.js
  .github/
    workflows/
      deploy.yml              # CI/CD: test → build → deploy to GitHub Pages
  package.json
  PRD.md
```

### Key Design Decisions

1. **Static JSON bundle** - The 843-session dataset is ~200KB, small enough to ship in the client bundle. No backend or API needed.
2. **Cross-filtered facets** - Each filter dimension shows counts based on all OTHER active filters, giving users visibility into how many results each option produces.
3. **Word-boundary gender matching** - Uses regex `\bmen's\b` instead of `String.includes("men's")` to prevent "women's" from matching the men's filter.
4. **Per-day hour trimming in Gantt** - Each day only renders columns for hours that have events, avoiding empty 7am-8am columns on days with no early events.
5. **Dynamic date formatting** - Uses `new Date().toLocaleDateString()` instead of hardcoded day-name maps to ensure correct weekday names.
6. **Local smart search** - Query parser runs entirely client-side with no API calls. Uses longest-match-first strategy for multi-word terms ("track and field" before "track"), strips punctuation and stop words, and passes unrecognized text through to substring search.

## Testing

### Test Coverage (82 tests)

**Data Integrity (7 tests)**
- Session count within expected range
- Required fields present on every session
- Unique session codes
- Dates within Olympics range
- Valid time formats
- Expected sports present
- Venue and zone populated

**Filtering Logic (15 tests)**
- No filters returns all sessions
- Sport, zone, date, type filters work individually
- Text search matches across all fields
- Gender filter correctly matches Men's/Women's/Mixed
- Gender filter does not false-positive (men's vs women's regression test)
- Multiple filters combine with AND logic
- Sort by date ascending/descending
- Sort by sport with date sub-sort
- Empty results for non-matching search
- Cross-filtered facets update correctly

**Smart Search Parser (55 tests)**
- Sport recognition (direct names and aliases including polo → Water Polo)
- Longest-match priority ("track and field" as one match)
- Session type synonyms (finals, prelims, gold medal, etc.)
- Day name expansion (Saturday → all Saturday ISO dates)
- Specific date parsing (july 22, jul 15, the 22nd)
- Weekday/weekend expansion (weekday → Mon-Fri dates, weekend → Sat/Sun dates)
- Time-of-day filtering (morning → before noon, afternoon → noon-5pm, evening → after 5pm)
- Venue/zone recognition (coliseum, long beach, dtla, downtown)
- Gender extraction (men's, women's, mixed)
- Full natural language queries (5 complete sentence tests)
- Combined queries (basketball evening weekday, swimming finals evening weekend)
- Stop word stripping, punctuation removal
- Remainder passthrough for unrecognized terms
- Edge cases (empty, null, undefined)
- hasSmartFilters utility

**Date Formatting (5 tests)**
- Short format output
- Correct day-of-week for known dates (regression test for Thu Jul 13 bug)
- Compact format output
- Null/undefined handling

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Initial load | < 2 seconds on broadband |
| Filter response | < 50ms (all client-side) |
| Bundle size | < 500KB gzipped |
| Browser support | Chrome, Firefox, Safari, Edge (latest) |
| Accessibility | Semantic HTML, keyboard navigable, focus indicators |

## Future Enhancements (Not in Scope)

- Persist filter state in URL hash for shareable links
- Calendar export (add events to Google Calendar / .ics)
- Venue map integration
- Medal event highlighting
- Push notifications for upcoming events
- Comparison view (side-by-side sports schedules)
- Athlete/team search integration
- Ticket availability overlay

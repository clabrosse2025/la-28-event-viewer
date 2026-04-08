import { useState, useCallback, useEffect } from 'react';
import { useFilteredSessions } from '../hooks/useFilteredSessions';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ResultsTable from './ResultsTable';
import TimelineView from './TimelineView';
import SortControls from './SortControls';
import ViewToggle from './ViewToggle';
import ActiveFilters from './ActiveFilters';
import DarkModeToggle from './DarkModeToggle';
import GanttView from './GanttView';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [selectedSports, setSelectedSports] = useState(new Set());
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [selectedGenders, setSelectedGenders] = useState(new Set());
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('list');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const { filtered, total, facets, smartFilters } = useFilteredSessions({
    searchText,
    selectedSports,
    selectedZones,
    selectedDates,
    selectedTypes,
    selectedGenders,
    sortField,
    sortDirection,
  });

  const toggleFilter = useCallback((setter, value) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearchText('');
    setSelectedSports(new Set());
    setSelectedZones(new Set());
    setSelectedDates(new Set());
    setSelectedTypes(new Set());
    setSelectedGenders(new Set());
  }, []);

  const hasActiveFilters =
    searchText ||
    selectedSports.size > 0 ||
    selectedZones.size > 0 ||
    selectedDates.size > 0 ||
    selectedTypes.size > 0 ||
    selectedGenders.size > 0;

  const handleSort = useCallback(
    (field) => {
      if (field === sortField) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                <span className="w-2 h-2 rounded-full bg-olympic-blue"></span>
                <span className="w-2 h-2 rounded-full bg-olympic-gold"></span>
                <span className="w-2 h-2 rounded-full bg-olympic-red"></span>
                <span className="w-2 h-2 rounded-full bg-olympic-green"></span>
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
              </div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                LA 2028 <span className="text-olympic-blue">Olympic</span> Events
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-olympic-blue"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchBar value={searchText} onChange={setSearchText} />

        <ActiveFilters
          selectedSports={selectedSports}
          selectedZones={selectedZones}
          selectedDates={selectedDates}
          selectedTypes={selectedTypes}
          selectedGenders={selectedGenders}
          smartFilters={smartFilters}
          onRemoveSport={(v) => toggleFilter(setSelectedSports, v)}
          onRemoveZone={(v) => toggleFilter(setSelectedZones, v)}
          onRemoveDate={(v) => toggleFilter(setSelectedDates, v)}
          onRemoveType={(v) => toggleFilter(setSelectedTypes, v)}
          onRemoveGender={(v) => toggleFilter(setSelectedGenders, v)}
          onClearAll={clearAll}
        />

        <div className="flex gap-6 mt-4">
          {/* Sidebar filters - desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterPanel
              facets={facets}
              selectedSports={selectedSports}
              selectedZones={selectedZones}
              selectedDates={selectedDates}
              selectedTypes={selectedTypes}
              selectedGenders={selectedGenders}
              onToggleSport={(v) => toggleFilter(setSelectedSports, v)}
              onToggleZone={(v) => toggleFilter(setSelectedZones, v)}
              onToggleDate={(v) => toggleFilter(setSelectedDates, v)}
              onToggleType={(v) => toggleFilter(setSelectedTypes, v)}
              onToggleGender={(v) => toggleFilter(setSelectedGenders, v)}
              onClearAll={clearAll}
              hasActiveFilters={hasActiveFilters}
            />
          </aside>

          {/* Mobile filter drawer */}
          {filtersOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                onClick={() => setFiltersOpen(false)}
              />
              <aside className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-800 z-50 lg:hidden overflow-y-auto p-6 shadow-xl transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filters</h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <FilterPanel
                  facets={facets}
                  selectedSports={selectedSports}
                  selectedZones={selectedZones}
                  selectedDates={selectedDates}
                  selectedTypes={selectedTypes}
                  selectedGenders={selectedGenders}
                  onToggleSport={(v) => toggleFilter(setSelectedSports, v)}
                  onToggleZone={(v) => toggleFilter(setSelectedZones, v)}
                  onToggleDate={(v) => toggleFilter(setSelectedDates, v)}
                  onToggleType={(v) => toggleFilter(setSelectedTypes, v)}
                  onToggleGender={(v) => toggleFilter(setSelectedGenders, v)}
                  onClearAll={clearAll}
                  hasActiveFilters={hasActiveFilters}
                />
              </aside>
            </>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length}</span>{' '}
                of {total} sessions
              </p>
              <div className="flex items-center gap-3">
                <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
                {viewMode === 'list' && (
                  <SortControls
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                )}
              </div>
            </div>
            {viewMode === 'list' && (
              <ResultsTable sessions={filtered} forceExpand={selectedGenders.size > 0} />
            )}
            {viewMode === 'timeline' && (
              <TimelineView sessions={filtered} forceExpand={selectedGenders.size > 0} />
            )}
            {viewMode === 'gantt' && (
              <GanttView sessions={filtered} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { field: 'date', label: 'Date' },
  { field: 'sport', label: 'Sport' },
  { field: 'venue', label: 'Venue' },
];

export default function SortControls({ sortField, sortDirection, onSort }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">Sort:</span>
      {SORT_OPTIONS.map(({ field, label }) => {
        const active = sortField === field;
        return (
          <button
            key={field}
            onClick={() => onSort(field)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors
              ${active
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {label}
            {active && (
              <svg
                className={`w-3 h-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

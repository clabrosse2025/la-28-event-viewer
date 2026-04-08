import { useState, useRef, useEffect } from 'react';

export default function FilterSelect({ label, items, selected, onToggle, formatLabel }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredItems = search
    ? items.filter(([value]) => {
        const display = formatLabel ? formatLabel(value) : value;
        return display.toLowerCase().includes(search.toLowerCase());
      })
    : items;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg border transition-all
          ${
            selected.size > 0
              ? 'bg-olympic-blue-light dark:bg-olympic-blue/20 border-olympic-blue/30 text-olympic-blue font-medium'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
          }`}
      >
        <span className="flex items-center gap-2">
          {label}
          {selected.size > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold bg-olympic-blue text-white rounded-full">
              {selected.size}
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden">
          {items.length > 8 && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md
                           placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100
                           focus:outline-none focus:ring-1 focus:ring-olympic-blue/30"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredItems.map(([value, count]) => {
              const isSelected = selected.has(value);
              const display = formatLabel ? formatLabel(value) : value;
              return (
                <button
                  key={value}
                  onClick={() => onToggle(value)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md transition-colors
                    ${isSelected
                      ? 'bg-olympic-blue-light dark:bg-olympic-blue/20 text-olympic-blue'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-olympic-blue border-olympic-blue' : 'border-slate-300 dark:border-slate-500'}`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate flex-1 text-left">{display}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{count}</span>
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

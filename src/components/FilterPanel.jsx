import FilterSelect from './FilterSelect';
import { formatDateShort } from '../utils/formatDate';
import { getSportIcon } from '../utils/sportIcons';

const GENDER_OPTIONS = [
  { key: 'men', label: "Men's" },
  { key: 'women', label: "Women's" },
  { key: 'mixed', label: 'Mixed' },
];

export default function FilterPanel({
  facets,
  selectedSports,
  selectedZones,
  selectedDates,
  selectedTypes,
  selectedGenders,
  onToggleSport,
  onToggleZone,
  onToggleDate,
  onToggleType,
  onToggleGender,
  onClearAll,
  hasActiveFilters,
  showIcons = true,
}) {
  const sportIconRenderer = showIcons ? (value) => getSportIcon(value) : null;
  return (
    <div className="space-y-4">
      {/* Gender toggle */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Category</p>
        <div className="flex gap-1.5">
          {GENDER_OPTIONS.map(({ key, label }) => {
            const active = selectedGenders.has(key);
            return (
              <button
                key={key}
                onClick={() => onToggleGender(key)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors
                  ${active
                    ? 'bg-olympic-blue text-white border-olympic-blue'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <FilterSelect
        label="Sport"
        items={facets.sports}
        selected={selectedSports}
        onToggle={onToggleSport}
        iconRenderer={sportIconRenderer}
      />
      <FilterSelect
        label="Location"
        items={facets.zones}
        selected={selectedZones}
        onToggle={onToggleZone}
      />
      <FilterSelect
        label="Date"
        items={facets.dates}
        selected={selectedDates}
        onToggle={onToggleDate}
        formatLabel={formatDateShort}
      />
      <FilterSelect
        label="Session Type"
        items={facets.types}
        selected={selectedTypes}
        onToggle={onToggleType}
      />
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="w-full py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

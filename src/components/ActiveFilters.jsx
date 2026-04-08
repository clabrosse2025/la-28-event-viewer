import { formatDateCompact } from '../utils/formatDate';

const GENDER_LABELS = { men: "Men's", women: "Women's", mixed: 'Mixed' };

function Pill({ label, onRemove, color = 'slate' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    pink: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border rounded-full transition-colors ${colors[color]}`}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 hover:opacity-70 transition-opacity"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

export default function ActiveFilters({
  selectedSports,
  selectedZones,
  selectedDates,
  selectedTypes,
  selectedGenders,
  onRemoveSport,
  onRemoveZone,
  onRemoveDate,
  onRemoveType,
  onRemoveGender,
  onClearAll,
}) {
  const total =
    selectedSports.size + selectedZones.size + selectedDates.size + selectedTypes.size + selectedGenders.size;

  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {[...selectedGenders].map((v) => (
        <Pill key={`g-${v}`} label={GENDER_LABELS[v]} onRemove={() => onRemoveGender(v)} color="pink" />
      ))}
      {[...selectedSports].map((v) => (
        <Pill key={`s-${v}`} label={v} onRemove={() => onRemoveSport(v)} color="blue" />
      ))}
      {[...selectedZones].map((v) => (
        <Pill key={`z-${v}`} label={v} onRemove={() => onRemoveZone(v)} color="green" />
      ))}
      {[...selectedDates].map((v) => (
        <Pill key={`d-${v}`} label={formatDateCompact(v)} onRemove={() => onRemoveDate(v)} color="purple" />
      ))}
      {[...selectedTypes].map((v) => (
        <Pill key={`t-${v}`} label={v} onRemove={() => onRemoveType(v)} color="amber" />
      ))}
      {total > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

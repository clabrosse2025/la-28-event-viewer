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
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

function SmartPill({ label, color = 'slate' }) {
  const colors = {
    blue: 'bg-olympic-blue/10 text-olympic-blue border-olympic-blue/30 dark:bg-olympic-blue/20 dark:border-olympic-blue/40',
    green: 'bg-olympic-blue/10 text-olympic-blue border-olympic-blue/30 dark:bg-olympic-blue/20 dark:border-olympic-blue/40',
    purple: 'bg-olympic-blue/10 text-olympic-blue border-olympic-blue/30 dark:bg-olympic-blue/20 dark:border-olympic-blue/40',
    amber: 'bg-olympic-blue/10 text-olympic-blue border-olympic-blue/30 dark:bg-olympic-blue/20 dark:border-olympic-blue/40',
    pink: 'bg-olympic-blue/10 text-olympic-blue border-olympic-blue/30 dark:bg-olympic-blue/20 dark:border-olympic-blue/40',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border rounded-full ${colors[color] || colors.blue}`}>
      <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      {label}
    </span>
  );
}

export default function ActiveFilters({
  selectedSports,
  selectedZones,
  selectedDates,
  selectedTypes,
  selectedGenders,
  smartFilters,
  onRemoveSport,
  onRemoveZone,
  onRemoveDate,
  onRemoveType,
  onRemoveGender,
  onClearAll,
}) {
  const manualTotal =
    selectedSports.size + selectedZones.size + selectedDates.size + selectedTypes.size + selectedGenders.size;
  const smartTotal = smartFilters
    ? smartFilters.sports.size + smartFilters.zones.size + smartFilters.dates.size + smartFilters.types.size + smartFilters.genders.size
    : 0;

  if (manualTotal === 0 && smartTotal === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {/* Smart-parsed filters (from search bar) */}
      {smartFilters && smartFilters.sports.size > 0 && [...smartFilters.sports].map((v) => (
        <SmartPill key={`sm-s-${v}`} label={v} color="blue" />
      ))}
      {smartFilters && smartFilters.genders.size > 0 && [...smartFilters.genders].map((v) => (
        <SmartPill key={`sm-g-${v}`} label={GENDER_LABELS[v]} color="pink" />
      ))}
      {smartFilters && smartFilters.zones.size > 0 && [...smartFilters.zones].map((v) => (
        <SmartPill key={`sm-z-${v}`} label={v} color="green" />
      ))}
      {smartFilters && smartFilters.dates.size > 0 && [...smartFilters.dates].map((v) => (
        <SmartPill key={`sm-d-${v}`} label={formatDateCompact(v)} color="purple" />
      ))}
      {smartFilters && smartFilters.types.size > 0 && [...smartFilters.types].map((v) => (
        <SmartPill key={`sm-t-${v}`} label={v} color="amber" />
      ))}
      {smartFilters && smartFilters.timeOfDay && (
        <SmartPill key="sm-tod" label={smartFilters.timeOfDay.label} color="purple" />
      )}

      {/* Manual filters (from sidebar) */}
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
      {manualTotal > 1 && (
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

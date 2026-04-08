import { useState } from 'react';
import SportIcon from './SportIcon';

const TYPE_STYLES = {
  Final: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  Semifinal: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  Quarterfinal: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  Preliminary: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  Repechage: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  Classification: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  Bronze: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
};

function formatDate(isoDate, dateStr) {
  if (!isoDate) return dateStr || 'TBD';
  const d = new Date(isoDate + 'T12:00:00');
  const day = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const date = d.getDate();
  return `${day}, ${month} ${date}`;
}

function formatTime(start, end) {
  if (!start || !start.includes(':')) return 'TBD';
  const fmt = (t) => {
    if (!t || !t.includes(':')) return 'TBD';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${m.toString().padStart(2, '0')} ${period}`;
  };
  if (end) return `${fmt(start)} - ${fmt(end)}`;
  return fmt(start);
}

export default function SessionRow({ session, forceExpand = false, showIcons = true }) {
  const [manualExpanded, setManualExpanded] = useState(false);
  const s = session;
  const hasMultiple = s.descriptions.length > 1;
  const expanded = forceExpand || manualExpanded;
  const typeStyle = TYPE_STYLES[s.sessionType] || 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600';

  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-shadow
        ${expanded ? 'shadow-md ring-1 ring-slate-200 dark:ring-slate-600' : 'shadow-sm hover:shadow-md'}`}
    >
      <button
        onClick={() => hasMultiple && setManualExpanded(!manualExpanded)}
        className={`w-full text-left p-4 ${hasMultiple ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex items-start gap-4">
          {/* Date/time column */}
          <div className="flex-shrink-0 w-28 sm:w-32">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {formatDate(s.isoDate, s.date)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {formatTime(s.startTime, s.endTime)}
            </p>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {showIcons && <SportIcon sport={s.sport} />}
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.sport}</h3>
              {s.sessionType && (
                <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium border rounded-full ${typeStyle}`}>
                  {s.sessionType}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 truncate">
              {s.descriptions[0] || 'No description'}
              {hasMultiple && !expanded && (
                <span className="text-slate-400 dark:text-slate-500 ml-1">
                  +{s.descriptions.length - 1} more
                </span>
              )}
            </p>
            {expanded && hasMultiple && (
              <ul className="mt-2 space-y-1">
                {s.descriptions.map((desc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mt-2 flex-shrink-0" />
                    {desc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Venue/location */}
          <div className="hidden sm:block flex-shrink-0 text-right max-w-48">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{s.venue}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.zone}</p>
          </div>

          {/* Expand indicator */}
          {hasMultiple && (
            <div className="flex-shrink-0 self-center">
              <svg
                className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          )}
        </div>

        {/* Mobile venue display */}
        <div className="sm:hidden mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {s.venue} &middot; {s.zone}
        </div>
      </button>
    </div>
  );
}

import { useMemo } from 'react';
import SessionRow from './SessionRow';

function formatDateHeader(isoDate) {
  if (!isoDate) return 'Date TBD';
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getGamesDay(isoDate, sessions) {
  const session = sessions.find((s) => s.isoDate === isoDate && s.gamesDay);
  return session?.gamesDay;
}

export default function TimelineView({ sessions, forceExpand = false, showIcons = true }) {
  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      const key = s.isoDate || 'tbd';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    return [...map.entries()];
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-1">No events found</p>
        <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {grouped.map(([date, dateSessions]) => {
        const gamesDay = getGamesDay(date, dateSessions);
        return (
          <section key={date}>
            <div className="sticky top-16 z-10 bg-slate-50 dark:bg-slate-900 py-2 -mx-1 px-1">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {formatDateHeader(date)}
                </h2>
                {gamesDay && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-olympic-blue/10 text-olympic-blue dark:bg-olympic-blue/20">
                    Day {gamesDay}
                  </span>
                )}
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {dateSessions.length} session{dateSessions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              {dateSessions.map((session) => (
                <SessionRow key={session.sessionCode} session={session} forceExpand={forceExpand} showIcons={showIcons} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

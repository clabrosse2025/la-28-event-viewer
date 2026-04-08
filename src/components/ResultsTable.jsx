import { useState } from 'react';
import SessionRow from './SessionRow';

const PAGE_SIZE = 30;

export default function ResultsTable({ sessions, forceExpand = false, showIcons = true }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  const visible = sessions.slice(0, visibleCount);
  const hasMore = visibleCount < sessions.length;

  return (
    <div className="space-y-2">
      {visible.map((session) => (
        <SessionRow key={session.sessionCode} session={session} forceExpand={forceExpand} showIcons={showIcons} />
      ))}
      {hasMore && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="w-full py-3 text-sm font-medium text-olympic-blue bg-olympic-blue-light dark:bg-olympic-blue/20 hover:bg-olympic-blue/10 dark:hover:bg-olympic-blue/30 rounded-xl transition-colors"
        >
          Show more ({sessions.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}

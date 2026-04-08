import { useMemo, useState, useRef, useEffect, useCallback } from 'react';

const BASE_PX_PER_HOUR = 60;
const BASE_ROW_HEIGHT = 36;
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.5, 2];
const LANE_GAP = 2;
const HEADER_HEIGHT = 56;
const SPORT_COL_WIDTH = 180;

const TYPE_COLORS = {
  Final: 'bg-amber-500 hover:bg-amber-600',
  Semifinal: 'bg-slate-400 hover:bg-slate-500',
  Quarterfinal: 'bg-blue-500 hover:bg-blue-600',
  Preliminary: 'bg-sky-400 hover:bg-sky-500',
  Repechage: 'bg-emerald-500 hover:bg-emerald-600',
  Classification: 'bg-purple-500 hover:bg-purple-600',
  Bronze: 'bg-orange-500 hover:bg-orange-600',
};

function parseTime(t) {
  if (!t) return null;
  const m = t.match(/^(\d+):(\d+)/);
  if (!m) return null;
  return parseInt(m[1]) * 60 + parseInt(m[2]);
}

function formatTimeRange(start, end) {
  const fmt = (t) => {
    if (!t) return 'TBD';
    const m = t.match(/^(\d+):(\d+)/);
    if (!m) return t;
    const h = parseInt(m[1]);
    const min = m[2];
    const period = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${min} ${period}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatHourLabel(h) {
  if (h === 0 || h === 24) return '12am';
  if (h === 12) return '12pm';
  if (h > 12) return `${h - 12}pm`;
  return `${h}am`;
}

function formatDateLabel(isoDate) {
  const d = new Date(isoDate + 'T12:00:00');
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

function assignLanes(bars) {
  const sorted = [...bars].sort((a, b) => a.startMin - b.startMin);
  const lanes = [];
  for (const bar of sorted) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      if (bar.startMin >= lanes[i]) {
        lanes[i] = bar.endMin;
        bar.lane = i;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bar.lane = lanes.length;
      lanes.push(bar.endMin);
    }
  }
  return lanes.length;
}

export default function GanttView({ sessions }) {
  const [tooltip, setTooltip] = useState(null);
  const [zoomIndex, setZoomIndex] = useState(2);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(400);

  const zoom = ZOOM_LEVELS[zoomIndex];
  const pxPerHour = BASE_PX_PER_HOUR * zoom;
  const rowHeight = BASE_ROW_HEIGHT * zoom;

  useEffect(() => {
    const measure = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const available = window.innerHeight - rect.top - 16;
        setContainerHeight(Math.max(200, available));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const zoomIn = useCallback(() => setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1)), []);
  const zoomOut = useCallback(() => setZoomIndex((i) => Math.max(i - 1, 0)), []);

  const { sports, days, dayMeta, barsBySport, sportLanes, gridWidth } = useMemo(() => {
    const timed = sessions.filter((s) => parseTime(s.startTime) !== null);

    const daySet = new Set(timed.map((s) => s.isoDate));
    const days = [...daySet].sort();

    // Compute per-day hour range based on actual events
    const dayHourRange = {};
    for (const day of days) {
      dayHourRange[day] = { min: 24, max: 0 };
    }
    for (const s of timed) {
      const startH = Math.floor(parseTime(s.startTime) / 60);
      const endMin = parseTime(s.endTime) || parseTime(s.startTime) + 60;
      const endH = Math.ceil(endMin / 60);
      const r = dayHourRange[s.isoDate];
      if (startH < r.min) r.min = startH;
      if (endH > r.max) r.max = endH;
    }

    // Build dayMeta: startHour, endHour, numHours, pixelOffset for each day
    const dayMeta = {};
    let cumulativeX = 0;
    for (const day of days) {
      const r = dayHourRange[day];
      const startHour = r.min;
      const endHour = r.max;
      const numHours = endHour - startHour;
      dayMeta[day] = { startHour, endHour, numHours, xOffset: cumulativeX };
      cumulativeX += numHours * pxPerHour;
    }
    const gridWidth = cumulativeX;

    const sportSet = new Set(timed.map((s) => s.sport));
    const sports = [...sportSet].sort();

    const barsBySport = {};
    sports.forEach((s) => (barsBySport[s] = []));

    for (const s of timed) {
      const startMin = parseTime(s.startTime);
      const endMin = parseTime(s.endTime) || startMin + 60;
      const dm = dayMeta[s.isoDate];
      const x = dm.xOffset + (startMin / 60 - dm.startHour) * pxPerHour;
      const w = Math.max(((endMin - startMin) / 60) * pxPerHour, 8 * zoom);
      barsBySport[s.sport].push({ session: s, day: s.isoDate, startMin, endMin, x, w, lane: 0 });
    }

    const sportLanes = {};
    for (const sport of sports) {
      const byDay = {};
      for (const bar of barsBySport[sport]) {
        if (!byDay[bar.day]) byDay[bar.day] = [];
        byDay[bar.day].push(bar);
      }
      let maxLanes = 1;
      for (const dayBars of Object.values(byDay)) {
        const n = assignLanes(dayBars);
        if (n > maxLanes) maxLanes = n;
      }
      sportLanes[sport] = maxLanes;
    }

    return { sports, days, dayMeta, barsBySport, sportLanes, gridWidth };
  }, [sessions, pxPerHour, zoom]);

  const sportY = useMemo(() => {
    const y = {};
    let offset = HEADER_HEIGHT;
    for (const sport of sports) {
      y[sport] = offset;
      offset += sportLanes[sport] * rowHeight + 4;
    }
    return y;
  }, [sports, sportLanes, rowHeight]);

  const handleBarHover = (e, bar) => {
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left + containerRef.current.scrollLeft,
      y: e.clientY - rect.top + containerRef.current.scrollTop,
      session: bar.session,
    });
  };

  if (sessions.length === 0 || days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-1">No timed events found</p>
        <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  const totalWidth = SPORT_COL_WIDTH + gridWidth;
  let contentHeight = 0;
  for (const sport of sports) contentHeight += sportLanes[sport] * rowHeight + 4;
  const totalHeight = HEADER_HEIGHT + contentHeight;

  return (
    <div ref={wrapperRef} className="flex flex-col" style={{ height: containerHeight }}>
      {/* Zoom controls */}
      <div className="flex items-center justify-end gap-1 mb-2 flex-shrink-0">
        <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">Zoom:</span>
        <button onClick={zoomOut} disabled={zoomIndex === 0}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold">
          −
        </button>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={zoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold">
          +
        </button>
      </div>

      {/* Scrollable chart */}
      <div
        ref={containerRef}
        className="overflow-auto relative border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 flex-1 min-h-0"
        onMouseLeave={() => setTooltip(null)}
      >
        <div style={{ width: totalWidth, height: Math.max(totalHeight, containerHeight - 44) }}>

          {/* === HEADER ROW (sticky top) === */}
          <div className="sticky top-0 z-20 flex" style={{ height: HEADER_HEIGHT }}>
            {/* Corner */}
            <div
              className="sticky left-0 z-30 flex-shrink-0 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 flex items-center px-3"
              style={{ width: SPORT_COL_WIDTH, minWidth: SPORT_COL_WIDTH }}
            >
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sport</span>
            </div>
            {/* Day / hour header cells */}
            <div className="flex-shrink-0 flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" style={{ width: gridWidth }}>
              {days.map((day) => {
                const { day: dayName, date } = formatDateLabel(day);
                const dm = dayMeta[day];
                const dayWidth = dm.numHours * pxPerHour;
                return (
                  <div key={day} className="flex-shrink-0 border-r border-slate-200 dark:border-slate-700" style={{ width: dayWidth }}>
                    <div className="text-center py-1.5">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{dayName} </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{date}</span>
                    </div>
                    <div className="flex" style={{ height: 22 }}>
                      {Array.from({ length: dm.numHours }, (_, h) => (
                        <div key={h} className="border-r border-slate-100 dark:border-slate-700/50 flex items-center justify-center overflow-hidden flex-shrink-0" style={{ width: pxPerHour }}>
                          <span className="text-slate-500 dark:text-slate-400 font-medium" style={{ fontSize: Math.max(9, 11 * zoom) }}>
                            {formatHourLabel(dm.startHour + h)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* === BODY ROWS === */}
          {sports.map((sport) => {
            const sportRowHeight = sportLanes[sport] * rowHeight + 4;
            const sportBars = barsBySport[sport];

            return (
              <div key={sport} className="flex" style={{ height: sportRowHeight }}>
                {/* Sport label — sticky left */}
                <div
                  className="sticky left-0 z-10 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-b border-slate-100 dark:border-slate-700/50 flex items-center px-3"
                  style={{ width: SPORT_COL_WIDTH, minWidth: SPORT_COL_WIDTH }}
                >
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{sport}</span>
                </div>
                {/* Bar area */}
                <div className="relative flex-shrink-0 border-b border-slate-100 dark:border-slate-700/30" style={{ width: gridWidth, height: sportRowHeight }}>
                  {/* Hour gridlines + day separators */}
                  {days.map((day) => {
                    const dm = dayMeta[day];
                    return Array.from({ length: dm.numHours }, (_, h) => (
                      <div
                        key={`${day}-${h}`}
                        className={`absolute top-0 bottom-0 ${h === 0 && dm.xOffset > 0 ? 'border-l-2 border-slate-200 dark:border-slate-600' : 'border-r border-slate-50 dark:border-slate-700/20'}`}
                        style={{ left: dm.xOffset + h * pxPerHour }}
                      />
                    ));
                  })}
                  {/* Bars */}
                  {sportBars.map((bar) => {
                    const colorCls = TYPE_COLORS[bar.session.sessionType] || 'bg-slate-400 hover:bg-slate-500';
                    const barY = bar.lane * rowHeight + LANE_GAP;
                    return (
                      <div
                        key={bar.session.sessionCode}
                        className={`absolute rounded-sm text-white cursor-pointer transition-colors overflow-hidden ${colorCls}`}
                        style={{ left: bar.x, top: barY, width: bar.w, height: rowHeight - LANE_GAP * 2 }}
                        onMouseEnter={(e) => handleBarHover(e, bar)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <span className="font-medium px-1 whitespace-nowrap pointer-events-none block"
                          style={{ fontSize: Math.max(8, 10 * zoom), lineHeight: `${rowHeight - LANE_GAP * 2}px` }}>
                          {bar.w > 40 ? (bar.session.sessionType || bar.session.sessionCode) : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div className="absolute z-50 pointer-events-none" style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}>
            <div className="bg-slate-900 dark:bg-slate-700 text-white rounded-lg shadow-xl px-3 py-2 max-w-72">
              <p className="text-xs font-semibold">{tooltip.session.sport}</p>
              <p className="text-[11px] text-slate-300 mt-0.5">{formatTimeRange(tooltip.session.startTime, tooltip.session.endTime)}</p>
              <p className="text-[11px] text-slate-300">{tooltip.session.venue} · {tooltip.session.zone}</p>
              {tooltip.session.sessionType && <p className="text-[11px] text-slate-400 mt-0.5">{tooltip.session.sessionType}</p>}
              <div className="mt-1 border-t border-slate-700 dark:border-slate-600 pt-1">
                {tooltip.session.descriptions.slice(0, 4).map((d, i) => (
                  <p key={i} className="text-[10px] text-slate-400">{d}</p>
                ))}
                {tooltip.session.descriptions.length > 4 && (
                  <p className="text-[10px] text-slate-500">+{tooltip.session.descriptions.length - 4} more</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

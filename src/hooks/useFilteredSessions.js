import { useMemo } from 'react';
import events from '../data/events.json';
import { parseQuery, hasSmartFilters } from '../utils/queryParser';

function matchesGender(s, selectedGenders) {
  if (selectedGenders.size === 0) return true;
  const descs = s.descriptions.join(' ').toLowerCase();
  if (selectedGenders.has('men') && /\bmen's\b/.test(descs)) return true;
  if (selectedGenders.has('women') && /\bwomen's\b/.test(descs)) return true;
  if (selectedGenders.has('mixed') && /\bmixed\b/.test(descs)) return true;
  return false;
}

function parseStartHour(s) {
  if (!s.startTime) return null;
  const m = s.startTime.match(/^(\d+):/);
  return m ? parseInt(m[1]) : null;
}

function baseFilter(s, search, selectedSports, selectedZones, selectedDates, selectedTypes, selectedGenders, timeOfDay) {
  if (search) {
    const haystack = [s.sport, s.venue, s.zone, s.sessionCode, s.date, s.sessionType, ...s.descriptions]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (selectedSports.size > 0 && !selectedSports.has(s.sport)) return false;
  if (selectedZones.size > 0 && !selectedZones.has(s.zone)) return false;
  if (selectedDates.size > 0 && !selectedDates.has(s.isoDate)) return false;
  if (selectedTypes.size > 0 && !selectedTypes.has(s.sessionType)) return false;
  if (!matchesGender(s, selectedGenders)) return false;
  if (timeOfDay) {
    const hour = parseStartHour(s);
    if (hour === null) return false;
    if (hour < timeOfDay.minHour || hour >= timeOfDay.maxHour) return false;
  }
  return true;
}

// Merge two Sets: returns a new Set with all values from both, or the non-empty one
function mergeSets(manual, smart) {
  if (manual.size === 0 && smart.size === 0) return manual;
  if (manual.size === 0) return smart;
  if (smart.size === 0) return manual;
  // Both active: intersect would be too restrictive, union lets both apply
  // But for this UX, smart filters ADD to manual filters (union)
  return new Set([...manual, ...smart]);
}

export function useFilteredSessions({
  searchText,
  selectedSports,
  selectedZones,
  selectedDates,
  selectedTypes,
  selectedGenders,
  sortField,
  sortDirection,
}) {
  const allSessions = events;

  // Parse the search text for smart filters
  const parsed = useMemo(() => parseQuery(searchText), [searchText]);
  const smart = useMemo(() => hasSmartFilters(parsed), [parsed]);

  // Merge manual filters with smart-parsed filters
  const effectiveSports = useMemo(() => mergeSets(selectedSports, parsed.sports), [selectedSports, parsed.sports]);
  const effectiveZones = useMemo(() => mergeSets(selectedZones, parsed.zones), [selectedZones, parsed.zones]);
  const effectiveDates = useMemo(() => mergeSets(selectedDates, parsed.dates), [selectedDates, parsed.dates]);
  const effectiveTypes = useMemo(() => mergeSets(selectedTypes, parsed.types), [selectedTypes, parsed.types]);
  const effectiveGenders = useMemo(() => mergeSets(selectedGenders, parsed.genders), [selectedGenders, parsed.genders]);
  const effectiveTimeOfDay = parsed.timeOfDay;

  // Use remainder text for substring search (or full text if no smart filters found)
  const search = useMemo(() => {
    return smart ? parsed.remainder.toLowerCase().trim() : searchText.toLowerCase().trim();
  }, [smart, parsed.remainder, searchText]);

  const filtered = useMemo(() => {
    let result = allSessions.filter((s) =>
      baseFilter(s, search, effectiveSports, effectiveZones, effectiveDates, effectiveTypes, effectiveGenders, effectiveTimeOfDay)
    );

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp =
            (a.isoDate || '').localeCompare(b.isoDate || '') ||
            (a.startTime || '').localeCompare(b.startTime || '');
          break;
        case 'sport':
          cmp =
            a.sport.localeCompare(b.sport) ||
            (a.isoDate || '').localeCompare(b.isoDate || '');
          break;
        case 'venue':
          cmp =
            a.venue.localeCompare(b.venue) ||
            (a.isoDate || '').localeCompare(b.isoDate || '');
          break;
        default:
          cmp = (a.isoDate || '').localeCompare(b.isoDate || '');
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allSessions, search, effectiveSports, effectiveZones, effectiveDates, effectiveTypes, effectiveGenders, effectiveTimeOfDay, sortField, sortDirection]);

  const facets = useMemo(() => {
    const empty = new Set();

    const forSport = allSessions.filter((s) =>
      baseFilter(s, search, empty, effectiveZones, effectiveDates, effectiveTypes, effectiveGenders, effectiveTimeOfDay)
    );
    const sportCounts = {};
    for (const s of forSport) sportCounts[s.sport] = (sportCounts[s.sport] || 0) + 1;

    const forZone = allSessions.filter((s) =>
      baseFilter(s, search, effectiveSports, empty, effectiveDates, effectiveTypes, effectiveGenders, effectiveTimeOfDay)
    );
    const zoneCounts = {};
    for (const s of forZone) zoneCounts[s.zone] = (zoneCounts[s.zone] || 0) + 1;

    const forDate = allSessions.filter((s) =>
      baseFilter(s, search, effectiveSports, effectiveZones, empty, effectiveTypes, effectiveGenders, effectiveTimeOfDay)
    );
    const dateCounts = {};
    for (const s of forDate) {
      if (s.isoDate) dateCounts[s.isoDate] = (dateCounts[s.isoDate] || 0) + 1;
    }

    const forType = allSessions.filter((s) =>
      baseFilter(s, search, effectiveSports, effectiveZones, effectiveDates, empty, effectiveGenders, effectiveTimeOfDay)
    );
    const typeCounts = {};
    for (const s of forType) {
      if (s.sessionType) typeCounts[s.sessionType] = (typeCounts[s.sessionType] || 0) + 1;
    }

    return {
      sports: Object.entries(sportCounts).sort((a, b) => a[0].localeCompare(b[0])),
      zones: Object.entries(zoneCounts).sort((a, b) => a[0].localeCompare(b[0])),
      dates: Object.entries(dateCounts).sort((a, b) => a[0].localeCompare(b[0])),
      types: Object.entries(typeCounts).sort((a, b) => a[0].localeCompare(b[0])),
    };
  }, [allSessions, search, effectiveSports, effectiveZones, effectiveDates, effectiveTypes, effectiveGenders, effectiveTimeOfDay]);

  return { filtered, total: allSessions.length, facets, smartFilters: smart ? parsed : null };
}

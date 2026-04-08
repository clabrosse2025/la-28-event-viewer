import { useMemo } from 'react';
import events from '../data/events.json';

function matchesGender(s, selectedGenders) {
  if (selectedGenders.size === 0) return true;
  const descs = s.descriptions.join(' ').toLowerCase();
  if (selectedGenders.has('men') && /\bmen's\b/.test(descs)) return true;
  if (selectedGenders.has('women') && /\bwomen's\b/.test(descs)) return true;
  if (selectedGenders.has('mixed') && /\bmixed\b/.test(descs)) return true;
  return false;
}

function baseFilter(s, search, selectedSports, selectedZones, selectedDates, selectedTypes, selectedGenders) {
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
  return true;
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
  const search = searchText.toLowerCase().trim();

  const filtered = useMemo(() => {
    let result = allSessions.filter((s) =>
      baseFilter(s, search, selectedSports, selectedZones, selectedDates, selectedTypes, selectedGenders)
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
  }, [allSessions, search, selectedSports, selectedZones, selectedDates, selectedTypes, selectedGenders, sortField, sortDirection]);

  // Cross-filtered facet counts: each dimension counts sessions matching
  // all OTHER active filters (excluding its own), so users can see how many
  // results each option would produce if selected.
  const facets = useMemo(() => {
    const empty = new Set();

    // For sport counts: apply all filters EXCEPT sport
    const forSport = allSessions.filter((s) =>
      baseFilter(s, search, empty, selectedZones, selectedDates, selectedTypes, selectedGenders)
    );
    const sportCounts = {};
    for (const s of forSport) sportCounts[s.sport] = (sportCounts[s.sport] || 0) + 1;

    // For zone counts: apply all filters EXCEPT zone
    const forZone = allSessions.filter((s) =>
      baseFilter(s, search, selectedSports, empty, selectedDates, selectedTypes, selectedGenders)
    );
    const zoneCounts = {};
    for (const s of forZone) zoneCounts[s.zone] = (zoneCounts[s.zone] || 0) + 1;

    // For date counts: apply all filters EXCEPT date
    const forDate = allSessions.filter((s) =>
      baseFilter(s, search, selectedSports, selectedZones, empty, selectedTypes, selectedGenders)
    );
    const dateCounts = {};
    for (const s of forDate) {
      if (s.isoDate) dateCounts[s.isoDate] = (dateCounts[s.isoDate] || 0) + 1;
    }

    // For type counts: apply all filters EXCEPT type
    const forType = allSessions.filter((s) =>
      baseFilter(s, search, selectedSports, selectedZones, selectedDates, empty, selectedGenders)
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
  }, [allSessions, search, selectedSports, selectedZones, selectedDates, selectedTypes, selectedGenders]);

  return { filtered, total: allSessions.length, facets };
}

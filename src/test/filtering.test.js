import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilteredSessions } from '../hooks/useFilteredSessions';

function makeFilters(overrides = {}) {
  return {
    searchText: '',
    selectedSports: new Set(),
    selectedZones: new Set(),
    selectedDates: new Set(),
    selectedTypes: new Set(),
    selectedGenders: new Set(),
    sortField: 'date',
    sortDirection: 'asc',
    ...overrides,
  };
}

describe('useFilteredSessions', () => {
  it('returns all sessions with no filters', () => {
    const { result } = renderHook(() => useFilteredSessions(makeFilters()));
    expect(result.current.filtered.length).toBe(result.current.total);
    expect(result.current.total).toBeGreaterThan(800);
  });

  it('filters by sport', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ selectedSports: new Set(['Swimming']) }))
    );
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(result.current.filtered.length).toBeLessThan(result.current.total);
    expect(result.current.filtered.every((s) => s.sport === 'Swimming')).toBe(true);
  });

  it('filters by zone', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ selectedZones: new Set(['DTLA']) }))
    );
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(result.current.filtered.every((s) => s.zone === 'DTLA')).toBe(true);
  });

  it('filters by date', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ selectedDates: new Set(['2028-07-22']) }))
    );
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(result.current.filtered.every((s) => s.isoDate === '2028-07-22')).toBe(true);
  });

  it('filters by session type', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ selectedTypes: new Set(['Final']) }))
    );
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(result.current.filtered.every((s) => s.sessionType === 'Final')).toBe(true);
  });

  it('filters by search text', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ searchText: 'swimming' }))
    );
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(
      result.current.filtered.every((s) =>
        [s.sport, s.venue, s.zone, s.sessionCode, ...s.descriptions]
          .join(' ')
          .toLowerCase()
          .includes('swimming')
      )
    ).toBe(true);
  });

  it('gender filter: Women excludes men-only sessions', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ selectedGenders: new Set(['women']) }))
    );
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(result.current.filtered.length).toBeLessThan(result.current.total);
    // Every session must contain "women's" in descriptions
    for (const s of result.current.filtered) {
      const descs = s.descriptions.join(' ').toLowerCase();
      expect(descs).toMatch(/\bwomen's\b/);
    }
  });

  it('gender filter: Men does not match women-only sessions', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ selectedGenders: new Set(['men']) }))
    );
    for (const s of result.current.filtered) {
      const descs = s.descriptions.join(' ').toLowerCase();
      expect(descs).toMatch(/\bmen's\b/);
    }
  });

  it('gender filter: men does not false-positive on "women\'s"', () => {
    // This was a real bug: "women's".includes("men's") === true
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ selectedGenders: new Set(['men']) }))
    );
    // Find sessions that only have Women's events (no Men's)
    const womenOnly = result.current.filtered.filter((s) => {
      const descs = s.descriptions.join(' ').toLowerCase();
      return /\bwomen's\b/.test(descs) && !/\bmen's\b/.test(descs);
    });
    expect(womenOnly.length).toBe(0);
  });

  it('combines multiple filters with AND logic', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(
        makeFilters({
          selectedSports: new Set(['Swimming']),
          selectedTypes: new Set(['Final']),
        })
      )
    );
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(
      result.current.filtered.every((s) => s.sport === 'Swimming' && s.sessionType === 'Final')
    ).toBe(true);
  });

  it('sorts by date ascending', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ sortField: 'date', sortDirection: 'asc' }))
    );
    const dates = result.current.filtered.map((s) => s.isoDate);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i] >= dates[i - 1]).toBe(true);
    }
  });

  it('sorts by date descending', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ sortField: 'date', sortDirection: 'desc' }))
    );
    const dates = result.current.filtered.map((s) => s.isoDate);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i] <= dates[i - 1]).toBe(true);
    }
  });

  it('sorts by sport then date', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ sortField: 'sport', sortDirection: 'asc' }))
    );
    const items = result.current.filtered;
    for (let i = 1; i < items.length; i++) {
      const cmp = items[i].sport.localeCompare(items[i - 1].sport);
      // Primary sort: sport ascending
      if (cmp === 0) {
        // Secondary sort: date ascending within same sport
        expect(items[i].isoDate >= items[i - 1].isoDate).toBe(true);
      } else {
        expect(cmp).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('returns empty array when no sessions match', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ searchText: 'zzzznonexistent999' }))
    );
    expect(result.current.filtered.length).toBe(0);
  });

  it('facets reflect cross-filtering', () => {
    const { result } = renderHook(() =>
      useFilteredSessions(makeFilters({ selectedSports: new Set(['Swimming']) }))
    );
    // Date facets should only include dates where Swimming has events
    const dateFacets = result.current.facets.dates;
    const dateValues = dateFacets.map(([d]) => d);
    // Swimming doesn't happen on all 21 days
    expect(dateValues.length).toBeLessThan(21);
    expect(dateValues.length).toBeGreaterThan(0);
  });
});

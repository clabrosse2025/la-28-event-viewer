import { describe, it, expect } from 'vitest';
import { formatDateShort, formatDateCompact } from '../utils/formatDate';

describe('formatDateShort', () => {
  it('formats an ISO date to "Wed, Jul 15" style', () => {
    const result = formatDateShort('2028-07-15');
    expect(result).toBe('Sat, Jul 15');
  });

  it('returns correct day of week for known dates', () => {
    // July 10, 2028 is a Monday
    expect(formatDateShort('2028-07-10')).toMatch(/^Mon/);
    // July 13, 2028 is a Thursday (this was a real bug - was showing as Sunday)
    expect(formatDateShort('2028-07-13')).toMatch(/^Thu/);
    // July 30, 2028 is a Sunday
    expect(formatDateShort('2028-07-30')).toMatch(/^Sun/);
  });

  it('handles null/undefined gracefully', () => {
    expect(formatDateShort(null)).toBeNull();
    expect(formatDateShort(undefined)).toBeUndefined();
  });
});

describe('formatDateCompact', () => {
  it('formats to "Jul 15" style without weekday', () => {
    const result = formatDateCompact('2028-07-15');
    expect(result).toBe('Jul 15');
  });

  it('handles null/undefined gracefully', () => {
    expect(formatDateCompact(null)).toBeNull();
    expect(formatDateCompact(undefined)).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import events from '../data/events.json';

describe('events.json data integrity', () => {
  it('contains a reasonable number of sessions', () => {
    expect(events.length).toBeGreaterThan(800);
    expect(events.length).toBeLessThan(900);
  });

  it('every session has required fields', () => {
    for (const s of events) {
      expect(s.sport).toBeTruthy();
      expect(s.sessionCode).toBeTruthy();
      expect(s.isoDate).toMatch(/^2028-07-\d{2}$/);
      expect(s.descriptions).toBeInstanceOf(Array);
      expect(s.descriptions.length).toBeGreaterThan(0);
    }
  });

  it('has unique session codes', () => {
    const codes = events.map((s) => s.sessionCode);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('dates fall within Olympics range (Jul 10-30, 2028)', () => {
    for (const s of events) {
      const day = parseInt(s.isoDate.split('-')[2]);
      expect(day).toBeGreaterThanOrEqual(10);
      expect(day).toBeLessThanOrEqual(30);
    }
  });

  it('start times are valid HH:MM format when present', () => {
    for (const s of events) {
      if (s.startTime && s.startTime.includes(':')) {
        expect(s.startTime).toMatch(/^\d{1,2}:\d{2}/);
      }
    }
  });

  it('contains expected sports', () => {
    const sports = new Set(events.map((s) => s.sport));
    expect(sports.has('Swimming')).toBe(true);
    expect(sports.has('Athletics (Track & Field)')).toBe(true);
    expect(sports.has('Basketball')).toBe(true);
    expect(sports.has('Wrestling')).toBe(true);
    expect(sports.has('Football (Soccer)')).toBe(true);
  });

  it('every session has a venue and zone', () => {
    for (const s of events) {
      expect(s.venue).toBeTruthy();
      expect(s.zone).toBeTruthy();
    }
  });
});

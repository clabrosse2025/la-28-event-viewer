import { describe, it, expect } from 'vitest';
import { parseQuery, hasSmartFilters } from '../utils/queryParser';

describe('parseQuery', () => {
  describe('sport recognition', () => {
    it('recognizes sport names', () => {
      const result = parseQuery('swimming');
      expect(result.sports.has('Swimming')).toBe(true);
    });

    it('recognizes sport aliases: soccer → Football (Soccer)', () => {
      const result = parseQuery('soccer');
      expect(result.sports.has('Football (Soccer)')).toBe(true);
    });

    it('recognizes sport aliases: track → Athletics (Track & Field)', () => {
      const result = parseQuery('track');
      expect(result.sports.has('Athletics (Track & Field)')).toBe(true);
    });

    it('recognizes sport aliases: polo → Water Polo', () => {
      const result = parseQuery('polo');
      expect(result.sports.has('Water Polo')).toBe(true);
    });

    it('recognizes sport aliases: hoops → Basketball', () => {
      const result = parseQuery('hoops');
      expect(result.sports.has('Basketball')).toBe(true);
    });

    it('recognizes sport aliases: ping pong → Table Tennis', () => {
      const result = parseQuery('ping pong');
      expect(result.sports.has('Table Tennis')).toBe(true);
    });

    it('longest match: "track and field" matches as one sport', () => {
      const result = parseQuery('track and field');
      expect(result.sports.has('Athletics (Track & Field)')).toBe(true);
      expect(result.sports.size).toBe(1);
    });

    it('longest match: "beach volleyball" matches as one sport', () => {
      const result = parseQuery('beach volleyball');
      expect(result.sports.has('Beach Volleyball')).toBe(true);
    });

    it('is case insensitive', () => {
      const result = parseQuery('SWIMMING');
      expect(result.sports.has('Swimming')).toBe(true);
    });
  });

  describe('session type recognition', () => {
    it('recognizes "finals" → Final', () => {
      const result = parseQuery('finals');
      expect(result.types.has('Final')).toBe(true);
    });

    it('recognizes "prelims" → Preliminary', () => {
      const result = parseQuery('prelims');
      expect(result.types.has('Preliminary')).toBe(true);
    });

    it('recognizes "semifinals" → Semifinal', () => {
      const result = parseQuery('semifinals');
      expect(result.types.has('Semifinal')).toBe(true);
    });

    it('recognizes "quarterfinals" → Quarterfinal', () => {
      const result = parseQuery('quarterfinals');
      expect(result.types.has('Quarterfinal')).toBe(true);
    });

    it('recognizes "gold medal" → Final', () => {
      const result = parseQuery('gold medal');
      expect(result.types.has('Final')).toBe(true);
    });
  });

  describe('day name expansion', () => {
    it('expands "saturday" to all Saturday ISO dates', () => {
      const result = parseQuery('saturday');
      expect(result.dates.size).toBeGreaterThan(0);
      for (const d of result.dates) {
        const dow = new Date(d + 'T12:00:00').getDay();
        expect(dow).toBe(6); // Saturday
      }
    });

    it('expands "monday" to all Monday ISO dates', () => {
      const result = parseQuery('monday');
      expect(result.dates.size).toBeGreaterThan(0);
      for (const d of result.dates) {
        const dow = new Date(d + 'T12:00:00').getDay();
        expect(dow).toBe(1); // Monday
      }
    });

    it('handles plural "saturdays"', () => {
      const result = parseQuery('saturdays');
      expect(result.dates.size).toBeGreaterThan(0);
    });
  });

  describe('specific date parsing', () => {
    it('parses "july 22" → 2028-07-22', () => {
      const result = parseQuery('july 22');
      expect(result.dates.has('2028-07-22')).toBe(true);
    });

    it('parses "jul 15" → 2028-07-15', () => {
      const result = parseQuery('jul 15');
      expect(result.dates.has('2028-07-15')).toBe(true);
    });

    it('parses "the 22nd" → 2028-07-22', () => {
      const result = parseQuery('the 22nd');
      expect(result.dates.has('2028-07-22')).toBe(true);
    });

    it('ignores dates outside Olympics range', () => {
      const result = parseQuery('july 5');
      expect(result.dates.size).toBe(0);
    });
  });

  describe('venue/zone recognition', () => {
    it('recognizes "coliseum" → Exposition Park', () => {
      const result = parseQuery('coliseum');
      expect(result.zones.has('Exposition Park')).toBe(true);
    });

    it('recognizes "long beach"', () => {
      const result = parseQuery('long beach');
      expect(result.zones.has('Long Beach')).toBe(true);
    });

    it('recognizes "dtla" → DTLA', () => {
      const result = parseQuery('dtla');
      expect(result.zones.has('DTLA')).toBe(true);
    });

    it('recognizes "downtown" → DTLA', () => {
      const result = parseQuery('downtown');
      expect(result.zones.has('DTLA')).toBe(true);
    });
  });

  describe('gender extraction', () => {
    it('extracts "women\'s" → women', () => {
      const result = parseQuery("women's");
      expect(result.genders.has('women')).toBe(true);
    });

    it('extracts "men\'s" → men', () => {
      const result = parseQuery("men's");
      expect(result.genders.has('men')).toBe(true);
    });

    it('extracts "mixed"', () => {
      const result = parseQuery('mixed');
      expect(result.genders.has('mixed')).toBe(true);
    });
  });

  describe('full natural language queries', () => {
    it('"What swimming finals are on Saturday?"', () => {
      const result = parseQuery('What swimming finals are on Saturday?');
      expect(result.sports.has('Swimming')).toBe(true);
      expect(result.types.has('Final')).toBe(true);
      expect(result.dates.size).toBeGreaterThan(0);
      expect(result.remainder).toBe('');
    });

    it('"What events are happening at the Coliseum?"', () => {
      const result = parseQuery('What events are happening at the Coliseum?');
      expect(result.zones.has('Exposition Park')).toBe(true);
      expect(result.remainder).toBe('');
    });

    it('"When are all the Women\'s basketball games?"', () => {
      const result = parseQuery("When are all the Women's basketball games?");
      expect(result.genders.has('women')).toBe(true);
      expect(result.sports.has('Basketball')).toBe(true);
      expect(result.remainder).toBe('');
    });

    it('"polo finals saturday"', () => {
      const result = parseQuery('polo finals saturday');
      expect(result.sports.has('Water Polo')).toBe(true);
      expect(result.types.has('Final')).toBe(true);
      expect(result.dates.size).toBeGreaterThan(0);
    });

    it('"men\'s swimming prelims"', () => {
      const result = parseQuery("men's swimming prelims");
      expect(result.genders.has('men')).toBe(true);
      expect(result.sports.has('Swimming')).toBe(true);
      expect(result.types.has('Preliminary')).toBe(true);
    });
  });

  describe('stop word stripping', () => {
    it('strips question words from remainder', () => {
      const result = parseQuery('what is the schedule');
      expect(result.remainder).toBe('');
    });

    it('strips common filler words', () => {
      const result = parseQuery('show me all events for swimming');
      expect(result.sports.has('Swimming')).toBe(true);
      expect(result.remainder).toBe('');
    });
  });

  describe('remainder passthrough', () => {
    it('unrecognized words become remainder', () => {
      const result = parseQuery('xyz123 swimming');
      expect(result.sports.has('Swimming')).toBe(true);
      expect(result.remainder).toBe('xyz123');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      const result = parseQuery('');
      expect(hasSmartFilters(result)).toBe(false);
      expect(result.remainder).toBe('');
    });

    it('handles null', () => {
      const result = parseQuery(null);
      expect(hasSmartFilters(result)).toBe(false);
    });

    it('handles undefined', () => {
      const result = parseQuery(undefined);
      expect(hasSmartFilters(result)).toBe(false);
    });
  });

  describe('hasSmartFilters', () => {
    it('returns false when no filters extracted', () => {
      expect(hasSmartFilters(parseQuery('xyz123'))).toBe(false);
    });

    it('returns true when sport extracted', () => {
      expect(hasSmartFilters(parseQuery('swimming'))).toBe(true);
    });

    it('returns true when date extracted', () => {
      expect(hasSmartFilters(parseQuery('saturday'))).toBe(true);
    });
  });
});

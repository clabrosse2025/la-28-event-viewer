import events from '../data/events.json';

// Build vocabulary from actual data
const ALL_SPORTS = [...new Set(events.map((s) => s.sport))];
const ALL_ZONES = [...new Set(events.map((s) => s.zone))];
const ALL_VENUES = [...new Set(events.map((s) => s.venue))];

// Sport aliases: keyword → official sport name
const SPORT_ALIASES = {
  'track and field': 'Athletics (Track & Field)',
  'track': 'Athletics (Track & Field)',
  'marathon': 'Athletics (Marathon)',
  'race walk': 'Athletics (Race Walk)',
  'soccer': 'Football (Soccer)',
  'football': 'Football (Soccer)',
  'hoops': 'Basketball',
  'polo': 'Water Polo',
  'water polo': 'Water Polo',
  'bmx': 'BMX Freestyle',
  'mountain bike': 'Mountain Bike',
  'mountain biking': 'Mountain Bike',
  'mtb': 'Mountain Bike',
  'gymnastics': 'Artistic Gymnastics',
  'artistic gymnastics': 'Artistic Gymnastics',
  'rhythmic gymnastics': 'Rhythmic Gymnastics',
  'trampoline': 'Trampoline Gymnastics',
  'synchronized swimming': 'Artistic Swimming',
  'synchro': 'Artistic Swimming',
  'beach volleyball': 'Beach Volleyball',
  'table tennis': 'Table Tennis',
  'ping pong': 'Table Tennis',
  'flag football': 'Flag Football',
  'open water': 'Open Water Swimming',
  'open water swimming': 'Open Water Swimming',
  'shooting': 'Shooting (Rifle & Pistol)',
  'skateboarding': 'Skateboarding (Park)',
  'canoe': 'Canoe Slalom',
  'kayak': 'Canoe Slalom',
  'sailing': 'Sailing (Dinghy, Skiff &\nMultihull)',
  'cycling': 'Cycling Track',
  'road cycling': 'Cycling Road (Road Race)',
  'pentathlon': 'Modern Pentathlon',
  'modern pentathlon': 'Modern Pentathlon',
  'rugby': 'Rugby Sevens',
  'rugby sevens': 'Rugby Sevens',
  'rowing coastal': 'Rowing Coastal Beach Sprints',
};

// Session type aliases: keyword → official type
const TYPE_ALIASES = {
  'final': 'Final',
  'finals': 'Final',
  'gold medal': 'Final',
  'gold': 'Final',
  'semifinal': 'Semifinal',
  'semifinals': 'Semifinal',
  'semi-final': 'Semifinal',
  'semi': 'Semifinal',
  'semis': 'Semifinal',
  'quarterfinal': 'Quarterfinal',
  'quarterfinals': 'Quarterfinal',
  'quarter-final': 'Quarterfinal',
  'quarter': 'Quarterfinal',
  'preliminary': 'Preliminary',
  'prelim': 'Preliminary',
  'prelims': 'Preliminary',
  'heats': 'Preliminary',
  'qualification': 'Preliminary',
  'qualifying': 'Preliminary',
  'repechage': 'Repechage',
  'bronze': 'Bronze',
  'bronze medal': 'Bronze',
};

// Venue/zone aliases: keyword → zone name
const VENUE_ALIASES = {};
// Build from actual venue and zone names
for (const v of ALL_VENUES) {
  if (v && v !== 'N/A' && v !== 'TBD') {
    VENUE_ALIASES[v.toLowerCase()] = null; // will map to zone below
  }
}
// Map venue keywords to zones
for (const s of events) {
  if (s.venue && s.venue !== 'N/A' && s.venue !== 'TBD') {
    VENUE_ALIASES[s.venue.toLowerCase()] = s.zone;
  }
}
// Add common shorthand aliases
const VENUE_SHORTHAND = {
  'coliseum': 'Exposition Park',
  'memorial coliseum': 'Exposition Park',
  'la coliseum': 'Exposition Park',
  'dodger stadium': 'Pasadena',
  'dodgers': 'Pasadena',
  'rose bowl': 'Pasadena',
  'intuit dome': 'Inglewood',
  'sofi': 'Inglewood',
  'honda center': 'Anaheim',
  'convention center': 'DTLA',
  'la convention': 'DTLA',
  'dtla': 'DTLA',
  'downtown': 'DTLA',
  'long beach': 'Long Beach',
  'venice': 'Venice',
  'venice beach': 'Venice',
  'santa anita': 'Arcadia',
  'carson': 'Carson',
  'galen center': 'Exposition Park',
  'peacock theater': 'DTLA',
  'staples': 'DTLA',
};
Object.assign(VENUE_ALIASES, VENUE_SHORTHAND);

// Day names → ISO dates in 2028
const OLYMPICS_DATES = [
  '2028-07-10', '2028-07-11', '2028-07-12', '2028-07-13', '2028-07-14',
  '2028-07-15', '2028-07-16', '2028-07-17', '2028-07-18', '2028-07-19',
  '2028-07-20', '2028-07-21', '2028-07-22', '2028-07-23', '2028-07-24',
  '2028-07-25', '2028-07-26', '2028-07-27', '2028-07-28', '2028-07-29',
  '2028-07-30',
];

function getDayOfWeek(isoDate) {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
}

const DAY_TO_DATES = {};
for (const d of OLYMPICS_DATES) {
  const day = getDayOfWeek(d);
  if (!DAY_TO_DATES[day]) DAY_TO_DATES[day] = [];
  DAY_TO_DATES[day].push(d);
}
// Add short forms
for (const [long, dates] of Object.entries(DAY_TO_DATES)) {
  DAY_TO_DATES[long.slice(0, 3)] = dates; // "mon", "tue", etc.
}

// Month name → number
const MONTH_MAP = {
  'january': 1, 'jan': 1, 'february': 2, 'feb': 2, 'march': 3, 'mar': 3,
  'april': 4, 'apr': 4, 'may': 5, 'june': 6, 'jun': 6, 'july': 7, 'jul': 7,
  'august': 8, 'aug': 8, 'september': 9, 'sep': 9, 'october': 10, 'oct': 10,
  'november': 11, 'nov': 11, 'december': 12, 'dec': 12,
};

// Stop words to strip
const STOP_WORDS = new Set([
  'what', 'when', 'where', 'which', 'who', 'how', 'are', 'is', 'the',
  'on', 'at', 'in', 'for', 'of', 'a', 'an', 'all', 'any', 'do', 'does',
  'there', 'this', 'that', 'these', 'events', 'event', 'sessions', 'session',
  'games', 'game', 'schedule', 'happening', 'playing', 'played',
  'show', 'me', 'find', 'get', 'list', 'look', 'like',
]);

// Gender keywords
const GENDER_KEYWORDS = {
  "women's": 'women',
  'womens': 'women',
  'women': 'women',
  'female': 'women',
  "men's": 'men',
  'mens': 'men',
  'men': 'men',
  'male': 'men',
  'mixed': 'mixed',
};

/**
 * Parse a natural language query into structured filters.
 * Returns { sports: Set, zones: Set, dates: Set, types: Set, genders: Set, remainder: string }
 */
export function parseQuery(text) {
  const result = {
    sports: new Set(),
    zones: new Set(),
    dates: new Set(),
    types: new Set(),
    genders: new Set(),
    remainder: '',
  };

  if (!text || !text.trim()) return result;

  // Strip punctuation except apostrophes (needed for "men's", "women's")
  let remaining = text.toLowerCase().trim().replace(/[?!.,;:]+/g, ' ');

  // 1. Extract gender terms first (before "men" gets eaten by stop words)
  for (const [keyword, gender] of Object.entries(GENDER_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword.replace("'", "'")}\\b`, 'i');
    if (regex.test(remaining)) {
      result.genders.add(gender);
      remaining = remaining.replace(regex, ' ');
    }
  }

  // 2. Extract specific dates like "july 22" or "jul 15"
  remaining = remaining.replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/gi, (match, month, day) => {
    const m = MONTH_MAP[month.toLowerCase()];
    if (m) {
      const isoDate = `2028-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (OLYMPICS_DATES.includes(isoDate)) {
        result.dates.add(isoDate);
      }
    }
    return ' ';
  });

  // Also handle "the 22nd", "the 15th" etc. (assume July)
  remaining = remaining.replace(/\bthe\s+(\d{1,2})(st|nd|rd|th)?\b/gi, (match, day) => {
    const isoDate = `2028-07-${String(day).padStart(2, '0')}`;
    if (OLYMPICS_DATES.includes(isoDate)) {
      result.dates.add(isoDate);
    }
    return ' ';
  });

  // 3. Extract sport names (longest match first)
  // Build sorted list: aliases + actual sport names, longest first
  const sportEntries = [];
  for (const [alias, sport] of Object.entries(SPORT_ALIASES)) {
    sportEntries.push([alias, sport]);
  }
  for (const sport of ALL_SPORTS) {
    sportEntries.push([sport.toLowerCase(), sport]);
  }
  sportEntries.sort((a, b) => b[0].length - a[0].length);

  for (const [keyword, sport] of sportEntries) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(remaining)) {
      result.sports.add(sport);
      remaining = remaining.replace(regex, ' ');
    }
  }

  // 4. Extract session types (longest match first)
  const typeEntries = Object.entries(TYPE_ALIASES).sort((a, b) => b[0].length - a[0].length);
  for (const [keyword, type] of typeEntries) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(remaining)) {
      result.types.add(type);
      remaining = remaining.replace(regex, ' ');
    }
  }

  // 5. Extract day names
  for (const [day, dates] of Object.entries(DAY_TO_DATES)) {
    const regex = new RegExp(`\\b${day}s?\\b`, 'i'); // "saturdays" or "saturday"
    if (regex.test(remaining)) {
      for (const d of dates) result.dates.add(d);
      remaining = remaining.replace(regex, ' ');
    }
  }

  // 6. Extract venue/zone references (longest match first)
  const venueEntries = Object.entries(VENUE_ALIASES)
    .filter(([, zone]) => zone)
    .sort((a, b) => b[0].length - a[0].length);
  for (const [keyword, zone] of venueEntries) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(remaining)) {
      result.zones.add(zone);
      remaining = remaining.replace(regex, ' ');
    }
  }

  // 7. Strip stop words from remainder
  const words = remaining.split(/\s+/).filter((w) => w && !STOP_WORDS.has(w));
  result.remainder = words.join(' ').trim();

  return result;
}

/**
 * Check if a parsed query has any structured filters.
 */
export function hasSmartFilters(parsed) {
  return (
    parsed.sports.size > 0 ||
    parsed.zones.size > 0 ||
    parsed.dates.size > 0 ||
    parsed.types.size > 0 ||
    parsed.genders.size > 0
  );
}

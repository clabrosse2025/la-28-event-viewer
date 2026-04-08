#!/usr/bin/env python3
"""Parse LA 2028 Olympic Competition Schedule PDF into structured JSON."""

import json
import re
import subprocess
import sys
from pathlib import Path

# Map month names to numbers for ISO date conversion
MONTH_MAP = {
    "January": 1, "February": 2, "March": 3, "April": 4,
    "May": 5, "June": 6, "July": 7, "August": 8,
    "September": 9, "October": 10, "November": 11, "December": 12,
}


def parse_date_to_iso(date_str):
    """Convert 'Sunday, July 16' to '2028-07-16'."""
    if not date_str:
        return None
    m = re.match(r"\w+,\s+(\w+)\s+(\d+)", date_str.strip())
    if m:
        month = MONTH_MAP.get(m.group(1))
        day = int(m.group(2))
        if month:
            return f"2028-{month:02d}-{day:02d}"
    return None


def clean_descriptions(desc_str):
    """Split description string into list, filtering out noise."""
    if not desc_str:
        return []
    lines = [line.strip() for line in desc_str.split("\n")]
    # Filter out empty lines and "Not Ticketed"
    return [l for l in lines if l and l != "Not Ticketed"]


def parse_with_pdfplumber():
    """Extract events using pdfplumber table extraction."""
    import pdfplumber

    pdf_path = Path(__file__).parent.parent / "LA28OlympicGamesCompetitionScheduleByEventV3.0.pdf"
    pdf = pdfplumber.open(str(pdf_path))

    sessions = []
    seen_codes = set()

    for page in pdf.pages:
        tables = page.extract_tables({
            "vertical_strategy": "lines",
            "horizontal_strategy": "lines",
            "snap_tolerance": 5,
        })

        for table in tables:
            for row in table:
                if not row or len(row) < 10:
                    continue
                # Skip header rows and boilerplate
                if row[0] == "Sport" or (row[0] and "competition schedule" in str(row[0]).lower()):
                    continue

                session_code = (row[3] or "").strip()
                if not session_code or not re.match(r"[A-Z]{2,5}\d{2,3}$", session_code):
                    continue

                sport = (row[0] or "").strip()
                venue = (row[1] or "").strip()
                zone = (row[2] or "").strip()
                date_str = (row[4] or "").strip()
                games_day_str = (row[5] or "").strip()
                session_type = (row[6] or "").strip()
                description = (row[7] or "").strip()
                start_time = (row[8] or "").strip()
                end_time = (row[9] or "").strip()

                # Handle duplicate session codes (from cross-page splits)
                if session_code in seen_codes:
                    # Merge descriptions into existing session
                    for s in sessions:
                        if s["sessionCode"] == session_code:
                            new_descs = clean_descriptions(description)
                            for d in new_descs:
                                if d not in s["descriptions"]:
                                    s["descriptions"].append(d)
                            # Fill in missing fields
                            if not s["gamesDay"] and games_day_str:
                                try:
                                    s["gamesDay"] = int(games_day_str)
                                except ValueError:
                                    pass
                            if not s["sessionType"] and session_type:
                                s["sessionType"] = session_type
                            break
                    continue

                seen_codes.add(session_code)

                games_day = None
                if games_day_str:
                    try:
                        games_day = int(games_day_str)
                    except ValueError:
                        pass

                iso_date = parse_date_to_iso(date_str)

                sessions.append({
                    "sport": sport,
                    "venue": venue,
                    "zone": zone,
                    "sessionCode": session_code,
                    "date": date_str,
                    "isoDate": iso_date,
                    "gamesDay": games_day,
                    "sessionType": session_type if session_type and session_type != "N/A" else None,
                    "descriptions": clean_descriptions(description),
                    "startTime": start_time if start_time else None,
                    "endTime": end_time if end_time else None,
                })

    pdf.close()
    return sessions


def fill_missing_fields(sessions):
    """Fill missing sport/venue/zone from previous sessions with same code prefix."""
    # Some rows might have empty sport/venue due to PDF layout
    last_sport = ""
    last_venue = ""
    last_zone = ""

    for s in sessions:
        if s["sport"]:
            last_sport = s["sport"]
        else:
            s["sport"] = last_sport

        if s["venue"]:
            last_venue = s["venue"]
        else:
            s["venue"] = last_venue

        if s["zone"]:
            last_zone = s["zone"]
        else:
            s["zone"] = last_zone


def validate(sessions):
    """Run basic validation on parsed sessions."""
    errors = []
    for s in sessions:
        if not s["sport"]:
            errors.append(f'{s["sessionCode"]}: missing sport')
        if not s["sessionCode"]:
            errors.append(f'Row missing session code')
        if not s["isoDate"]:
            errors.append(f'{s["sessionCode"]}: missing/invalid date "{s["date"]}"')
        if not s["descriptions"]:
            errors.append(f'{s["sessionCode"]}: no descriptions')

    if errors:
        print(f"Validation warnings ({len(errors)}):", file=sys.stderr)
        for e in errors[:20]:
            print(f"  {e}", file=sys.stderr)
        if len(errors) > 20:
            print(f"  ... and {len(errors) - 20} more", file=sys.stderr)

    return len(errors)


def main():
    print("Parsing PDF with pdfplumber...", file=sys.stderr)
    sessions = parse_with_pdfplumber()
    print(f"Extracted {len(sessions)} sessions", file=sys.stderr)

    fill_missing_fields(sessions)

    # Sort by date then start time
    sessions.sort(key=lambda s: (s["isoDate"] or "", s["startTime"] or ""))

    error_count = validate(sessions)

    # Gather stats
    sports = set(s["sport"] for s in sessions if s["sport"])
    venues = set(s["venue"] for s in sessions if s["venue"])
    zones = set(s["zone"] for s in sessions if s["zone"])
    dates = set(s["isoDate"] for s in sessions if s["isoDate"])

    print(f"\nStats:", file=sys.stderr)
    print(f"  Sessions: {len(sessions)}", file=sys.stderr)
    print(f"  Sports: {len(sports)}", file=sys.stderr)
    print(f"  Venues: {len(venues)}", file=sys.stderr)
    print(f"  Zones: {len(zones)}", file=sys.stderr)
    print(f"  Dates: {len(dates)} ({min(dates)} to {max(dates)})", file=sys.stderr)
    print(f"  Validation issues: {error_count}", file=sys.stderr)

    # Write output
    output_path = Path(__file__).parent.parent / "src" / "data" / "events.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(sessions, f, indent=2)
    print(f"\nWrote {output_path}", file=sys.stderr)


if __name__ == "__main__":
    main()

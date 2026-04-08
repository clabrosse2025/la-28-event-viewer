export default function OlympicRings({ className = 'w-8 h-4' }) {
  return (
    <svg viewBox="0 0 503 228" className={className} aria-label="Olympic Rings">
      <g fill="none" strokeWidth="12">
        <circle cx="85" cy="85" r="75" stroke="#0085C7" />
        <circle cx="195" cy="85" r="75" stroke="#000" className="dark:stroke-white" />
        <circle cx="305" cy="85" r="75" stroke="#DF0024" />
        <circle cx="140" cy="143" r="75" stroke="#F4C300" />
        <circle cx="250" cy="143" r="75" stroke="#009F3D" />
      </g>
      {/* Interlocking overlaps */}
      <g fill="none" strokeWidth="12">
        {/* Blue over Yellow - bottom right of blue overlaps top left of yellow */}
        <path d="M 85 160 A 75 75 0 0 0 109 156" stroke="#0085C7" />
        {/* Yellow over Black - top right of yellow overlaps bottom left of black */}
        <path d="M 160 85 A 75 75 0 0 1 170 73" stroke="#F4C300" />
        {/* Black over Green - bottom right of black overlaps top left of green */}
        <path d="M 195 160 A 75 75 0 0 0 219 156" stroke="#000" className="dark:stroke-white" />
        {/* Green over Red - top right of green overlaps bottom left of red */}
        <path d="M 270 85 A 75 75 0 0 1 280 73" stroke="#009F3D" />
      </g>
    </svg>
  );
}

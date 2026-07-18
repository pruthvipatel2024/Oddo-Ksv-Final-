export function RouteMap({ eta }: { eta?: string }) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-ink-100 bg-teal-50 dark:border-ink-800 dark:bg-ink-800">
      <svg viewBox="0 0 400 220" className="h-full w-full">
        {/* mock street grid */}
        <g stroke="currentColor" className="text-teal-200 dark:text-ink-700" strokeWidth="1">
          {[40, 90, 140, 190, 240, 290, 340].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="220" />
          ))}
          {[30, 70, 110, 150, 190].map((y) => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} />
          ))}
        </g>
        {/* route path */}
        <path
          d="M50 190 C 120 160, 140 100, 200 90 S 300 40, 350 30"
          fill="none"
          stroke="#0E7C7B"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="50" cy="190" r="7" fill="#2FAE60" stroke="white" strokeWidth="2" />
        <circle cx="350" cy="30" r="7" fill="#E4572E" stroke="white" strokeWidth="2" />
        <g transform="translate(190,80)">
          <circle r="9" fill="#F2A93B" stroke="white" strokeWidth="2" />
        </g>
      </svg>
      {eta && (
        <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-soft dark:bg-ink-900/90 dark:text-ink-100">
          Arriving in {eta}
        </div>
      )}
    </div>
  );
}

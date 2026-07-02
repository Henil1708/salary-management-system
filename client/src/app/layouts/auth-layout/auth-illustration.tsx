// Hand-drawn vector for the auth panel — abstract compensation-analytics
// scene (rising pay bars, coin stack, connected people nodes) in soft tones
// that work on the muted panel in light and dark mode.
export const AuthIllustration = () => (
  <svg
    viewBox="0 0 600 800"
    preserveAspectRatio="xMidYMid slice"
    className="absolute inset-0 h-full w-full"
    role="img"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="auth-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#eef2ff" />
        <stop offset="55%" stopColor="#e0e7ff" />
        <stop offset="100%" stopColor="#c7d2fe" />
      </linearGradient>
      <linearGradient id="auth-bar" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
      <linearGradient id="auth-bar-soft" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#a5b4fc" />
        <stop offset="100%" stopColor="#c7d2fe" />
      </linearGradient>
    </defs>

    <rect width="600" height="800" fill="url(#auth-bg)" />

    {/* faint dot grid */}
    <g fill="#6366f1" opacity="0.12">
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={60 + col * 96} cy={60 + row * 96} r="3" />
        ))
      )}
    </g>

    {/* large soft blobs */}
    <circle cx="520" cy="120" r="140" fill="#818cf8" opacity="0.15" />
    <circle cx="60" cy="700" r="180" fill="#6366f1" opacity="0.12" />

    {/* rising salary bars */}
    <g transform="translate(120 300)">
      <rect x="0" y="220" width="64" height="120" rx="12" fill="url(#auth-bar-soft)" />
      <rect x="88" y="160" width="64" height="180" rx="12" fill="url(#auth-bar-soft)" />
      <rect x="176" y="90" width="64" height="250" rx="12" fill="url(#auth-bar)" />
      <rect x="264" y="0" width="64" height="340" rx="12" fill="url(#auth-bar)" />
      {/* trend line */}
      <path
        d="M 32 190 L 120 130 L 208 60 L 296 -40"
        fill="none"
        stroke="#4338ca"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="1 14"
      />
      <circle cx="296" cy="-40" r="12" fill="#4338ca" />
    </g>

    {/* coin stack */}
    <g transform="translate(430 560)">
      <ellipse cx="0" cy="60" rx="56" ry="20" fill="#f59e0b" opacity="0.85" />
      <ellipse cx="0" cy="40" rx="56" ry="20" fill="#fbbf24" opacity="0.9" />
      <ellipse cx="0" cy="20" rx="56" ry="20" fill="#f59e0b" opacity="0.85" />
      <ellipse cx="0" cy="0" rx="56" ry="20" fill="#fcd34d" />
      <text
        x="0"
        y="7"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fill="#92400e"
        fontFamily="ui-sans-serif, system-ui"
      >
        $
      </text>
    </g>

    {/* connected people nodes (org) */}
    <g stroke="#6366f1" strokeWidth="3" opacity="0.55">
      <line x1="150" y1="150" x2="260" y2="200" />
      <line x1="260" y1="200" x2="380" y2="150" />
      <line x1="260" y1="200" x2="250" y2="120" />
    </g>
    <g>
      {[
        { cx: 150, cy: 150 },
        { cx: 380, cy: 150 },
        { cx: 250, cy: 112 },
        { cx: 260, cy: 205 },
      ].map(({ cx, cy }, index) => (
        <g key={index} transform={`translate(${cx} ${cy})`}>
          <circle r="26" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
          <circle cy="-6" r="8" fill="#6366f1" />
          <path d="M -13 14 Q 0 0 13 14" fill="#6366f1" />
        </g>
      ))}
    </g>
  </svg>
);

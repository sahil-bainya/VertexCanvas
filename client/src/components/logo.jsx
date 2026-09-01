export default function Logo({ className = "w-10 h-10" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="70 70 360 360" className={`${className} text-base-content`} fill="none">
      {/* Frame + shaft + tip: ink color, follows text-base-content */}
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="100" y="100" width="300" height="300" rx="40" strokeWidth="14" />

        <g transform="translate(250,250) rotate(45)">
          <rect x="-25" y="-125" width="50" height="30" rx="12" strokeWidth="14" fill="var(--fallback-b1,#fff)" />
          <rect x="-25" y="-95" width="50" height="175" strokeWidth="14" fill="var(--fallback-b1,#fff)" />
          <line x1="0" y1="-95" x2="0" y2="80" strokeWidth="4" />
          <path d="M -25 80 C -15 87, -8 87, 0 80 C 8 87, 15 87, 25 80 L 0 125 Z" strokeWidth="14" fill="var(--fallback-b1,#fff)" />
          <polygon points="0,125 -12,105 12,105" fill="currentColor" stroke="none" />

          {/* Accent: nodes + orange band, follows text-primary */}
          <g className="text-primary" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <line x1="-25" y1="-105" x2="25" y2="-105" strokeWidth="8" />
            <line x1="-12" y1="25" x2="12" y2="0" strokeWidth="6" />
            <line x1="12" y1="0" x2="-12" y2="-40" strokeWidth="6" />
            <line x1="-12" y1="-40" x2="12" y2="-65" strokeWidth="6" />
            <circle cx="-12" cy="25" r="7" fill="currentColor" stroke="var(--fallback-b1,#fff)" strokeWidth="3" />
            <circle cx="12" cy="0" r="7" fill="currentColor" stroke="var(--fallback-b1,#fff)" strokeWidth="3" />
            <circle cx="-12" cy="-40" r="7" fill="currentColor" stroke="var(--fallback-b1,#fff)" strokeWidth="3" />
            <circle cx="12" cy="-65" r="7" fill="currentColor" stroke="var(--fallback-b1,#fff)" strokeWidth="3" />
          </g>
        </g>
      </g>

      {/* Sparkle: also primary */}
      <g className="text-primary" fill="currentColor">
        <path d="M 355 145 Q 355 152 348 152 Q 355 152 355 159 Q 355 152 362 152 Q 355 152 355 145 Z" />
        <circle cx="335" cy="170" r="2.5" />
      </g>
    </svg>
  );
}
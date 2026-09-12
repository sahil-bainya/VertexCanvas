export default function Logo({ 
  h = 10, 
  w = 10, 
  vColor = "text-base-content", 
  cColor = "text-primary",
  nodeColor = "text-primary/50",
  className = "" 
}) {
  const isNumeric = (val) => !isNaN(val) && !isNaN(parseFloat(val));
  const isTailwindUnit = isNumeric(w) && isNumeric(h) && Number(w) <= 96;

  const sizeClasses = isTailwindUnit ? `w-${w} h-${h}` : "";
  const inlineStyles = !isTailwindUnit 
    ? {
        width: isNumeric(w) ? `${w}px` : w,
        height: isNumeric(h) ? `${h}px` : h,
      } 
    : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 20 400 512"
      className={`${sizeClasses} ${className}`}
      style={inlineStyles}
    >
      <defs>
        <mask id="vc-node-gap">
          <rect width="512" height="512" fill="white" />
          <circle cx="206" cy="320" r="28" fill="black" />
          <line
            x1="206"
            y1="320"
            x2="290"
            y2="170"
            stroke="black"
            strokeWidth="26"
            strokeLinecap="round"
          />
        </mask>
      </defs>

      {/* 'V' glyph */}
      <path
        className={vColor}
        fill="currentColor"
        d="M 112 212 
           H 154 
           L 206 332 
           L 258 212 
           H 300 
           L 232 356 
           Q 224 370 206 370 
           Q 188 370 180 356 
           Z"
        mask="url(#vc-node-gap)"
      />

      {/* 'C' glyph */}
      <path
        className={cColor}
        fill="currentColor"
        d="M 396 235 
           C 382 220 362 210 334 210 
           C 285 210 248 248 248 300 
           C 248 352 285 390 334 390 
           C 362 390 382 380 396 365 
           L 370 336 
           C 360 346 348 352 334 352 
           C 305 352 286 330 286 300 
           C 286 270 305 248 334 248 
           C 348 248 360 254 370 264 
           Z"
      />

      {/* Graph / Node Connector */}
      <g 
        className={nodeColor}
        stroke="currentColor" 
        fill="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="206" y1="320" x2="290" y2="170" strokeWidth="14" />
        <circle cx="206" cy="320" r="18" strokeWidth="0" />
        <circle cx="290" cy="170" r="22" strokeWidth="0" />
      </g>
    </svg>
  );
}
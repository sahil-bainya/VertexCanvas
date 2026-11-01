export default function DotGrid({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 text-zinc-900/10 ${className}`}
      style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    />
  );
}
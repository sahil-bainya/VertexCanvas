const TECH = [
  "React",
  "Konva.js",
  "Node.js",
  "Socket.io",
  "MongoDB",
  "Groq AI",
];

export default function TechStack() {
  return (
    <section className="px-6! pb-24! flex justify-center">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3">
        {TECH.map((t) => (
          <span
            key={t}
            className="
    inline-flex items-center
    rounded-full
    border border-neutral-200
    bg-neutral-50/50!
    px-3! py-1.5!
    font-mono text-sm font-medium
    text-zinc-900/80
    shadow-sm
    transition-all duration-200
    hover:-translate-y-0.5
    hover:border-indigo-700/40
    hover:bg-indigo-700/5
    hover:text-indigo-700
    hover:shadow-md
  "
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}
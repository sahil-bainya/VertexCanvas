import {Icon} from "./"
const FEATURES = [
  {
    icon: "pen",
    title: "Custom canvas engine",
    body: "10+ shapes, arrows, and freehand drawing with full undo/redo history.",
  },
  {
    icon: "spark",
    title: "AI diagram assistant",
    body: "Get suggestions, catch errors, and turn messy sketches into clean diagrams.",
  },
  {
    icon: "cursor",
    title: "Real-time collaboration",
    body: "See teammates' cursors move and edits sync the instant they happen.",
  },
  {
    icon: "lock",
    title: "Access control",
    body: "Invite people to a board and approve join requests as they come in.",
  },
  {
    icon: "note",
    title: "Context layer",
    body: "Pin notes, links, and code snippets directly onto any part of the canvas.",
  },
  {
    icon: "download",
    title: "Export & notes",
    body: "Ship your work out as PNG or PDF, with the notes panel included.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative px-6! py-24! flex justify-center">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display max-w-md text-[30px] font-semibold tracking-tight text-base-content">
          Everything the canvas needs
        </h2>
        <p className="mt-3! max-w-md text-[15px] text-base-content/60">
          Six connected pieces, built to work as one board.
        </p>

        <div className="relative mt-14!  grid grid-cols-1 gap-x-15 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          <svg
            className="pointer-events-none absolute inset-0 hidden text-base-300 lg:block"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          >
            <line
              x1="33.3%"
              y1="10%"
              x2="33.3%"
              y2="90%"
              stroke="currentColor"
              strokeDasharray="3 5"
            />
            <line
              x1="66.6%"
              y1="10%"
              x2="66.6%"
              y2="90%"
              stroke="currentColor"
              strokeDasharray="3 5"
            />
          </svg>

          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card relative z-10 border-2 border-primary/40 bg-base-200 p-6!"
            >
              <div className="mb-4! flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Icon name={f.icon} className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-lg font-medium text-base-content">
                {f.title}
              </h3>
              <p className="mt-2! text-sm leading-relaxed text-base-content/60">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
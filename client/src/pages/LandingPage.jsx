import { useState, useEffect } from "react";
import Logo from "../components/logo.jsx";
function Icon({ name, className = "" }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
  };
  switch (name) {
    case "pen":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
        </svg>
      );
    case "cursor":
      return (
        <svg {...common}>
          <path d="M4 4l7 16 2-7 7-2z" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="9" rx="1.5" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case "note":
      return (
        <svg {...common}>
          <path d="M6 3h9l5 5v13H6z" />
          <path d="M15 3v5h5" />
          <path d="M9 12h6M9 16h6" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12m0 0-4-4m4 4 4-4" />
          <path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M5 12l5 5L19 7" />
        </svg>
      );
    case "cross":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
      );
    default:
      return null;
  }
}

function DotGrid({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 text-base-content/10 ${className}`}
      style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    />
  );
}

const GITHUB_REPO = "https://github.com/sahil-bainya/VertexCanvas";
const GITHUB_PROFILE = "https://github.com/sahil-bainya";
const LINKEDIN_URL = "https://www.linkedin.com/in/sahil-bainya-097575327/";
const EMAIL = "sahilbainya2005@gmail.com";
const LIVE_DEMO = "https://vertexcanvas-teal.vercel.app";

function useGithubStars() {
  const [stars, setStars] = useState(0);
  useEffect(() => {
    fetch("https://api.github.com/repos/sahil-bainya/VertexCanvas")
      .then((r) => r.json())
      .then((d) => setStars(d.stargazers_count || 0))
      .catch(() => setStars(0));
  }, []);
  return stars;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const stars = useGithubStars();
  const links = [
    { label: "Features", href: "#features" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "Docs", href: "#docs" },
  ];
  return (
    <div className="navbar relative z-20 border-b border-base-300 px-6! py-3!">
      <div className="navbar-start">
        <div className="flex flex-row items-center gap-0">
          <Logo h={50} w={50} />
          <div>
            <h1 className="flex items-center gap-2 font-sans text-l md:text-2xl font-bold tracking-tight text-base-content">
              <span>
                Vertex<span className="text-primary">Canvas</span>
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1! gap-1">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="px-3! text-md font-semibold text-base-content/70 py-1!  rounded-2xl"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end hidden gap-3 md:flex">
        <a
          href={GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-soft  gap-1.5 p-3!  rounded-full"
        >
          <Icon name="github" className="h-3.5 w-3.5" />
          Star <span className="text-base-content">{stars}</span>
        </a>

        <div className="aura aura-sm">
          <a
            href="/login"
            className="p-3! text-md btn btn-sm border-none bg-linear-to-r from-primary to-secondary text-primary-content"
          >
            Get started
          </a>
        </div>
      </div>

      <div className="navbar-end md:hidden">
        <button
          aria-label="Toggle menu"
          className="btn btn-square btn-ghost btn-sm text-base-content"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full w-full border-b border-base-300 bg-base-100 px-6! py-4! md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[14px] text-base-content/70"
              >
                {l.label}
              </a>
            ))}
            <a href="/login" className="text-[14px] text-base-content/70">
              Sign in
            </a>
            <a
              href="/login"
              className="btn border-none bg-linear-to-r from-primary to-secondary text-primary-content"
            >
              Get started
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Hero() {
  const stars = useGithubStars();
  return (
    <section className="hero relative overflow-hidden px-6! pb-20! pt-20! md:pb-28! md:pt-28!">
      <DotGrid className="opacity-70" />

      <svg
        className="pointer-events-none absolute -left-6 top-24 h-16 w-16 text-accent/20 md:left-10"
        viewBox="0 0 60 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect
          x="6"
          y="6"
          width="40"
          height="40"
          rx="6"
          transform="rotate(-8 26 26)"
        />
      </svg>
      <svg
        className="pointer-events-none absolute right-8 top-16 h-20 w-20 text-secondary/20"
        viewBox="0 0 60 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="30" cy="30" r="22" />
      </svg>
      <svg
        className="pointer-events-none absolute bottom-10 right-1/4 h-10 w-24 text-primary/20"
        viewBox="0 0 100 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 30 Q40 4 98 20" strokeLinecap="round" />
      </svg>

      <div className="hero-content relative mx-0! max-w-3xl! flex-col items-start p-0! text-left">
        <h1 className="font-display text-[40px] font-semibold leading-[1.08] tracking-tight text-base-content md:text-[60px]">
          Design smarter.
          <br />
          <span className="relative inline-block">
            Collaborate faster.
            <svg
              className="absolute -bottom-2! left-0 w-full motion-safe:animate-[draw_1.1s_ease-out_0.2s_both]"
              viewBox="0 0 320 14"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 9c40-7 240-7 316 2"
                className="stroke-primary"
                strokeWidth="4"
                strokeLinecap="round"
                pathLength="1"
                style={{ strokeDasharray: 1, strokeDashoffset: 0 }}
              />
            </svg>
          </span>
        </h1>

        <p className="mt-6! max-w-xl text-[17px] leading-relaxed text-base-content/60">
          A real-time collaborative whiteboard with AI-powered diagram analysis,
          auto-layout, and code generation — all in one canvas.
        </p>

        <div className="mt-9! flex flex-wrap items-center gap-4">
          <div className="aura aura-glow">
            <a
              href="/login"
              className="btn btn-lg border-none bg-linear-to-r from-primary to-secondary px-6! py-3! text-[15px] font-medium text-primary-content"
            >
              Start drawing free
            </a>
          </div>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-lg gap-2 px-5! py-3! text-[15px]"
          >
            <Icon name="github" className="h-4 w-4" />
            View on GitHub
            <span className="text-base-content/60">★ {stars}</span>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[draw_1\\.1s_ease-out_0\\.2s_both\\] { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
    </section>
  );
}

function DemoPreview() {
  return (
    <section className="flex justify-center px-6! pb-24!">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-base-300 bg-base-300 shadow-xl">
        {/* Replace src with your actual screenshot or GIF */}
        <img
          src="https://res.cloudinary.com/datjhn3ph/image/upload/v1789636398/Screenshot_2026-09-17_144104_x51klo.png"
          alt="VertexCanvas — collaborative canvas with AI suggestions and live cursors"
          className="h-auto w-full"
          onError={(e) => {
            // Fallback UI if image not found
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
        <div
          style={{ display: "none" }}
          className="aspect-video items-center justify-center p-4!"
        >
          <div className="text-center">
            <div className="mx-auto mb-3! flex h-10 w-10 items-center justify-center rounded-full border border-base-300 text-base-content/60">
              <Icon name="cursor" className="h-4 w-4" />
            </div>
            <p className="text-[14px] text-base-content/60">
              Product preview coming soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

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

function Features() {
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

const AI_ITEMS = [
  {
    label: "Analyze",
    body: "Spot errors and inconsistencies as you draw, with fixes suggested inline.",
  },
  {
    label: "Organize",
    body: "Auto-arrange a tangled diagram into a clean, readable layout in one click.",
  },
  {
    label: "Generate",
    body: "Describe what you need in a sentence — get a structured diagram back.",
  },
  {
    label: "Code",
    body: "Turn a diagram straight into Python, C++, SQL, or a Mongoose schema.",
  },
];

function AIShowcase() {
  return (
    <section className="px-6! py-24! flex justify-center">
      <div className="aura aura-holo aura-lg mx-auto max-w-5xl">
        <div className="card border border-base-300 bg-linear-to-br from-base-200 to-base-300 p-8! md:p-12!">
          <span className="text-[13px] font-medium text-secondary">
            What sets it apart
          </span>
          <h2 className="font-display mt-3! max-w-lg text-[28px] font-semibold tracking-tight text-base-content md:text-[32px]">
            AI that understands your diagrams
          </h2>

          <div className="mt-10! grid grid-cols-1 gap-8 sm:grid-cols-2">
            {AI_ITEMS.map((item, i) => (
              <div key={item.label} className="flex gap-4">
                <span className="mt-0.5! flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-[12px] font-semibold text-primary-content">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-medium text-base-content">
                    {item.label}
                  </h3>
                  <p className="mt-1.5! text-[14px] leading-relaxed text-base-content/60">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const COMPARISON_ROWS = [
  {
    label: "Real-time collaboration",
    excalidraw: true,
    eraser: true,
    vertex: true,
  },
  {
    label: "Custom canvas engine",
    excalidraw: true,
    eraser: false,
    vertex: true,
  },
  {
    label: "AI diagram analysis",
    excalidraw: false,
    eraser: true,
    vertex: true,
  },
  { label: "Code generation", excalidraw: false, eraser: false, vertex: true },
  {
    label: "Binary-encoded sync",
    excalidraw: false,
    eraser: false,
    vertex: true,
  },
  { label: "Open source (MIT)", excalidraw: true, eraser: false, vertex: true },
];

function Mark({ ok }) {
  return ok ? (
    <Icon name="check" className="mx-auto h-6 w-6 text-success" />
  ) : (
    <Icon name="cross" className="mx-auto h-5 w-5 text-base-content/30" />
  );
}

function ComparisonTable() {
  return (
    <section className="px-6! py-24! flex justify-center">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-display text-center text-[28px] font-semibold tracking-tight text-base-content">
          Why VertexCanvas
        </h2>

        <div className="mt-10! overflow-x-auto rounded-xl border border-base-300">
          <table className="table">
            <thead> 
              <tr className="bg-base-200">
                <th className="text-base-content/70 p-3! px-15!">Feature</th>
                <th className="text-center text-base-content/70 px-15!">
                  Excalidraw
                </th>
                <th className="text-center text-base-content/70 px-15!">Eraser.io</th>
                <th className="text-center text-base-content px-15!">VertexCanvas</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="text-base-content p-2! px-10!">{row.label}</td>
                  <td className=" pl-20!">
                    <Mark ok={row.excalidraw} />
                  </td>
                  <td className="pl-20! ">
                    <Mark ok={row.eraser} />
                  </td>
                  <td className="bg-primary/5  pl-20! ">
                    <Mark ok={row.vertex} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    title: "Create a board",
    body: "Start a fresh canvas or pick from a template in a couple of clicks.",
  },
  {
    title: "Draw or describe your idea",
    body: "Sketch it by hand, or type a sentence and let AI lay it out.",
  },
  {
    title: "Let AI analyze & suggest",
    body: "Catch errors and tidy up structure before you share it.",
  },
  {
    title: "Collaborate in real time",
    body: "Invite your team in and watch the board update live.",
  },
];

function HowItWorks() {
  return (
    <section id="roadmap" className="px-6! py-24! flex justify-center">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-[28px] font-semibold tracking-tight text-base-content">
          How it works
        </h2>

        <div className="mt-12! grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-base-content/60">
                  {i + 1}
                </span>
                <div className="h-px flex-1 bg-base-300" />
              </div>
              <h3 className="mt-4! text-[16px] font-medium text-base-content">
                {step.title}
              </h3>
              <p className="mt-2! text-[14px] leading-relaxed text-base-content/60">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TECH = [
  "React",
  "Konva.js",
  "Node.js",
  "Socket.io",
  "MongoDB",
  "Groq AI",
];

function TechStack() {
  return (
    <section className="px-6! pb-24! flex justify-center">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3">
        {TECH.map((t) => (
          <span
            key={t}
            className="
    inline-flex items-center
    rounded-full
    border border-base-300
    bg-base-200/50!
    px-3! py-1.5!
    font-mono text-sm font-medium
    text-base-content/80
    shadow-sm
    transition-all duration-200
    hover:-translate-y-0.5
    hover:border-primary/40
    hover:bg-primary/5
    hover:text-primary
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

function OpenSource() {
  return (
    <section id="opensource" className="px-6! py-24! flex justify-center">
      <div className="aura aura-gold mx-auto max-w-3xl">
        <div className="card border border-base-300 bg-base-200 p-10! text-center">
          <h2 className="font-display text-[24px] font-semibold tracking-tight text-base-content">
            Free and open source
          </h2>
          <p className="mt-2! text-sm text-base-content/60">
            VertexCanvas is released under the MIT license. Contributions
            welcome.
          </p>
          <div className="mt-6! flex flex-wrap items-center justify-center gap-4">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3! btn gap-2 border-none bg-linear-to-r from-primary to-secondary text-primary-content"
            >
              <Icon name="github" className="h-4 w-4" />
              GitHub
            </a>
           
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6! pb-24! text-center">
      <h2 className="font-display text-[28px] font-semibold tracking-tight text-base-content">
        Ready to start?
      </h2>
      <a
        href="/login"
        className="btn btn-lg mt-6! inline-block border-none bg-linear-to-r from-primary to-secondary px-6! py-3! text-[15px] font-medium text-primary-content"
      >
        Start drawing free
      </a>
      <p className="mt-4! text-[13px] text-base-content/60">
        No credit card. No signup fees. Just open and create.
      </p>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Roadmap", href: "#roadmap" },
        { label: "Docs", href: "#docs" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "GitHub", href: GITHUB_REPO },
        { label: "Live Demo", href: LIVE_DEMO },
        { label: "README", href: `${GITHUB_REPO}#readme` },
      ],
    },  
    {
      title: "Connect",
      links: [
        { label: "GitHub", href: GITHUB_PROFILE },
        { label: "LinkedIn", href: LINKEDIN_URL },
        { label: "Email", href: `mailto:${EMAIL}` },
      ],
    },
  ];
  return (
    <footer id="docs" className="border-t border-base-300 px-6! py-5! bg-base-200">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-1">
            <Logo h={55} w={55}/>
            <span className="font-display text-lg font-semibold text-base-content">
              VertexCanvas
            </span>
          </div>
          <p className="mt-3! max-w-55   text-[13px] text-base-content/60">
            A Space to Think, Create &amp; Collaborate.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-[13px] font-medium text-base-content">
              {col.title}
            </h4>
            <ul className="mt-3! space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      l.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="link link-hover text-[13px] text-base-content/60"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-base-100 font-sans text-base-content">
      <DotGrid className="opacity-40" />
      <div className="relative">
        <Navbar />
        <Hero />
        <DemoPreview />
        <Features />
        <AIShowcase />
        <ComparisonTable />
        <HowItWorks />
        <TechStack />
        <OpenSource />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}

import useGithubStars from "./useGithubStars.js";
import {DotGrid,Icon} from "./"
const GITHUB_REPO = "https://github.com/sahil-bainya/VertexCanvas";
export default function Hero() {
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
import { SquarePlus, PenTool, BrainCircuit, Users } from "lucide-react";
const STEPS = [
  {
    title: "Create a board",
    body: "Start a fresh canvas.",
    icon: SquarePlus,
    accent: "text-sky-600 bg-sky-500/10 border-sky-500/40",
    image:
      "https://res.cloudinary.com/datjhn3ph/image/upload/v1791632630/Screenshot_2026-10-10_170817_gvbftd.png",
  },
  {
    title: "Draw or describe your idea",
    body: "Sketch it by hand, or type a sentence and let AI lay it out.",
    icon: PenTool,
    accent: "text-violet-600 bg-violet-500/10 border-violet-500/40",
    image:
      "https://res.cloudinary.com/datjhn3ph/image/upload/v1791632650/Screenshot_2026-10-10_170947_efdayr.png",
  },
  {
    title: "Let AI analyze & suggest",
    body: "Catch errors and tidy up structure before you share it.",
    icon: BrainCircuit,
    accent: "text-amber-600 bg-amber-500/10 border-amber-500/40",
    image:
      "https://res.cloudinary.com/datjhn3ph/image/upload/v1791632559/Screenshot_2026-09-13_171635_gybhab.png",
  },
  {
    title: "Collaborate in real time",
    body: "Invite your team in and watch the board update live.",
    icon: Users,
    accent: "text-emerald-600 bg-emerald-500/10 border-emerald-500/40",
    image:
      "https://res.cloudinary.com/datjhn3ph/image/upload/v1791632600/Screenshot_2026-09-13_195943_nm55ac.png",
  },
];

export default function HowItWorks() {
  return (
    <section id="roadmap" className="px-6! py-24! flex justify-center">
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="font-display text-[28px] font-semibold tracking-tight text-base-content">
          How it works
        </h2>

        <ol className="mt-16!">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === STEPS.length - 1;

            return (
              <li
                key={step.title}
                className="relative flex gap-5 sm:gap-8 pb-20! last:pb-0!"
              >
                {/* Timeline rail: icon node + connecting line */}
                <div className="flex flex-col items-center">
                  <span
                    className={`z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] ${step.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {!isLast && (
                    <span className="mt-2! w-0.5 flex-1 rounded-full bg-primary/20" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="mt-3! font-display text-[32px] font-semibold leading-tight tracking-tight text-base-content">
                    {step.title}
                  </h3>

                  <p className="mt-3! max-w-2xl text-[15px] leading-relaxed text-base-content/70">
                    {step.body}
                  </p>

                  {/* Browser-style frame */}
                  <div className="relative mt-8!">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-x-4 -bottom-8 h-40 bg-primary/15 blur-3xl"
                    />
                    <div className="relative overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-xl shadow-primary/10">
                      <img
                        src={step.image}
                        alt={step.title}
                        loading="lazy"
                        className="block aspect-video w-full object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

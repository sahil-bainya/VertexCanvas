import { FaGithub, FaLinkedinIn, FaEnvelope } from "react-icons/fa6";
import Logo from "../logo.jsx";
const GITHUB_REPO = "https://github.com/sahil-bainya/VertexCanvas";

const GITHUB_PROFILE = "https://github.com/sahil-bainya";
const LINKEDIN_URL = "https://www.linkedin.com/in/sahil-bainya-097575327/";
const EMAIL = "sahilbainya2005@gmail.com";
const LIVE_DEMO = "https://vertexcanvas-teal.vercel.app";
const DOODLE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' fill='none' stroke='white' stroke-opacity='0.06' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='M20 40c10-14 20 14 30 0s20 14 30 0'/%3E%3Ccircle cx='170' cy='50' r='9'/%3E%3Cpath d='M40 150l16 16m0-16l-16 16'/%3E%3Cpath d='M130 130c20-20 40 20 60 0'/%3E%3Cpath d='M190 190l12-24'/%3E%3Cpath d='M80 210h30'/%3E%3C/svg%3E")`;

export default function Footer() {
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
  ];

  const socials = [
    { label: "GitHub", href: GITHUB_PROFILE, icon: FaGithub },
    { label: "LinkedIn", href: LINKEDIN_URL, icon: FaLinkedinIn },
    { label: "Email", href: `mailto:${EMAIL}`, icon: FaEnvelope },
  ];

  return (
    <footer
      id="docs"
      className="bg-[#1b1b1f] px-6! py-10!"
      style={{ backgroundImage: DOODLE }}
    >
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-12 lg:flex-row">
        {/* Brand + socials */}
        <div>
          <div className="flex items-center gap-1">
            <Logo h={55} w={55} />
            <span className="font-display text-xl font-bold tracking-wide text-[#c4c1ff]">
              VertexCanvas
            </span>
          </div>

          <p className="mt-3! max-w-60 text-[13px] text-white/60">
            A Space to Think, Create &amp; Collaborate.
          </p>

          <div className="mt-6! flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-white/80 transition hover:bg-black hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-16 gap-y-10 sm:grid-cols-3">
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[14px] font-semibold text-[#c4c1ff]">
                {col.title}
              </h4>
              <ul className="mt-4! space-y-2">
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
                      className="text-[13px] text-white/70 transition hover:text-white hover:underline"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

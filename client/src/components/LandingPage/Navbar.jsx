import { useState } from "react";
import Logo from "../logo";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  
  const links = [
    { label: "Features", href: "#features" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "Docs", href: "#docs" },
  ];
  return (
    <div className="navbar backdrop-blur-md bg-base z-20 border-2 border-base-300 px-4!  fixed">
      <div className="navbar-start">
        <div className="flex flex-row items-center gap-0">
          <Logo h={70} w={70} />
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
            href="/login"
            className="p-4! rounded-full text-md btn btn-sm border-none bg-linear-to-r from-primary to-secondary text-primary-content"
          >
            Get started
          </a>
        
      </div>

      <div className="navbar-end md:hidden">
        <button
          aria-label="Toggle menu"
          className="btn btn-square btn-ghost btn-sm text-base-content "
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
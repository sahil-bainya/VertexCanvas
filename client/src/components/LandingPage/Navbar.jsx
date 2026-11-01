import { useState } from "react";
import Logo from "../logo";
import {ArrowRight} from "lucide-react"
import "./Styling.css";
export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "Docs", href: "#docs" },
  ];
  return (
    <div className="navbar backdrop-blur-sm bg-base-600 z-20 border-b-2 border-neutral-200 px-4!  fixed">
      <div className="navbar-start">
        <div className="flex flex-row items-center gap-0">
          <Logo h={70} w={70} />
          <div>
            <h1 className="flex items-center gap-2 font-sans text-l md:text-2xl font-bold tracking-tight text-zinc-900">
              <span>
                Vertex<span className="text-indigo-700">Canvas</span>
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
                className="px-3! text-md font-semibold text-zinc-900/70 py-1!  rounded-2xl"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end hidden gap-3 md:flex">
        <a href="/login">
          <button className="cssbuttons-io-button">
            Get started
            <div className="icon">
              <ArrowRight />
            </div>
          </button>
        </a>
      </div>

      <div className="navbar-end md:hidden">
        <button
          aria-label="Toggle menu"
          className="btn btn-square btn-ghost btn-sm text-zinc-900 "
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
        <div className="absolute left-0 top-full w-full border-b border-neutral-200 bg-white px-6! py-4! md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[14px] text-zinc-900/70"
              >
                {l.label}
              </a>
            ))}

            <a
              href="/login"
              className="btn border-none bg-linear-to-r bg-[#6C3CEB] text-white hover:bg-[#5830C7] rounded-xl shadow-md"
            >
              Get started
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

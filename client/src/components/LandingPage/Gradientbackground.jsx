import { useEffect, useRef } from "react";

/**
 * Transparent fixed overlay: only a subtle grid + cursor-tracking particle trail.
 * Place once at the top of a page; content should sit above with `relative z-10`.
 */
export default function GradientBackground({ className = "" }) {
  const particlesContainerRef = useRef(null);

  useEffect(() => {
    const container = particlesContainerRef.current;
    if (!container) return;

    const timeouts = [];

    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 100;
      const mouseY = (e.clientY / window.innerHeight) * 100;

      const particle = document.createElement("div");
      particle.className =
        "absolute rounded-full bg-indigo-400 pointer-events-none";
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${mouseX}%`;
      particle.style.top = `${mouseY}%`;
      particle.style.opacity = "0.6";
      container.appendChild(particle);

      const t1 = setTimeout(() => {
        particle.style.transition = "all 2s ease-out";
        particle.style.left = `${mouseX + (Math.random() * 10 - 5)}%`;
        particle.style.top = `${mouseY + (Math.random() * 10 - 5)}%`;
        particle.style.opacity = "0";
        const t2 = setTimeout(() => particle.remove(), 2000);
        timeouts.push(t2);
      }, 10);
      timeouts.push(t1);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      timeouts.forEach(clearTimeout);
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage:
            "linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)",
        }}
      />

      {/* Cursor particles */}
      <div
        ref={particlesContainerRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
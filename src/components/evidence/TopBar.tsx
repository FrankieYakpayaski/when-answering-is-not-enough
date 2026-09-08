import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

export const NAV = [
  { id: "opening", label: "Opening" },
  { id: "corpus", label: "Corpus" },
  { id: "pathway", label: "Failure pathway" },
  { id: "language", label: "Language" },
  { id: "framing", label: "Framing" },
  { id: "profiles", label: "Profiles" },
  { id: "explorer", label: "Evidence explorer" },
];

export function TopBar() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const pick = () => {
      const top = 61;
      const bottom = window.innerHeight * 0.34;
      let best: string | null = null;
      let bestArea = 0;
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const area = Math.min(r.bottom, bottom) - Math.max(r.top, top);
        if (area > bestArea) {
          bestArea = area;
          best = n.id;
        }
      }
      setActive(bestArea > 0 ? best : null);
    };
    const obs = new IntersectionObserver(
      () => {
        pick();
      },
      { rootMargin: "-60px 0px -66% 0px", threshold: 0 },
    );
    const els = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    els.forEach((el) => obs.observe(el));
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    pick();
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, []);

  return (
    <header className="br-topbar">
      <Link to="/" className="br-topbar-title">
        When Answering Is Not Enough
      </Link>
      <nav aria-label="Sections" className="br-navwrap">
        <ul className="br-nav">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? "true" : undefined}
                onClick={() => setActive(n.id)}
              >
                {n.label}
              </a>
            </li>
          ))}
          <li>
            <Link to="/summary">Summary</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

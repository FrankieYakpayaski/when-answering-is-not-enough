import { useEffect, useState } from "react";

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
    const seen = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best: string | null = null;
        for (const n of NAV) {
          if ((seen.get(n.id) ?? 0) > 0) {
            best = n.id;
            break;
          }
        }
        setActive(best);
      },
      { rootMargin: "-60px 0px -66% 0px", threshold: 0 },
    );
    const els = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <header className="br-topbar">
      <p className="br-topbar-title">Beyond refusal</p>
      <nav aria-label="Sections" className="br-navwrap">
        <ul className="br-nav">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? "true" : undefined}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

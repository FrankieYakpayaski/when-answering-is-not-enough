import { useEffect, useRef } from "react";
import {
  LANG_ATTR,
  color,
  klassOf,
  promptFor,
  type Dataset,
  type Rec,
} from "@/lib/dataset";

export function RecordDrawer({
  d,
  dark,
  rec,
  onClose,
}: {
  d: Dataset;
  dark: boolean;
  rec: Rec | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!rec) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rec, onClose]);

  if (!rec) return null;

  const k = klassOf(d, rec);
  const p = promptFor(d, rec);
  const lang = d.langs.find((l) => l.code === rec.l);
  const model = d.models.find((m) => m.code === rec.m);
  const dom = d.domains.find((x) => x.code === rec.d);
  const langAttr = LANG_ATTR[rec.l] ?? "en";
  const isEnglish = rec.l === "ENG";

  return (
    <>
      <div className="br-scrim" onClick={onClose} aria-hidden="true" />
      <aside
        className="br-drawer"
        aria-label={`Evidence record ${rec.id}`}
        tabIndex={-1}
      >
        <div className="br-drawer-top">
          <div>
            <p className="br-eyebrow">Evidence record</p>
            <h2 className="br-drawer-id">{rec.id}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="br-btn"
            onClick={onClose}
          >
            Close record
          </button>
        </div>

        <p className="br-outcome">
          <span
            className="br-swatch"
            style={{ background: color(k, dark) }}
            aria-hidden="true"
          />
          {k.label} <span className="br-muted">· {k.rubric}</span>
        </p>

        <section className="br-drawer-sec">
          <h3>Prompt as administered ({lang?.name})</h3>
          <p className="br-prompt" lang={langAttr}>
            {p?.texts[rec.l]}
          </p>
          {!isEnglish && (
            <>
              <h4 className="br-subhead">English anchor</h4>
              <p className="br-prompt br-muted" lang="en">
                {p?.en}
              </p>
            </>
          )}
        </section>

        <section className="br-drawer-sec">
          <h3>Response, verbatim</h3>
          <p className="br-muted br-fine">
            {model?.name} · {model?.mode} · {rec.len} characters
          </p>
          <div className="br-verbatim" lang={langAttr}>
            {rec.o}
          </div>
        </section>

        <section className="br-drawer-sec">
          <h3>Evaluator note</h3>
          <p>{d.notes[rec.n]}</p>
        </section>

        {rec.ig && (
          <section className="br-drawer-sec">
            <h3>Integrity register</h3>
            <dl className="br-dl">
              <dt>Issue</dt>
              <dd>{rec.ig.issue}</dd>
              <dt>Note</dt>
              <dd>{rec.ig.note}</dd>
              <dt>Resolution</dt>
              <dd>{rec.ig.res}</dd>
              <dt>Handling</dt>
              <dd>{rec.ig.handling}</dd>
            </dl>
          </section>
        )}

        <section className="br-drawer-sec">
          <h3>Condition</h3>
          <dl className="br-dl">
            <dt>Domain</dt>
            <dd>
              {rec.d} — {dom?.title}
            </dd>
            <dt>Prompt</dt>
            <dd>
              {rec.p} — {p?.scenario} ({p?.stype})
            </dd>
            <dt>Language</dt>
            <dd>{lang?.name}</dd>
            <dt>Model</dt>
            <dd>{model?.name}</dd>
            <dt>Repetition</dt>
            <dd>{rec.r}</dd>
            <dt>Framing arm</dt>
            <dd>{rec.a ? "Culturally contextualised" : "Direct"}</dd>
            <dt>Register</dt>
            <dd>{p?.register}</dd>
            <dt>Urgency</dt>
            <dd>{p?.urgency}</dd>
            <dt>Risk level</dt>
            <dd>{p?.risk}</dd>
            <dt>Safety-sensitive</dt>
            <dd>{p?.sens}</dd>
            <dt>Pillar</dt>
            <dd>{p?.pillar}</dd>
            <dt>Translation QA</dt>
            <dd>{p?.qa}</dd>
            <dt>Integrity-sensitive corpus</dt>
            <dd>{rec.x ? "Excluded" : "Included"}</dd>
          </dl>
        </section>

        <section className="br-drawer-sec">
          <h3>Expected safe behaviour</h3>
          <p>{p?.expected}</p>
        </section>
      </aside>
    </>
  );
}

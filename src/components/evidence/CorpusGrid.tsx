import { Fragment, useMemo, useState } from "react";
import {
  color,
  countByClass,
  klassOf,
  LANG_ATTR,
  type Dataset,
  type Rec,
} from "@/lib/dataset";

export function CorpusGrid({
  d,
  dark,
  onOpen,
}: {
  d: Dataset;
  dark: boolean;
  onOpen: (r: Rec) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const byKey = useMemo(() => {
    const map = new Map<string, Rec>();
    for (const r of d.records) map.set(`${r.d}|${r.l}|${r.m}|${r.p}|${r.r}`, r);
    return map;
  }, [d]);

  const reps = useMemo(
    () => Array.from(new Set(d.records.map((r) => r.r))).sort(),
    [d],
  );

  const counts = countByClass(d, d.records);

  return (
    <div className="br-stack">
      <div
        className="br-legend"
        role="group"
        aria-label="Outcome legend and filter"
      >
        {d.classes.map((k, idx) => {
          const active = selected === idx;
          return (
            <button
              key={k.key}
              type="button"
              className={`br-legend-item${active ? " is-active" : ""}`}
              aria-pressed={active}
              onClick={() => setSelected(active ? null : idx)}
            >
              <span
                className="br-swatch"
                style={{ background: color(k, dark) }}
                aria-hidden="true"
              />
              <span className="br-legend-label">{k.label}</span>
              <span className="br-legend-count">{counts[idx]}</span>
            </button>
          );
        })}
        {selected !== null && (
          <button
            type="button"
            className="br-btn br-btn-quiet"
            onClick={() => setSelected(null)}
          >
            Clear outcome highlight
          </button>
        )}
      </div>
      <p className="br-muted br-fine">
        Diagonal hatching marks records held out of integrity-sensitive
        estimates. Select an outcome to dim the other cells; every cell stays in
        place.
      </p>

      {d.domains.map((dom) => {
        const promptCodes = Object.keys(d.prompts)
          .filter((k) => k.startsWith(`${dom.code}-`))
          .map((k) => k.slice(dom.code.length + 1));
        const domainCount = d.records.filter((r) => r.d === dom.code).length;
        const cols =
          "var(--lang-col) max-content" +
          promptCodes
            .map(
              (_, i) =>
                `${i ? " var(--grp-gap)" : ""} repeat(${reps.length}, var(--cell))`,
            )
            .join("");
        const rowsPerBlock = d.models.length + 1;
        return (
          <section key={dom.code} className="br-domain-block">
            <header className="br-domain-side">
              <p className="br-domain-code">{dom.code}</p>
              <h3>{dom.title}</h3>
              <p className="br-muted br-scope">{dom.scope}</p>
              <p className="br-muted br-fine br-domain-meta">
                {domainCount} responses. Concern: {dom.concern}.
              </p>
            </header>
            <div className="br-matrix-col">
              <div className="br-scrollx">
                <div
                  className="br-grid"
                  style={{ gridTemplateColumns: cols }}
                >
                  <div className="br-grid-corner" style={{ gridColumn: "span 2" }} />
                  {promptCodes.map((pc, i) => (
                    <Fragment key={pc}>
                      {i > 0 && <div className="br-gutter" aria-hidden="true" />}
                      <div
                        className="br-colgroup"
                        style={{ gridColumn: `span ${reps.length}` }}
                      >
                        {pc}
                      </div>
                    </Fragment>
                  ))}
                  <div className="br-grid-corner" style={{ gridColumn: "span 2" }} />
                  {promptCodes.map((pc, i) => (
                    <Fragment key={pc}>
                      {i > 0 && <div className="br-gutter" aria-hidden="true" />}
                      {reps.map((rp) => (
                        <div key={`${pc}-${rp}`} className="br-colrep">
                          {rp.replace(/^R0?/, "")}
                        </div>
                      ))}
                    </Fragment>
                  ))}
                  {d.langs.map((lang, li) => (
                    <Fragment key={lang.code}>
                      {li > 0 && (
                        <div className="br-rowgutter" aria-hidden="true" />
                      )}
                      {d.models.map((model) => (
                        <Row
                          key={`${dom.code}-${lang.code}-${model.code}`}
                          d={d}
                          dark={dark}
                          dom={dom.code}
                          lang={lang}
                          model={model}
                          promptCodes={promptCodes}
                          reps={reps}
                          byKey={byKey}
                          selected={selected}
                          onOpen={onOpen}
                        />
                      ))}
                    </Fragment>
                  ))}
                  {d.langs.map((lang, li) =>
                    li % 2 === 1 ? (
                      <div
                        key={`tint-${lang.code}`}
                        className="br-langtint"
                        aria-hidden="true"
                        style={{
                          gridColumn: "1 / -1",
                          gridRow: `${3 + li * rowsPerBlock} / span ${d.models.length}`,
                        }}
                      />
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Row({
  d,
  dark,
  dom,
  lang,
  model,
  promptCodes,
  reps,
  byKey,
  selected,
  onOpen,
}: {
  d: Dataset;
  dark: boolean;
  dom: string;
  lang: { code: string; name: string };
  model: { code: string; name: string };
  promptCodes: string[];
  reps: string[];
  byKey: Map<string, Rec>;
  selected: number | null;
  onOpen: (r: Rec) => void;
}) {
  return (
    <>
      <div className="br-rowlabel br-rowlabel-lang" lang={LANG_ATTR[lang.code] ?? "en"}>
        {lang.name}
      </div>
      <div className="br-rowlabel br-rowlabel-model">{model.name}</div>
      {promptCodes.map((pc, i) => (
        <Fragment key={pc}>
          {i > 0 && <div className="br-gutter" aria-hidden="true" />}
          {reps.map((rp) => {
            const rec = byKey.get(
              `${dom}|${lang.code}|${model.code}|${pc}|${rp}`,
            );
            if (!rec)
              return <div key={`${pc}-${rp}`} className="br-cell-empty" />;
            const k = klassOf(d, rec);
            const dimmed = selected !== null && selected !== rec.c;
            return (
              <button
                key={rec.id}
                type="button"
                data-record-id={rec.id}
                className={`br-cell${dimmed ? " is-dim" : ""}${rec.x ? " is-hatched" : ""}`}
                style={{ background: color(k, dark) }}
                onClick={() => onOpen(rec)}
                title={`${rec.id} — ${lang.name} — ${k.label}`}
                aria-label={`${rec.id}, ${lang.name}, ${model.name}, prompt ${pc}, repetition ${rp}: ${k.label}`}
              />
            );
          })}
        </Fragment>
      ))}
    </>
  );
}

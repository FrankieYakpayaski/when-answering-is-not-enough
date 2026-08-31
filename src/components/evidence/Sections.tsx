import {
  classByKey,
  color,
  countByClass,
  fmtPct,
  fmtPp,
  isAppropriate,
  klassOf,
  rate,
  type Dataset,
  type Rec,
} from "@/lib/dataset";

export function Figure({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="br-figure">
      <p className="br-figure-value">{value}</p>
      <p className="br-figure-label">{label}</p>
      {sub && <p className="br-muted br-fine">{sub}</p>}
    </div>
  );
}

export function Opening({ d }: { d: Dataset }) {
  const all = d.records;
  const r = rate(d, all);
  const counts = countByClass(d, all);
  const refusal = classByKey(d, "refusal");
  const unsafe = classByKey(d, "unsafe");
  const failCount = all.filter((x) => klassOf(d, x).fail).length;

  return (
    <div className="br-stack">
      <p className="br-eyebrow">
        {d.meta["domainCount"]} domains · {d.meta["langCount"]} languages ·{" "}
        {d.meta["modelCount"]} configurations · {String(d.meta["testWindow"])}
      </p>
      <h1 className="br-display">
        What answering looks like when nothing is refused
      </h1>
      <div className="br-figures">
        <Figure label="Coded responses" value={String(all.length)} />
        <Figure
          label="Coded appropriate"
          value={`${r.n}/${r.N}`}
          sub={fmtPct(r.pct)}
        />
        <Figure
          label={refusal.klass.label}
          value={String(counts[refusal.idx])}
        />
        <Figure label="Coded as a failure" value={String(failCount)} />
        <Figure label={unsafe.klass.label} value={String(counts[unsafe.idx])} />
      </div>
    </div>
  );
}

const STAGE_KEYS = [
  { key: "refusal", stage: "Engagement" },
  { key: "comprehension", stage: "Comprehension and relevance" },
  { key: "language", stage: "Requested-language delivery" },
  { key: "incomplete", stage: "Completeness and escalation" },
  { key: "unsafe", stage: "Guidance safety" },
];

export function Pathway({
  d,
  dark,
  onStage,
}: {
  d: Dataset;
  dark: boolean;
  onStage: (key: string) => void;
}) {
  const counts = countByClass(d, d.records);
  return (
    <ol className="br-pathway">
      {STAGE_KEYS.map(({ key, stage }, i) => {
        const { idx, klass } = classByKey(d, key);
        if (!klass) return null;
        return (
          <li key={key} className="br-stage">
            <p className="br-eyebrow">Stage {i + 1}</p>
            <h3>{stage}</h3>
            <p
              className="br-stage-count"
              style={{ color: color(klass, dark) }}
            >
              {counts[idx]}
            </p>
            <p className="br-muted br-fine">
              {klass.label} · {counts[idx]}/{d.records.length}
            </p>
            <button
              type="button"
              className="br-btn br-btn-quiet"
              onClick={() => onStage(key)}
            >
              Show these records
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function StackedBar({
  d,
  dark,
  records,
}: {
  d: Dataset;
  dark: boolean;
  records: Rec[];
}) {
  const counts = countByClass(d, records);
  const total = records.length;
  return (
    <div className="br-bar" role="img" aria-label={barLabel(d, counts, total)}>
      {d.classes.map((k, i) => {
        const c = counts[i] ?? 0;
        if (!c || !total) return null;
        return (
          <span
            key={k.key}
            className="br-bar-seg"
            style={{
              width: `${(c / total) * 100}%`,
              background: color(k, dark),
            }}
          />
        );
      })}
    </div>
  );
}

function barLabel(d: Dataset, counts: number[], total: number) {
  return d.classes
    .map((k, i) => `${k.label}: ${counts[i] ?? 0} of ${total}`)
    .join("; ");
}

export function ComparisonRows({
  d,
  dark,
  rows,
  referenceKey,
}: {
  d: Dataset;
  dark: boolean;
  rows: { key: string; name: string; records: Rec[] }[];
  referenceKey: string;
}) {
  const refRow = rows.find((r) => r.key === referenceKey);
  const refRate = refRow ? rate(d, refRow.records).pct : null;
  return (
    <div className="br-rows">
      {rows.map((row) => {
        const rt = rate(d, row.records);
        const diff =
          rt.pct === null || refRate === null ? null : rt.pct - refRate;
        return (
          <div key={row.key} className="br-comp-row">
            <p className="br-comp-name">{row.name}</p>
            <StackedBar d={d} dark={dark} records={row.records} />
            <p className="br-comp-num">
              {rt.n}/{rt.N}
            </p>
            <p className="br-comp-num">{fmtPct(rt.pct)}</p>
            <p className="br-comp-num br-muted">
              {row.key === referenceKey ? "reference" : fmtPp(diff)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function CorpusToggle({
  integrity,
  onChange,
}: {
  integrity: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="br-toggle" role="group" aria-label="Corpus">
      <button
        type="button"
        className={`br-toggle-btn${integrity ? "" : " is-on"}`}
        aria-pressed={!integrity}
        onClick={() => onChange(false)}
      >
        Observed corpus
      </button>
      <button
        type="button"
        className={`br-toggle-btn${integrity ? " is-on" : ""}`}
        aria-pressed={integrity}
        onClick={() => onChange(true)}
      >
        Integrity-sensitive corpus
      </button>
    </div>
  );
}

export function Profiles({
  d,
  dark,
  onOpenFilter,
}: {
  d: Dataset;
  dark: boolean;
  onOpenFilter: () => void;
}) {
  return (
    <div className="br-stack">
      <div className="br-profiles">
        {d.models.map((m) => {
          const recs = d.records.filter((r) => r.m === m.code);
          const rt = rate(d, recs);
          const counts = countByClass(d, recs);
          return (
            <article key={m.code} className="br-profile">
              <h3>{m.name}</h3>
              <p className="br-muted br-fine">{m.mode}</p>
              <p className="br-profile-rate">
                {rt.n}/{rt.N} · {fmtPct(rt.pct)}
              </p>
              <StackedBar d={d} dark={dark} records={recs} />
              <ul className="br-composition">
                {d.classes.map((k, i) =>
                  k.fail && (counts[i] ?? 0) > 0 ? (
                    <li key={k.key}>
                      <span
                        className="br-swatch"
                        style={{ background: color(k, dark) }}
                        aria-hidden="true"
                      />
                      {k.label}
                      <span className="br-comp-num">
                        {counts[i]}/{rt.N}
                      </span>
                    </li>
                  ) : null,
                )}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="br-domains">
        {d.domains.map((dom) => {
          const recs = d.records.filter((r) => r.d === dom.code);
          const rt = rate(d, recs);
          const counts = countByClass(d, recs);
          return (
            <article key={dom.code} className="br-domain">
              <h3>
                <span className="br-code">{dom.code}</span> {dom.title}
              </h3>
              <p className="br-profile-rate">
                {rt.n}/{rt.N} · {fmtPct(rt.pct)}
              </p>
              <StackedBar d={d} dark={dark} records={recs} />
              <p className="br-muted br-fine">{dom.concern}</p>
              <ul className="br-composition">
                {d.classes.map((k, i) =>
                  k.fail && (counts[i] ?? 0) > 0 ? (
                    <li key={k.key}>
                      <span
                        className="br-swatch"
                        style={{ background: color(k, dark) }}
                        aria-hidden="true"
                      />
                      {k.label}
                      <span className="br-comp-num">
                        {counts[i]}/{rt.N}
                      </span>
                    </li>
                  ) : null,
                )}
              </ul>
            </article>
          );
        })}
      </div>
      <button type="button" className="br-btn" onClick={onOpenFilter}>
        Open the evidence explorer
      </button>
    </div>
  );
}

export function ClaimsPair({
  claim,
}: {
  claim: Dataset["claims"][number] | undefined;
}) {
  if (!claim) return null;
  return (
    <div className="br-claim-pair">
      <div className="br-claim">
        <p className="br-eyebrow">Supported — {claim.dim}</p>
        <p>{claim.can}</p>
      </div>
      <div className="br-claim br-claim-not">
        <p className="br-eyebrow">Not claimed</p>
        <p>{claim.cannot}</p>
      </div>
    </div>
  );
}

export function MethodAndClaims({ d }: { d: Dataset }) {
  return (
    <div className="br-stack">
      <div className="br-method">
        {d.method.map((m) => (
          <article key={m.h} className="br-method-card">
            <h3>{m.h}</h3>
            <p>{m.p}</p>
          </article>
        ))}
      </div>
      <table className="br-table br-claims-table">
        <caption className="br-sr">Claims: supported and not claimed</caption>
        <thead>
          <tr>
            <th scope="col">Dimension</th>
            <th scope="col">Supported</th>
            <th scope="col">Not claimed</th>
          </tr>
        </thead>
        <tbody>
          {d.claims.map((c) => (
            <tr key={c.dim}>
              <th scope="row">{c.dim}</th>
              <td>{c.can}</td>
              <td className="br-not-claimed">{c.cannot}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function appropriateOf(d: Dataset, recs: Rec[]) {
  return recs.filter((r) => isAppropriate(d, r)).length;
}

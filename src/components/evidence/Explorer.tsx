import { useMemo, useState } from "react";
import {
  csvOf,
  fmtPct,
  klassOf,
  promptFor,
  rate,
  DATASET_FILE,
  type Dataset,
  type Rec,
} from "@/lib/dataset";

export type Filters = {
  outcome: string;
  lang: string;
  model: string;
  domain: string;
  arm: string;
  urgency: string;
  risk: string;
  sens: string;
  q: string;
};

export const EMPTY_FILTERS: Filters = {
  outcome: "",
  lang: "",
  model: "",
  domain: "",
  arm: "",
  urgency: "",
  risk: "",
  sens: "",
  q: "",
};

const ROW_CAP = 120;

export function filterRecords(d: Dataset, f: Filters): Rec[] {
  const q = f.q.trim().toLowerCase();
  return d.records.filter((r) => {
    const p = promptFor(d, r);
    if (f.outcome && klassOf(d, r).key !== f.outcome) return false;
    if (f.lang && r.l !== f.lang) return false;
    if (f.model && r.m !== f.model) return false;
    if (f.domain && r.d !== f.domain) return false;
    if (f.arm && String(r.a) !== f.arm) return false;
    if (f.urgency && p?.urgency !== f.urgency) return false;
    if (f.risk && p?.risk !== f.risk) return false;
    if (f.sens && p?.sens !== f.sens) return false;
    if (q) {
      const hay = [
        r.o,
        d.notes[r.n] ?? "",
        p?.texts[r.l] ?? "",
        p?.en ?? "",
        r.id,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="br-field">
      <span className="br-field-label">{label}</span>
      <select
        className="br-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Explorer({
  d,
  filters,
  setFilters,
  onOpen,
}: {
  d: Dataset;
  filters: Filters;
  setFilters: (f: Filters) => void;
  onOpen: (r: Rec) => void;
}) {
  const [downloadName] = useState("beyond-refusal-filtered.csv");
  const results = useMemo(() => filterRecords(d, filters), [d, filters]);
  const rt = rate(d, results);
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });

  const exportCsv = () => {
    const blob = new Blob([csvOf(d, results)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="br-stack">
      <div className="br-filters">
        <Select
          label="Outcome"
          value={filters.outcome}
          onChange={(v) => set({ outcome: v })}
          options={d.classes.map((c) => ({ value: c.key, label: c.label }))}
        />
        <Select
          label="Language"
          value={filters.lang}
          onChange={(v) => set({ lang: v })}
          options={d.langs.map((l) => ({ value: l.code, label: l.name }))}
        />
        <Select
          label="Model"
          value={filters.model}
          onChange={(v) => set({ model: v })}
          options={d.models.map((m) => ({ value: m.code, label: m.name }))}
        />
        <Select
          label="Domain"
          value={filters.domain}
          onChange={(v) => set({ domain: v })}
          options={d.domains.map((x) => ({
            value: x.code,
            label: `${x.code} — ${x.title}`,
          }))}
        />
        <Select
          label="Framing"
          value={filters.arm}
          onChange={(v) => set({ arm: v })}
          options={[
            { value: "0", label: "Direct" },
            { value: "1", label: "Culturally contextualised" },
          ]}
        />
        <Select
          label="Urgency"
          value={filters.urgency}
          onChange={(v) => set({ urgency: v })}
          options={d.facets.urgency.map((u) => ({ value: u, label: u }))}
        />
        <Select
          label="Risk level"
          value={filters.risk}
          onChange={(v) => set({ risk: v })}
          options={d.facets.risk.map((u) => ({ value: u, label: u }))}
        />
        <Select
          label="Safety-sensitive"
          value={filters.sens}
          onChange={(v) => set({ sens: v })}
          options={Array.from(
            new Set(Object.values(d.prompts).map((p) => p.sens)),
          ).map((s) => ({ value: s, label: s }))}
        />
        <label className="br-field br-field-wide">
          <span className="br-field-label">
            Search response, note and prompt
          </span>
          <input
            className="br-input"
            type="search"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Type a word or phrase"
          />
        </label>
      </div>

      <div className="br-resultbar">
        <p>
          <strong>
            {rt.n}/{rt.N}
          </strong>{" "}
          coded appropriate in the current selection · {fmtPct(rt.pct)}
        </p>
        <div className="br-actions">
          <button
            type="button"
            className="br-btn br-btn-quiet"
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Reset filters
          </button>
          <button
            type="button"
            className="br-btn"
            onClick={exportCsv}
            disabled={results.length === 0}
          >
            Download filtered records as CSV
          </button>
        </div>
      </div>

      <p className="br-muted br-fine">
        Responses are shown exactly as captured, including responses coded as
        unsafe. Nothing here is health guidance.
      </p>

      {results.length === 0 ? (
        <p className="br-empty">
          No records match this selection. Widen a filter or clear the search
          text to see records again.
        </p>
      ) : (
        <>
          <div className="br-scrollx">
            <table className="br-table">
              <caption className="br-sr">Filtered evidence records</caption>
              <thead>
                <tr>
                  <th scope="col">Record</th>
                  <th scope="col">Domain</th>
                  <th scope="col">Prompt</th>
                  <th scope="col">Language</th>
                  <th scope="col">Model</th>
                  <th scope="col">Framing</th>
                  <th scope="col">Outcome</th>
                  <th scope="col">Open</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, ROW_CAP).map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="br-mono">
                      {r.id}
                    </th>
                    <td>{r.d}</td>
                    <td>{r.p}</td>
                    <td lang={LANG_ATTR[r.l] ?? "en"}>
                      {d.langs.find((l) => l.code === r.l)?.name}
                    </td>
                    <td>{d.models.find((m) => m.code === r.m)?.name}</td>
                    <td>{r.a ? "Culturally contextualised" : "Direct"}</td>
                    <td>{klassOf(d, r).label}</td>
                    <td>
                      <button
                        type="button"
                        className="br-btn br-btn-quiet"
                        onClick={() => onOpen(r)}
                      >
                        Open record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {results.length > ROW_CAP && (
            <p className="br-muted br-fine">
              Showing the first {ROW_CAP} of {results.length} matching records.
              Narrow the filters or export the full selection to CSV. Data file:{" "}
              {DATASET_FILE}.
            </p>
          )}
        </>
      )}
    </div>
  );
}

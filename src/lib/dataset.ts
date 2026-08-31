export type Klass = {
  key: string;
  rubric: string;
  label: string;
  short: string;
  color: string;
  colorDark: string;
  fail: boolean;
};

export type IntegrityEntry = {
  issue: string;
  note: string;
  res: string;
  handling: string;
};

export type Rec = {
  i: number;
  id: string;
  d: string;
  p: string;
  l: string;
  m: string;
  r: string;
  c: number;
  a: number;
  x: number;
  n: number;
  o: string;
  len: number;
  t: number;
  ig?: IntegrityEntry;
};

export type Prompt = {
  scenario: string;
  stype: string;
  risk: string;
  pillar: string;
  expected: string;
  en: string;
  texts: Record<string, string>;
  register: string;
  urgency: string;
  sens: string;
  qa: string;
  arm: number;
};

export type Dataset = {
  records: Rec[];
  prompts: Record<string, Prompt>;
  notes: string[];
  domains: { code: string; title: string; scope: string; concern: string }[];
  classes: Klass[];
  theme: {
    light: Record<string, string>;
    dark: Record<string, string>;
    type: { display: string; body: string; why: string };
    note: string;
  };
  langs: { code: string; name: string }[];
  models: { code: string; name: string; mode: string }[];
  facets: { urgency: string[]; risk: string[] };
  method: { h: string; p: string }[];
  claims: { dim: string; can: string; cannot: string }[];
  meta: Record<string, string | number>;
  footer: string;
};

export const DATASET_FILE = "beyond-refusal-dataset.json";
export const DATASET_URL = `/data/${DATASET_FILE}`;

export async function loadDataset(): Promise<Dataset> {
  const res = await fetch(DATASET_URL);
  if (!res.ok) throw new Error(`Could not load ${DATASET_FILE} (${res.status})`);
  return (await res.json()) as Dataset;
}

export const LANG_ATTR: Record<string, string> = {
  ENG: "en",
  PCM: "pcm",
  YOR: "yo",
  IGB: "ig",
};

export function klassOf(d: Dataset, r: Rec): Klass {
  return d.classes[r.c]!;
}

export function isAppropriate(d: Dataset, r: Rec) {
  return klassOf(d, r).fail === false;
}

export type Rate = { n: number; N: number; pct: number | null };

export function rate(d: Dataset, records: Rec[]): Rate {
  const N = records.length;
  const n = records.filter((r) => isAppropriate(d, r)).length;
  return { n, N, pct: N === 0 ? null : (n / N) * 100 };
}

export function fmtPct(pct: number | null) {
  return pct === null ? "—" : `${pct.toFixed(2)}%`;
}

export function fmtPp(diff: number | null) {
  if (diff === null) return "—";
  const sign = diff > 0 ? "+" : diff < 0 ? "\u2212" : "";
  return `${sign}${Math.abs(diff).toFixed(2)} pp`;
}

export function countByClass(d: Dataset, records: Rec[]): number[] {
  const out = d.classes.map(() => 0);
  for (const r of records) out[r.c] = (out[r.c] ?? 0) + 1;
  return out;
}

export function classByKey(d: Dataset, key: string) {
  const idx = d.classes.findIndex((c) => c.key === key);
  return { idx, klass: d.classes[idx]! };
}

export function promptFor(d: Dataset, r: Rec) {
  return d.prompts[`${r.d}-${r.p}`];
}

export function corpus(d: Dataset, integritySensitive: boolean) {
  return integritySensitive ? d.records.filter((r) => !r.x) : d.records;
}

export function color(k: Klass, dark: boolean) {
  return dark ? k.colorDark : k.color;
}

export function csvOf(d: Dataset, records: Rec[]) {
  const head = [
    "id",
    "domain",
    "prompt",
    "language",
    "model",
    "repetition",
    "outcome",
    "appropriate",
    "framing",
    "excluded",
    "urgency",
    "risk",
    "safety_sensitive",
    "note",
    "response",
  ];
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [head.join(",")];
  for (const r of records) {
    const p = promptFor(d, r);
    lines.push(
      [
        r.id,
        r.d,
        r.p,
        r.l,
        r.m,
        r.r,
        klassOf(d, r).label,
        String(isAppropriate(d, r)),
        r.a ? "Culturally contextualised" : "Direct",
        String(Boolean(r.x)),
        p?.urgency ?? "",
        p?.risk ?? "",
        p?.sens ?? "",
        d.notes[r.n] ?? "",
        r.o,
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n");
}

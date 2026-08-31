import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  DATASET_FILE,
  corpus,
  fmtPct,
  loadDataset,
  rate,
  type Rec,
} from "@/lib/dataset";
import { useDark } from "@/hooks/use-dark";
import { ThemeVars } from "@/components/evidence/ThemeVars";
import { SafetyNotice } from "@/components/evidence/SafetyNotice";
import { TopBar } from "@/components/evidence/TopBar";
import { CorpusGrid } from "@/components/evidence/CorpusGrid";
import { RecordDrawer } from "@/components/evidence/RecordDrawer";
import {
  ClaimsPair,
  ComparisonRows,
  CorpusToggle,
  MethodAndClaims,
  Opening,
  Pathway,
  Profiles,
} from "@/components/evidence/Sections";
import {
  EMPTY_FILTERS,
  Explorer,
  type Filters,
} from "@/components/evidence/Explorer";

const TITLE = "Beyond refusal — multilingual public-health safety evidence";
const DESC =
  "An interrogable record of coded model responses across English, Nigerian Pidgin, Yorùbá and Igbo, with every figure computed from the published dataset.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


function Index() {
  const dark = useDark();
  const { data, error, isLoading } = useQuery({
    queryKey: ["dataset"],
    queryFn: loadDataset,
    staleTime: Infinity,
  });
  const [open, setOpen] = useState<Rec | null>(null);
  const [integrity, setIntegrity] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const goExplorer = useCallback(() => {
    document.getElementById("explorer")?.scrollIntoView({ block: "start" });
  }, []);

  const onStage = useCallback(
    (key: string) => {
      setFilters({ ...EMPTY_FILTERS, outcome: key });
      goExplorer();
    },
    [goExplorer],
  );

  if (isLoading) {
    return (
      <main className="br-state">
        <p>Loading {DATASET_FILE}.</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="br-state">
        <h1>The dataset did not load</h1>
        <p>
          This page reads every figure from {DATASET_FILE}. Nothing is shown
          until that file loads. Reload the page or restore the file, then try
          again.
        </p>
      </main>
    );
  }

  const d = data;
  const active = corpus(d, integrity);
  const activeRate = rate(d, active);
  const framingClaim = d.claims.find((c) => /cultur|context/i.test(c.dim));
  const corpusCaption = integrity
    ? `Integrity-sensitive corpus: ${active.length} of ${d.records.length} records, excluding those held out of integrity-sensitive estimates.`
    : `Observed corpus: all ${active.length} records as recorded.`;

  return (
    <>
      <ThemeVars theme={d.theme} />
      <a className="br-skip" href="#opening">
        Skip to content
      </a>
      <TopBar />

      <main className="br-page">
        <section id="opening" className="br-section">
          <SafetyNotice d={d} />
          <Opening d={d} />
        </section>

        <section id="corpus" className="br-section">
          <h2 className="br-h2">The corpus</h2>
          <p className="br-lede">
            Every coded response, one cell each. Rows are language by
            configuration; columns are prompt by repetition. Select a cell to
            read the record.
          </p>
          <CorpusGrid d={d} dark={dark} onOpen={setOpen} />
        </section>

        <section id="pathway" className="br-section">
          <h2 className="br-h2">Failure pathway</h2>
          <p className="br-lede">
            Each stage counts the responses coded as failing at that stage,
            across all {d.records.length} records.
          </p>
          <Pathway d={d} dark={dark} onStage={onStage} />
        </section>

        <section id="language" className="br-section">
          <h2 className="br-h2">Language</h2>
          <CorpusToggle integrity={integrity} onChange={setIntegrity} />
          <p className="br-muted br-fine">{corpusCaption}</p>
          <ComparisonRows
            d={d}
            dark={dark}
            referenceKey="ENG"
            rows={d.langs.map((l) => ({
              key: l.code,
              name: l.name,
              records: active.filter((r) => r.l === l.code),
            }))}
          />
          <p className="br-muted br-fine">
            Active corpus overall: {activeRate.n}/{activeRate.N} ·{" "}
            {fmtPct(activeRate.pct)}. Differences are percentage points against
            English.
          </p>
        </section>

        <section id="framing" className="br-section">
          <h2 className="br-h2">Framing</h2>
          <CorpusToggle integrity={integrity} onChange={setIntegrity} />
          <p className="br-muted br-fine">{corpusCaption}</p>
          <div className="br-two">
            <div>
              <ComparisonRows
                d={d}
                dark={dark}
                referenceKey="0"
                rows={[
                  {
                    key: "0",
                    name: "Direct",
                    records: active.filter((r) => r.a === 0),
                  },
                  {
                    key: "1",
                    name: "Culturally contextualised",
                    records: active.filter((r) => r.a === 1),
                  },
                ]}
              />
            </div>
            <ClaimsPair claim={framingClaim} />
          </div>
        </section>

        <section id="profiles" className="br-section">
          <h2 className="br-h2">Model and domain profiles</h2>
          <p className="br-lede">
            Rates are shown per configuration and per domain over the observed
            corpus, with the failure composition of each.
          </p>
          <Profiles d={d} dark={dark} onOpenFilter={goExplorer} />
        </section>

        <section id="explorer" className="br-section">
          <h2 className="br-h2">Evidence explorer</h2>
          <p className="br-lede">
            Filter and search the coded records, then export the current
            selection.
          </p>
          <Explorer
            d={d}
            filters={filters}
            setFilters={setFilters}
            onOpen={setOpen}
          />
          <h2 className="br-h2 br-h2-spaced">Method</h2>
          <MethodAndClaims d={d} />
        </section>
      </main>

      <footer
        className="br-footer"
        dangerouslySetInnerHTML={{ __html: d.footer }}
      />

      <RecordDrawer
        d={d}
        dark={dark}
        rec={open}
        onClose={() => setOpen(null)}
      />
    </>
  );
}

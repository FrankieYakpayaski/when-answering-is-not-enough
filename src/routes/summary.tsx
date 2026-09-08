import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  DATASET_FILE,
  classByKey,
  countByClass,
  fmtPct,
  loadDataset,
  rate,
  type Dataset,
} from "@/lib/dataset";
import { ThemeVars } from "@/components/evidence/ThemeVars";

const TITLE =
  "Executive summary — When Answering Is Not Enough: Multilingual Public-Health Safety";
const DESC =
  "A brief introduction to the 1,080-response evaluation of comprehension, language delivery, escalation, and unsafe guidance across English, Nigerian Pidgin, Yorùbá and Igbo.";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Summary,
});

function Headline({ d }: { d: Dataset }) {
  const rt = rate(d, d.records);
  const unsafe = classByKey(d, "unsafe");
  const unsafeCount = countByClass(d, d.records)[unsafe.idx] ?? 0;
  const refusal = classByKey(d, "refusal");
  const refusalCount = countByClass(d, d.records)[refusal.idx] ?? 0;

  return (
    <div className="br-figures">
      <div className="br-figure">
        <p className="br-figure-value">{rt.N}</p>
        <p className="br-figure-label">Recorded responses</p>
      </div>
      <div className="br-figure">
        <p className="br-figure-value">
          {rt.n}/{rt.N}
        </p>
        <p className="br-figure-label">Appropriate ({fmtPct(rt.pct)})</p>
      </div>
      <div className="br-figure">
        <p className="br-figure-value">{refusalCount}</p>
        <p className="br-figure-label">Unnecessary refusals</p>
      </div>
      <div className="br-figure">
        <p className="br-figure-value">{unsafeCount}</p>
        <p className="br-figure-label">Materially unsafe</p>
      </div>
    </div>
  );
}

function Summary() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["dataset"],
    queryFn: loadDataset,
    staleTime: Infinity,
  });

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
          This summary reads a few headline figures from {DATASET_FILE}. Reload
          the page or restore the file, then try again.
        </p>
      </main>
    );
  }

  const d = data;

  return (
    <>
      <ThemeVars theme={d.theme} />
      <header className="br-topbar">
        <Link to="/" className="br-topbar-title">
          When Answering Is Not Enough
        </Link>
        <nav aria-label="Sections" className="br-navwrap">
          <ul className="br-nav">
            <li>
              <Link to="/">Evidence platform</Link>
            </li>
            <li>
              <a href="/summary" aria-current="true">
                Summary
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="br-page">
        <section className="br-section">
          <div className="br-hero">
            <p className="br-hero-eyebrow">Executive summary</p>
            <h1 className="br-hero-title">
              When Answering Is Not Enough: Multilingual Public-Health Safety
            </h1>
            <p className="br-hero-deck">
              A 1,080-response evaluation of how frontier models complete
              legitimate public-health requests across English, Nigerian
              Pidgin, Yorùbá and Igbo.
            </p>
          </div>

          <Headline d={d} />
        </section>

        <section className="br-section">
          <h2 className="br-h2">What this study asks</h2>
          <p className="br-lede">
            Most safety tests ask whether a model refuses a harmful request. For
            real public-health questions, the harder problem is what happens
            after the model agrees to answer. A response can be engaged but
            still misunderstand the request, reply in the wrong language, omit
            urgently needed guidance, or give advice that could increase harm.
          </p>
          <p>
            This study evaluates the full answer pathway: comprehension,
            requested-language delivery, completeness and escalation, and the
            substantive safety of the guidance itself. It uses semantically
            matched prompts in four languages and two framing styles, each
            repeated three times across three consumer-facing model
            configurations.
          </p>
        </section>

        <section className="br-section">
          <h2 className="br-h2">What was tested</h2>
          <p className="br-lede">
            The design covered three models, four languages, five public-health
            taxonomies, six prompts per taxonomy, and three repetitions.
          </p>
          <ul className="br-prose-list">
            <li>
              <strong>Languages:</strong> English, Nigerian Pidgin, Yorùbá and
              Igbo.
            </li>
            <li>
              <strong>Taxonomies:</strong> FGM and community safeguarding;
              mental health, stigma and help-seeking; illness recognition and
              health literacy; outbreaks and public-health communication;
              endemic diseases and everyday health.
            </li>
            <li>
              <strong>Framing:</strong> direct questions and culturally
              contextualised scenarios that place the request in recognisable
              social settings.
            </li>
            <li>
              <strong>Models:</strong> ChatGPT (GPT-5.6 Sol, Medium effort),
              Claude (Opus 4.6, Medium) and Microsoft Copilot (GPT-5.6, Think
              Deeper).
            </li>
          </ul>
          <p className="br-muted br-fine">
            All prompts were legitimate public-health requests. The study did
            not include hazardous-intent, adversarial, or dual-use biological
            prompts.
          </p>
        </section>

        <section className="br-section">
          <h2 className="br-h2">Principal findings</h2>
          <p className="br-lede">
            Refusal-only testing would have reported zero failures in this
            corpus. Evaluating the completed answers identified 79 failures among
            1,080 responses.
          </p>
          <ul className="br-prose-list">
            <li>
              <strong>Appropriate responses:</strong> 1,001 of 1,080 (92.69%).
            </li>
            <li>
              <strong>No unnecessary refusals.</strong> Every failure occurred
              after the model chose to engage.
            </li>
            <li>
              <strong>Failure pathway:</strong> 60 comprehension or relevance
              failures, 14 wrong-language deliveries, 1 completeness or
              escalation failure, and 4 materially unsafe responses.
            </li>
            <li>
              <strong>Language patterns:</strong> Nigerian Pidgin and Yorùbá were
              descriptively comparable with English on the integrity-sensitive
              corpus; Igbo showed the clearest deficit, with a higher
              comprehension-failure rate.
            </li>
            <li>
              <strong>Framing patterns:</strong> Culturally contextualised
              prompts produced a higher failure rate than direct prompts in the
              tested set. This is a descriptive association, not proof of a
              causal effect.
            </li>
          </ul>
        </section>

        <section className="br-section">
          <h2 className="br-h2">Why it matters</h2>
          <p className="br-lede">
            Aggregate scores can hide qualitatively different failures. Claude
            had the highest appropriate-response rate but produced all four
            unsafe cases. Copilot produced no substantively unsafe guidance but
            had the largest burden of comprehension and wrong-language failures.
            ChatGPT's failures were concentrated in comprehension.
          </p>
          <p>
            For deployment decisions, these distinctions matter. A single
            ranking would collapse them. Multilingual public-health assurance
            should report refusal calibration, comprehension, language
            delivery, completeness and escalation, and substantive safety as
            separate dimensions.
          </p>
        </section>

        <section className="br-section">
          <h2 className="br-h2">Explore the evidence</h2>
          <p className="br-lede">
            The interactive platform lets you browse every response, filter by
            language, model, domain and outcome, and export the current
            selection.
          </p>
          <Link to="/" className="br-btn">
            Open the evidence platform
          </Link>
        </section>
      </main>

      <footer
        className="br-footer"
        dangerouslySetInnerHTML={{ __html: d.footer }}
      />
    </>
  );
}

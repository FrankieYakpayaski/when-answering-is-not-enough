import { useEffect, useState } from "react";
import { classByKey, countByClass, type Dataset } from "@/lib/dataset";
import { useDark } from "@/hooks/use-dark";

const SESSION_KEY = "br-notice-dismissed";

export function SafetyNotice({ d }: { d: Dataset }) {
  const dark = useDark();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setDismissed(true);
  }, []);

  if (dismissed) return null;

  const unsafe = classByKey(d, "unsafe");
  const unsafeCount = countByClass(d, d.records)[unsafe.idx] ?? 0;

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="br-notice" role="status" aria-label="Content and safety notice">
      <p className="br-notice-lead">
        Responses on this page are reproduced exactly as they were captured,
        including {unsafeCount} coded as materially unsafe. Nothing here is
        health advice and none of it should be acted on.
      </p>
      <div className="br-notice-hide">
        <button
          type="button"
          className="br-notice-hide-btn"
          onClick={dismiss}
          aria-label="Hide content and safety notice for this session"
        >
          Hide notice
        </button>
      </div>
      <div className="br-notice-blocks">
        <div
          className="br-notice-block"
          style={{ borderLeftColor: dark ? unsafe.klass.colorDark : unsafe.klass.color }}
        >
          <h3>If you need help now</h3>
          <p>
            Contact a qualified health worker or your local emergency services.
            This page is a research record and cannot advise on any health
            situation.
          </p>
        </div>
        <div className="br-notice-block">
          <h3>Difficult subject matter</h3>
          <p>
            The corpus covers female genital mutilation, a child at immediate
            risk of cutting, suicidal ideation, psychosis, spiritual
            attributions of mental illness, and disease outbreaks.
          </p>
        </div>
        <div className="br-notice-block">
          <h3>No dual-use content</h3>
          <p>
            All {d.prompts ? Object.keys(d.prompts).length : ""} prompts were
            legitimate public-health requests. The study has no
            hazardous-intent arm and reports nothing about biological misuse.
          </p>
        </div>
      </div>
    </div>
  );
}

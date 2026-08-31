import { useEffect, useState } from "react";
import { classByKey, countByClass, type Dataset } from "@/lib/dataset";

const SESSION_KEY = "br-notice-dismissed";

export function SafetyNotice({ d }: { d: Dataset }) {
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
      <div className="br-notice-body">
        <p>
          This corpus covers female genital mutilation, a child at immediate
          risk of cutting, suicidal ideation, psychosis, witchcraft and
          spiritual attributions of mental illness, and disease outbreaks. Some
          readers will find this material distressing.
        </p>
        <p>
          Model responses appear exactly as they were captured, including{" "}
          {unsafeCount}{" "}
          {unsafeCount === 1 ? "response" : "responses"} coded as unsafe.
          Nothing on this page is health advice, and none of it should be acted
          on. Anyone who needs help with a health situation should contact a
          qualified health worker or local emergency services.
        </p>
        <p>
          Every prompt tested was a legitimate public-health request. The study
          contains no hazardous-intent or dual-use component and therefore
          reports nothing about biological misuse.
        </p>
      </div>
      <button
        type="button"
        className="br-btn br-btn-quiet"
        onClick={dismiss}
        aria-label="Dismiss content and safety notice for this session"
      >
        Dismiss notice
      </button>
    </div>
  );
}

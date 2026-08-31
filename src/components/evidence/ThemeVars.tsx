import type { Dataset } from "@/lib/dataset";

const NAME_MAP: Record<string, string> = {
  ink: "--ink",
  inkMuted: "--ink-muted",
  inkFaint: "--ink-faint",
  rule: "--rule",
  ruleSoft: "--rule-soft",
  ground: "--ground",
  panel: "--panel",
  rowHover: "--row-hover",
  notClaimed: "--not-claimed",
  inputBg: "--input-bg",
  toggleOn: "--toggle-on",
  toggleOnText: "--toggle-on-text",
  scrim: "--scrim",
  topbar: "--topbar",
  hatch: "--hatch",
};

function block(tokens: Record<string, string>) {
  return Object.entries(tokens)
    .filter(([k]) => NAME_MAP[k])
    .map(([k, v]) => `${NAME_MAP[k]}:${v};`)
    .join("");
}

export function ThemeVars({ theme }: { theme: Dataset["theme"] }) {
  const css = `:root{color-scheme:light dark;--font-display:${theme.type.display};--font-body:${theme.type.body};${block(theme.light)}}
@media (prefers-color-scheme: dark){:root{${block(theme.dark)}}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

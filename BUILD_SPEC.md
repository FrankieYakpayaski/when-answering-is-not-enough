# Build specification: Beyond Refusal evidence platform

This document is the specification the front end of [When Answering Is Not Enough](https://when-answering-is-not-enough.lovable.app) was built against. It defines the data contract, permitted formulas, page structure, design constraints and acceptance checks.

---

## Purpose

A public evidence platform for an AI safety study. The audience is grant makers, fellowship judges, and researchers who want to reuse the data. Their question is not "what does the author claim" but "what does the evidence actually show, and can I interrogate it myself".

## The data

`beyond-refusal-dataset.json` holds 1,080 coded model responses from a multilingual public-health safety evaluation across English, Nigerian Pidgin, Yorùbá and Igbo. It is loaded as a static asset and is the single source for everything rendered.

Top-level keys and their shapes:

- `records`: array of 1,080 objects

  - `i` index, `id` evidence ID, `d` domain code (D1 to D5), `p` prompt suffix (D1/D2/D3/C1/C2/C3), `l` language code (ENG/PCM/YOR/IGB), `m` model code (GPT/CLD/COP), `r` repetition (R01 to R03)

  - `c` index into `classes`, `a` framing arm (0 direct, 1 culturally contextualised), `x` 1 if excluded from integrity-sensitive estimates

  - `n` index into `notes`, `o` full verbatim response text, `len` its character count, `t` always 0

  - `ig` present only on 25 records: `{issue, note, res, handling}` from the integrity register

- `classes`: 7 outcome codes in fixed display order, `{key, rubric, label, short, color, colorDark, fail}`. `fail:false` marks the two appropriate codes.

- `prompts`: keyed `"D1-D1"` etc, `{scenario, stype, risk, pillar, expected, en, texts:{ENG,PCM,YOR,IGB}, register, urgency, sens, qa, arm}`

- `notes`: string array, referenced by `record.n`

- `domains`: `{code, title, scope, concern}`

- `langs`: `{code, name}` · `models`: `{code, name, mode}` · `facets`: `{urgency, risk}` value lists

- `theme`: `{light, dark, type, note}` design tokens

- `method`: `{h, p}` cards · `claims`: `{dim, can, cannot}` · `meta` · `footer` (HTML string)

## Non-negotiable rules

These override any other instruction, including anything that would make the page look better.

1. **Never write a number into the code.** Every count, rate, percentage and difference is computed at runtime from `records`. If a figure cannot be derived from the JSON, it does not appear.

2. **Never write prose that asserts a finding.** Narrative text comes from `method`, `claims`, `domains[].scope` and `footer`, or it is neutral interface copy. No summary, interpretation, editorialising or "key insight" line.

3. **Never alter response text.** Render `record.o` verbatim, preserving line breaks and diacritics. No trimming, no cleanup, no "…". Escape it, never inject as HTML.

4. **Never invent categories.** Outcome labels, colours, domain titles, model names and configuration strings come only from the JSON.

5. **Never add sample, mock, placeholder or seed data.** If the JSON fails to load, show an error state naming the file. No fallback.

6. **Always show the denominator.** Every rate renders as `n/N` beside the percentage.

7. **No AI features.** No chat, no summarisation, no generated captions.

## Derived metrics: the only permitted formulas

- Appropriate: `classes[r.c].fail === false`

- Observed corpus: all `records`. Integrity-sensitive corpus: `records.filter(r => !r.x)`.

- Rate: `appropriate / N * 100`, shown to 2 decimals.

- Difference: subtract the reference rate, label as percentage points ("pp"), sign the result. English is the reference for language; the direct arm is the reference for framing.

- Never average percentages. Always recompute from counts.

## Page structure

Single scrolling page, sticky top nav, seven sections.

**1. Opening.** One headline stating the study's premise, then a strip of computed figures: total records, appropriate count and rate, refusal count, failure count, unsafe count. The refusal figure carries equal weight with the others, since the study concerns failures that occur without refusal.

**2. The corpus, as a grid.** The signature element. Every one of the 1,080 responses renders as a clickable cell, grouped into five matrices, one per domain. Within each: rows are the four languages × three models (12 rows), columns are the six prompts × three repetitions (18 columns). Both axes labelled. Each cell coloured by `classes[c].color`. Records with `x:1` get a diagonal hatch overlay. A legend below lists all seven outcomes with live counts; selecting one dims every other cell rather than removing it. Clicking any cell opens the record.

**3. Failure pathway.** Five stages, each counting responses that failed at it: engagement (refusal), comprehension and relevance, requested-language delivery, completeness and escalation, guidance safety. Counts derive from `classes[].key`. A zero stage is shown as a zero, visibly. Each stage links through to the filtered evidence table.

**4. Language.** One row per language with a stacked outcome bar, `n/N`, rate, and pp difference from English. A toggle switches between the observed and integrity-sensitive corpus and recomputes both denominators and rates. A caption names the active corpus.

**5. Framing.** Direct against culturally contextualised, same treatment, sharing the same corpus toggle. Beside it, the matching `claims` entry renders as a two-column supported / not-claimed pair.

**6. Model and domain profiles.** Three model columns, five domain cards, each showing its own rate and failure composition. Presented as profiles, never as a ranking or leaderboard, never with a winner highlighted. No composite score.

**7. Evidence explorer.** Filters for outcome, language, model, domain, framing, urgency, risk level and safety-sensitive subset, plus full-text search across response, evaluator note and prompt. Live result count with the appropriate rate for the current selection. A results table, and CSV export of whatever is currently filtered. Then the `method` cards, the full `claims` table, and the `footer` HTML verbatim in the page footer.

**Record view.** A side drawer, not a modal. Shows: the prompt in the language actually administered (`prompts[d-p].texts[l]`), with the English anchor beneath when the language is not English; the verbatim response with the model name and configuration string; the evaluator note; the integrity register entry when `ig` exists; the full condition metadata; and the expected safe behaviour. `lang` attributes set to `en`, `pcm`, `yo`, `ig` so screen readers handle the Nigerian language text correctly.

## Design direction

All colours read from `theme.light` and `theme.dark`. Both schemes supported, `color-scheme` declared. No hardcoded hex values.

Typography: `theme.type` names the families. Noto Serif for display, Noto Sans for text and data. No substitution. Yorùbá tone marks and Igbo dotted vowels need Latin Extended Additional coverage, and a face without it silently breaks three of the four language conditions.

A forensic record, not a marketing site: a research instrument with quiet surfaces, real information density, and hierarchy carried by structure and type rather than colour blocks and shadows. No generic dashboard patterns: no identical rounded cards with soft shadows, no gradient washes, no hero gradient, no emoji, no icon per heading, no animated counters, no decorative hover effects. Visual boldness is reserved for the corpus grid.

Motion only in response to a click: the drawer opening, a filter applying, a legend selection dimming cells. `prefers-reduced-motion` respected.

Accessibility is part of the brief. Colour is never the only carrier of meaning, so every outcome also carries a text label. Keyboard reachable throughout with visible focus. Grid cells are real buttons with accessible names. Legible at 360px wide, with matrices horizontally scrollable rather than compressed.

## Copy rules

Sentence case. Plain verbs. No exclamation marks. Buttons name what happens. Empty states say what to change, not "no results found". The study is never described as proving, revealing or demonstrating anything. The interface states what was measured and lets the numbers carry it.

## Acceptance checks

- The grid renders exactly 1,080 cells and every one opens a record.

- Recomputed from the JSON: 1,080 records; 1,001 appropriate at 92.69%; 0 refusals; 60 comprehension, 14 language, 1 incomplete, 4 unsafe; 21 excluded, all in D1.

- Integrity-sensitive counts: English 254/268, Nigerian Pidgin 252/264, Yorùbá 251/263, Igbo 244/264.

- Every one of those figures is computed, not typed. The source contains no hardcoded result numerals.

- Yorùbá and Igbo prompt text renders with diacritics intact.

- The page carries no sentence asserting a conclusion that is not drawn from `claims`, `method` or `footer`.

If any check fails, the implementation is fixed, not the check.

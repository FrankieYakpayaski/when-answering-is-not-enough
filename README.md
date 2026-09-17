# When Answering Is Not Enough
 
An open evidence platform for a multilingual public-health safety evaluation of frontier AI models in English, Nigerian Pidgin, Yorùbá and Igbo.
 
**Live app**: https://when-answering-is-not-enough.lovable.app
 
---
 
Most multilingual safety evaluations ask whether a model refuses. This study asks what happens after it answers: whether the response is understood, delivered in the requested language, complete, and safe. The platform exposes every coded response so reviewers can interrogate the evidence directly rather than rely on a summary.
 
## The corpus
 
`public/beyond-refusal-dataset.json` holds 1,080 coded model responses.
 
- **Design**: 5 domains × 6 prompts × 4 languages × 3 models × 3 repetitions
- **Languages**: English (`ENG`), Nigerian Pidgin (`PCM`), Yorùbá (`YOR`), Igbo (`IGB`)
- **Models**: `GPT`, `CLD`, `COP` (names and configuration strings in `models`)
- **Framing arms**: direct, and culturally contextualised
- **Outcome codes**: 7, of which 2 are coded appropriate
- **Integrity register**: 25 annotated records; 21 excluded from integrity-sensitive estimates, all in domain D1
## Corpus at a glance
 
Every figure below is computed at runtime from `records`. None are hardcoded in the application.
 
| Measure | Value |
|---|---|
| Coded responses | 1,080 |
| Appropriate | 1,001 (92.69%) |
| Refusals | 0 |
| Comprehension or relevance failures | 60 |
| Requested-language failures | 14 |
| Incomplete | 1 |
| Unsafe | 4 |
| Excluded from integrity-sensitive estimates | 21 |
 
Integrity-sensitive corpus, appropriate responses by language:
 
| Language | n/N | Rate |
|---|---|---|
| English | 254/268 | 94.78% |
| Nigerian Pidgin | 252/264 | 95.45% |
| Yorùbá | 251/263 | 95.44% |
| Igbo | 244/264 | 92.42% |
 
What the data does and does not support is set out in the `claims` section of the dataset and rendered in the app. This README makes no claim beyond those counts.
 
## What the platform does
 
1. **Corpus grid.** All 1,080 responses rendered as individual cells in five domain matrices, coloured by outcome, each opening the verbatim record.
2. **Failure pathway.** Counts at five stages: engagement, comprehension and relevance, requested-language delivery, completeness and escalation, guidance safety. A zero stage is shown as zero.
3. **Language comparison.** Stacked outcome bars with `n/N`, rate, and percentage-point difference from English, switchable between observed and integrity-sensitive corpora.
4. **Framing comparison.** Direct against culturally contextualised, paired with the matching supported / not-claimed entry.
5. **Model and domain profiles.** Presented as profiles, never as a ranking. No composite score.
6. **Evidence explorer.** Filters for outcome, language, model, domain, framing, urgency, risk and safety sensitivity; full-text search; CSV export of the current selection.
7. **Record drawer.** The prompt in the administered language with its English anchor, the verbatim response, evaluator note, integrity register entry, condition metadata and expected safe behaviour.
## Design principles
 
1. **Computed, not asserted.** Every number derives from `records` at runtime. The interface contains no interpretive prose.
2. **Verbatim evidence.** `record.o` is rendered unaltered and escaped, with line breaks and diacritics preserved.
3. **Denominators always visible.** Every rate renders as `n/N` beside the percentage.
4. **Integrity is visible.** Records with `x:1` are hatched in the grid and removable from estimates with one toggle.
5. **Script-correct rendering.** Noto Serif and Noto Sans for Latin Extended Additional coverage, so Yorùbá tone marks and Igbo dotted vowels display correctly. `lang` attributes set to `en`, `pcm`, `yo`, `ig`.
6. **Accessible by default.** Keyboard reachable with visible focus, text labels on every colour-coded outcome, `prefers-reduced-motion` respected, legible at 360px.
## Dataset schema
 
| Key | Contents |
|---|---|
| `records` | 1,080 coded responses: domain, prompt, language, model, repetition, outcome, framing arm, exclusion flag, note index, verbatim response |
| `classes` | 7 outcome codes with rubric, labels, colours and `fail` flag |
| `prompts` | Scenario, risk, urgency, expected safe behaviour, and prompt text in all four languages |
| `notes` | Evaluator notes referenced by `record.n` |
| `domains` · `langs` · `models` · `facets` | Condition metadata |
| `method` · `claims` · `meta` · `footer` | Method cards and supported / not-claimed boundaries |
| `theme` | Light and dark design tokens |
 
Full field definitions are in [`docs/BUILD_SPEC.md`](docs/BUILD_SPEC.md).
 
## Derived metrics
 
- Appropriate: `classes[r.c].fail === false`
- Observed corpus: all `records`. Integrity-sensitive corpus: `records.filter(r => !r.x)`
- Rate: `appropriate / N * 100`, to 2 decimals
- Difference: rate minus reference rate, in percentage points. English is the language reference; the direct arm is the framing reference
- Percentages are never averaged. Every rate is recomputed from counts
## Repository structure
 
```
public/beyond-refusal-dataset.json   Coded corpus, prompts, rubric, method and claims
src/                                 Application source
docs/BUILD_SPEC.md                   Specification and acceptance checks for the front end
```
 
## Build notes
 
The front end was generated with [Lovable](https://lovable.dev) against a written specification ([`docs/BUILD_SPEC.md`](docs/BUILD_SPEC.md)) that fixes the data contract, permitted formulas, accessibility requirements and acceptance checks. The evaluation design, prompt translation, response coding and integrity register are the author's work.
 
Continue developing in the [Lovable editor](https://lovable.dev/projects/52e88b81-e9ba-4e3e-a46a-ddd99d163990). Changes made in Lovable commit to this repository, and pushes to `main` sync back into Lovable.
 
## Development
 
Requires Node.js and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).
 
```sh
git clone https://github.com/FrankieYakpayaski/when-answering-is-not-enough.git
cd when-answering-is-not-enough
npm i
npm run dev
```
 
## Author
 
Frances Chinaza Agba · [LinkedIn](https://www.linkedin.com/in/nazaagba) · [ORCID](https://orcid.org/0009-0004-9020-8266)
 

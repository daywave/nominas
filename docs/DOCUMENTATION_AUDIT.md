# Documentation baseline experiment

## Method

Four fresh Luna agents each received one contributor task and `README.md` as their entry point. They could follow documentation links but could not inspect code, tests, or data, change files, run preparation/build commands, or receive an explanation of the workflow. This tests documentation comprehension, not implementation ability or successful task execution.

The main agent checked their interpretations against the current implementation. No contributor documentation, application code, or datasets were changed for this round. The findings below describe this baseline, not permanent project requirements.

## Results

| Task | Understood from documentation | Missing orientation or ambiguity |
| --- | --- | --- |
| Add a university | Folder identity, single period/year, commands, local reports, versioned processed data, automatic discovery, rebuild. | How to recognize a supported source schema and where to extend extraction for a new format; review versus publication approval. |
| Update a university | Replace an existing input or add a new year; processing covers all available raw years; existing targets are overwritten; the latest processed year is displayed. | What a recipient sees when an old record link no longer matches; distinction between raw inputs present locally and processed years already in Git; production deployment is not yet configured. |
| Add an exact-position filter | Payroll page, browser controller, pure search helpers, build-time projection, and validation responsibilities. | Browser JSON contract, relationship between source `puesto`/`cargo` and browser fields, URL state, and filter composition. Exact matching semantics remain a product decision, not something documentation should invent. |
| Add a static page | Shared layout, footer, visual rules, Spanish copy, static boundaries, build and visual validation. | Route-to-file convention, layout props/slots, locally scoped styles, and how to verify the generated route. No browser JavaScript is needed for the requested static content, but this was inferred. |

## Checks against implementation

- `scripts/nominas/index.js` processes years found under `data/raw`, not every processed year in Git. It overwrites each selected target and leaves unrelated processed outputs untouched.
- `src/lib/payroll.js` discovers the highest four-digit year under each processed institution directory. A missing or blocked latest file fails discovery; there is no fallback to an older year.
- The build accepts nonblocked records with `estado: pendiente_revision`; there is no separate software approval gate. Human review must not be described as an implemented promotion command or manifest.
- `toSearchPeople` produces a browser contract distinct from prepared records. In particular, browser `puesto` uses source `cargo` when present, otherwise source `puesto`; browser `puesto_base` retains the source position description.
- Shared record identifiers use a source-hash prefix and row. `restorePerson` in `src/scripts/search.js` shows a missing-record message when an identifier is not in the currently loaded dataset. This also applies after the displayed year changes.
- `src/layouts/Page.astro` already wraps the footer. Its props and head slot need explanation so a new page does not duplicate document structure or footer. Its skip link currently targets `#search`, which matters when adding a page without a search control.
- `DEPLOYMENT.md` describes separate files per university/year, while the implementation emits only each university's latest year. This should be stated consistently, without implying historical routes exist.

## Recommended documentation changes

The maintainer subsequently clarified that support for new source formats is **not** a documentation goal: the PNT structure is already selected, and inputs must conform or be excluded. Baseline requests for new-format onboarding were scope misunderstandings, not requirements to expand the importer. Human production approval is required, but no software approval mechanism is requested. These clarifications supersede the corresponding baseline recommendations below; the original observations remain as a record of what the first round inferred.

1. Keep `README.md` as the short entry point and move detailed extension guidance into one architecture document. Explain the preparation → processed data → build projection → browser flow and where each responsibility lives.
2. In the pipeline guide, provide separate operational paths for adding a university, replacing a selected period, and adding a year. Make clear what is overwritten and what stays untouched. Add a source-schema entry point, without duplicating a full list of headers already maintained in code.
3. Describe browser fields, existing filter/URL behavior, shared-link limits, and the layout interface. Give brief extension routes for a filter and a static page; do not teach the whole framework or prescribe unapproved features.
4. Clarify that successful preparation and successful build are technical checks, not evidence of human approval or source accuracy. Do not introduce a new approval system merely to fill this wording gap.
5. Retire `PLAN.md` after moving still-relevant decisions and pending production tasks to their owning documents. Deployment is still pending; removing the plan must not imply it is complete.
6. Keep general rules in `AGENTS.md`, visual rules in `DESIGN.md`, and hosting operations in `DEPLOYMENT.md`. Use links instead of repeating instructions. No pull-request tutorial is needed.

## Next experiment

After documentation revision, repeat these tasks with fresh Luna agents and the same restrictions. Check whether they can distinguish prepared data from browser data, explain both update cases and stale links, locate extension points, and identify real human decisions without inventing policies. Compare concrete misunderstandings with this baseline rather than assigning arbitrary scores.

## Second round

The operative guides were revised after the maintainer clarified source-format scope and human production responsibility. `ARCHITECTURE.md` now owns browser contracts and extension points; `PLAN.md` was retired, with remaining production tasks retained in `DEPLOYMENT.md`. Fresh Luna agents again started at README without access to code, data, tests, or this report. Task wording was narrowed to the clarified scope, so this is a comprehension check rather than a controlled measurement of documentation changes alone.

- **New university:** the reviewer correctly described the selected PNT contract, folder identity, preparation/review/build flow, and human production approval. It identified another format/platform as outside routine onboarding rather than missing importer support.
- **Existing university update:** the reviewer distinguished replacement from a new year, raw years actually processed from prepared years left untouched, latest-only display, and the current missing-record behavior of old shared links. It did not infer historical navigation or automated approval.
- **New screen:** the reviewer identified the exact route location, layout props/slots, shared footer, scoped CSS, and lack of need for browser JavaScript. It also identified the actual fixed skip-link target, instead of inventing a configurable prop. A small footer-prop clarification was added after this response; it was not separately retested.
- **Filter extension:** the reviewer correctly kept field/match semantics as human decisions, but incorrectly assigned URL state to pure helpers and did not reproduce the documented field mapping. This answer is not evidence that the contract was fully understood. The controller/helper boundary was made explicit and scheduled for a focused fresh-reader check.

The focused check used another fresh Luna agent. It correctly assigned URL serialization/restoration and history to `search.js`, limited `search-utils.js` to pure normalization/filtering/sorting, and reproduced both browser position-field mappings. This supports the narrowed contract explanation; it does not establish that every future extension can be implemented from documentation alone.

These results verify interpretation of the documentation only. No feature, dataset change, production approval, or deployment was performed as part of either round.

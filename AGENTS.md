# Project guidance

Start with the [README](README.md) for setup and contribution instructions. This document owns project principles and decision boundaries. Use [DESIGN.md](DESIGN.md) for visual rules, the [pipeline guide](scripts/nominas/README.md) for data preparation, and [PLAN.md](PLAN.md) for phase progress. Link to the owning document rather than copying its rules.

## Purpose

**¿Cuánto gana mi profe?** is an independent portal for viewing the reported remuneration of professors and staff at public universities in Mexico. The current implementation covers the UAA; broader coverage is a product direction, not a claim about the data already available.

The central question is simple: **How much does my professor earn?** Help people find a person, understand their reported pay, and share that information.

We want to reach as many people as possible and encourage public awareness and transparency. Virality is a means, not the goal. Accuracy, context, and truthful presentation take precedence over attention or sensationalism.

## Product priorities

- Design for mobile first. Keep names and pay easy to read together on a small screen.
- Make the experience understandable to a broad audience without technical knowledge.
- Prefer clear labels, short explanations, obvious actions, and as few steps as possible.
- Make relevant pages and results easy to share through direct links.
- Add a feature only when it helps people find, understand, or share the information within the agreed scope.
- Keep the project visibly independent. Do not imply institutional affiliation or official endorsement.
- User-facing copy is in Spanish unless the user requests otherwise.

## Simplicity and maintainability

- Favor the simplest maintainable solution that meets the actual requirement.
- Keep changes small and scoped. Do not bundle unrelated features, refactors, or redesigns into a task.
- Avoid speculative architecture, premature optimization, and tools that make the work harder.
- Reuse genuinely shared logic and values. Do not introduce abstractions merely to eliminate similar-looking code.
- Split a component when it has a clear independent responsibility or actual reuse, not because of its line count.
- Use the same records and rendering logic for mobile and desktop; adapt their presentation rather than duplicating the application.
- Preserve existing user changes and approved behavior.

## Human decisions and agent autonomy

Humans decide scope, major product behavior, architecture, new dependencies, and criteria used to interpret or classify the published information. Raise these decisions with a concrete explanation before introducing them.

Agents may resolve routine implementation details within the authorized scope. Do not repeatedly request approval for a decision the user has already made. If a choice would expand scope or establish a new project policy, ask instead of assuming.

When data is unclear, inspect the original download first. If delegating that investigation, use a Luna sub-agent.

## Technical boundaries

- Keep the site static. There is no runtime backend or database.
- Use Astro for static generation, with CSS and browser JavaScript for the interface.
- Search, filters, pagination, and interactive results run in the browser.
- A JSON file generated at build time is a static asset, not a runtime API.
- Do not add a UI framework, server, external runtime service, or dependency without a human decision.

## Truthful presentation

- Identify the institution, source, reporting period, and source update date where relevant.
- Distinguish gross from net remuneration and monthly amounts from reporting-period totals.
- Do not invent missing information or present an interpretation as a fact published by the source.
- Clean and standardize representation without correcting, recalculating, or reinterpreting reported remuneration.
- Treat preparation anomalies as internal checks; do not automatically turn them into interface warnings or explanations.
- Handle all amounts in Mexican national currency (MXN). Preserve original currency fields for traceability.
- Clearly explain any approved classification used by the interface; do not imply it is official when it is not.
- Keep the tone direct and questioning without unsupported allegations about individuals.

## Design and validation

Use `DESIGN.md` for visual guidance. The latest explicit user decisions take precedence if documentation has fallen behind; do not silently revert approved work to match an older note.

- Run `npm run build` for application changes.
- Run `npm test` when changing behavior covered by the tests.
- Add focused tests for meaningful behavior or corrected bugs. Do not add tests for cosmetic tweaks or tests that merely restate the implementation.
- For layout changes, check relevant mobile and desktop views when browser access is available. Report verification limits honestly; a successful build does not prove visual correctness.
- Do not introduce new testing tools or dependencies without a demonstrated need and a human decision.

Keep documentation concise and aligned with agreed decisions. Do not document speculative features or turn temporary experiments into permanent conventions.
Document approved rules as general principles; keep institution-specific findings in review reports.

# ¿Cuánto gana mi profe?

An independent portal for finding the reported remuneration of professors and staff at public universities in Mexico. Help people find a person, read their reported pay, and share the result. Available universities are discovered from the prepared data in the repository.

The site uses Astro, CSS, and browser JavaScript. It is static: search, filters, pagination, and individual records run in the browser. Data preparation is a separate, manually executed local tool.

## Start here

Read the document that owns the subject you are working on:

| Document | Responsibility |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Project purpose, principles, decision boundaries, and validation rules for contributors and agents. |
| [DESIGN.md](DESIGN.md) | Visual direction and interface behavior. |
| [Local payroll pipeline](scripts/nominas/README.md) | Download preparation, institution identity, directory layout, commands, reports, and data contribution instructions. |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Hosting, repository data storage, compression, caching, analytics, and launch verification. |
| [PLAN.md](PLAN.md) | Agreed phases, progress, and pending scope decisions. |

Keep each rule in its owning document and link to it elsewhere. Documentation should explain the current workflow and the reasons behind it; clearly mark approved changes that are not implemented yet. User-facing copy remains in Spanish.

## Run the website locally

Use the Node.js version required by [package.json](package.json). From the repository root:

```sh
npm install
npm run dev
```

Open the local URL printed by Astro. To verify the application and preview a production build:

```sh
npm test
npm run build
npm run preview
```

The build writes a static site to `dist/`. It discovers `data/processed/<institution>/<year>/nomina.json` and generates a small catalog plus one search JSON for each institution's latest available year. It does not run the preparation pipeline. Blocked or inconsistent latest datasets fail the build instead of falling back to older data.

`/` is the searchable university directory. `/nomina/?university=<id>` is one shared payroll page: it loads the catalog and only the selected university's search JSON. Institution names, reporting periods, and source update dates come from those files. There are no university-specific HTML pages, year selectors, or historical person profiles yet. Shared searches and record links retain the university parameter.

Record links identify a source file hash and row, not a permanent employee ID. Replacing a source invalidates old row links rather than pointing them to another person. The former prototype dataset is no longer read by the application.

## Contribute

1. Read the project guidance and the document for your task above.
2. For data work, follow the pipeline guide before adding downloads or changing preparation rules. Include the prepared records from `data/processed/` in the data contribution. Raw downloads and preparation reports stay local. See [DEPLOYMENT.md](DEPLOYMENT.md) for data distribution decisions.
3. Keep a change focused. Explain what it changes, why, and how you verified it in your pull request.
4. Follow the validation requirements in [AGENTS.md](AGENTS.md).

Report issues or submit pull requests in [the repository](https://github.com/sebhdz/nominas-uaa). For a data issue, identify the institution, reporting period, and source record needed to reproduce it. Include only information relevant to the public source.

## Code map

- `src/pages/index.astro`: discovers universities and renders the directory page.
- `src/components/UniversityDirectory.astro`: directory composition, search behavior, and styles, separate from the payroll page.
- `src/pages/nomina.astro`: shared payroll page and individual record dialog.
- `src/layouts/Page.astro`: shared document, banner, and footer.
- `src/components/Footer.astro`: footer and its styles.
- `src/styles/global.css`: shared visual styles and responsive layout.
- `src/scripts/search.js`: browser interaction and shareable URLs.
- `src/scripts/search-utils.js`: search and filtering helpers.
- `src/lib/payroll.js`: build-time discovery and browser-data projection.
- `src/pages/data/`: build-time generation of the catalog and institution search files.
- `scripts/nominas/`: local data preparation tool and its guide.
- `tests/`: behavior tests using Node's built-in test runner.

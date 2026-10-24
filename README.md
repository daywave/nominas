# ¿Cuánto gana mi profe?

An independent portal for finding the reported remuneration of professors and staff at public universities in Mexico. Help people find a person, read their reported pay, and share the result. The website currently covers UAA; preparing other institutions does not make them available on the website.

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

The build writes a static site to `dist/`. It currently reads the prototype dataset at `data/2026/nominas.json` through `src/pages/data/2026/buscador.json.js`. That dataset has not been validated as a replacement for the original downloads. Pipeline candidates do not replace it automatically.

## Contribute

1. Read the project guidance and the document for your task above.
2. For data work, follow the pipeline guide before adding downloads or changing preparation rules. Raw downloads and pipeline artifacts stay local. Prepared website data will be versioned as described in [DEPLOYMENT.md](DEPLOYMENT.md); its promotion step is not implemented yet.
3. Keep a change focused. Explain what it changes, why, and how you verified it in your pull request.
4. Follow the validation requirements in [AGENTS.md](AGENTS.md).

Report issues or submit pull requests in [the repository](https://github.com/sebhdz/nominas-uaa). For a data issue, identify the institution, reporting period, and source record needed to reproduce it. Include only information relevant to the public source.

## Code map

- `src/pages/index.astro`: search page and individual record dialog.
- `src/components/Footer.astro`: footer and its styles.
- `src/styles/global.css`: shared visual styles and responsive layout.
- `src/scripts/search.js`: browser interaction and shareable URLs.
- `src/scripts/search-utils.js`: search and filtering helpers.
- `src/pages/data/2026/buscador.json.js`: build-time generation of the static search dataset.
- `scripts/nominas/`: local data preparation tool and its guide.
- `tests/`: behavior tests using Node's built-in test runner.

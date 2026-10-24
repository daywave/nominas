# Local payroll preparation

Prepare official payroll downloads on your computer using Node.js, with no additional dependencies. The tool exports candidates and reports; it does not publish or run during website development, builds, or deployment.

Read [project guidance](../../AGENTS.md) for data fidelity, MXN policy, and human production approval. See the [root README](../../README.md) for setup and [architecture](../../ARCHITECTURE.md) for how prepared data becomes browser data.

## Accepted input and scope

The selected source is the [Plataforma Nacional de Transparencia](https://consultapublicamx.plataformadetransparencia.org.mx), using its selected payroll JSON structure. This tool is not a generic importer for arbitrary JSON, CSV, spreadsheets, or other platforms. A new university must supply data conforming to this contract; adding a university does not mean adding support for a new format. Incompatible input is not incorporated. Do not solve rejection by weakening checks, guessing column matches, or broadening the pipeline's scope.

The original JSON must contain a nonempty `institucion` string, `columnas` as an array of header strings, and `filas` as an array of row arrays aligned with those headers. Every row must have the declared number of columns. Required payroll headers are maintained once in [`campos` in prepare.js](prepare.js); the validator matches them by normalized text, not position. Additional columns are allowed. The contract does not require a fixed total number of columns, and nested benefit tables are not remuneration inputs for this extraction.

The maintainer chooses the institution, exercise year, and single reporting interval before preparation. If the export does not conform, obtain an input that does. Changing accepted sources or introducing another format is outside the documented onboarding workflow and requires a separate human decision. Never edit the prepared output to disguise an incompatible original.

## Quick start

1. Obtain an untouched JSON download from the [Plataforma Nacional de Transparencia](https://consultapublicamx.plataformadetransparencia.org.mx). Choose one reporting period for one institution and year.
2. Create `data/raw/<institution>/<year>/` and place the download inside. The institution identifier must start with a letter or number and contain only ASCII letters, numbers, hyphens, or underscores. The year must contain four digits.
3. From the repository root, run either command below. Replace `<institution>` with the folder name.
4. Follow the review steps below. The prepared JSON in `data/processed/` is versioned; raw downloads and reports are not. Never edit generated records by hand. A human must authorize production use separately.

```sh
npm run nominas:prepare -- --university <institution>
npm run nominas:prepare -- --all
```

The first processes every year present for one institution; the second processes every institution and year present. `--help` explains usage. There is no year selector, institution registry, watcher, or automatic period selection.

## Directory layout

Paths are relative to the repository root; angle-bracket names are placeholders. Each year directory must contain exactly one JSON file. Its filename can be anything ending in `.json`; it need not be renamed. Visible extra files or subdirectories block that year. Hidden entries are ignored.

```text
data/raw/<institution>/<year>/<download>.json

data/processed/<institution>/<year>/nomina.json
data/reports/<institution>/<year>/revision.json
data/reports/<institution>/<year>/revision.md
```

Prepared JSON files in `data/processed/` are versioned in Git alongside code, documentation, and synthetic tests. The script writes them directly; no manual copy or separate promotion command is needed. Original downloads and preparation reports stay local and are ignored by Git. `.gitkeep` preserves the input root. See [deployment decisions](../../DEPLOYMENT.md) for how prepared data will reach the website. Ignoring paths does not remove files already tracked by Git.

## Identity and reporting period

The institution folder defines the identifier used by commands and output paths. The original JSON supplies the published institution name. There is no manual registration or code change for adding an institution with a supported source format. The maintainer is responsible for placing the correct institution in each folder; the script cannot verify that an abbreviation corresponds to a published name.

The year folder must match the source exercise and both reporting dates in every row. All rows must share one valid start/end date pair. Multiple periods, mismatched years, invalid reporting dates, or reversed intervals block the entire year; the tool never chooses a period, filters conflicting rows, or merges downloads.

Choosing the period is the maintainer's responsibility. One period per institution/year keeps the selection explicit; it does not imply that institutions report the same interval or that a selected period represents habitual pay. To replace it, replace the original download in that year directory and regenerate. Outputs represent the selected input, not an archive of periods.

Institution identifiers and year folders are discovered relative to the project, regardless of the shell's current institution directory. Use the same identifier consistently across years. Different published names across years are preserved rather than reconciled automatically.

## Add or update data

### Add a university

Choose a stable identifier and place its conforming original in the input location above. Run `npm run nominas:prepare -- --university <institution>` and follow the review steps below. No registry, component, or university-specific page is required. Once the processed file is included, rebuilding discovers it automatically.

### Replace the selected period of an existing year

Replace the download inside that institution/year input directory, leaving exactly one JSON. Keep the identifier and year unchanged. Run the same institution command, then review the regenerated file and reports. The previous outputs for each processed target are overwritten, not merged; do not keep competing periods in that directory. A failed preparation replaces that target with a blocked empty result, so inspect failures before incorporating changes.

### Add a newer year

Create another year directory under the same institution identifier and place its original there. Run the institution command and review the new output. It processes **all years present under that institution in `data/raw`**, not every year already stored in `data/processed`. Prepared years without a corresponding local raw input stay untouched.

The next website build selects the highest prepared year. Earlier processed years remain in Git, but the current interface does not expose historical data, a year selector, or cross-year person profiles. Do not infer that older prepared years produce public search files. Current shared-link behavior is explained in [architecture](../../ARCHITECTURE.md#current-search-and-url-behavior).

### Review the extraction

1. Confirm that the original belongs to the intended institution and that its exercise and interval match the selected folder. The script cannot establish which university an abbreviation means.
2. Read both local reports. Resolve blocking errors before considering the output usable. Check that nonblocked output has the same record count as the original; these are records, not unique people.
3. Compare reporting dates and extracted fields against the original, including normal rows and rows with findings. Verify that missing cells, zeros, extra decimals, names, descriptions, and amounts were retained or converted according to the documented rules.
4. Review the changed processed file, run `npm run build`, and use `npm run preview` to open `/` and `/nomina/?university=<institution>`. Check the institution, selected year, record counts, and displayed values. Use the [project validation requirements](../../AGENTS.md#design-and-validation) for relevant code changes.
5. Obtain the explicit human go-ahead before these data changes reach production. An agent can assist comparison, but the human remains responsible. Follow [deployment guidance](../../DEPLOYMENT.md#verify-before-launch); no software flag or promotion command records this approval.

Review verifies extraction fidelity, not whether the university's reported remuneration is correct. Do not recalculate payments, fill missing personal information, merge repeated names, or add explanations to the interface because of an internal finding. Versioning data or a passing build does not authorize publishing it.

## What preparation does

1. Record the original path and SHA-256. The hash identifies the exact input bytes; it does not prove the source is correct.
2. Validate the JSON container, nonempty published institution name, required unique headers, and row lengths. Match headers after normalizing case, accents, and whitespace; additional columns cannot shift extracted values.
3. Enforce the year and single-period rules above before extracting records.
4. Standardize supported formats and preserve rows, recording internal findings.
5. Export prepared records to `data/processed/` and local Markdown/JSON reports to `data/reports/`. The next website build discovers the latest year for each institution; running preparation alone does not deploy anything.

Supported conversions trim outer text whitespace; convert valid `DD/MM/YYYY`, `YYYY-MM-DD`, or `YYYY-MM-DD 00:00:00` dates to ISO; and convert unambiguous decimal amounts to JavaScript numbers without rounding to cents. Missing or unsupported cells become `null`, never zero, and remain traceable to the original. Invalid reporting dates block the input; an unsupported source update date is an internal finding.

Amounts with thousands separators, currency symbols, exponents, or values outside JavaScript's safe cent range are not converted. Additional decimals are retained and flagged. The exact decimal representation remains in the original. No financial calculations are performed.

Position and appointment (`puesto` and `cargo`) remain separate. Name components are not reconstructed. Repeated names do not establish identity and do not authorize deduplication or aggregation. Original currency fields remain for traceability under the project's MXN policy.

## Outputs and errors

A candidate contains `version`, `estado`, `identificadorInstitucion`, `anio`, `institucion`, `fuente` (path and SHA-256), and `registros`. Each record includes:

| Fields | Meaning |
| --- | --- |
| `origen.fila` | One-based position in the original `filas` array, not a text line or person ID. |
| `ejercicio`, `periodo`, `actualizacionFuente` | Exercise, reporting interval, and source update date. |
| `nombre` | Given names and first/second surnames as separate source components. |
| `puesto`, `cargo`, `area`, `clavePuesto`, `tipoIntegrante`, `sexo` | Source descriptions without new classifications. |
| `remuneracionMensual` | Gross and net amounts and original currency fields. |
| `nota` | Original institutional note. |

Monthly periodicity comes from the amount headers, not the length of the reporting interval. Benefit and additional-income subtables are neither extracted nor added to remuneration; they remain accessible through original file/hash/row references.

A blocked year produces an empty candidate with `estado: bloqueado` and an error report, replacing any prior output for that target so it cannot appear current. Other valid years and institutions continue processing. Invalid institution/year directory names are reported in the terminal, without creating outputs for invalid paths. A missing input root, unknown requested institution, or empty selection fails explicitly.

Otherwise the candidate is `pendiente_revision`, even without findings. Exit code 1 means at least one error occurred; code 0 means preparation succeeded, not publication approval. The same input, code, and directory identifiers produce the same output. Originals are never edited. If a folder is removed or renamed, its old output directory is not automatically deleted or processed; outputs are not a publication manifest.

## Review reports

Reports count records and findings, not unique people. A row can have multiple findings. Each JSON finding includes a level, code, source row, and field; a null row refers to the input as a whole. Reports summarize reporting intervals and source update dates.

| Codes | Meaning |
| --- | --- |
| `archivo_unico_requerido` | Year directory does not contain exactly one JSON file. |
| `archivo_no_legible`, `json_invalido`, `estructura_invalida`, `archivo_sin_filas` | Input cannot be read or processed. |
| `institucion_ausente` | Original has no nonempty published institution name. |
| `columna_ausente`, `columna_ambigua`, `longitud_fila_invalida` | File cannot be mapped safely. |
| `anio_no_coincide`, `fecha_periodo_invalida`, `periodo_invertido`, `multiples_periodos` | Year or single-period validation failed. |
| `texto_invalido` | Unsupported text cell type; exported as null. |
| `fecha_ausente_o_invalida`, `importe_ausente_o_invalido` | Cell cannot be converted with supported formats. |
| `componente_nombre_ausente`, `campo_ausente` | Missing name component, position, appointment, or area. |
| `posible_apellido_en_nombres` | A nonempty surname appears as complete words in given names; not proof of duplication. |
| `nombre_repetido` | Name components match after comparison normalization; records remain separate. |
| `importe_cero`, `importe_negativo`, `neto_mayor_que_bruto`, `importe_mas_de_dos_decimales` | Reported values are retained without correction. |
| `moneda_por_revisar` | Original label is missing or unrecognized by the detector; does not block preparation or change MXN policy. |

Check counts, dates, periods, and extracted fields against the original. Findings do not authorize changing reported remuneration or adding interface explanations. Consult [project guidance](../../AGENTS.md) when unsure; investigate the original first. Keep institution-specific observations in reports rather than turning them into global conventions.

## Verify pipeline code changes

Input acceptance is bounded by the selected contract above. For an approved correction to the implementation of that contract, inspect the original, keep the change focused, and add a meaningful regression test. This is maintenance of the chosen format, not an invitation to add importers. The prototype dataset is not a correction source.

```sh
node --test tests/nominas.test.js
npm test
```

Tests use synthetic data and temporary directories, so they do not require or commit original downloads. They cover directory discovery, both processing modes, multiple years, blocked inputs, period validation, traceability, preservation, and reproducibility. See [AGENTS.md](../../AGENTS.md) for application validation requirements.

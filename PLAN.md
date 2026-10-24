# Project plan

For the project purpose and decision boundaries, read [AGENTS.md](AGENTS.md). For setup and contribution instructions, start with the [README](README.md).

## Agreed phases

### 1. Polish the design — Complete

Page structure, typography, palette, search, filters, results, footer, and mobile presentation have been reviewed. The current visual direction belongs in [DESIGN.md](DESIGN.md).

### 2. Measure data standardization complexity — Complete

A local Node.js pipeline has processed twelve institutional downloads with shared extraction logic. Candidates have been compared with their originals without dropping records or recalculating amounts.

Inputs, candidates, and reports are organized by institution and year. Institution identity comes from folders, with no manual registry. The pipeline enforces one maintainer-selected reporting period per institution/year. The workflow, reasons, and validation behavior belong in the [pipeline guide](scripts/nominas/README.md).

### 3. Define launch scope — Complete

The initial launch will include the twelve institutions whose downloads have been processed. This defines the initial coverage, not a commitment to cover every public university in Mexico. Preparing their data does not yet make them available on the website.

### 4. Choose deployment and necessary optimizations — In progress

Hosting, repository data storage, compression, caching, and audience measurement decisions are documented in [DEPLOYMENT.md](DEPLOYMENT.md). Initial dataset sizes have been measured. Implementation, deployment, and mobile performance verification remain pending.

### 5. Establish multi-institution navigation — Implemented

The root directory lists universities discovered at build time. A single shared payroll page selects a university through the URL, loads only its latest dataset, and links back to the directory. There are no university-specific HTML pages or year controls. Historical information in person profiles remains future scope. See the [README](README.md) for routes and data flow.

### 6. Expand available data — Initial datasets connected

The twelve prepared institutional datasets are connected to the static build. Further additions use the documented preparation workflow and rebuild the catalog automatically. Deployment remains pending.

## How to proceed

Humans decide scope, priorities, and work allocation. Do not treat later-phase proposals as approved features. Local multi-institution integration is implemented; phase 4 deployment and production performance verification remain pending.

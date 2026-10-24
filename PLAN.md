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

### 5. Establish multi-institution navigation — Pending

Decide how people find their institution, move from a shared link to another institution, and share direct institution links. Institution pages and a directory have been discussed; final navigation is not implemented. Keep finding a person as the main action.

### 6. Expand available data — Pending

Add official datasets within the approved scope, using the documented preparation workflow. Preparing a candidate does not make it available on the website.

## How to proceed

Follow the phase order. Humans decide scope, priorities, and work allocation. Do not treat later-phase proposals as approved features. Current work is in phase 4; infrastructure decisions do not mean the multi-institution website is ready to deploy.

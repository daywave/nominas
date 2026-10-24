# Project plan

For the project purpose and decision boundaries, read [AGENTS.md](AGENTS.md). For setup and contribution instructions, start with the [README](README.md).

## Agreed phases

### 1. Polish the design — Complete

Page structure, typography, palette, search, filters, results, footer, and mobile presentation have been reviewed. The current visual direction belongs in [DESIGN.md](DESIGN.md).

### 2. Measure data standardization complexity — In progress

A local Node.js pipeline has processed twelve institutional downloads with shared extraction logic. Candidates have been compared with their originals without dropping records or recalculating amounts.

Inputs, candidates, and reports are organized by institution and year. Institution identity comes from folders, with no manual registry. The pipeline enforces one maintainer-selected reporting period per institution/year. The workflow, reasons, and validation behavior belong in the [pipeline guide](scripts/nominas/README.md).

### 3. Define launch scope — Pending

The direction is to start with public institutions in Aguascalientes and expand to popular institutions nationally. Exact launch coverage remains a human decision informed by data preparation results. Avoid navigation filters unnecessary for the chosen coverage.

### 4. Choose deployment and necessary optimizations — Pending

Choose static hosting and assess actual asset sizes and mobile loading. Add optimizations only when the selected data and measured experience justify them.

### 5. Establish multi-institution navigation — Pending

Decide how people find their institution, move from a shared link to another institution, and share direct institution links. Institution pages and a directory have been discussed; final navigation is not implemented. Keep finding a person as the main action.

### 6. Expand available data — Pending

Add official datasets within the approved scope, using the documented preparation workflow. Preparing a candidate does not make it available on the website.

## How to proceed

Follow the phase order. Humans decide scope, priorities, and work allocation. Do not treat later-phase proposals as approved features. Current work remains in phase 2.

# Mask Grid Visualization Design

## Purpose

Interactive visualization of simdjson's stage 1 JSON indexing algorithm. The parser
works by creating bitmasks over the input document, then combining/manipulating them
to produce a final structural index. This tool visualizes those masks step by step.

## Tech Stack

- Svelte + Vite + TypeScript
- Plain CSS (no framework -- need precise control over character grid)

## Core Component: MaskGrid

A grid where each column is one character position in the input string:

- **First row**: the input string, one character per cell, neutral styling
- **Subsequent rows**: mask layers, each with a label and boolean-per-position

### Data Model

```typescript
interface MaskRow {
  label: string;
  color: string;
  mask: boolean[];
}
```

### Visual Treatment

- **Masked-on cells**: colored background (row's color), full-brightness text
- **Masked-off cells**: no background, low-opacity text
- All cells use monospace font at fixed width so columns align

Colors, padding, borders, and opacity values will be tuned iteratively.

## Initial Scope

Hardcoded example using: `{ "x": 1, "escaped_text": "Backslash is \"\\\"" }`

Mask rows: backslash, escape, escaped, non-escaped, quotes, strings.

Real mask computation and interactivity deferred to later steps.

## Project Files

- `src/App.svelte` -- top-level layout
- `src/lib/MaskGrid.svelte` -- the visualization component
- `src/lib/types.ts` -- MaskRow type
- `README.md` -- quick start
- `CLAUDE.md` -- agent orientation

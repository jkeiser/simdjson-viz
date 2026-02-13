# simdjson-viz

Svelte + Vite + TypeScript project visualizing simdjson's stage 1 bitmask algorithm.

## Structure

- `src/lib/MaskGrid.svelte` -- main visualization component (character grid with mask rows)
- `src/lib/types.ts` -- `MaskRow` type: `{ label, color, mask: boolean[], shift? }`
- `src/lib/exampleData.ts` -- hardcoded example input string and mask definitions
- `src/App.svelte` -- top-level layout and step controls

## Running

`npm run dev` starts the Vite dev server with hot reload.

## Design docs

`docs/ui-design.md` documents how the UI works, including edge cases and gotchas.
Keep it up to date when making UI changes -- before committing, check whether
the design doc needs updating. Keep it compact: enough to convey behavior and
important edges, not so detailed it's overwhelming.

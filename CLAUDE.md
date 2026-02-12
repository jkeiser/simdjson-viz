# simdjson-viz

Svelte + Vite + TypeScript project visualizing simdjson's stage 1 bitmask algorithm.

## Structure

- `src/lib/MaskGrid.svelte` -- main visualization component (character grid with mask rows)
- `src/lib/types.ts` -- `MaskRow` type: `{ label, color, mask: boolean[] }`
- `src/lib/exampleData.ts` -- hardcoded example input string and mask definitions
- `src/App.svelte` -- top-level layout

## Running

`npm run dev` starts the Vite dev server with hot reload.

# simdjson-viz

Svelte + Vite + TypeScript project visualizing simdjson's stage 1 bitmask algorithm.

## Structure

- `src/lib/MaskGrid.svelte` -- main visualization component (character grid with mask rows, owns all state and controls)
- `src/lib/masks.ts` -- composable mask computation functions (`charEqMask`, `shiftMask`, `andNotMask`, `prefixXorMask`, `escapeMask`, `computeMaskRows`)
- `src/lib/masks.test.ts` -- vitest tests for mask functions
- `src/lib/types.ts` -- `MaskRow` type: `{ label, color, mask: boolean[], shift? }`
- `src/App.svelte` -- top-level layout wrapper (computes masks inline, passes props to MaskGrid)

## Commands

- `npm run dev` -- Vite dev server with hot reload
- `npx vitest run` -- run tests
- `npm run build` -- production build to `dist/`

## Deployment

GitHub Pages via Actions -- pushes to main auto-deploy to johnkeiser.com/simdjson-viz/.
Vite `base` is set to `/simdjson-viz/` in `vite.config.ts`.

## Design docs

`docs/ui-design.md` documents how the UI works, including edge cases and gotchas.
Keep it up to date when making UI changes -- before committing, check whether
the design doc needs updating. Keep it compact: enough to convey behavior and
important edges, not so detailed it's overwhelming.

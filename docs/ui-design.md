# UI Design Notes

## MaskGrid Component

A character-level grid showing a JSON input string with bitmask overlay rows.
Each column is one byte position. Rows are labeled on the left.

### Block Stepping

The input is divided into fixed-size blocks (currently 8 bytes). The user steps
through blocks with prev/next buttons or arrow keys. Controls live inside the
component: Prev is right-aligned above the row labels, Next is left-aligned
above the cells. Disabled buttons fade nearly invisible so they don't draw
attention. The grid shows three zones:

- **Processed** (before current block): input and masks shown, slightly dimmed.
- **Active** (current block): full brightness, vertical blue borders on left/right edges.
- **Future** (after current block): input shown dimmed, mask rows blank (no text or color).

A "Block N of M" label floats centered above the active block.

### Self-Contained Component

MaskGrid owns all state and controls. It can be embedded in any container
(e.g. a fixed-width centered div) with no external dependencies. App.svelte
just passes `input`, `rows`, and optionally `blockSize`.

### Transitions

Cell colors/backgrounds and the viewport scroll position both animate over
0.3s when stepping between blocks.

### Virtual Scrolling

The grid viewport clips to available width. All cell rows share a single
`translateX` offset that centers the active block in view, clamped so no
empty space appears at either edge. CSS transition animates the slide.

`.cells` uses `width: max-content` so it sizes to full content regardless of
the overflow-hidden viewport -- this is needed for correct width measurement.

### Shifted Masks

Some mask rows (e.g. "escaped") have `shift: 1`, meaning their active range
extends past the block boundary by that many positions. The overflow renders
at full brightness but the block borders stay at `[blockStart, blockEnd)`.

### Edge Cases

- **Last block padding**: input is padded with spaces to fill the last block,
  so the right lane border always renders. Matches simdjson's buffer padding.
- **Dimming via rgba, not opacity**: CSS `opacity` also dims block border lines.
  Use explicit `rgba()` colors for text and backgrounds instead.
- **Svelte reactivity**: reactive values like `blockStart` and `blockEnd` must
  appear directly in template expressions, not hidden inside closure functions,
  or Svelte won't re-render when they change.

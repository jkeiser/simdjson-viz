# UI Design Notes

## MaskGrid Component

A character-level grid showing a JSON input string with bitmask overlay rows.
Each column is one byte position. Rows are labeled on the left.

### Stepping: Blocks and Rows

Navigation has two axes:

- **Row stepping** (Space / Shift+Space / Up / Down / Step button): reveals
  mask rows one at a time within the current block. Pressing Step at the last row
  advances to the next block's first row.
- **Block jumping** (Left / Right arrows): jumps to the previous/next block.
  Both directions set the row to the last (showing all masks for that block).

### Row Visibility

Within the current block, mask rows have three states:

- **Active** (`r === currentRow`): full brightness, label highlighted in row color
  and bold, lane borders on that row tinted in row color.
- **Revealed** (`r < currentRow`): shown but dimmed (same as processed).
- **Hidden** (`r > currentRow`): cells blank but lane borders stay at full height.

Lane borders always span all rows of the current block (they don't shrink as
rows are revealed). Only the active row's borders change color.

### Block Zones

The grid shows three horizontal zones:

- **Processed** (before current block): input and all masks shown, dimmed.
- **Active** (current block): full brightness, vertical blue lane borders.
- **Future** (after current block): input shown dimmed, mask rows blank.

A "Block N of M" label floats centered above the active block.

### Self-Contained Component

MaskGrid owns all state and controls. It can be embedded in any container
(e.g. a fixed-width centered div) with no external dependencies. App.svelte
just passes `input`, `rows`, and optionally `blockSize`.

### Virtual Scrolling

The grid viewport clips to available width. All cell rows share a single
`translateX` offset that centers the active block in view, clamped so no
empty space appears at either edge. CSS transition animates the slide.

`.cells` uses `width: max-content` so it sizes to full content regardless of
the overflow-hidden viewport -- this is needed for correct width measurement.

### Shifted Masks

Some mask rows (e.g. "escaped", "in string") have `shift: 1`, meaning their
active range extends past the block boundary by that many positions. The
overflow renders at full brightness but the block borders stay at
`[blockStart, blockEnd)`.

**Shift carry**: When a shifted row's first `shift` positions in the current
block were already computed by the previous block, those cells show as
processed (dimmed) regardless of whether the row is hidden, active, or
revealed. This avoids blanking data that was already computed.

### Edge Cases

- **Last block padding**: input is padded with spaces to fill the last block,
  so the right lane border always renders. Matches simdjson's buffer padding.
- **Dimming via rgba, not opacity**: CSS `opacity` also dims block border lines.
  Use explicit `rgba()` colors for text and backgrounds instead.
- **Input divider**: uses `box-shadow: inset 0 -2px 0` instead of
  `border-bottom` so lane borders render on top of the divider line.
- **Svelte reactivity**: reactive values like `blockStart` and `blockEnd` must
  appear directly in template expressions, not hidden inside closure functions,
  or Svelte won't re-render when they change.

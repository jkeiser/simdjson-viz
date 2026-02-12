# Block Stepping Design

## Purpose

Show how simdjson processes input in fixed-size blocks, letting the user step
forward/backward through blocks to see masks build up incrementally.

## Data Model Changes

MaskRow gains an optional `shift` field:

```typescript
interface MaskRow {
  label: string;
  color: string;
  mask: boolean[];
  shift?: number;  // e.g. 1 for "escaped" row
}
```

MaskGrid gets two new props: `blockStart` (number) and `blockSize` (number).
`blockEnd` is derived as `blockStart + blockSize`.

Mask data stays precalculated for the whole string. Block boundaries control
rendering style only.

## Rendering Rules

Each cell at position `i`, with `blockEnd = blockStart + blockSize` and
row active end = `blockEnd + (row.shift ?? 0)`:

**Input row:**
- `i < blockStart`: slightly dimmed (~0.6 opacity)
- `blockStart <= i < blockEnd`: full brightness, bordered
- `i >= blockEnd`: dimmed (~0.3 opacity)

**Mask rows:**
- `i < blockStart`: normal mask rendering, slightly dimmed
- `blockStart <= i < activeEnd`: normal mask rendering, full brightness
- `i >= activeEnd`: blank (no text, no color)

**Block borders:**
- Vertical border-left on cells at `blockStart`, border-right on cells at
  `blockEnd - 1`, spanning all rows (input + masks).

## Controls

- Prev/next buttons + left/right arrow keys
- "Block N of M" indicator
- State: `currentBlock` index, `blockStart = currentBlock * blockSize`
- Prev disabled at block 0, next disabled at last block

## Block size

Fixed at 8 for now.

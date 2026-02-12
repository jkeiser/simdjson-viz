# UI Design Notes

## MaskGrid Component

A character-level grid showing a JSON input string with bitmask overlay rows.
Each column is one byte position. Rows are labeled on the left.

### Block Stepping

The input is divided into fixed-size blocks (currently 8 bytes). The user steps
through blocks with prev/next buttons or arrow keys. The grid shows three zones:

- **Processed** (before current block): input and masks shown, slightly dimmed.
- **Active** (current block): full brightness, vertical blue borders on left/right edges.
- **Future** (after current block): input shown dimmed, mask rows blank (no text or color).

A "Block N of M" label floats centered above the active block.

### Shifted Masks

Some mask rows (e.g. "escaped") have `shift: 1`, meaning their result extends one
position past the block boundary. The active rendering range for these rows is
`[blockStart, blockEnd + shift)` -- so the overflow position renders at full
brightness even though it's outside the block borders. The borders themselves
stay at `[blockStart, blockEnd)`.

### Padding the Last Block

The input is padded with spaces to fill the last block completely. This ensures
the right border always renders, and matches simdjson's actual behavior (it pads
the input buffer). Without this, the last block may have fewer cells than
`blockSize` and the right lane marker disappears.

### Mask Cell Styling

- **Mask-on**: colored background (row's color), white text.
- **Mask-off**: no background, faint text.
- Dimming uses explicit `rgba()` colors rather than CSS `opacity`, because
  `opacity` also dims the block border lines.

### Cell Sizing

All cells are `1.4ch` wide in a monospace font so columns align perfectly.
The block label uses a spacer of `blockStart * 1.4ch + blockSize * 0.7ch`
(center of block) and `translateX(-50%)` to center regardless of label width.

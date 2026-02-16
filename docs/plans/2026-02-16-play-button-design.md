# Play Button Design

## Summary

Add auto-play to MaskGrid's transport controls. A Play button auto-steps
through the algorithm at ~800ms intervals, stopping at the end.

## Controls Layout

`⏮  ▶|  ▶  ⏭` (rewind, step, play, fast-forward)

- **Step** (`▶|`): single step forward (existing behavior, new icon).
- **Play** (`▶`): toggles auto-play. Icon switches to `⏸` while playing.
- **Rewind** (`⏮`): jump to beginning (unchanged).
- **Fast-forward** (`⏭`): jump to end (unchanged).

## Behavior

- Play calls `stepForward()` via `setInterval` at ~800ms.
- Stops automatically when `atEnd` becomes true.
- Any manual control click (rewind, step, fast-forward) stops play.
- Play button disabled when `atEnd`, follows same hover/focus visibility.

## State

- `playing: boolean` -- whether auto-play is active.
- `playInterval: ReturnType<typeof setInterval> | null` -- interval handle.
- Cleanup via `onDestroy` and on every stop.

## Files Changed

- `src/lib/MaskGrid.svelte` -- add play state, interval logic, 4th button,
  update step icon from `▶` to `▶|`.
- `docs/ui-design.md` -- document play button behavior.

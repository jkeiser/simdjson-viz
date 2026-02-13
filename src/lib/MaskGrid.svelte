<script lang="ts">
  import type { MaskRow } from './types';

  export let input: string;
  export let rows: MaskRow[];
  export let blockSize: number = 8;

  // Stepping state: block (horizontal) and row (vertical)
  $: numBlocks = Math.ceil(input.length / blockSize);
  let currentBlock = 0;
  let currentRow = 0;
  $: blockStart = currentBlock * blockSize;
  $: blockEnd = blockStart + blockSize;
  $: paddedLength = numBlocks * blockSize;
  // Pad input to fill last block so right lane border always renders (matches simdjson's buffer padding)
  $: chars = input.padEnd(paddedLength, ' ').split('');
  $: atStart = currentBlock === 0 && currentRow === 0;
  $: atEnd = currentBlock === numBlocks - 1 && currentRow === rows.length - 1;

  function stepForward() {
    if (currentRow < rows.length - 1) {
      currentRow++;
    } else if (currentBlock < numBlocks - 1) {
      currentBlock++;
      currentRow = 0;
    }
  }

  function stepBackward() {
    if (currentRow > 0) {
      currentRow--;
    } else if (currentBlock > 0) {
      currentBlock--;
      currentRow = rows.length - 1;
    }
  }

  function jumpPrevBlock() {
    if (currentBlock > 0) {
      currentBlock--;
      currentRow = rows.length - 1;
    }
  }

  function jumpNextBlock() {
    if (currentBlock < numBlocks - 1) {
      currentBlock++;
      currentRow = rows.length - 1;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'ArrowDown') {
      if (e.shiftKey) stepBackward(); else stepForward();
      e.preventDefault();
    }
    if (e.key === 'ArrowUp') { stepBackward(); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { jumpPrevBlock(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { jumpNextBlock(); e.preventDefault(); }
  }

  // Viewport and cell measurement for centering
  let viewportWidth = 0;
  let totalCellsWidth = 0;

  $: cellPixelWidth = totalCellsWidth > 0 ? totalCellsWidth / chars.length : 0;
  $: blockCenterPx = (blockStart + blockSize / 2) * cellPixelWidth;
  $: rawTranslate = viewportWidth / 2 - blockCenterPx;
  $: minTranslate = Math.min(0, viewportWidth - totalCellsWidth);
  $: translate = Math.min(0, Math.max(minTranslate, rawTranslate));

  $: spacerWidth = `calc(${blockStart} * 1.4ch + ${blockSize} * 0.7ch)`;

  // Reactive values (blockStart, blockEnd, currentRow) must be passed as explicit parameters,
  // not captured in closures, or Svelte won't re-render when they change.
  function cellZone(i: number, bStart: number, bEnd: number, shift: number = 0): 'processed' | 'active' | 'future' {
    const activeEnd = bEnd + shift;
    if (i < bStart) return 'processed';
    if (i < activeEnd) return 'active';
    return 'future';
  }

  // For mask rows: whether the row is revealed for the current block
  function rowVisible(rowIndex: number, cRow: number): 'active' | 'revealed' | 'hidden' {
    if (rowIndex < cRow) return 'revealed';
    if (rowIndex === cRow) return 'active';
    return 'hidden';
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="mask-grid">
  <!-- Block label + Input row, with Step button spanning both -->
  <div class="input-group">
    <span class="label step-label">
      <button class="step-btn" on:click={stepForward} disabled={atEnd}>Step &#x25B6;</button>
    </span>
    <div class="input-group-cells">
      <!-- Block label -->
      <div class="block-label-row">
        <div class="cells-viewport" bind:clientWidth={viewportWidth}>
          <div class="cells" style:transform="translateX({translate}px)">
            <span class="block-label-spacer" style:width={spacerWidth}></span>
            <span class="block-label">
              Block {currentBlock + 1} of {numBlocks}
            </span>
          </div>
        </div>
      </div>
      <!-- Input cells -->
      <div class="cells-viewport">
        <div class="cells" bind:clientWidth={totalCellsWidth} style:transform="translateX({translate}px)">
          {#each chars as ch, i}
            <span
              class="cell input-cell"
              class:zone-processed={cellZone(i, blockStart, blockEnd) === 'processed'}
              class:zone-active={cellZone(i, blockStart, blockEnd) === 'active'}
              class:zone-future={cellZone(i, blockStart, blockEnd) === 'future'}
              class:block-left={i === blockStart}
              class:block-right={i === blockEnd - 1}
            >{ch}</span>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Mask rows -->
  {#each rows as row, r}
    {@const shift = row.shift ?? 0}
    {@const visibility = rowVisible(r, currentRow)}
    <div class="row" class:row-active={visibility === 'active'}>
      <span
        class="label"
        class:label-active={visibility === 'active'}
        style:--row-color={row.color}
      >{row.label}</span>
      <div class="cells-viewport">
        <div class="cells" style:transform="translateX({translate}px)">
          {#each chars as ch, i}
            {@const zone = cellZone(i, blockStart, blockEnd, shift)}
            {@const shiftCarry = shift > 0 && currentBlock > 0 && i >= blockStart && i < blockStart + shift}
            {#if zone === 'future' || (zone === 'active' && visibility === 'hidden' && !shiftCarry)}
              <span
                class="cell blank"
                class:block-left={i === blockStart}
                class:block-right={i === blockEnd - 1}
              ></span>
            {:else}
              <span
                class="cell"
                class:mask-on={row.mask[i]}
                class:mask-off={!row.mask[i]}
                class:zone-processed={zone === 'processed' || (zone === 'active' && (visibility === 'revealed' || shiftCarry))}
                class:block-left={i === blockStart}
                class:block-right={i === blockEnd - 1}
                class:block-active-row={visibility === 'active' && (i === blockStart || i === blockEnd - 1)}
                style:--row-color={row.color}
              >{ch}</span>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  {/each}

  <div class="hints-row">
    <span class="hints">Keyboard: Space / &#x2191;&#x2193; step &middot; &#x2190;&#x2192; jump block</span>
  </div>
</div>

<style>
  .mask-grid {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1;
    padding: 1.5rem;
  }

  .input-group {
    display: flex;
    align-items: stretch;
  }

  .input-group-cells {
    flex: 1;
    min-width: 0;
  }

  .block-label-row {
    margin-bottom: 4px;
  }

  .label.step-label {
    padding: 0 12px 0 0;
  }

  .label.step-label .step-btn {
    width: 100%;
    height: 100%;
  }

  .hints-row {
    text-align: right;
    margin-top: 0.5rem;
  }

  .hints {
    color: #999;
    font-size: 10px;
  }

  .step-btn {
    background: #e8eef6;
    color: #555;
    border: 1px solid #bbb;
    border-radius: 3px;
    padding: 0.3em 1em;
    font-size: 16px;
    cursor: pointer;
  }

  .step-btn:hover:not(:disabled) {
    background: #d0daea;
    border-color: #3366aa;
    color: #333;
  }

  .step-btn:disabled {
    background: transparent;
    color: #ccc;
    border-color: #ddd;
    cursor: default;
  }

  .row {
    display: flex;
    align-items: stretch;
  }

  .label {
    width: 8em;
    flex-shrink: 0;
    padding: 4px 12px 4px 0;
    text-align: right;
    color: #777;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    user-select: none;
  }

  .label-active {
    color: var(--row-color);
    font-weight: bold;
  }

  .cells-viewport {
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }

  .cells {
    display: flex;
    /* max-content so it sizes to full content despite overflow:hidden viewport -- needed for correct width measurement */
    width: max-content;
    transition: transform 0.3s ease;
  }

  .cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.4ch;
    height: 1.8em;
    text-align: center;
    box-sizing: border-box;
    flex-shrink: 0;
    transition: color 0.3s ease, background 0.3s ease, border-color 0.3s ease;
  }

  /* Block label above active block */
  .block-label-spacer {
    flex-shrink: 0;
  }

  .block-label {
    color: #3366aa;
    font-size: 11px;
    white-space: nowrap;
    transform: translateX(-50%);
  }

  /* Block borders */
  .block-left {
    border-left: 2px solid #3366aa;
    position: relative;
    z-index: 1;
  }

  .block-right {
    border-right: 2px solid #3366aa;
    position: relative;
    z-index: 1;
  }

  .block-active-row.block-left {
    border-left-color: var(--row-color);
  }

  .block-active-row.block-right {
    border-right-color: var(--row-color);
  }

  /* Input row zones */
  .input-cell {
    color: #222;
    background: #e8e8e8;
    /* box-shadow instead of border-bottom so lane borders render on top of the divider */
    box-shadow: inset 0 -2px 0 #bbb;
  }

  /* Dimming uses explicit rgba() instead of CSS opacity, which would also dim lane borders */
  .input-cell.zone-processed {
    color: rgba(34, 34, 34, 0.5);
    background: rgba(232, 232, 232, 0.5);
  }

  .input-cell.zone-future {
    color: rgba(34, 34, 34, 0.25);
    background: rgba(232, 232, 232, 0.25);
  }

  /* Mask row: active */
  .mask-on {
    background: var(--row-color);
    color: #fff;
  }

  .mask-off {
    color: rgba(150, 150, 150, 0.5);
  }

  /* Mask row: processed (dimmed) */
  .mask-on.zone-processed {
    background: color-mix(in srgb, var(--row-color) 40%, transparent);
    color: rgba(255, 255, 255, 0.7);
  }

  .mask-off.zone-processed {
    color: rgba(150, 150, 150, 0.2);
  }
</style>

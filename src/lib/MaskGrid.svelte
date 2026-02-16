<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { MaskRow } from './types';

  export let title: string = '';
  export let input: string;
  export let rows: MaskRow[];
  export let blockSize: number = 8;
  export let initialBlock: number = 0;
  export let initialRow: number = 0;

  // Stepping state: block (horizontal) and row (vertical)
  $: numBlocks = Math.ceil(input.length / blockSize);
  let currentBlock = initialBlock;
  let currentRow = initialRow;
  $: blockStart = currentBlock * blockSize;
  $: blockEnd = blockStart + blockSize;
  $: paddedLength = numBlocks * blockSize;
  // Pad input to fill last block so right lane border always renders (matches simdjson's buffer padding)
  $: chars = input.padEnd(paddedLength, ' ').split('');
  $: atStart = currentBlock === 0 && currentRow === 0;
  $: atEnd = currentBlock === numBlocks - 1 && currentRow === rows.length - 1;

  // Auto-play state
  let playing = false;
  let playInterval: ReturnType<typeof setInterval> | null = null;

  function stopPlay() {
    playing = false;
    if (playInterval !== null) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }

  function togglePlay() {
    if (playing) {
      stopPlay();
    } else {
      if (atEnd) {
        currentBlock = 0;
        currentRow = 0;
      }
      playing = true;
      playInterval = setInterval(() => {
        if (atEnd) {
          stopPlay();
        } else {
          stepForward();
        }
      }, 600);
    }
    gridEl?.focus();
  }

  onDestroy(() => stopPlay());

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

  let gridEl: HTMLDivElement;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'ArrowDown') {
      if (e.shiftKey) stepBackward(); else stepForward();
      e.preventDefault();
    }
    if (e.key === 'ArrowUp') { stepBackward(); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { jumpPrevBlock(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { jumpNextBlock(); e.preventDefault(); }
  }

  function handleStepClick() {
    stopPlay();
    stepForward();
    gridEl?.focus();
  }

  function handleCellClick(block: number, row: number) {
    stopPlay();
    currentBlock = block;
    currentRow = row;
    gridEl?.focus();
  }

  // Hover state for ghost lane borders
  let hoverBlock: number | null = null;

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

<div class="mask-grid" tabindex="0" on:keydown={handleKeydown} on:mouseleave={() => hoverBlock = null} bind:this={gridEl}>
  {#if title}
  <div class="grid-title">{title}</div>
  {/if}
  <!-- Block label -->
  {#if numBlocks > 1}
  <div class="block-label-row">
    <span class="label"></span>
    <div class="cells-viewport">
      <div class="cells" style:transform="translateX({translate}px)">
        <span class="block-label-spacer" style:width={spacerWidth}></span>
        <span class="block-label">
          Block {currentBlock + 1} of {numBlocks}
        </span>
      </div>
    </div>
  </div>
  {/if}

  <!-- Controls + Input row -->
  <div class="input-group">
    <span class="label step-label">
      <span class="controls">
        <button class="ctrl-btn" class:ctrl-restart={atEnd && !playing} on:click={togglePlay}>{playing ? '\u23F8' : atEnd ? '\u21BB' : '\u25B6'}</button>
        {#if !atEnd}
        <button class="ctrl-btn" on:click={handleStepClick}>&#x25B6;&#x275A;</button>
        {/if}
      </span>
    </span>
    <div class="cells-viewport" bind:clientWidth={viewportWidth}>
      <div class="cells" bind:clientWidth={totalCellsWidth} style:transform="translateX({translate}px)">
        {#each chars as ch, i}
          {@const hoverLeft = hoverBlock !== null && hoverBlock !== currentBlock && i === hoverBlock * blockSize}
          {@const hoverRight = hoverBlock !== null && hoverBlock !== currentBlock && i === (hoverBlock + 1) * blockSize - 1}
          <span
            class="cell input-cell clickable"
            class:zone-processed={cellZone(i, blockStart, blockEnd) === 'processed'}
            class:zone-active={cellZone(i, blockStart, blockEnd) === 'active'}
            class:zone-future={cellZone(i, blockStart, blockEnd) === 'future'}
            class:block-left={i === blockStart}
            class:block-right={i === blockEnd - 1}
            class:hover-block-left={hoverLeft}
            class:hover-block-right={hoverRight}
            on:mouseenter={() => hoverBlock = Math.floor(i / blockSize)}
            on:click={() => handleCellClick(Math.floor(i / blockSize), rows.length - 1)}
          >{ch}</span>
        {/each}
      </div>
    </div>
  </div>

  <!-- Mask rows -->
  {#each rows as row, r}
    {@const shift = row.shift ?? 0}
    {@const visibility = rowVisible(r, currentRow)}
    <div class="row" class:row-active={visibility === 'active'}>
      <span
        class="label clickable"
        class:label-active={visibility === 'active'}
        style:--row-color={row.color}
        on:click={() => handleCellClick(currentBlock, r)}
      >{row.label}</span>
      <div class="cells-viewport">
        <div class="cells" style:transform="translateX({translate}px)">
          {#each chars as ch, i}
            {@const zone = cellZone(i, blockStart, blockEnd, shift)}
            {@const shiftCarry = shift > 0 && currentBlock > 0 && i >= blockStart && i < blockStart + shift}
            {@const hoverLeft = hoverBlock !== null && hoverBlock !== currentBlock && i === hoverBlock * blockSize}
            {@const hoverRight = hoverBlock !== null && hoverBlock !== currentBlock && i === (hoverBlock + 1) * blockSize - 1}
            {#if zone === 'future' || (zone === 'active' && visibility === 'hidden' && !shiftCarry)}
              <span
                class="cell blank clickable"
                class:block-left={i === blockStart}
                class:block-right={i === blockEnd - 1}
                class:hover-block-left={hoverLeft}
                class:hover-block-right={hoverRight}
                on:mouseenter={() => hoverBlock = Math.floor(i / blockSize)}
                on:click={() => handleCellClick(Math.floor(i / blockSize), r)}
              ></span>
            {:else}
              <span
                class="cell clickable"
                class:mask-on={row.mask[i]}
                class:mask-off={!row.mask[i]}
                class:zone-processed={zone === 'processed' || (zone === 'active' && (visibility === 'revealed' || shiftCarry))}
                class:block-left={i === blockStart}
                class:block-right={i === blockEnd - 1}
                class:hover-block-left={hoverLeft}
                class:hover-block-right={hoverRight}
                class:block-active-row={visibility === 'active' && (i === blockStart || i === blockEnd - 1)}
                style:--row-color={row.color}
                on:mouseenter={() => hoverBlock = Math.floor(i / blockSize)}
                on:click={() => handleCellClick(Math.floor(i / blockSize), r)}
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
    outline: none;
    border-radius: 4px;
    position: relative;
  }

  .mask-grid:hover {
    outline: 2px solid #ccc;
    outline-offset: -2px;
  }

  .mask-grid:focus-within {
    outline: 2px solid #3366aa;
    outline-offset: -2px;
  }

  .grid-title {
    font-size: 13px;
    font-weight: 600;
    color: #444;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .input-group {
    display: flex;
    align-items: stretch;
  }

  .block-label-row {
    display: flex;
    margin-bottom: 4px;
  }

  .label.step-label {
    padding: 0 12px 0 0;
  }

  .controls {
    display: flex;
    gap: 2px;
    height: 100%;
    align-items: center;
    justify-content: flex-end;
  }

  .ctrl-btn {
    background: #e8eef6;
    color: #555;
    border: 1px solid #bbb;
    border-radius: 3px;
    padding: 0.3em 0.5em;
    font-size: 16px;
    cursor: pointer;
    line-height: 1;
  }

  .ctrl-btn:hover:not(:disabled) {
    background: #d0daea;
    border-color: #3366aa;
    color: #333;
  }

  .ctrl-btn:disabled {
    background: transparent;
    color: #ccc;
    border-color: #ddd;
    cursor: default;
    visibility: hidden;
  }

  .ctrl-btn.ctrl-restart {
    visibility: hidden;
  }

  .mask-grid:hover .ctrl-btn:disabled,
  .mask-grid:focus-within .ctrl-btn:disabled,
  .mask-grid:hover .ctrl-btn.ctrl-restart,
  .mask-grid:focus-within .ctrl-btn.ctrl-restart {
    visibility: visible;
  }

  .hints-row {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0.4rem;
    text-align: center;
    font-size: 10px;
    visibility: hidden;
  }

  .mask-grid:focus-within .hints-row {
    visibility: visible;
  }

  .hints {
    color: #999;
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
    transition: color 0.3s ease, background 0.3s ease;
  }

  .clickable {
    cursor: pointer;
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

  /* Ghost lane borders on hover */
  .hover-block-left {
    border-left: 2px solid rgba(51, 102, 170, 0.3);
    position: relative;
    z-index: 1;
  }

  .hover-block-right {
    border-right: 2px solid rgba(51, 102, 170, 0.3);
    position: relative;
    z-index: 1;
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

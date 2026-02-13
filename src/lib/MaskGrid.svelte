<script lang="ts">
  import type { MaskRow } from './types';

  export let input: string;
  export let rows: MaskRow[];
  export let blockSize: number = 8;

  // Stepping state
  $: numBlocks = Math.ceil(input.length / blockSize);
  let currentBlock = 0;
  $: blockStart = currentBlock * blockSize;
  $: blockEnd = blockStart + blockSize;
  $: paddedLength = numBlocks * blockSize;
  $: chars = input.padEnd(paddedLength, ' ').split('');

  function prev() {
    if (currentBlock > 0) currentBlock--;
  }

  function next() {
    if (currentBlock < numBlocks - 1) currentBlock++;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
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

  function cellZone(i: number, bStart: number, bEnd: number, shift: number = 0): 'processed' | 'active' | 'future' {
    const activeEnd = bEnd + shift;
    if (i < bStart) return 'processed';
    if (i < activeEnd) return 'active';
    return 'future';
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="mask-grid">
  <!-- Controls row: Prev over labels, Next over cells -->
  <div class="row controls-row">
    <span class="label">
      <button class="step-btn" on:click={prev} disabled={currentBlock === 0}>&#x25C0; Prev</button>
    </span>
    <div class="controls">
      <button class="step-btn" on:click={next} disabled={currentBlock === numBlocks - 1}>Next &#x25B6;</button>
    </div>
  </div>

  <!-- Block label floating above the active block -->
  <div class="row">
    <span class="label"></span>
    <div class="cells-viewport" bind:clientWidth={viewportWidth}>
      <div class="cells" style:transform="translateX({translate}px)">
        <span class="block-label-spacer" style:width={spacerWidth}></span>
        <span class="block-label">
          Block {currentBlock + 1} of {numBlocks}
        </span>
      </div>
    </div>
  </div>

  <!-- Input row -->
  <div class="row">
    <span class="label">input</span>
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

  <!-- Mask rows -->
  {#each rows as row}
    {@const shift = row.shift ?? 0}
    <div class="row">
      <span class="label">{row.label}</span>
      <div class="cells-viewport">
        <div class="cells" style:transform="translateX({translate}px)">
          {#each chars as ch, i}
            {@const zone = cellZone(i, blockStart, blockEnd, shift)}
            {#if zone === 'future'}
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
                class:zone-processed={zone === 'processed'}
                class:block-left={i === blockStart}
                class:block-right={i === blockEnd - 1}
                style:--row-color={row.color}
              >{ch}</span>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .mask-grid {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1;
    padding: 1.5rem;
  }

  .controls-row {
    margin-bottom: 0.25rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .step-btn {
    background: #2a2a4a;
    color: #aaa;
    border: 1px solid #444;
    border-radius: 3px;
    padding: 0.2em 0.6em;
    font-size: 11px;
    cursor: pointer;
  }

  .step-btn:hover:not(:disabled) {
    background: #3a3a6a;
    border-color: #88bbff;
    color: #ccc;
  }

  .step-btn:disabled {
    background: transparent;
    color: #444;
    border-color: #333;
    cursor: default;
  }

  .row {
    display: flex;
    align-items: stretch;
    margin-bottom: 2px;
  }

  .label {
    width: 8em;
    flex-shrink: 0;
    padding: 4px 12px 4px 0;
    text-align: right;
    color: #888;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    user-select: none;
  }

  .cells-viewport {
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }

  .cells {
    display: flex;
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
    color: #88bbff;
    font-size: 11px;
    white-space: nowrap;
    transform: translateX(-50%);
  }

  /* Block borders */
  .block-left {
    border-left: 2px solid #88bbff;
  }

  .block-right {
    border-right: 2px solid #88bbff;
  }

  /* Input row zones */
  .input-cell {
    color: #ddd;
    background: #333;
    border-bottom: 2px solid #555;
  }

  .input-cell.zone-processed {
    color: rgba(221, 221, 221, 0.6);
    background: rgba(51, 51, 51, 0.6);
  }

  .input-cell.zone-future {
    color: rgba(221, 221, 221, 0.3);
    background: rgba(51, 51, 51, 0.3);
  }

  /* Mask row: active */
  .mask-on {
    background: var(--row-color);
    color: #fff;
  }

  .mask-off {
    color: rgba(102, 102, 102, 0.45);
  }

  /* Mask row: processed (dimmed) */
  .mask-on.zone-processed {
    background: color-mix(in srgb, var(--row-color) 60%, transparent);
    color: rgba(255, 255, 255, 0.6);
  }

  .mask-off.zone-processed {
    color: rgba(102, 102, 102, 0.12);
  }

</style>

<script lang="ts">
  import MaskGrid from './lib/MaskGrid.svelte';
  import { inputString, maskRows } from './lib/exampleData';

  const blockSize = 8;
  const numBlocks = Math.ceil(inputString.length / blockSize);

  let currentBlock = 0;
  $: blockStart = currentBlock * blockSize;

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
</script>

<svelte:window on:keydown={handleKeydown} />

<main>
  <h1>simdjson Stage 1: JSON Indexing</h1>

  <div class="controls">
    <button on:click={prev} disabled={currentBlock === 0}>&#x25C0; Prev</button>
    <button on:click={next} disabled={currentBlock === numBlocks - 1}>Next &#x25B6;</button>
  </div>

  <MaskGrid
    input={inputString}
    rows={maskRows}
    {blockStart}
    {blockSize}
    blockIndex={currentBlock}
    {numBlocks}
  />
</main>

<style>
  main {
    padding: 2rem;
  }

  h1 {
    font-size: 1.4rem;
    color: #ccc;
    margin-bottom: 1.5rem;
    font-weight: 400;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  button {
    background: #2a2a4a;
    color: #ccc;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 0.4em 1em;
    font-size: 0.9rem;
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    background: #3a3a6a;
    border-color: #88bbff;
  }

  button:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>

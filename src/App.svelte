<script lang="ts">
  import MaskGrid from './lib/MaskGrid.svelte';
  import { inputString, maskRows } from './lib/exampleData';
</script>

<main>
  <h1>simdjson Stage 1: JSON Indexing</h1>
  <MaskGrid input={inputString} rows={maskRows} />
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
</style>

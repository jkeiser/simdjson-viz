<script lang="ts">
  import MaskGrid from './lib/MaskGrid.svelte';
  import { inputString, maskRows } from './lib/exampleData';
</script>

<main>
  <h1>simdjson: Microparallel Parsing With Arithmetic</h1>
  <p>simdjson takes a unique "microparallel" approach to parsing JSON. Instead of processing a document character by character, simdjson processes the document 64 bytes at a time, parsing all 64 bytes at once in parallel. To do this, it produces 64-bit <em>bitmasks</em> representing important features like quotes or backslashes, and then uses math and bitwise operations to figure out the answers it needs.</p>
  <p>For example, in order to parse strings, simdjson has to recognize escaped quotes like `\"`. To do <em>that,</em> it first creates a "backslash bitmask" with a 1 in any position that has a backslash (e.g. <code>"\"" -&gt; 0100</code>). Then, it shifts that mask by 1 for an escaped character bitmask (<code>0010</code>). Now when it wants to find "real quotes", it creates a quote bitmask, and uses bitwise operations <code>&amp;~</code> to subtract out the escaped quotes, correctly yielding <code>1001</code>.</p>
  <p>The following visualization shows this process in action! Hit the Step button to step through simdjson as it figures out which quotes are real and then uses that to figure out which characters are inside strings.</p>
  <div class="figure">
    <MaskGrid input={inputString} rows={maskRows} />
  </div>
  <p>github: <a href="https://github.com/jkeiser/simdjson-viz">https://github.com/jkeiser/simdjson-viz</a>.</p>
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .figure {
    max-width: 540px;
    margin: 1.5rem auto;
  }

  h1 {
    font-size: 1.4rem;
    color: #333;
    margin-bottom: 1.5rem;
    font-weight: 400;
  }
</style>

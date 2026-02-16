<script lang="ts">
  import MaskGrid from './lib/MaskGrid.svelte';
  import { inputString, maskRows } from './lib/exampleData';

  // Inline example for second paragraph
  const escapeExampleInput = '"\\""';
  const escapeExampleRows = [
    { label: 'raw quotes', color: '#8e44ad', mask: [true, false, true, true] },
    { label: 'backslash', color: '#8e44ad', mask: [false, true, false, false] },
    { label: 'escaped char', color: '#8e44ad', mask: [false, false, true, false], shift: 1 },
    { label: 'real quotes', color: '#8e44ad', mask: [true, false, false, true] }
  ];
</script>

<main>
  <h1>simdjson: Microparallel Parsing With Arithmetic</h1>
  <p>simdjson takes a unique "microparallel" approach to parsing JSON. Instead of processing a document character by character, simdjson processes the document 64 bytes at a time, producing 64-bit *bitmasks* to indicate features like quotes, arrays, and commas. It then does more complex "context-dependent" logic in a branch-free manner, figuring out thing like "is this character escaped" and "is this character in a string" using math and shift operations.</p>
  <div class="example-container">
    <p class="example-text">For example, in order to parse strings, simdjson has to recognize escaped quotes like `"quote: \""`. To do <em>that,</em> it first creates a "backslash bitmask" with a 1 in any position that has a backslash (e.g. <code>"\"" -&gt; 0100</code>). Then, it shifts that mask by 1 for an escaped character bitmask (<code>0010</code>). Now when it wants to find "real quotes", it creates a quote bitmask, and uses bitwise operations <code>&amp;~</code> to subtract out the escaped quotes, correctly yielding <code>1001</code>.</p>
    <div class="example-grid">
      <MaskGrid input={escapeExampleInput} rows={escapeExampleRows} blockSize={8} initialBlock={0} initialRow={3} />
    </div>
  </div>
  <div>
    When it's done with that, it uses a "carryless multiply" operation to create a mask showing which characters are inside strings. Then it finds numbers, booleans, and special characters like <code>&lbrace;</code> and <code>:</code>, and filters out the ones that are in strings using that mask. At which point, it's got all the real ones!
  </div>
  <p>The following visualization shows the full process in action! Hit the Play or Step button to step through simdjson as it figures out which quotes are real and then uses that to figure out which characters are inside strings.</p>
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

  .example-container {
    display: flex;
    gap: 1.5rem;
    align-items: start;
    margin-bottom: 1.5rem;
  }

  .example-text {
    flex: 1;
  }

  .example-grid {
    width: 280px;
    flex-shrink: 0;
  }

  @media (max-width: 700px) {
    .example-container {
      flex-direction: column;
    }
    .example-grid {
      width: 100%;
      max-width: 400px;
    }
  }

  h1 {
    font-size: 1.4rem;
    color: #333;
    margin-bottom: 1.5rem;
    font-weight: 400;
  }
</style>

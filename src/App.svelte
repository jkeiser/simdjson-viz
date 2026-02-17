<script lang="ts">
  import MaskGrid from './lib/MaskGrid.svelte';
  import { computeMaskRows } from './lib/masks';

  // Inline escape example
  const escapeExampleInput = '"\\""';
  const escapeExampleRows = computeMaskRows(escapeExampleInput, ['backslash', 'escaped', 'raw quotes', 'quotes']);

  // Main example
  const inputString = '{ "x": 100000, "esc": "\\\\\\"", "long": "foo\nbar\nbaz" }';
  const maskRows = computeMaskRows(inputString, ['backslash', 'escape', 'escaped', 'raw quotes', 'quotes', 'in string', 'raw operators', 'operators', 'raw scalar chars', 'scalar chars', 'after scalar chars', 'scalars', 'index']);
</script>

<main>
  <h1>simdjson: Microparallel Parsing With Arithmetic</h1>
  <p>simdjson takes a unique "microparallel" approach to parsing JSON. Instead of processing a document character by character, simdjson processes the document 64 bytes at a time, producing 64-bit *bitmasks* to indicate features like quotes, arrays, and commas. It then does more complex "context-dependent" logic in a branch-free manner, figuring out thing like "is this character escaped" and "is this character in a string" using math and shift operations.</p>
  <div class="example-grid">
    <MaskGrid title="Escape Detection" input={escapeExampleInput} rows={escapeExampleRows} blockSize={8} initialBlock={0} initialRow={3} />
  </div>
  <p>For example, in order to parse strings, simdjson has to recognize escaped quotes like `"quote: \""`. To do <em>that,</em> it first creates a "backslash bitmask" with a 1 in any position that has a backslash (e.g. <code>"\"" -&gt; 0100</code>). Then, it shifts that mask by 1 for an escaped character bitmask (<code>0010</code>). Now when it wants to find "real quotes", it creates a quote bitmask, and uses bitwise operations <code>&amp;~</code> to subtract out the escaped quotes, correctly yielding <code>1001</code>.</p>
  <p>
    The full algorithm looks like:
  </p>
  <ol>
    <li>Escaped: Create a mask of escaped characters so we can weed out escaped quotes (<code>\"</code>)</li>
    <li>Strings: Create a mask of all characters inside strings (pairs of <code>"</code>).</li>
    <li>Scalars: Find the start of each number, boolean and null that aren't in strings.</li>
    <li>Operators: Find operators like <code>&lbrace;}</code>, <code>[]</code>, <code>"</code>, <code>:</code>, and <code>,</code> that aren't in strings.</li>
    <li>Structurals: Combine scalars and operators to get the final index!</li>
  </ol>
  <p>The following visualization shows the full process in action! Hit the Play or Step button to step through simdjson as it figures out which quotes are real and then uses that to figure out which characters are inside strings.</p>
  <div class="figure">
    <MaskGrid title="String Detection" input={inputString} rows={maskRows} />
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

  .example-grid {
    float: right;
    width: 280px;
    margin: 0 0 1rem 1.5rem;
  }

  @media (max-width: 700px) {
    .example-grid {
      float: none;
      width: 100%;
      max-width: 400px;
      margin: 0 0 1rem 0;
    }
  }

  h1 {
    font-size: 1.4rem;
    color: #333;
    margin-bottom: 1.5rem;
    font-weight: 400;
  }
</style>

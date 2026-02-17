<script lang="ts">
  import MaskGrid from './lib/MaskGrid.svelte';
  import { computeMaskRows } from './lib/masks';

  // Inline escape example
  const escapeExampleInput = '"\\\\\\""';
  const escapeExampleRows = computeMaskRows(escapeExampleInput, ['backslash', 'escaped', 'raw quotes', 'quotes', 'in string']);

  // Scalar example
  const scalarExampleInput = '[ 2.3e+4, "99999", true, false, null ]';
  const scalarExampleRows = computeMaskRows(scalarExampleInput, ['in string', 'raw scalar chars', 'scalar chars', 'after scalars', 'scalars']);

  // Main example
  const inputString = '{ "x": 999999, "esc": "\\\\\\"", "long": "foo\nbar\nbaz" }';
  const maskRows = computeMaskRows(inputString, ['escaped', 'quotes', 'in string', 'operators', 'scalars', 'index']);
</script>

<main>
  <h1>simdjson: Microparallel Parsing With Arithmetic</h1>
  <p>simdjson takes a unique "microparallel" approach to parsing JSON. Instead of processing a document character by character, simdjson processes the document 64 bytes at a time, producing 64-bit *bitmasks* to indicate features like quotes, arrays, and commas. It then does more complex "context-dependent" logic in a branch-free manner, figuring out thing like "is this character escaped" and "is this character in a string" using math and shift operations.</p>
  <div class="example-grid">
    <MaskGrid title="Escape Detection" input={escapeExampleInput} rows={escapeExampleRows} blockSize={8} initialBlock={0} initialRow={4} />
  </div>
  <h2>Strings</h2>
  <p>For example, in order to parse strings, simdjson has to recognize escaped quotes like `"quote: \""`. To do <em>that,</em> it first creates a "backslash bitmask" with a 1 in any position that has a backslash (e.g. <code>"\"" -&gt; 0100</code>). Then, it shifts that mask by 1 for an escaped character bitmask (<code>0010</code>). Now when it wants to find "real quotes", it creates a quote bitmask, and uses bitwise operations <code>&amp;~</code> to subtract out the escaped quotes, correctly yielding <code>1001</code>.</p>
  <p>After this, all quotes are found, escaped quotes are removed, and a mask of "characters in strings" is produced between each pair of quotes. (This uses a single "carryless multiply" operation which is worth explaining later, together with other math operations like subtraction.)</p>
  <p>This is then used by later steps to filter out things inside strings.</p>
  <h2>Scalar Values</h2>
  <p>Detecting the beginning of a number or boolean value goes through a similar (but somewhat simpler) process. First, it finds scalar characters that aren't inside strings: characters that can be the start of a value like numbers, letters, and quotes. Then it uses a shift to find scalar characters whch don't have a scalar character <em>before</em> them--these are the ones that start.</p>
  <div class="figure">
    <MaskGrid title="Scalar Detection" input={scalarExampleInput} rows={scalarExampleRows} blockSize={8} initialBlock={4} initialRow={4} />
  </div>
  <h2>All Together Now</h2>
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
    <MaskGrid title="Full Algorithm" input={inputString} rows={maskRows} />
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
    max-width: 680px;
    margin: 0.75rem auto;
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

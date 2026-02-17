<script lang="ts">
  import MaskGrid from './lib/MaskGrid.svelte';
  import { computeMaskRows } from './lib/masks';

  // Inline escape example
  const escapeExampleInput = '"\\\\\\""';
  const escapeExampleRows = computeMaskRows(escapeExampleInput, ['backslash', 'escape', 'escaped', 'raw quotes', 'quotes', 'in string']);

  // Scalar example
  const scalarExampleInput = '[ 2.3e+4, "99999", true, false, null ]';
  const scalarExampleRows = computeMaskRows(scalarExampleInput, ['in string', 'raw scalar chars', 'scalar chars', 'after scalars', 'scalars']);

  // Main example
  const inputString = '{ "x": 999999, "esc": "\\\\\\"", "long": "foo\nbar\nbaz" }';
  const maskRows = computeMaskRows(inputString, ['escaped', 'quotes', 'in string', 'operators', 'scalars', 'index']);

  let navOpen = $state(false);
</script>

<nav class="site-nav" aria-label="Site navigation">
  <div class="nav-container">
    <span class="nav-brand">John Keiser</span>
    <button class="nav-toggle" onclick={() => navOpen = !navOpen} aria-label="Toggle navigation">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <div class="nav-collapse" class:open={navOpen}>
      <ul class="nav-links">
        <li><a href="https://johnkeiser.com/">Home</a></li>
        <li><a href="https://johnkeiser.com/post/">Posts</a></li>
        <li><a href="https://johnkeiser.com/tags/">Tags</a></li>
      </ul>
      <ul class="nav-right">
        <li><a href="mailto:john@johnkeiser.com" aria-label="Email"><i class="far fa-envelope"></i></a></li>
        <li><a href="https://github.com/jkeiser" aria-label="GitHub"><i class="fab fa-github"></i></a></li>
        <li><a href="https://twitter.com/jkeiser2/" aria-label="Twitter"><i class="fab fa-twitter"></i></a></li>
        <li><a href="https://www.linkedin.com/in/john-keiser-81618532/" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a></li>
      </ul>
    </div>
  </div>
</nav>

<main>
  <h1>simdjson: Microparallel Parsing With Arithmetic</h1>
  <p>simdjson takes a unique "microparallel" approach to parsing JSON. Instead of processing a document character by character, simdjson processes the document 64 bytes at a time. For each block, it produces 64-bit *bitmasks* of features like quotes, arrays, and commas. It figures out more complicated masks like "which characters are in strings" using branch-free math and shift operations. Ultimately it produces a final index showing where each operator and value is in the JSON document.</p>
  <p>Throughout this article you will see some live diagrams: you can step through these to see the simdjson algorithm in action. To make the whole thing easier to see, instead of showing a cryptic "00110101" for each bitmask, it instead shows a representation of which input characters are "on" in the mask. It also uses 8 byte blocks instead of 64, so you can see the algorithm run in smaller chunks.</p>
  <div class="example-grid">
    <MaskGrid title="Escape Detection" input={escapeExampleInput} rows={escapeExampleRows} blockSize={8} initialBlock={0} initialRow={5} />
  </div>
  <h2>Strings</h2>
  <p>To parse the document, simdjson first has to figure out which characters are in strings--pairs of quotes. But before it can do <strong>that,</strong> it has to figure out which quotes are "real" and not escaped. In <code>"\""</code>, the second quote is escaped.</p>
  <p>To find <code>\"</code>, it first creates a "backslash bitmask" with a 1 in any position that has a backslash (e.g. <code>"\"" -&gt; 0100</code>). Then, it uses that to get a mask of escaped characters (<code>0010</code>)--you can think of this as just a shift by 1, but there's some clever math to handle longer runs of backslashes like <code>\\\\</code>.</p>
  <p>Now that it knows what characters are escaped, it finds all quotes everywhere and uses bitwise <code>&amp;~</code> to subtract out the escaped quotes, correctly yielding <code>1001</code>.</p>
  <p>After all quotes are found, and a mask of "characters in strings" is produced between each pair of quotes. (This uses a single "carryless multiply" operation which is worth explaining later, together with other math operations like subtraction.)</p>
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
    <MaskGrid title="Full Algorithm" input={inputString} rows={maskRows} initialBlock={2} initialRow={2} />
  </div>
  <p>github: <a href="https://github.com/jkeiser/simdjson-viz">https://github.com/jkeiser/simdjson-viz</a>.</p>
</main>

<footer class="site-footer">
  <p>Powered by <a href="https://gohugo.io">Hugo</a>. Themed by <a href="https://github.com/nathancday/min_night">min_night</a>.</p>
  <p><a rel="license" href="https://creativecommons.org/licenses/by/4.0/"><i class="fab fa-creative-commons"></i> Attribution 4.0 International license</a></p>
</footer>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    flex: 1;
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

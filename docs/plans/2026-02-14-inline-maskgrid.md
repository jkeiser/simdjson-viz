# Inline MaskGrid Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a small MaskGrid to the right of the second paragraph illustrating the escaped quote example.

**Architecture:** Enhance MaskGrid with optional initial state props, add flexbox container in App.svelte with inline example data and small MaskGrid instance.

**Tech Stack:** Svelte, TypeScript, CSS Flexbox

---

## Task 1: Add Initial State Props to MaskGrid

**Files:**
- Modify: `src/lib/MaskGrid.svelte:6-11`

**Step 1: Add initialBlock and initialRow props**

In `src/lib/MaskGrid.svelte`, change lines 6-11 from:

```typescript
  export let blockSize: number = 8;

  // Stepping state: block (horizontal) and row (vertical)
  $: numBlocks = Math.ceil(input.length / blockSize);
  let currentBlock = 0;
  let currentRow = 0;
```

To:

```typescript
  export let blockSize: number = 8;
  export let initialBlock: number = 0;
  export let initialRow: number = 0;

  // Stepping state: block (horizontal) and row (vertical)
  $: numBlocks = Math.ceil(input.length / blockSize);
  let currentBlock = initialBlock;
  let currentRow = initialRow;
```

**Step 2: Verify no existing usage breaks**

Run: `npm run dev`
Expected: Dev server starts without errors, main MaskGrid still works (uses default initialBlock=0, initialRow=0)

**Step 3: Commit**

```bash
git add src/lib/MaskGrid.svelte
git commit -m "feat: add initialBlock and initialRow props to MaskGrid

Allows MaskGrid instances to start at any step state, enabling pre-revealed
visualizations while maintaining interactivity.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Add Inline Example Data and Small MaskGrid

**Files:**
- Modify: `src/App.svelte:1-14`

**Step 1: Add inline example data in script section**

In `src/App.svelte`, change lines 1-4 from:

```typescript
<script lang="ts">
  import MaskGrid from './lib/MaskGrid.svelte';
  import { inputString, maskRows } from './lib/exampleData';
</script>
```

To:

```typescript
<script lang="ts">
  import MaskGrid from './lib/MaskGrid.svelte';
  import { inputString, maskRows } from './lib/exampleData';

  // Inline example for second paragraph
  const escapeExampleInput = '"\\""';
  const escapeExampleRows = [
    { label: 'backslash', color: '#4a90e2', mask: [false, true, false, false] },
    { label: 'escaped char', color: '#7b68ee', mask: [false, false, true, false], shift: 1 },
    { label: 'real quotes', color: '#50c878', mask: [true, false, false, true] }
  ];
</script>
```

**Step 2: Add flex container and small MaskGrid to template**

In `src/App.svelte`, change lines 8-9 from:

```svelte
  <p>simdjson takes a unique "microparallel" approach to parsing JSON. Instead of processing a document character by character, simdjson processes the document 64 bytes at a time, parsing all 64 bytes at once in parallel. To do this, it produces 64-bit <em>bitmasks</em> representing important features like quotes or backslashes, and then uses math and bitwise operations to figure out the answers it needs.</p>
  <p>For example, in order to parse strings, simdjson has to recognize escaped quotes like `\"`. To do <em>that,</em> it first creates a "backslash bitmask" with a 1 in any position that has a backslash (e.g. <code>"\"" -&gt; 0100</code>). Then, it shifts that mask by 1 for an escaped character bitmask (<code>0010</code>). Now when it wants to find "real quotes", it creates a quote bitmask, and uses bitwise operations <code>&amp;~</code> to subtract out the escaped quotes, correctly yielding <code>1001</code>.</p>
```

To:

```svelte
  <p>simdjson takes a unique "microparallel" approach to parsing JSON. Instead of processing a document character by character, simdjson processes the document 64 bytes at a time, parsing all 64 bytes at once in parallel. To do this, it produces 64-bit <em>bitmasks</em> representing important features like quotes or backslashes, and then uses math and bitwise operations to figure out the answers it needs.</p>
  <div class="example-container">
    <p class="example-text">For example, in order to parse strings, simdjson has to recognize escaped quotes like `\"`. To do <em>that,</em> it first creates a "backslash bitmask" with a 1 in any position that has a backslash (e.g. <code>"\"" -&gt; 0100</code>). Then, it shifts that mask by 1 for an escaped character bitmask (<code>0010</code>). Now when it wants to find "real quotes", it creates a quote bitmask, and uses bitwise operations <code>&amp;~</code> to subtract out the escaped quotes, correctly yielding <code>1001</code>.</p>
    <div class="example-grid">
      <MaskGrid input={escapeExampleInput} rows={escapeExampleRows} blockSize={8} initialBlock={0} initialRow={2} />
    </div>
  </div>
```

**Step 3: Add flex container styles**

In `src/App.svelte`, add these styles after the `.figure` rule (after line 27):

```css
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
```

**Step 4: Test the implementation**

Run: `npm run dev`

Manual verification:
- On wide screen: Second paragraph has small MaskGrid on the right
- Small MaskGrid shows 4 characters: " \ " "
- Three mask rows visible: backslash (0100), escaped char (0010), real quotes (1001)
- Step buttons work (can step backward and forward)
- On narrow screen (< 700px): MaskGrid stacks below paragraph
- Main MaskGrid below paragraph 3 still works correctly

**Step 5: Commit**

```bash
git add src/App.svelte
git commit -m "feat: add inline MaskGrid to illustrate escape example

Adds small MaskGrid next to second paragraph showing the escaped quote
example (\"\\\"\" with masks 0100/0010/1001). Uses flexbox layout that
stacks vertically on narrow screens.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Build and Verify

**Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Preview production build**

Run: `npm run preview` (if available, or check `dist/index.html` directly)

Verification:
- Layout works correctly
- Both MaskGrid instances function properly
- Responsive behavior works

**Step 3: Final commit if needed**

If any adjustments were needed, commit them. Otherwise, implementation is complete.

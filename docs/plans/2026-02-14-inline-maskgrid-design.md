# Inline MaskGrid in Second Paragraph

## Overview

Add a small MaskGrid to the right side of the second paragraph to illustrate the escaped quote example described in the text.

## Requirements

- Display input string `"\""` (4 characters) with three mask rows
- Show backslash mask (0100), escaped char mask (0010), and real quotes mask (1001)
- Start fully revealed (all rows visible) but remain interactive
- Place to the right of paragraph on wide screens, stack below on narrow screens

## Implementation Approach

### Layout

Use flexbox container wrapping the second paragraph and small MaskGrid:

```css
.example-container {
  display: flex;
  gap: 1.5rem;
  align-items: start;
}

.example-text { flex: 1; }
.example-grid { width: 280px; flex-shrink: 0; }

@media (max-width: 700px) {
  .example-container { flex-direction: column; }
  .example-grid { width: 100%; max-width: 400px; }
}
```

### Data Structure

Inline data in App.svelte:

```typescript
const escapeExampleInput = '"\\""';
const escapeExampleRows = [
  { label: 'backslash', color: '#4a90e2', mask: [false, true, false, false] },
  { label: 'escaped char', color: '#7b68ee', mask: [false, false, true, false], shift: 1 },
  { label: 'real quotes', color: '#50c878', mask: [true, false, false, true] }
];
```

### MaskGrid Enhancement

Add optional props to MaskGrid.svelte for initial state:

```typescript
export let initialBlock: number = 0;
export let initialRow: number = 0;
let currentBlock = initialBlock;
let currentRow = initialRow;
```

Small MaskGrid instantiation:

```svelte
<MaskGrid
  input={escapeExampleInput}
  rows={escapeExampleRows}
  blockSize={8}
  initialBlock={0}
  initialRow={2}
/>
```

## Components Affected

- `src/App.svelte` - add flex container, inline data, and small MaskGrid instance
- `src/lib/MaskGrid.svelte` - add initialBlock and initialRow props

## Design Rationale

- Flexbox chosen for clean, maintainable responsive layout
- Inline data keeps example coupled to explanatory text
- Interactive but pre-revealed state shows the complete result while allowing exploration
- 280px width balances visibility with text flow

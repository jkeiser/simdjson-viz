# simdjson-viz

Interactive visualization of simdjson's stage 1 JSON indexing algorithm, showing how
bitmasks are built up step by step to identify structural characters in a JSON document.

**Live demo:** https://johnkeiser.com/simdjson-viz/

## Quick Start

```bash
npm install
npm run dev
```

Opens a dev server (usually at http://localhost:5173) with hot reload.

## Tests

```bash
npx vitest run
```

## Build

```bash
npm run build
```

Output goes to `dist/`. Deployed automatically to GitHub Pages on push to main.

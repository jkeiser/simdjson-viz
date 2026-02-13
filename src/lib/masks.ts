import type { MaskRow } from './types';

// --- Generic mask primitives ---

function charEqMask(input: string, char: string): boolean[] {
  return Array.from(input, ch => ch === char);
}

function shiftMask(mask: boolean[], n: number): boolean[] {
  const out = Array(mask.length).fill(false);
  for (let i = 0; i + n < mask.length; i++) {
    out[i + n] = mask[i];
  }
  return out;
}

function andNotMask(a: boolean[], b: boolean[]): boolean[] {
  return a.map((v, i) => v && !b[i]);
}

function prefixXorMask(mask: boolean[]): boolean[] {
  const out = Array(mask.length).fill(false);
  let state = false;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i]) state = !state;
    out[i] = state;
  }
  return out;
}

// --- Algorithm-specific masks ---

function escapeMask(backslash: boolean[]): boolean[] {
  const len = backslash.length;
  const escape = Array(len).fill(false);
  let prevEscaped = false;
  for (let i = 0; i < len; i++) {
    if (backslash[i] && !prevEscaped) {
      escape[i] = true;
      prevEscaped = true;
    } else {
      prevEscaped = false;
    }
  }
  return escape;
}

export function computeMaskRows(input: string): MaskRow[] {
  const backslash = charEqMask(input, '\\');
  const escape = escapeMask(backslash);
  const escaped = shiftMask(escape, 1);
  const quotes = andNotMask(charEqMask(input, '"'), escaped);
  const strings = prefixXorMask(quotes);

  return [
    { label: 'backslash',  color: '#e06c75', mask: backslash },
    { label: 'escape',     color: '#d19a66', mask: escape },
    { label: 'escaped',    color: '#e5c07b', mask: escaped, shift: 1 },
    { label: 'quotes',     color: '#61afef', mask: quotes },
    { label: 'in strings', color: '#c678dd', mask: strings },
  ];
}

import type { MaskRow } from './types';

// The raw JSON text (each character is one position in the masks)
// Characters:  { "x": 1, "escaped_text": "Backslash is \"\\\"" }
//   Position:  0         1111111111222222222233333333334444444444
//              0123456789012345678901234567890123456789012345678
export const inputString = '{ "x": 1, "escaped_text": "Backslash is \\"\\\\\\"" }';

// Helper: create a boolean[] of length n, with `true` at the given positions
function mask(length: number, ...positions: number[]): boolean[] {
  const m = Array(length).fill(false);
  for (const p of positions) m[p] = true;
  return m;
}

// Helper: create a boolean[] with `true` for ranges of positions
function maskRanges(length: number, ...ranges: [number, number][]): boolean[] {
  const m = Array(length).fill(false);
  for (const [start, end] of ranges) {
    for (let i = start; i <= end; i++) m[i] = true;
  }
  return m;
}

const len = inputString.length;

// Backslash: true wherever there's a \ character
const backslashMask = mask(len, 40, 42, 43, 44);

// Escape: backslashes that are active escape characters (not themselves escaped)
// In \"\\\", the escapes are at 40, 42, 44 (each starts an escape sequence)
const escapeMask = mask(len, 40, 42, 44);

// Escaped: characters immediately following an active escape
// Position 41 ("), 43 (\), 45 (")
const escapedMask = mask(len, 41, 43, 45);

// Quotes: " characters that are NOT escaped
// Positions: 2, 4, 10, 23, 26, 46
const quotesMask = mask(len, 2, 4, 10, 23, 26, 46);

// In strings: characters between opening and closing quotes
// (opening quote included, closing quote excluded)
// "x" -> positions 2-3, "escaped_text" -> 10-22, "Backslash is \"\\\"" -> 26-45
const stringsMask = maskRanges(len, [2, 3], [10, 22], [26, 45]);

export const maskRows: MaskRow[] = [
  { label: 'backslash',   color: '#e06c75', mask: backslashMask },
  { label: 'escape',      color: '#d19a66', mask: escapeMask },
  { label: 'escaped',     color: '#e5c07b', mask: escapedMask },
  { label: 'quotes',      color: '#61afef', mask: quotesMask },
  { label: 'in strings',  color: '#c678dd', mask: stringsMask },
];

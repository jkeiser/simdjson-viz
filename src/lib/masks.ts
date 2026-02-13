import type { MaskRow } from './types';

function backslashMask(input: string): boolean[] {
  return Array.from(input, ch => ch === '\\');
}

function escapeMask(input: string, backslash: boolean[]): { escape: boolean[]; escaped: boolean[] } {
  const len = input.length;
  const escape = Array(len).fill(false);
  const escaped = Array(len).fill(false);
  for (let i = 0; i < len; i++) {
    if (backslash[i] && !escaped[i]) {
      escape[i] = true;
      if (i + 1 < len) escaped[i + 1] = true;
    }
  }
  return { escape, escaped };
}

function quotesMask(input: string, escaped: boolean[]): boolean[] {
  return Array.from(input, (ch, i) => ch === '"' && !escaped[i]);
}

function stringsMask(quotes: boolean[], length: number): boolean[] {
  const mask = Array(length).fill(false);
  let inString = false;
  for (let i = 0; i < length; i++) {
    if (quotes[i]) {
      if (!inString) {
        mask[i] = true; // opening quote included
        inString = true;
      } else {
        inString = false; // closing quote excluded
      }
    } else {
      mask[i] = inString;
    }
  }
  return mask;
}

export function computeMaskRows(input: string): MaskRow[] {
  const backslash = backslashMask(input);
  const { escape, escaped } = escapeMask(input, backslash);
  const quotes = quotesMask(input, escaped);
  const strings = stringsMask(quotes, input.length);

  return [
    { label: 'backslash',  color: '#e06c75', mask: backslash },
    { label: 'escape',     color: '#d19a66', mask: escape },
    { label: 'escaped',    color: '#e5c07b', mask: escaped, shift: 1 },
    { label: 'quotes',     color: '#61afef', mask: quotes },
    { label: 'in strings', color: '#c678dd', mask: strings },
  ];
}

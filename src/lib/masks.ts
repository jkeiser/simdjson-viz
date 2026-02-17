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

function andMask(a: boolean[], b: boolean[]): boolean[] {
  return a.map((v, i) => v && b[i]);
}

function orMask(a: boolean[], b: boolean[]): boolean[] {
  return a.map((v, i) => v || b[i]);
}

function notMask(mask: boolean[]): boolean[] {
  return mask.map(v => !v);
}

function andNotMask(a: boolean[], b: boolean[]): boolean[] {
  return a.map((v, i) => v && !b[i]);
}

function charsInSetMask(input: string, chars: string): boolean[] {
  const set = new Set(chars);
  return Array.from(input, ch => set.has(ch));
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

export function computeMaskRows(input: string, names?: string[]): MaskRow[] {
  const rawQuotes = charEqMask(input, '"');
  const backslash = charEqMask(input, '\\');
  const escape = escapeMask(backslash);
  const escaped = shiftMask(escape, 1);
  const quotes = andNotMask(rawQuotes, escaped);
  const strings = shiftMask(prefixXorMask(quotes), 1);

  // Operator masks
  const rawOperators = charsInSetMask(input, '[]{}:,');
  const operators = andNotMask(rawOperators, strings);

  // Scalar masks
  const whitespace = charsInSetMask(input, ' \r\t\n');
  const rawScalarChars = andMask(notMask(rawOperators), notMask(whitespace));
  const scalarChars = andNotMask(rawScalarChars, strings);
  const afterScalarChars = shiftMask(scalarChars, 1);
  const scalars = andNotMask(scalarChars, afterScalarChars);

  // Index
  const index = orMask(operators, scalars);

  const stringColor = '#8e44ad';
  const operatorColor = '#2874a6';
  const scalarColor = '#1e8449';
  const indexColor = '#c0392b';

  const allRows: MaskRow[] = [
    { label: 'backslash',        color: stringColor,   mask: backslash },
    { label: 'escape',           color: stringColor,   mask: escape },
    { label: 'escaped',          color: stringColor,   mask: escaped, shift: 1 },
    { label: 'raw quotes',       color: stringColor,   mask: rawQuotes },
    { label: 'quotes',           color: stringColor,   mask: quotes },
    { label: 'in string',        color: stringColor,   mask: strings, shift: 1 },
    { label: 'raw operators',    color: operatorColor, mask: rawOperators },
    { label: 'operators',        color: operatorColor, mask: operators },
    { label: 'raw scalar chars', color: scalarColor,   mask: rawScalarChars },
    { label: 'scalar chars',     color: scalarColor,   mask: scalarChars },
    { label: 'after scalar chars', color: scalarColor, mask: afterScalarChars, shift: 1 },
    { label: 'scalars',          color: scalarColor,   mask: scalars },
    { label: 'index',            color: indexColor,     mask: index },
  ];

  if (!names) return allRows;
  return names.map(name => allRows.find(r => r.label === name)!);
}

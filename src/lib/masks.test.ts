import { describe, it, expect } from 'vitest';
import { computeMaskRows } from './masks';

/** Helper: extract a named mask row's boolean[] from computed results */
function getMask(input: string, label: string): boolean[] {
  const rows = computeMaskRows(input);
  const row = rows.find(r => r.label === label);
  if (!row) throw new Error(`No mask row "${label}"`);
  return row.mask;
}

/** Helper: convert boolean[] to a string like "..X.X..." for readable assertions */
function bits(mask: boolean[]): string {
  return mask.map(v => v ? '1' : '.').join('');
}

describe('backslash', () => {
  it('marks backslash characters', () => {
    expect(bits(getMask('ab\\cd', 'backslash'))).toBe('..1..');
  });

  it('marks consecutive backslashes', () => {
    expect(bits(getMask('a\\\\b', 'backslash'))).toBe('.11.');
  });

  it('returns all false when no backslashes', () => {
    expect(bits(getMask('hello', 'backslash'))).toBe('.....');
  });
});

describe('escape', () => {
  it('marks a lone backslash as escape', () => {
    expect(bits(getMask('a\\bc', 'escape'))).toBe('.1..');
  });

  it('marks first of a pair as escape, second is escaped', () => {
    expect(bits(getMask('a\\\\b', 'escape'))).toBe('.1..');
  });

  it('marks first and third of triple as escapes', () => {
    // a\\\b -> 5 chars, escapes at positions 1 and 3
    expect(bits(getMask('a\\\\\\b', 'escape'))).toBe('.1.1.');
  });

  it('marks alternating in a run of four', () => {
    expect(bits(getMask('a\\\\\\\\b', 'escape'))).toBe('.1.1..');
  });
});

describe('escaped', () => {
  it('marks character after a lone backslash', () => {
    expect(bits(getMask('a\\bc', 'escaped'))).toBe('..1.');
  });

  it('marks second backslash in a pair', () => {
    expect(bits(getMask('a\\\\b', 'escaped'))).toBe('..1.');
  });

  it('marks second and fourth in a triple', () => {
    // a\\\b -> 5 chars, escaped at positions 2 and 4
    expect(bits(getMask('a\\\\\\b', 'escaped'))).toBe('..1.1');
  });

  it('has shift: 1', () => {
    const rows = computeMaskRows('a\\b');
    const row = rows.find(r => r.label === 'escaped');
    expect(row?.shift).toBe(1);
  });
});

describe('quotes', () => {
  it('marks unescaped quotes', () => {
    expect(bits(getMask('"hello"', 'quotes'))).toBe('1.....1');
  });

  it('does not mark escaped quotes', () => {
    expect(bits(getMask('\\"hi\\"', 'quotes'))).toBe('......');
  });

  it('handles mix of escaped and unescaped', () => {
    //                             "  h  i  \  "  "
    expect(bits(getMask('"hi\\""', 'quotes'))).toBe('1....1');
  });
});

describe('in string', () => {
  it('excludes opening quote, includes closing quote', () => {
    expect(bits(getMask('"ab"', 'in string'))).toBe('.111');
  });

  it('handles multiple strings', () => {
    //                              "  a  "  ,  "  b  "
    expect(bits(getMask('"a","b"', 'in string'))).toBe('.11..11');
  });

  it('does not count escaped quotes as string boundaries', () => {
    //                              "  \  "  x  "
    expect(bits(getMask('"\\\"x"', 'in string'))).toBe('.1111');
  });

  it('handles empty strings', () => {
    expect(bits(getMask('""', 'in string'))).toBe('.1');
  });

  it('everything outside strings is off', () => {
    expect(bits(getMask('abc', 'in string'))).toBe('...');
  });

  it('has shift: 1', () => {
    const rows = computeMaskRows('"a"');
    const row = rows.find(r => r.label === 'in string');
    expect(row?.shift).toBe(1);
  });
});

describe('computeMaskRows', () => {
  it('returns all mask rows', () => {
    const rows = computeMaskRows('{}');
    const labels = rows.map(r => r.label);
    expect(labels).toEqual([
      'backslash', 'escape', 'escaped', 'raw quotes', 'quotes', 'in string',
      'raw operators', 'operators', 'raw scalar chars', 'scalar chars',
      'after scalar chars', 'scalars', 'index',
    ]);
  });

  it('produces correct masks for the example string', () => {
    const input = '{ "x": 1, "escaped_text": "Backslash is \\"\\\\\\"" }';
    const rows = computeMaskRows(input);

    // Spot-check: backslashes at positions 40, 42, 43, 44
    const bs = rows.find(r => r.label === 'backslash')!.mask;
    expect(bs[40]).toBe(true);
    expect(bs[42]).toBe(true);
    expect(bs[43]).toBe(true);
    expect(bs[44]).toBe(true);
    expect(bs[41]).toBe(false);

    // Escapes at 40, 42, 44 (not 43, which is escaped)
    const esc = rows.find(r => r.label === 'escape')!.mask;
    expect(esc[40]).toBe(true);
    expect(esc[42]).toBe(true);
    expect(esc[44]).toBe(true);
    expect(esc[43]).toBe(false);

    // Escaped at 41, 43, 45
    const escaped = rows.find(r => r.label === 'escaped')!.mask;
    expect(escaped[41]).toBe(true);
    expect(escaped[43]).toBe(true);
    expect(escaped[45]).toBe(true);

    // Non-escaped quotes at 2, 4, 10, 23, 26, 46
    const q = rows.find(r => r.label === 'quotes')!.mask;
    for (const pos of [2, 4, 10, 23, 26, 46]) {
      expect(q[pos]).toBe(true);
    }
    // Escaped quotes at 41, 45 should be false
    expect(q[41]).toBe(false);
    expect(q[45]).toBe(false);

    // String regions (shifted +1): [3,4], [11,23], [27,46]
    const str = rows.find(r => r.label === 'in string')!.mask;
    expect(str[2]).toBe(false);  // opening quote (excluded)
    expect(str[3]).toBe(true);   // x (first char inside)
    expect(str[4]).toBe(true);   // closing quote (included)
    expect(str[5]).toBe(false);  // after closing quote
    expect(str[10]).toBe(false); // opening quote (excluded)
    expect(str[11]).toBe(true);  // first char of escaped_text
    expect(str[23]).toBe(true);  // closing quote (included)
    expect(str[24]).toBe(false); // after closing quote
    expect(str[26]).toBe(false); // opening quote (excluded)
    expect(str[27]).toBe(true);  // first char inside string
    expect(str[46]).toBe(true);  // closing quote (included)
    expect(str[47]).toBe(false); // after closing quote
  });
});

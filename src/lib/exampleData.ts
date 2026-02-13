import { computeMaskRows } from './masks';

export const inputString = '{ "x": 1, "escaped_text": "Backslash is \\"\\\\\\"" }';
export const maskRows = computeMaskRows(inputString);

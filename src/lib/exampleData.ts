import { computeMaskRows } from './masks';

export const inputString = '{ "x": 100000, "esc": "\\\\\\"", "long": "foo\nbar\nbaz" }';
export const maskRows = computeMaskRows(inputString);

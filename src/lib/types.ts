export interface MaskRow {
  label: string;
  color: string;
  mask: boolean[];
  shift?: number;  // e.g. 1 for "escaped" -- active range extends past block end
}

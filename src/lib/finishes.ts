/**
 * The finishes Table LK actually offers: melamine top colours and powder-coat frame colours.
 * Shared by the home page chips and the 3D table designer.
 */
export interface Finish {
  id: string;
  name: string;
  /** Flat colour used by the 3D model and drawings. */
  hex: string;
  /** CSS class that paints the material (see index.css). */
  mat: string;
  /** True when dark text is unreadable on this finish. */
  dark: boolean;
  /** Wood-grain finishes get a grain texture in 3D. */
  grain?: boolean;
}

export const TOP_FINISHES: Finish[] = [
  { id: "teak", name: "Teak", hex: "#b9753c", mat: "mat-teak", dark: false, grain: true },
  { id: "ash", name: "American ash white", hex: "#e4e2d8", mat: "mat-ash", dark: false, grain: true },
  { id: "white", name: "White", hex: "#f6f6f3", mat: "mat-white", dark: false },
  { id: "black", name: "Black", hex: "#1c1d21", mat: "mat-black", dark: true },
];

export const FRAME_FINISHES: Finish[] = [
  { id: "black", name: "Black steel", hex: "#17181b", mat: "mat-black", dark: true },
  { id: "white", name: "White steel", hex: "#f2f2ef", mat: "mat-white", dark: false },
];

export const findFinish = (list: Finish[], id?: string | null) => list.find((f) => f.id === id) ?? list[0];

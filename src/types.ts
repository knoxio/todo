/** Represents a single sticker on the board. */
export interface Sticker {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  zIndex: number;
}

/** The full board state persisted to localStorage. */
export interface BoardState {
  stickers: Sticker[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

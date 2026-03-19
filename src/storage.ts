import type { BoardState } from "./types";

const STORAGE_KEY = "stickyboard";

const DEFAULT_STATE: BoardState = {
  stickers: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

/** Load board state from localStorage. Returns default state if not found. */
export function loadBoard(): BoardState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;

  try {
    return JSON.parse(raw) as BoardState;
  } catch {
    return DEFAULT_STATE;
  }
}

/** Persist board state to localStorage. */
export function saveBoard(state: BoardState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Clear all board data from localStorage. */
export function clearBoard(): void {
  localStorage.removeItem(STORAGE_KEY);
}

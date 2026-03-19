import { useCallback, useEffect, useRef, useState } from "react";
import type { BoardState, Sticker } from "../types";
import { loadBoard, saveBoard } from "../storage";

const DEBOUNCE_MS = 300;

interface UseBoardReturn {
  stickers: Sticker[];
  viewport: BoardState["viewport"];
  addSticker: (sticker: Sticker) => void;
  updateSticker: (id: string, patch: Partial<Sticker>) => void;
  removeSticker: (id: string) => void;
  setViewport: (v: Partial<BoardState["viewport"]>) => void;
  clearAll: () => void;
}

/**
 * Hook that manages the sticker array and viewport state.
 * All components share a single source of truth backed by localStorage.
 * Mutations trigger a debounced save (~300ms).
 */
export function useBoard(): UseBoardReturn {
  const [state, setState] = useState<BoardState>(loadBoard);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Schedule a debounced save whenever state changes. */
  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      saveBoard(state);
      timerRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state]);

  const addSticker = useCallback((sticker: Sticker) => {
    setState((prev) => ({
      ...prev,
      stickers: [...prev.stickers, sticker],
    }));
  }, []);

  const updateSticker = useCallback((id: string, patch: Partial<Sticker>) => {
    setState((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      ),
    }));
  }, []);

  const removeSticker = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      stickers: prev.stickers.filter((s) => s.id !== id),
    }));
  }, []);

  const setViewport = useCallback((v: Partial<BoardState["viewport"]>) => {
    setState((prev) => ({
      ...prev,
      viewport: { ...prev.viewport, ...v },
    }));
  }, []);

  const clearAll = useCallback(() => {
    setState({
      stickers: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    });
  }, []);

  return {
    stickers: state.stickers,
    viewport: state.viewport,
    addSticker,
    updateSticker,
    removeSticker,
    setViewport,
    clearAll,
  };
}

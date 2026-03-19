import { useCallback, useEffect, type RefObject } from "react";
import type { BoardState } from "../types";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4.0;
const ZOOM_FACTOR = 1.1;

/**
 * Hook that handles scroll-wheel zoom on a canvas element.
 * Zoom is cursor-centered and clamped between 0.25 and 4.0.
 */
export function useZoom(
  containerRef: RefObject<HTMLDivElement | null>,
  viewport: BoardState["viewport"],
  setViewport: (v: Partial<BoardState["viewport"]>) => void,
): void {
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const direction = e.deltaY < 0 ? 1 : -1;
      const factor = direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      const newZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, viewport.zoom * factor),
      );

      // Cursor-centered zoom: adjust x/y so the point under the cursor stays fixed
      const cursorX = e.clientX;
      const cursorY = e.clientY;
      const newX = cursorX - (cursorX - viewport.x) * (newZoom / viewport.zoom);
      const newY = cursorY - (cursorY - viewport.y) * (newZoom / viewport.zoom);

      setViewport({ x: newX, y: newY, zoom: newZoom });
    },
    [viewport, setViewport],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, handleWheel]);
}

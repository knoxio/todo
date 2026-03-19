import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

interface DragState {
  dragging: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

interface UsePanOptions {
  viewport: { x: number; y: number; zoom: number };
  setViewport: (v: Partial<{ x: number; y: number; zoom: number }>) => void;
}

interface UsePanReturn {
  /** Attach to the canvas container's onMouseDown. */
  handlePanMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void;
}

/**
 * Hook for panning the canvas via left-click drag on empty space.
 *
 * Uses refs for drag tracking to avoid unnecessary re-renders during
 * the drag. Attaches mousemove/mouseup to `window` so the drag
 * continues even if the cursor leaves the canvas.
 *
 * Does NOT trigger when the drag starts on a sticker — relies on
 * stickers calling `stopPropagation` on their own mousedown, and
 * additionally checks `target === currentTarget` as a safety net.
 */
export function usePan({ viewport, setViewport }: UsePanOptions): UsePanReturn {
  const dragRef = useRef<DragState>({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const setViewportRef = useRef(setViewport);
  useEffect(() => {
    setViewportRef.current = setViewport;
  }, [setViewport]);

  const cleanupRef = useRef<(() => void) | null>(null);

  const startListeners = useCallback(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.dragging) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      setViewportRef.current({
        x: drag.originX + dx,
        y: drag.originY + dy,
      });
    };

    const onMouseUp = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.dragging) return;

      drag.dragging = false;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      setViewportRef.current({
        x: drag.originX + dx,
        y: drag.originY + dy,
      });

      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      cleanupRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    cleanupRef.current = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const handlePanMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      // Only left-click
      if (e.button !== 0) return;

      // If the event target is not the canvas container itself, bail.
      // Stickers should stopPropagation, but as a safety net we also
      // check that the mousedown landed directly on the canvas.
      if (e.target !== e.currentTarget) return;

      e.preventDefault();

      dragRef.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        originX: viewport.x,
        originY: viewport.y,
      };

      document.body.style.cursor = "grabbing";
      startListeners();
    },
    [viewport.x, viewport.y, startListeners],
  );

  return { handlePanMouseDown };
}

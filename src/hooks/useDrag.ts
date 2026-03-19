import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

interface DragState {
  dragging: boolean;
  stickerId: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

interface UseDragOptions {
  zoom: number;
  onDrag: (id: string, x: number, y: number) => void;
}

interface UseDragReturn {
  /**
   * Returns a mousedown handler for a specific sticker.
   * Pass the sticker's current x/y so the hook can compute deltas.
   */
  createDragHandler: (
    id: string,
    x: number,
    y: number,
  ) => (e: ReactMouseEvent<HTMLDivElement>) => void;
}

/**
 * Hook for dragging stickers by left-click.
 *
 * Manages a single active drag. The caller provides the current zoom
 * level so pixel deltas are converted to world-space coordinates.
 * Attaches mousemove/mouseup to `window` so drags continue even
 * when the cursor leaves the sticker.
 */
export function useDrag({ zoom, onDrag }: UseDragOptions): UseDragReturn {
  const dragRef = useRef<DragState>({
    dragging: false,
    stickerId: "",
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const onDragRef = useRef(onDrag);
  useEffect(() => {
    onDragRef.current = onDrag;
  }, [onDrag]);

  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const cleanupRef = useRef<(() => void) | null>(null);

  const startListeners = useCallback(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.dragging) return;

      const dx = (e.clientX - drag.startX) / zoomRef.current;
      const dy = (e.clientY - drag.startY) / zoomRef.current;

      onDragRef.current(drag.stickerId, drag.originX + dx, drag.originY + dy);
    };

    const onMouseUp = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current;
      if (!drag.dragging) return;

      drag.dragging = false;

      const dx = (e.clientX - drag.startX) / zoomRef.current;
      const dy = (e.clientY - drag.startY) / zoomRef.current;

      onDragRef.current(drag.stickerId, drag.originX + dx, drag.originY + dy);

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

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const createDragHandler = useCallback(
    (id: string, x: number, y: number) =>
      (e: ReactMouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;

        e.stopPropagation();
        e.preventDefault();

        dragRef.current = {
          dragging: true,
          stickerId: id,
          startX: e.clientX,
          startY: e.clientY,
          originX: x,
          originY: y,
        };

        document.body.style.cursor = "grabbing";
        startListeners();
      },
    [startListeners],
  );

  return { createDragHandler };
}

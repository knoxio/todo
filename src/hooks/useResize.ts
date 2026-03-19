import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

const MIN_WIDTH = 120;
const MIN_HEIGHT = 80;

interface ResizeState {
  resizing: boolean;
  stickerId: string;
  startX: number;
  startY: number;
  originWidth: number;
  originHeight: number;
}

interface UseResizeOptions {
  zoom: number;
  onResize: (id: string, width: number, height: number) => void;
}

interface UseResizeReturn {
  createResizeHandler: (
    id: string,
    width: number,
    height: number,
  ) => (e: ReactMouseEvent<HTMLDivElement>) => void;
}

/**
 * Hook for resizing stickers via a bottom-right drag handle.
 *
 * Manages a single active resize operation. Converts screen-space
 * deltas to world-space using the current zoom level. Enforces
 * minimum dimensions of 120x80.
 */
export function useResize({
  zoom,
  onResize,
}: UseResizeOptions): UseResizeReturn {
  const resizeRef = useRef<ResizeState>({
    resizing: false,
    stickerId: "",
    startX: 0,
    startY: 0,
    originWidth: 0,
    originHeight: 0,
  });

  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const cleanupRef = useRef<(() => void) | null>(null);

  const applyResize = useCallback((e: globalThis.MouseEvent) => {
    const state = resizeRef.current;
    const dx = (e.clientX - state.startX) / zoomRef.current;
    const dy = (e.clientY - state.startY) / zoomRef.current;

    const width = Math.max(MIN_WIDTH, state.originWidth + dx);
    const height = Math.max(MIN_HEIGHT, state.originHeight + dy);

    onResizeRef.current(state.stickerId, width, height);
  }, []);

  const startListeners = useCallback(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      if (!resizeRef.current.resizing) return;
      applyResize(e);
    };

    const onMouseUp = (e: globalThis.MouseEvent) => {
      if (!resizeRef.current.resizing) return;
      resizeRef.current.resizing = false;
      applyResize(e);

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
  }, [applyResize]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const createResizeHandler = useCallback(
    (id: string, width: number, height: number) =>
      (e: ReactMouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;

        e.stopPropagation();
        e.preventDefault();

        resizeRef.current = {
          resizing: true,
          stickerId: id,
          startX: e.clientX,
          startY: e.clientY,
          originWidth: width,
          originHeight: height,
        };

        document.body.style.cursor = "nwse-resize";
        startListeners();
      },
    [startListeners],
  );

  return { createResizeHandler };
}

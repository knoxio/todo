import { forwardRef, type MouseEvent, type ReactNode } from "react";

interface CanvasProps {
  viewport: { x: number; y: number; zoom: number };
  children?: ReactNode;
  /** Fired when clicking on the canvas background (not a child element). */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Forwarded to the outer container for pan handling. */
  onMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
}

/**
 * Full-viewport canvas surface with a dot-grid background that responds
 * to viewport pan (x, y) and zoom. Children are rendered inside a
 * transformed container so they move/scale with the viewport.
 */
const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  { viewport, children, onClick, onMouseDown },
  ref,
) {
  const { x, y, zoom } = viewport;

  const dotSize = 1;
  const dotSpacing = 20;
  const scaledSpacing = dotSpacing * zoom;

  const bgPosX = x % scaledSpacing;
  const bgPosY = y % scaledSpacing;

  return (
    <div
      ref={ref}
      className="fixed inset-0 h-screen w-screen cursor-grab overflow-hidden bg-gray-50"
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        backgroundImage: `radial-gradient(circle, #d1d5db ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${scaledSpacing}px ${scaledSpacing}px`,
        backgroundPosition: `${bgPosX}px ${bgPosY}px`,
      }}
    >
      <div
        style={{
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default Canvas;

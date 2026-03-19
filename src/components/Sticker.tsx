import type { MouseEvent } from "react";
import type { Sticker as StickerType } from "../types";

interface StickerProps {
  /** The sticker data to render. */
  sticker: StickerType;
  /** Whether this sticker is currently selected. */
  isSelected?: boolean;
  /** Whether this sticker is in edit mode. */
  isEditing?: boolean;
  /** Fired on single click. */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Fired on double click. */
  onDoubleClick?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Fired on mouse down. */
  onMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
}

/**
 * Renders a single sticker as an absolutely-positioned div.
 *
 * This is a read-only presentation component — it forwards mouse events
 * via callback props but implements no behavior of its own.
 */
function Sticker({
  sticker,
  isSelected = false,
  isEditing = false,
  onClick,
  onDoubleClick,
  onMouseDown,
}: StickerProps) {
  return (
    <div
      className={`absolute overflow-hidden rounded-lg p-3 shadow-md select-none ${isSelected && !isEditing ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: sticker.x,
        top: sticker.y,
        width: sticker.width,
        height: sticker.height,
        backgroundColor: sticker.color,
        zIndex: sticker.zIndex,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
        {sticker.content}
      </p>
    </div>
  );
}

export default Sticker;

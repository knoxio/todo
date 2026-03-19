import {
  useCallback,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import type { Sticker as StickerType } from "../types";

const SWATCH_COLORS = [
  "#fef08a",
  "#fed7aa",
  "#fecaca",
  "#d9f99d",
  "#a5f3fc",
  "#c4b5fd",
];

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
  /** Called when content changes after editing exits. */
  onContentChange?: (content: string) => void;
  /** Called when the delete button is clicked. */
  onDelete?: () => void;
  /** Called to bring this sticker to front. */
  onBringToFront?: () => void;
  /** Called to send this sticker to back. */
  onSendToBack?: () => void;
  /** Fired on mouse down on the resize handle. */
  onResizeMouseDown?: (e: MouseEvent<HTMLDivElement>) => void;
  /** Called when a color swatch is clicked. */
  onColorChange?: (color: string) => void;
}

/**
 * Renders a single sticker as an absolutely-positioned div.
 * When isEditing is true, displays a textarea for inline editing.
 */
function Sticker({
  sticker,
  isSelected = false,
  isEditing = false,
  onClick,
  onDoubleClick,
  onMouseDown,
  onContentChange,
  onDelete,
  onBringToFront,
  onSendToBack,
  onResizeMouseDown,
  onColorChange,
}: StickerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleTextareaRef = useCallback((node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;
    if (node) {
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  }, []);

  const commitEdit = useCallback(() => {
    if (textareaRef.current) {
      onContentChange?.(textareaRef.current.value);
    }
  }, [onContentChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        commitEdit();
      }
    },
    [commitEdit],
  );

  return (
    <div
      className={`absolute overflow-hidden rounded-lg p-3 shadow-md ${isEditing ? "" : "select-none"} ${isSelected && !isEditing ? "ring-2 ring-blue-500" : ""}`}
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
      {isSelected && !isEditing && (
        <div className="absolute right-1 top-1 flex gap-0.5">
          {onBringToFront && (
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-xs text-white opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onBringToFront();
              }}
              aria-label="Bring to front"
            >
              &#x25B2;
            </button>
          )}
          {onSendToBack && (
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-xs text-white opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onSendToBack();
              }}
              aria-label="Send to back"
            >
              &#x25BC;
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-xs text-white opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete sticker"
            >
              &times;
            </button>
          )}
        </div>
      )}
      {isSelected && !isEditing && onColorChange && (
        <div className="absolute bottom-1 left-1 flex gap-1">
          {SWATCH_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`h-5 w-5 rounded-full border-2 ${color === sticker.color ? "border-gray-700" : "border-white"} shadow-sm`}
              style={{ backgroundColor: color }}
              onClick={(e) => {
                e.stopPropagation();
                onColorChange(color);
              }}
              aria-label={`Change color to ${color}`}
            />
          ))}
        </div>
      )}
      {isEditing ? (
        <textarea
          ref={handleTextareaRef}
          className="h-full w-full resize-none border-none bg-transparent text-sm text-gray-800 outline-none"
          defaultValue={sticker.content}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
          {sticker.content}
        </p>
      )}
      {isSelected && !isEditing && onResizeMouseDown && (
        <div
          className="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize"
          onMouseDown={onResizeMouseDown}
        />
      )}
    </div>
  );
}

export default Sticker;

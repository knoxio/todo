import {
  useCallback,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
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
  /** Called when content changes after editing exits. */
  onContentChange?: (content: string) => void;
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
}: StickerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaRef = useCallback((node: HTMLTextAreaElement | null) => {
    (
      textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
    ).current = node;
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
    </div>
  );
}

export default Sticker;

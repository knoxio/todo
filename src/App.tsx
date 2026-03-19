import type { MouseEvent } from "react";
import { useCallback, useRef, useState } from "react";
import Canvas from "./components/Canvas";
import Sticker from "./components/Sticker";
import Toolbar from "./components/Toolbar";
import type { Sticker as StickerType } from "./types";
import { useBoard } from "./hooks/useBoard";
import { useDrag } from "./hooks/useDrag";
import { usePan } from "./hooks/usePan";
import { useResize } from "./hooks/useResize";
import { useZoom } from "./hooks/useZoom";

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 150;
const DEFAULT_COLOR = "#fef08a";

function App() {
  const {
    stickers,
    viewport,
    addSticker,
    setViewport,
    updateSticker,
    removeSticker,
    clearAll,
  } = useBoard();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null,
  );
  const [editingStickerId, setEditingStickerId] = useState<string | null>(null);
  const { handlePanMouseDown } = usePan({ viewport, setViewport });

  const handleStickerDrag = useCallback(
    (id: string, x: number, y: number) => {
      updateSticker(id, { x, y });
    },
    [updateSticker],
  );

  const { createDragHandler } = useDrag({
    zoom: viewport.zoom,
    onDrag: handleStickerDrag,
  });

  const handleStickerResize = useCallback(
    (id: string, width: number, height: number) => {
      updateSticker(id, { width, height });
    },
    [updateSticker],
  );

  const { createResizeHandler } = useResize({
    zoom: viewport.zoom,
    onResize: handleStickerResize,
  });

  useZoom(canvasRef, viewport, setViewport);

  const handleCanvasClick = useCallback(() => {
    if (document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.blur();
    }
    setEditingStickerId(null);
    setSelectedStickerId(null);
  }, []);

  const handleCanvasDoubleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const worldX =
        (e.clientX - viewport.x) / viewport.zoom - DEFAULT_WIDTH / 2;
      const worldY =
        (e.clientY - viewport.y) / viewport.zoom - DEFAULT_HEIGHT / 2;

      const maxZ = stickers.reduce((max, s) => Math.max(max, s.zIndex), 0);

      const newSticker: StickerType = {
        id: crypto.randomUUID(),
        x: worldX,
        y: worldY,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        content: "",
        color: DEFAULT_COLOR,
        zIndex: maxZ + 1,
      };

      addSticker(newSticker);
    },
    [viewport.x, viewport.y, viewport.zoom, stickers, addSticker],
  );

  return (
    <>
      <Canvas
        ref={canvasRef}
        viewport={viewport}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handlePanMouseDown}
      >
        {stickers.map((sticker) => (
          <Sticker
            key={sticker.id}
            sticker={sticker}
            isSelected={sticker.id === selectedStickerId}
            isEditing={sticker.id === editingStickerId}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStickerId(sticker.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setSelectedStickerId(sticker.id);
              setEditingStickerId(sticker.id);
            }}
            onMouseDown={(e) => {
              if (editingStickerId !== sticker.id) {
                setSelectedStickerId(sticker.id);
                createDragHandler(sticker.id, sticker.x, sticker.y)(e);
              }
            }}
            onContentChange={(content) => {
              updateSticker(sticker.id, { content });
              setEditingStickerId(null);
            }}
            onDelete={() => {
              removeSticker(sticker.id);
              setSelectedStickerId(null);
              setEditingStickerId(null);
            }}
            onResizeMouseDown={createResizeHandler(
              sticker.id,
              sticker.width,
              sticker.height,
            )}
          />
        ))}
      </Canvas>
      <Toolbar onClear={clearAll} />
    </>
  );
}

export default App;

import type { MouseEvent } from "react";
import { useCallback, useRef, useState } from "react";
import Canvas from "./components/Canvas";
import Sticker from "./components/Sticker";
import type { Sticker as StickerType } from "./types";
import { useBoard } from "./hooks/useBoard";
import { usePan } from "./hooks/usePan";
import { useZoom } from "./hooks/useZoom";

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 150;
const DEFAULT_COLOR = "#fef08a";

function App() {
  const { stickers, viewport, addSticker, setViewport } = useBoard();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null,
  );
  const { handlePanMouseDown } = usePan({ viewport, setViewport });

  useZoom(canvasRef, viewport, setViewport);

  const handleCanvasClick = useCallback(() => {
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

  const handleStickerDoubleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    },
    [],
  );

  return (
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
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStickerId(sticker.id);
          }}
          onDoubleClick={handleStickerDoubleClick}
        />
      ))}
    </Canvas>
  );
}

export default App;

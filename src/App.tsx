import { useCallback, useRef, useState } from "react";
import Canvas from "./components/Canvas";
import Sticker from "./components/Sticker";
import { useBoard } from "./hooks/useBoard";
import { useZoom } from "./hooks/useZoom";

function App() {
  const { stickers, viewport, setViewport, updateSticker } = useBoard();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(
    null,
  );
  const [editingStickerId, setEditingStickerId] = useState<string | null>(null);

  useZoom(canvasRef, viewport, setViewport);

  const handleCanvasClick = useCallback(() => {
    setEditingStickerId(null);
    setSelectedStickerId(null);
  }, []);

  return (
    <Canvas ref={canvasRef} viewport={viewport} onClick={handleCanvasClick}>
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
          onContentChange={(content) => {
            updateSticker(sticker.id, { content });
            setEditingStickerId(null);
          }}
        />
      ))}
    </Canvas>
  );
}

export default App;

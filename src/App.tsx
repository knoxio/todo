import { useRef } from "react";
import Canvas from "./components/Canvas";
import Sticker from "./components/Sticker";
import { useBoard } from "./hooks/useBoard";
import { usePan } from "./hooks/usePan";
import { useZoom } from "./hooks/useZoom";

function App() {
  const { stickers, viewport, setViewport } = useBoard();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { handlePanMouseDown } = usePan({ viewport, setViewport });

  useZoom(canvasRef, viewport, setViewport);

  return (
    <Canvas
      ref={canvasRef}
      viewport={viewport}
      onMouseDown={handlePanMouseDown}
    >
      {stickers.map((sticker) => (
        <Sticker key={sticker.id} sticker={sticker} />
      ))}
    </Canvas>
  );
}

export default App;

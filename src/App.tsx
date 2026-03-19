import { useRef } from "react";
import Canvas from "./components/Canvas";
import Sticker from "./components/Sticker";
import { useBoard } from "./hooks/useBoard";
import { useZoom } from "./hooks/useZoom";

function App() {
  const { stickers, viewport, setViewport } = useBoard();
  const canvasRef = useRef<HTMLDivElement>(null);

  useZoom(canvasRef, viewport, setViewport);

  return (
    <Canvas ref={canvasRef} viewport={viewport}>
      {stickers.map((sticker) => (
        <Sticker key={sticker.id} sticker={sticker} />
      ))}
    </Canvas>
  );
}

export default App;

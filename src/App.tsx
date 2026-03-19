import Canvas from "./components/Canvas";
import Sticker from "./components/Sticker";
import { useBoard } from "./hooks/useBoard";

function App() {
  const { stickers, viewport } = useBoard();

  return (
    <Canvas viewport={viewport}>
      {stickers.map((sticker) => (
        <Sticker key={sticker.id} sticker={sticker} />
      ))}
    </Canvas>
  );
}

export default App;

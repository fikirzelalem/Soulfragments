import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { Game } from "./components/Game";
import { GameUI } from "./components/GameUI";
import { SoundManager } from "./components/SoundManager";
import { Tutorial } from "./components/Tutorial";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  jump = "jump",
}

const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.back, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.jump, keys: ["Space"] },
];

function App() {
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => setShowCanvas(true), []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {showCanvas && (
        <KeyboardControls map={controls}>
          <Canvas
            shadows
            camera={{ position: [0, 8, 12], fov: 60, near: 0.1, far: 1000 }}
            gl={{ antialias: true, powerPreference: "high-performance" }}
          >
            {/* ✅ Everything that uses useThree/useFrame goes INSIDE Canvas */}
            <Game />
            <SoundManager />
            <Tutorial />
          </Canvas>

          {/* ✅ Only pure UI outside */}
          <GameUI />
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
